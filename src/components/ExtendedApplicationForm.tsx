import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface FormData {
  // Контактные данные
  phone: string;
  email: string;
  
  // Персональные данные
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  birthPlace: string;
  
  // Паспортные данные
  passportSeries: string;
  passportNumber: string;
  passportIssueDate: string;
  passportIssuer: string;
  passportCode: string;
  
  // Адрес регистрации
  registrationAddress: {
    region: string;
    city: string;
    street: string;
    house: string;
    apartment: string;
    postalCode: string;
  };
  
  // Адрес проживания
  actualAddress: {
    region: string;
    city: string;
    street: string;
    house: string;
    apartment: string;
    postalCode: string;
  };
  sameAsRegistration: boolean;
  
  // Занятость и доходы
  employmentType: string;
  employer: string;
  position: string;
  workExperience: string;
  monthlyIncome: string;
  additionalIncome: string;
  
  // Документы
  documents: {
    passport: File | null;
    income: File | null;
    employment: File | null;
  };
}

interface ExtendedApplicationFormProps {
  loanAmount: number;
  loanDays: number;
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

const ExtendedApplicationForm: React.FC<ExtendedApplicationFormProps> = ({
  loanAmount,
  loanDays,
  onSubmit,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    birthPlace: '',
    passportSeries: '',
    passportNumber: '',
    passportIssueDate: '',
    passportIssuer: '',
    passportCode: '',
    registrationAddress: {
      region: '',
      city: '',
      street: '',
      house: '',
      apartment: '',
      postalCode: ''
    },
    actualAddress: {
      region: '',
      city: '',
      street: '',
      house: '',
      apartment: '',
      postalCode: ''
    },
    sameAsRegistration: true,
    employmentType: '',
    employer: '',
    position: '',
    workExperience: '',
    monthlyIncome: '',
    additionalIncome: '',
    documents: {
      passport: null,
      income: null,
      employment: null
    }
  });

  const totalSteps = 6;
  const stepTitles = [
    'Контактные данные',
    'Персональная информация',
    'Паспортные данные',
    'Адреса',
    'Занятость и доходы',
    'Документы'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (type: 'registrationAddress' | 'actualAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (type: keyof FormData['documents'], file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: file
      }
    }));
  };

  const handleSameAsRegistration = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameAsRegistration: checked,
      actualAddress: checked ? { ...prev.registrationAddress } : prev.actualAddress
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Имитация отправки данных
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSubmit(formData);
    setIsLoading(false);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 1) return `+7`;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-micro-gray via-white to-micro-light py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад к калькулятору
            </Button>
            <h1 className="text-3xl font-bold text-micro-dark mb-2">Заявка на займ</h1>
            <p className="text-gray-600">
              Займ на {loanAmount.toLocaleString()} ₽ на {loanDays} дней
            </p>
          </div>

          {/* Прогресс */}
          <Card className="mb-8 rounded-3xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-micro-dark">
                  Шаг {currentStep} из {totalSteps}: {stepTitles[currentStep - 1]}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Форма */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="p-8">
              {/* Шаг 1: Контактные данные */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-micro-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="Phone" size={32} className="text-micro-blue" />
                    </div>
                    <h3 className="text-xl font-semibold text-micro-dark">Контактные данные</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Номер телефона *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                        className="rounded-xl"
                        maxLength={18}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@mail.ru"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 2: Персональная информация */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-micro-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="User" size={32} className="text-micro-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-micro-dark">Персональная информация</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <Input
                        id="lastName"
                        placeholder="Иванов"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName">Имя *</Label>
                      <Input
                        id="firstName"
                        placeholder="Иван"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="middleName">Отчество *</Label>
                      <Input
                        id="middleName"
                        placeholder="Иванович"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="birthDate">Дата рождения *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthPlace">Место рождения *</Label>
                      <Input
                        id="birthPlace"
                        placeholder="г. Москва"
                        value={formData.birthPlace}
                        onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 3: Паспортные данные */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="FileText" size={32} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-micro-dark">Паспортные данные</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="passportSeries">Серия паспорта *</Label>
                      <Input
                        id="passportSeries"
                        placeholder="1234"
                        value={formData.passportSeries}
                        onChange={(e) => handleInputChange('passportSeries', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="rounded-xl"
                        maxLength={4}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="passportNumber">Номер паспорта *</Label>
                      <Input
                        id="passportNumber"
                        placeholder="567890"
                        value={formData.passportNumber}
                        onChange={(e) => handleInputChange('passportNumber', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="rounded-xl"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="passportIssueDate">Дата выдачи *</Label>
                    <Input
                      id="passportIssueDate"
                      type="date"
                      value={formData.passportIssueDate}
                      onChange={(e) => handleInputChange('passportIssueDate', e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="passportIssuer">Кем выдан *</Label>
                    <Textarea
                      id="passportIssuer"
                      placeholder="ОТДЕЛОМ УФМС РОССИИ ПО Г. МОСКВЕ"
                      value={formData.passportIssuer}
                      onChange={(e) => handleInputChange('passportIssuer', e.target.value)}
                      className="rounded-xl"
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="passportCode">Код подразделения *</Label>
                    <Input
                      id="passportCode"
                      placeholder="123-456"
                      value={formData.passportCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.length > 3 ? `${value.slice(0, 3)}-${value.slice(3, 6)}` : value;
                        handleInputChange('passportCode', formatted);
                      }}
                      className="rounded-xl"
                      maxLength={7}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Шаг 4: Адреса */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="MapPin" size={32} className="text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-micro-dark">Адреса</h3>
                  </div>
                  
                  {/* Адрес регистрации */}
                  <div>
                    <h4 className="font-medium text-micro-dark mb-4">Адрес регистрации</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Регион *</Label>
                        <Input
                          placeholder="Московская область"
                          value={formData.registrationAddress.region}
                          onChange={(e) => handleAddressChange('registrationAddress', 'region', e.target.value)}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <Label>Город *</Label>
                        <Input
                          placeholder="Москва"
                          value={formData.registrationAddress.city}
                          onChange={(e) => handleAddressChange('registrationAddress', 'city', e.target.value)}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <Label>Улица *</Label>
                        <Input
                          placeholder="ул. Тверская"
                          value={formData.registrationAddress.street}
                          onChange={(e) => handleAddressChange('registrationAddress', 'street', e.target.value)}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <Label>Дом *</Label>
                        <Input
                          placeholder="12"
                          value={formData.registrationAddress.house}
                          onChange={(e) => handleAddressChange('registrationAddress', 'house', e.target.value)}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <Label>Квартира</Label>
                        <Input
                          placeholder="34"
                          value={formData.registrationAddress.apartment}
                          onChange={(e) => handleAddressChange('registrationAddress', 'apartment', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>Почтовый индекс *</Label>
                        <Input
                          placeholder="123456"
                          value={formData.registrationAddress.postalCode}
                          onChange={(e) => handleAddressChange('registrationAddress', 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="rounded-xl"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Checkbox для адреса проживания */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAddress"
                      checked={formData.sameAsRegistration}
                      onCheckedChange={handleSameAsRegistration}
                    />
                    <Label htmlFor="sameAddress">Адрес проживания совпадает с адресом регистрации</Label>
                  </div>
                  
                  {/* Адрес проживания */}
                  {!formData.sameAsRegistration && (
                    <div>
                      <h4 className="font-medium text-micro-dark mb-4">Адрес проживания</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Регион *</Label>
                          <Input
                            placeholder="Московская область"
                            value={formData.actualAddress.region}
                            onChange={(e) => handleAddressChange('actualAddress', 'region', e.target.value)}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <Label>Город *</Label>
                          <Input
                            placeholder="Москва"
                            value={formData.actualAddress.city}
                            onChange={(e) => handleAddressChange('actualAddress', 'city', e.target.value)}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <Label>Улица *</Label>
                          <Input
                            placeholder="ул. Тверская"
                            value={formData.actualAddress.street}
                            onChange={(e) => handleAddressChange('actualAddress', 'street', e.target.value)}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <Label>Дом *</Label>
                          <Input
                            placeholder="12"
                            value={formData.actualAddress.house}
                            onChange={(e) => handleAddressChange('actualAddress', 'house', e.target.value)}
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <Label>Квартира</Label>
                          <Input
                            placeholder="34"
                            value={formData.actualAddress.apartment}
                            onChange={(e) => handleAddressChange('actualAddress', 'apartment', e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label>Почтовый индекс *</Label>
                          <Input
                            placeholder="123456"
                            value={formData.actualAddress.postalCode}
                            onChange={(e) => handleAddressChange('actualAddress', 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="rounded-xl"
                            maxLength={6}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Шаг 5: Занятость и доходы */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="Briefcase" size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-micro-dark">Занятость и доходы</h3>
                  </div>
                  
                  <div>
                    <Label>Тип занятости *</Label>
                    <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Выберите тип занятости" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Трудоустроенный</SelectItem>
                        <SelectItem value="self-employed">Самозанятый</SelectItem>
                        <SelectItem value="entrepreneur">ИП</SelectItem>
                        <SelectItem value="pensioner">Пенсионер</SelectItem>
                        <SelectItem value="student">Студент</SelectItem>
                        <SelectItem value="unemployed">Безработный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(formData.employmentType === 'employed' || formData.employmentType === 'self-employed') && (
                    <>
                      <div>
                        <Label htmlFor="employer">Место работы *</Label>
                        <Input
                          id="employer"
                          placeholder="ООО Рога и Копыта"
                          value={formData.employer}
                          onChange={(e) => handleInputChange('employer', e.target.value)}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="position">Должность *</Label>
                        <Input
                          id="position"
                          placeholder="Менеджер"
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label>Стаж работы *</Label>
                        <Select value={formData.workExperience} onValueChange={(value) => handleInputChange('workExperience', value)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите стаж" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less-6-months">Менее 6 месяцев</SelectItem>
                            <SelectItem value="6-12-months">6-12 месяцев</SelectItem>
                            <SelectItem value="1-3-years">1-3 года</SelectItem>
                            <SelectItem value="3-5-years">3-5 лет</SelectItem>
                            <SelectItem value="more-5-years">Более 5 лет</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="monthlyIncome">Ежемесячный доход *</Label>
                      <Input
                        id="monthlyIncome"
                        placeholder="50000"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleInputChange('monthlyIncome', e.target.value.replace(/\D/g, ''))}
                        className="rounded-xl"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">В рублях</p>
                    </div>
                    <div>
                      <Label htmlFor="additionalIncome">Дополнительный доход</Label>
                      <Input
                        id="additionalIncome"
                        placeholder="10000"
                        value={formData.additionalIncome}
                        onChange={(e) => handleInputChange('additionalIncome', e.target.value.replace(/\D/g, ''))}
                        className="rounded-xl"
                      />
                      <p className="text-sm text-gray-500 mt-1">В рублях (необязательно)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 6: Документы */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="Upload" size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-micro-dark">Загрузка документов</h3>
                    <p className="text-gray-600">Загрузите скан-копии или фотографии документов</p>
                  </div>
                  
                  {/* Загрузка паспорта */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                    <div className="text-center">
                      <Icon name="FileText" size={32} className="text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium mb-2">Паспорт (главная страница) *</h4>
                      <p className="text-sm text-gray-600 mb-4">Загрузите фото разворота с фотографией</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('passport', e.target.files?.[0] || null)}
                        className="hidden"
                        id="passport-upload"
                      />
                      <label htmlFor="passport-upload">
                        <Button variant="outline" className="rounded-xl" asChild>
                          <span>
                            <Icon name="Upload" size={16} className="mr-2" />
                            Выбрать файл
                          </span>
                        </Button>
                      </label>
                      {formData.documents.passport && (
                        <Badge className="ml-2 bg-micro-green text-white">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          {formData.documents.passport.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Загрузка справки о доходах */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                    <div className="text-center">
                      <Icon name="FileBarChart" size={32} className="text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium mb-2">Справка о доходах</h4>
                      <p className="text-sm text-gray-600 mb-4">2-НДФЛ или справка с места работы</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('income', e.target.files?.[0] || null)}
                        className="hidden"
                        id="income-upload"
                      />
                      <label htmlFor="income-upload">
                        <Button variant="outline" className="rounded-xl" asChild>
                          <span>
                            <Icon name="Upload" size={16} className="mr-2" />
                            Выбрать файл
                          </span>
                        </Button>
                      </label>
                      {formData.documents.income && (
                        <Badge className="ml-2 bg-micro-green text-white">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          {formData.documents.income.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Загрузка справки с работы */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
                    <div className="text-center">
                      <Icon name="Building" size={32} className="text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium mb-2">Справка с места работы</h4>
                      <p className="text-sm text-gray-600 mb-4">Подтверждение трудоустройства</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('employment', e.target.files?.[0] || null)}
                        className="hidden"
                        id="employment-upload"
                      />
                      <label htmlFor="employment-upload">
                        <Button variant="outline" className="rounded-xl" asChild>
                          <span>
                            <Icon name="Upload" size={16} className="mr-2" />
                            Выбрать файл
                          </span>
                        </Button>
                      </label>
                      {formData.documents.employment && (
                        <Badge className="ml-2 bg-micro-green text-white">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          {formData.documents.employment.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Навигация */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="rounded-xl"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    className="bg-micro-blue hover:bg-blue-600 rounded-xl"
                  >
                    Далее
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.documents.passport}
                    className="bg-micro-green hover:bg-green-600 rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Отправляем заявку...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={16} className="mr-2" />
                        Отправить заявку
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExtendedApplicationForm;