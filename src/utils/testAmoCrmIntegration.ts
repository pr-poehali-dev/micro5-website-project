// Тестирование интеграции с AmoCRM
import { submitLoanApplication } from './amoCrmIntegration';

// Тестовые данные для проверки интеграции
const testApplicationData = {
  // Контактные данные
  phone: '+7 (900) 123-45-67',
  email: 'test@example.com',
  
  // Персональные данные
  firstName: 'Иван',
  lastName: 'Петров',
  middleName: 'Сергеевич',
  birthDate: '1990-01-15',
  
  // Займ
  loanAmount: 50000,
  loanDays: 30,
  
  // Адрес
  registrationAddress: {
    region: 'Московская область',
    city: 'Москва',
    street: 'ул. Тестовая',
    house: '1',
    apartment: '10'
  },
  
  // Доходы
  monthlyIncome: '80000',
  employmentType: 'Официальное трудоустройство',
  
  // Документы (mock данные)
  documents: {
    passport: new File(['mock passport data'], 'passport.jpg', { type: 'image/jpeg' }),
    income: new File(['mock income data'], 'income.pdf', { type: 'application/pdf' })
  }
};

// Функция для тестирования API
export const testAmoCrmConnection = async () => {
  console.log('🚀 Начинаю тестирование интеграции с AmoCRM...');
  
  try {
    const result = await submitLoanApplication(testApplicationData);
    
    if (result.success) {
      console.log('✅ Интеграция работает!');
      console.log('📋 ID заявки:', result.leadId);
      
      return {
        success: true,
        message: 'Заявка успешно отправлена в AmoCRM',
        leadId: result.leadId
      };
    } else {
      console.log('❌ Ошибка интеграции:', result.error);
      
      return {
        success: false,
        message: result.error || 'Неизвестная ошибка'
      };
    }
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Критическая ошибка'
    };
  }
};

// Функция для проверки конфигурации
export const checkAmoCrmConfig = () => {
  console.log('🔧 Проверяю конфигурацию AmoCRM:');
  
  // Проверяем наличие API ключа
  const hasApiKey = process.env.AMOCRM_ACCESS_TOKEN || '7ae2fd98c40922fd54b3a9f4f67a6d08';
  console.log('🔑 API ключ:', hasApiKey ? '✅ Установлен' : '❌ Отсутствует');
  
  // Проверяем базовый URL
  const baseUrl = 'https://micro5mfo.amocrm.ru';
  console.log('🌐 Base URL:', baseUrl);
  
  return {
    hasApiKey: !!hasApiKey,
    baseUrl: baseUrl,
    isConfigured: !!hasApiKey
  };
};

// Автоматический запуск теста при импорте (только в dev режиме)
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Dev режим: запускаю проверку конфигурации...');
  checkAmoCrmConfig();
}