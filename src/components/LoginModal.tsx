import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { callCabinet, setToken } from '@/lib/cabinetApi';

interface LoginModalProps {
  children: React.ReactNode;
  onLogin?: (phone: string) => void;
}

const formatPhone = (value: string) => {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return '';
  let r = '+7 (' + d.slice(0, 3);
  if (d.length >= 3) r += ')';
  if (d.length > 3) r += ' ' + d.slice(3, 6);
  if (d.length > 6) r += '-' + d.slice(6, 8);
  if (d.length > 8) r += '-' + d.slice(8, 10);
  return r;
};

const LoginModal: React.FC<LoginModalProps> = ({ children, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await callCabinet({ action: 'login', phone });
      setToken(data.token);
      onLogin?.(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    }
    setIsLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-micro-dark">
            Вход в личный кабинет
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 bg-micro-blue/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="Smartphone" size={28} className="text-micro-blue" />
            </div>
            <p className="text-gray-600 text-sm">Введите номер телефона, указанный в заявке</p>
          </div>

          <div>
            <Label htmlFor="phone-login">Номер телефона</Label>
            <Input
              id="phone-login"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="mt-2 h-12 text-base"
            />
          </div>

          {error && <p className="text-sm text-micro-green text-center">{error}</p>}

          <Button
            type="submit"
            disabled={phone.length < 18 || isLoading}
            className="w-full h-12 bg-micro-blue hover:bg-blue-800 text-white text-base"
          >
            {isLoading ? 'Входим...' : 'Войти'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
