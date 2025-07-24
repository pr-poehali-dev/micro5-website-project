import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import ContactStep from '@/components/ContactStep';
import PersonalInfoStep from '@/components/PersonalInfoStep';
import PassportStep from '@/components/PassportStep';
import AddressStep from '@/components/AddressStep';
import EmploymentStep from '@/components/EmploymentStep';
import DocumentsStep from '@/components/DocumentsStep';

interface FormData {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  birthPlace: string;
  passportSeries: string;
  passportNumber: string;
  passportIssueDate: string;
  passportIssuer: string;
  passportCode: string;
  registrationAddress: {
    region: string;
    city: string;
    street: string;
    house: string;
    apartment: string;
    postalCode: string;
  };
  actualAddress: {
    region: string;
    city: string;
    street: string;
    house: string;
    apartment: string;
    postalCode: string;
  };
  sameAsRegistration: boolean;
  employmentType: string;
  employer: string;
  position: string;
  workExperience: string;
  monthlyIncome: string;
  additionalIncome: string;
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContactStep
            formData={{ phone: formData.phone, email: formData.email }}
            onInputChange={handleInputChange}
            formatPhoneNumber={formatPhoneNumber}
          />
        );
      case 2:
        return (
          <PersonalInfoStep
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              middleName: formData.middleName,
              birthDate: formData.birthDate,
              birthPlace: formData.birthPlace
            }}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <PassportStep
            formData={{
              passportSeries: formData.passportSeries,
              passportNumber: formData.passportNumber,
              passportIssueDate: formData.passportIssueDate,
              passportIssuer: formData.passportIssuer,
              passportCode: formData.passportCode
            }}
            onInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <AddressStep
            formData={{
              registrationAddress: formData.registrationAddress,
              actualAddress: formData.actualAddress,
              sameAsRegistration: formData.sameAsRegistration
            }}
            onAddressChange={handleAddressChange}
            onSameAsRegistration={handleSameAsRegistration}
          />
        );
      case 5:
        return (
          <EmploymentStep
            formData={{
              employmentType: formData.employmentType,
              employer: formData.employer,
              position: formData.position,
              workExperience: formData.workExperience,
              monthlyIncome: formData.monthlyIncome,
              additionalIncome: formData.additionalIncome
            }}
            onInputChange={handleInputChange}
          />
        );
      case 6:
        return (
          <DocumentsStep
            formData={{ documents: formData.documents }}
            onFileUpload={handleFileUpload}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-micro-gray via-white to-micro-light py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
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

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="p-8">
              {renderCurrentStep()}

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