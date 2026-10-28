import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from '@/components/ui/icon';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  passportSeries: string;
  passportNumber: string;
  passportDate: string;
  passportIssuer: string;
  address: string;
  income: string;
  employment: string;
  cardNumber: string;
  cardBank: string;
  agreedToTerms: boolean;
  agreedToDataProcessing: boolean;
}

interface ImprovedLoanFormProps {
  loanAmount: number;
  loanDays: number;
  onSubmit: (formData: FormData) => void;
  onBack: () => void;
}

const ImprovedLoanForm: React.FC<ImprovedLoanFormProps> = ({
  loanAmount,
  loanDays,
  onSubmit,
  onBack
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    passportSeries: '',
    passportNumber: '',
    passportDate: '',
    passportIssuer: '',
    address: '',
    income: '',
    employment: '',
    cardNumber: '',
    cardBank: '',
    agreedToTerms: false,
    agreedToDataProcessing: false
  });

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName && formData.phone && formData.email && formData.birthDate;
      case 2:
        return formData.passportSeries && formData.passportNumber && formData.passportDate && formData.passportIssuer;
      case 3:
        return formData.address && formData.income && formData.employment;
      case 4:
        return formData.cardNumber && formData.cardBank && formData.agreedToTerms && formData.agreedToDataProcessing;
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: 'Личные данные', icon: 'User' },
    { number: 2, title: 'Паспортные данные', icon: 'CreditCard' },
    { number: 3, title: 'Работа и доходы', icon: 'Briefcase' },
    { number: 4, title: 'Банковская карта', icon: 'Wallet' }
  ];

  return (
    <div className="min-h-screen bg-micro-gray py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-micro-blue hover:bg-blue-50"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Вернуться к калькулятору
        </Button>

        <Card className="bg-white shadow-xl rounded-3xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl text-micro-dark mb-2">Анкета на займ</CardTitle>
            <p className="text-gray-500">
              Займ {loanAmount.toLocaleString()} ₽ на {loanDays} дней
            </p>
          </CardHeader>

          <CardContent>
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              {steps.map((stepItem, index) => (
                <div key={stepItem.number} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    step >= stepItem.number 
                      ? 'bg-micro-blue border-micro-blue text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon name={stepItem.icon as any} size={20} />
                  </div>
                  <span className={`text-sm mt-2 text-center ${
                    step >= stepItem.number ? 'text-micro-blue font-medium' : 'text-gray-400'
                  }`}>
                    {stepItem.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`absolute h-0.5 w-16 mt-6 ml-16 ${
                      step > stepItem.number ? 'bg-micro-blue' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Data */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-micro-dark mb-6">Личная информация</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">ФИО полностью *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="birthDate">Дата рождения *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => updateFormData('birthDate', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Мобильный телефон *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email адрес *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="example@email.com"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Passport Data */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-micro-dark mb-6">Паспортные данные</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="passportSeries">Серия паспорта *</Label>
                    <Input
                      id="passportSeries"
                      value={formData.passportSeries}
                      onChange={(e) => updateFormData('passportSeries', e.target.value)}
                      placeholder="1234"
                      maxLength={4}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="passportNumber">Номер паспорта *</Label>
                    <Input
                      id="passportNumber"
                      value={formData.passportNumber}
                      onChange={(e) => updateFormData('passportNumber', e.target.value)}
                      placeholder="567890"
                      maxLength={6}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passportDate">Дата выдачи паспорта *</Label>
                  <Input
                    id="passportDate"
                    type="date"
                    value={formData.passportDate}
                    onChange={(e) => updateFormData('passportDate', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="passportIssuer">Кем выдан *</Label>
                  <Input
                    id="passportIssuer"
                    value={formData.passportIssuer}
                    onChange={(e) => updateFormData('passportIssuer', e.target.value)}
                    placeholder="ОТДЕЛОМ УФМС РОССИИ..."
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Employment Data */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-micro-dark mb-6">Работа и доходы</h3>
                
                <div>
                  <Label htmlFor="address">Адрес регистрации *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="employment">Трудовая деятельность *</Label>
                    <Select onValueChange={(value) => updateFormData('employment', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Выберите..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Работаю по найму</SelectItem>
                        <SelectItem value="business">Собственный бизнес</SelectItem>
                        <SelectItem value="freelance">Фриланс</SelectItem>
                        <SelectItem value="pension">Пенсионер</SelectItem>
                        <SelectItem value="student">Студент</SelectItem>
                        <SelectItem value="unemployed">Не работаю</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="income">Ежемесячный доход *</Label>
                    <Select onValueChange={(value) => updateFormData('income', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Выберите..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-20000">До 20 000 ₽</SelectItem>
                        <SelectItem value="20000-40000">20 000 - 40 000 ₽</SelectItem>
                        <SelectItem value="40000-60000">40 000 - 60 000 ₽</SelectItem>
                        <SelectItem value="60000-100000">60 000 - 100 000 ₽</SelectItem>
                        <SelectItem value="100000+">Свыше 100 000 ₽</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Bank Card */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-micro-dark mb-6">Банковская карта для получения займа</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="cardNumber">Номер карты *</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => updateFormData('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardBank">Банк *</Label>
                    <Select onValueChange={(value) => updateFormData('cardBank', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Выберите банк..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sberbank">Сбербанк</SelectItem>
                        <SelectItem value="vtb">ВТБ</SelectItem>
                        <SelectItem value="gazprombank">Газпромбанк</SelectItem>
                        <SelectItem value="alfabank">Альфа-Банк</SelectItem>
                        <SelectItem value="tinkoff">Тинькофф</SelectItem>
                        <SelectItem value="raiffeisen">Райффайзенбанк</SelectItem>
                        <SelectItem value="other">Другой банк</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => updateFormData('agreedToTerms', !!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      Я согласен с <a href="#" className="text-micro-blue underline">условиями займа</a> и 
                      <a href="#" className="text-micro-blue underline ml-1">публичной офертой</a>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="data"
                      checked={formData.agreedToDataProcessing}
                      onCheckedChange={(checked) => updateFormData('agreedToDataProcessing', !!checked)}
                    />
                    <Label htmlFor="data" className="text-sm leading-relaxed">
                      Я согласен на <a href="#" className="text-micro-blue underline">обработку персональных данных</a>
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center"
              >
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                Назад
              </Button>

              {step < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-micro-blue hover:bg-blue-800 text-white flex items-center"
                >
                  Далее
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="bg-micro-green hover:bg-red-700 text-white flex items-center"
                >
                  Отправить заявку
                  <Icon name="Send" size={20} className="ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImprovedLoanForm;