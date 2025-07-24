import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface AddressData {
  region: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postalCode: string;
}

interface AddressStepProps {
  formData: {
    registrationAddress: AddressData;
    actualAddress: AddressData;
    sameAsRegistration: boolean;
  };
  onAddressChange: (type: 'registrationAddress' | 'actualAddress', field: string, value: string) => void;
  onSameAsRegistration: (checked: boolean) => void;
}

const AddressStep: React.FC<AddressStepProps> = ({
  formData,
  onAddressChange,
  onSameAsRegistration
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="MapPin" size={32} className="text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-micro-dark">Адреса</h3>
      </div>
      
      <div>
        <h4 className="font-medium text-micro-dark mb-4">Адрес регистрации</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Регион *</Label>
            <Input
              placeholder="Московская область"
              value={formData.registrationAddress.region}
              onChange={(e) => onAddressChange('registrationAddress', 'region', e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          <div>
            <Label>Город *</Label>
            <Input
              placeholder="Москва"
              value={formData.registrationAddress.city}
              onChange={(e) => onAddressChange('registrationAddress', 'city', e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          <div>
            <Label>Улица *</Label>
            <Input
              placeholder="ул. Тверская"
              value={formData.registrationAddress.street}
              onChange={(e) => onAddressChange('registrationAddress', 'street', e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          <div>
            <Label>Дом *</Label>
            <Input
              placeholder="12"
              value={formData.registrationAddress.house}
              onChange={(e) => onAddressChange('registrationAddress', 'house', e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          <div>
            <Label>Квартира</Label>
            <Input
              placeholder="34"
              value={formData.registrationAddress.apartment}
              onChange={(e) => onAddressChange('registrationAddress', 'apartment', e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <Label>Почтовый индекс *</Label>
            <Input
              placeholder="123456"
              value={formData.registrationAddress.postalCode}
              onChange={(e) => onAddressChange('registrationAddress', 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="rounded-xl"
              maxLength={6}
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sameAddress"
          checked={formData.sameAsRegistration}
          onCheckedChange={onSameAsRegistration}
        />
        <Label htmlFor="sameAddress">Адрес проживания совпадает с адресом регистрации</Label>
      </div>
      
      {!formData.sameAsRegistration && (
        <div>
          <h4 className="font-medium text-micro-dark mb-4">Адрес проживания</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Регион *</Label>
              <Input
                placeholder="Московская область"
                value={formData.actualAddress.region}
                onChange={(e) => onAddressChange('actualAddress', 'region', e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <Label>Город *</Label>
              <Input
                placeholder="Москва"
                value={formData.actualAddress.city}
                onChange={(e) => onAddressChange('actualAddress', 'city', e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <Label>Улица *</Label>
              <Input
                placeholder="ул. Тверская"
                value={formData.actualAddress.street}
                onChange={(e) => onAddressChange('actualAddress', 'street', e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <Label>Дом *</Label>
              <Input
                placeholder="12"
                value={formData.actualAddress.house}
                onChange={(e) => onAddressChange('actualAddress', 'house', e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <Label>Квартира</Label>
              <Input
                placeholder="34"
                value={formData.actualAddress.apartment}
                onChange={(e) => onAddressChange('actualAddress', 'apartment', e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Почтовый индекс *</Label>
              <Input
                placeholder="123456"
                value={formData.actualAddress.postalCode}
                onChange={(e) => onAddressChange('actualAddress', 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="rounded-xl"
                maxLength={6}
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressStep;