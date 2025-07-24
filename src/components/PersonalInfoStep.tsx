import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface PersonalInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    middleName: string;
    birthDate: string;
    birthPlace: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  onInputChange
}) => {
  return (
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
            onChange={(e) => onInputChange('lastName', e.target.value)}
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
            onChange={(e) => onInputChange('firstName', e.target.value)}
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
            onChange={(e) => onInputChange('middleName', e.target.value)}
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
            onChange={(e) => onInputChange('birthDate', e.target.value)}
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
            onChange={(e) => onInputChange('birthPlace', e.target.value)}
            className="rounded-xl"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;