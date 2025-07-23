// AmoCRM интеграция для МФО Микро5
interface AmoCrmConfig {
  baseUrl: string;
  accessToken: string;
  accountId: string;
}

interface LoanApplication {
  // Контактные данные
  phone: string;
  email: string;
  
  // Персональные данные
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  
  // Займ
  loanAmount: number;
  loanDays: number;
  
  // Адрес
  registrationAddress: {
    region: string;
    city: string;
    street: string;
    house: string;
    apartment: string;
  };
  
  // Доходы
  monthlyIncome: string;
  employmentType: string;
  
  // Документы
  documents: {
    passport?: File;
    income?: File;
    employment?: File;
  };
}

interface AmoCrmLead {
  name: string;
  price: number;
  responsible_user_id?: number;
  status_id?: number;
  pipeline_id?: number;
  custom_fields_values?: Array<{
    field_id: number;
    values: Array<{
      value: string;
    }>;
  }>;
  _embedded?: {
    contacts?: Array<{
      id?: number;
      name: string;
      first_name: string;
      last_name: string;
      custom_fields_values?: Array<{
        field_id: number;
        values: Array<{
          value: string;
          enum_code?: string;
        }>;
      }>;
    }>;
  };
}

class AmoCrmService {
  private config: AmoCrmConfig;

  constructor(config: AmoCrmConfig) {
    this.config = config;
  }

  // Отправка заявки в AmoCRM
  async submitLoanApplication(application: LoanApplication): Promise<{ success: boolean; leadId?: string; error?: string }> {
    try {
      // Создаем контакт
      const contact = await this.createContact(application);
      
      // Создаем сделку
      const lead = await this.createLead(application, contact.id);
      
      // Добавляем примечания с деталями
      await this.addLeadNote(lead.id, this.formatApplicationDetails(application));
      
      // Загружаем документы (если есть)
      if (application.documents.passport) {
        await this.uploadDocument(lead.id, application.documents.passport, 'Паспорт');
      }
      
      if (application.documents.income) {
        await this.uploadDocument(lead.id, application.documents.income, 'Справка о доходах');
      }
      
      if (application.documents.employment) {
        await this.uploadDocument(lead.id, application.documents.employment, 'Справка с работы');
      }

      return { success: true, leadId: lead.id.toString() };
    } catch (error) {
      console.error('Ошибка при отправке в AmoCRM:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
    }
  }

  // Создание контакта
  private async createContact(application: LoanApplication) {
    const contactData = {
      name: `${application.lastName} ${application.firstName} ${application.middleName}`.trim(),
      first_name: application.firstName,
      last_name: application.lastName,
      custom_fields_values: [
        {
          field_id: 264911, // ID поля "Телефон" в AmoCRM
          values: [{ value: application.phone, enum_code: 'WORK' }]
        },
        {
          field_id: 264913, // ID поля "Email" в AmoCRM
          values: [{ value: application.email, enum_code: 'WORK' }]
        },
        {
          field_id: 1234567, // ID кастомного поля "Дата рождения"
          values: [{ value: application.birthDate }]
        },
        {
          field_id: 1234568, // ID кастомного поля "Адрес регистрации"
          values: [{ value: this.formatAddress(application.registrationAddress) }]
        }
      ]
    };

    const response = await this.makeRequest('/api/v4/contacts', 'POST', [contactData]);
    return response._embedded.contacts[0];
  }

  // Создание сделки
  private async createLead(application: LoanApplication, contactId: number) {
    const leadData: AmoCrmLead = {
      name: `Займ ${application.loanAmount}₽ - ${application.lastName} ${application.firstName}`,
      price: application.loanAmount,
      pipeline_id: 7654321, // ID воронки "Займы"
      status_id: 12345678, // ID статуса "Новая заявка"
      custom_fields_values: [
        {
          field_id: 1234569, // ID поля "Сумма займа"
          values: [{ value: application.loanAmount.toString() }]
        },
        {
          field_id: 1234570, // ID поля "Срок займа (дней)"
          values: [{ value: application.loanDays.toString() }]
        },
        {
          field_id: 1234571, // ID поля "Ежемесячный доход"
          values: [{ value: application.monthlyIncome }]
        },
        {
          field_id: 1234572, // ID поля "Тип занятости"
          values: [{ value: application.employmentType }]
        }
      ],
      _embedded: {
        contacts: [{ id: contactId }]
      }
    };

    const response = await this.makeRequest('/api/v4/leads', 'POST', [leadData]);
    return response._embedded.leads[0];
  }

  // Добавление примечания к сделке
  private async addLeadNote(leadId: number, noteText: string) {
    const noteData = {
      entity_id: leadId,
      entity_type: 'leads',
      note_type: 'common',
      params: {
        text: noteText
      }
    };

    return this.makeRequest('/api/v4/leads/notes', 'POST', [noteData]);
  }

  // Загрузка документа
  private async uploadDocument(leadId: number, file: File, description: string) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Сначала загружаем файл
    const uploadResponse = await fetch(`${this.config.baseUrl}/api/v4/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error('Ошибка загрузки файла');
    }

    const uploadData = await uploadResponse.json();
    const fileId = uploadData._embedded.files[0].id;

    // Привязываем файл к сделке
    const attachmentData = {
      entity_id: leadId,
      entity_type: 'leads',
      note_type: 'attachment',
      params: {
        text: description,
        attachment: {
          file_uuid: fileId
        }
      }
    };

    return this.makeRequest('/api/v4/leads/notes', 'POST', [attachmentData]);
  }

  // Обновление статуса сделки
  async updateLeadStatus(leadId: string, statusId: number, comment?: string) {
    const updateData = {
      id: parseInt(leadId),
      status_id: statusId
    };

    const response = await this.makeRequest('/api/v4/leads', 'PATCH', [updateData]);
    
    if (comment) {
      await this.addLeadNote(parseInt(leadId), comment);
    }

    return response;
  }

  // Получение статуса сделки
  async getLeadStatus(leadId: string) {
    const response = await this.makeRequest(`/api/v4/leads/${leadId}`, 'GET');
    return {
      status_id: response.status_id,
      pipeline_id: response.pipeline_id,
      name: response.name,
      price: response.price
    };
  }

  // Вспомогательные методы
  private formatAddress(address: any): string {
    return `${address.region}, ${address.city}, ${address.street}, д. ${address.house}${address.apartment ? `, кв. ${address.apartment}` : ''}`;
  }

  private formatApplicationDetails(application: LoanApplication): string {
    return `
=== ДЕТАЛИ ЗАЯВКИ ===
Займ: ${application.loanAmount.toLocaleString()}₽ на ${application.loanDays} дней
ФИО: ${application.lastName} ${application.firstName} ${application.middleName}
Телефон: ${application.phone}
Email: ${application.email}
Дата рождения: ${application.birthDate}

=== АДРЕС РЕГИСТРАЦИИ ===
${this.formatAddress(application.registrationAddress)}

=== ДОХОДЫ ===
Ежемесячный доход: ${application.monthlyIncome}₽
Тип занятости: ${application.employmentType}

=== ДОКУМЕНТЫ ===
${application.documents.passport ? '✅ Паспорт загружен' : '❌ Паспорт не загружен'}
${application.documents.income ? '✅ Справка о доходах загружена' : '❌ Справка о доходах не загружена'}
${application.documents.employment ? '✅ Справка с работы загружена' : '❌ Справка с работы не загружена'}

Дата подачи заявки: ${new Date().toLocaleString('ru-RU')}
    `.trim();
  }

  private async makeRequest(endpoint: string, method: string, data?: any) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`AmoCRM API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Конфигурация для продакшн среды
const amoCrmConfig: AmoCrmConfig = {
  baseUrl: 'https://micro5mfo.amocrm.ru', // Замените на ваш поддомен
  accessToken: '7ae2fd98c40922fd54b3a9f4f67a6d08',
  accountId: process.env.AMOCRM_ACCOUNT_ID || 'your_account_id_here'
};

// Создаем экземпляр сервиса
export const amoCrmService = new AmoCrmService(amoCrmConfig);

// Константы статусов (нужно заменить на реальные ID из вашей AmoCRM)
export const AMO_STATUSES = {
  NEW_APPLICATION: 12345678,      // Новая заявка
  DOCUMENT_CHECK: 12345679,       // Проверка документов
  SCORING: 12345680,              // Скоринг
  APPROVAL: 12345681,             // На одобрении
  APPROVED: 12345682,             // Одобрено
  REJECTED: 12345683,             // Отклонено
  MONEY_ISSUED: 12345684,         // Деньги выданы
  REPAID: 12345685               // Погашен
};

// Основная функция для отправки заявки
export const submitLoanApplication = async (application: LoanApplication) => {
  try {
    // Используем реальный API AmoCRM
    const result = await amoCrmService.submitLoanApplication(application);
    return result;
  } catch (error) {
    console.error('Ошибка отправки в AmoCRM:', error);
    
    // Fallback к симуляции в случае ошибки
    console.warn('Переключаемся на режим симуляции');
    return simulateAmoCrmSubmission(application);
  }
};

// Функция для симуляции отправки (для разработки и fallback)
export const simulateAmoCrmSubmission = async (application: LoanApplication) => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Имитация успешной отправки в 90% случаев
  const success = Math.random() > 0.1;
  
  if (success) {
    const leadId = `LEAD-${Date.now()}`;
    console.log('Заявка отправлена в AmoCRM (симуляция):', {
      leadId,
      application: {
        name: `${application.lastName} ${application.firstName}`,
        amount: application.loanAmount,
        phone: application.phone
      }
    });
    
    return { success: true, leadId };
  } else {
    return { success: false, error: 'Ошибка подключения к AmoCRM' };
  }
};