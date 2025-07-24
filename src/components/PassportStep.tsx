import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface PassportStepProps {
  formData: {
    passportSeries: string;
    passportNumber: string;
    passportIssueDate: string;
    passportIssuer: string;
    passportCode: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const PassportStep: React.FC<PassportStepProps> = ({
  formData,
  onInputChange
}) => {
  return (
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
            onChange={(e) => onInputChange('passportSeries', e.target.value.replace(/\D/g, '').slice(0, 4))}
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
            onChange={(e) => onInputChange('passportNumber', e.target.value.replace(/\D/g, '').slice(0, 6))}
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
          onChange={(e) => onInputChange('passportIssueDate', e.target.value)}
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
          onChange={(e) => onInputChange('passportIssuer', e.target.value)}
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
            onInputChange('passportCode', formatted);
          }}
          className="rounded-xl"
          maxLength={7}
          required
        />
      </div>
    </div>
  );
};

export default PassportStep;