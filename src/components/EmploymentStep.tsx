import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface EmploymentStepProps {
  formData: {
    employmentType: string;
    employer: string;
    position: string;
    workExperience: string;
    monthlyIncome: string;
    additionalIncome: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const EmploymentStep: React.FC<EmploymentStepProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="Briefcase" size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-micro-dark">Занятость и доходы</h3>
      </div>
      
      <div>
        <Label>Тип занятости *</Label>
        <Select value={formData.employmentType} onValueChange={(value) => onInputChange('employmentType', value)}>
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
              onChange={(e) => onInputChange('employer', e.target.value)}
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
              onChange={(e) => onInputChange('position', e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          
          <div>
            <Label>Стаж работы *</Label>
            <Select value={formData.workExperience} onValueChange={(value) => onInputChange('workExperience', value)}>
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
            onChange={(e) => onInputChange('monthlyIncome', e.target.value.replace(/\D/g, ''))}
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
            onChange={(e) => onInputChange('additionalIncome', e.target.value.replace(/\D/g, ''))}
            className="rounded-xl"
          />
          <p className="text-sm text-gray-500 mt-1">В рублях (необязательно)</p>
        </div>
      </div>
    </div>
  );
};

export default EmploymentStep;