import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ContactStepProps {
  formData: {
    phone: string;
    email: string;
  };
  onInputChange: (field: string, value: string) => void;
  formatPhoneNumber: (phone: string) => string;
}

const ContactStep: React.FC<ContactStepProps> = ({
  formData,
  onInputChange,
  formatPhoneNumber
}) => {
  return (
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
            onChange={(e) => onInputChange('phone', formatPhoneNumber(e.target.value))}
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
            onChange={(e) => onInputChange('email', e.target.value)}
            className="rounded-xl"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ContactStep;