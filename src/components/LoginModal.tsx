import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface LoginModalProps {
  children: React.ReactNode;
  onLogin?: (phone: string, code: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ children, onLogin }) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 1) return `+7`;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    
    // Имитация отправки SMS
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep('code');
    setIsLoading(false);
    setCountdown(60);
    
    // Запускаем обратный отсчёт
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    
    // Имитация проверки кода
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    if (onLogin) {
      onLogin(phone, code);
    }
  };

  const handleResendCode = () => {
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-micro-dark">
            Вход в личный кабинет
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {step === 'phone' && (
            <Card className="border-0 bg-micro-gray">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-micro-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="Smartphone" size={32} className="text-micro-blue" />
                  </div>
                  <h3 className="font-semibold text-micro-dark mb-2">Введите номер телефона</h3>
                  <p className="text-gray-600 text-sm">
                    Мы отправим SMS с кодом подтверждения
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone-login">Номер телефона</Label>
                    <Input
                      id="phone-login"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="rounded-xl text-lg"
                      maxLength={18}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSendCode}
                    disabled={phone.length < 18 || isLoading}
                    className="w-full bg-micro-blue hover:bg-blue-600 rounded-xl py-3"
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Отправляем SMS...
                      </>
                    ) : (
                      <>
                        <Icon name="MessageSquare" size={16} className="mr-2" />
                        Получить код
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'code' && (
            <Card className="border-0 bg-micro-gray">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-micro-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="ShieldCheck" size={32} className="text-micro-green" />
                  </div>
                  <h3 className="font-semibold text-micro-dark mb-2">Введите код из SMS</h3>
                  <p className="text-gray-600 text-sm">
                    Код отправлен на номер <span className="font-medium">{phone}</span>
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => setStep('phone')}
                    className="text-micro-blue p-0 h-auto"
                  >
                    Изменить номер
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code-input">Код подтверждения</Label>
                    <Input
                      id="code-input"
                      type="text"
                      placeholder="1234"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="rounded-xl text-lg text-center tracking-widest"
                      maxLength={4}
                      autoFocus
                    />
                  </div>
                  
                  {countdown > 0 && (
                    <div className="text-center">
                      <Badge variant="secondary" className="bg-micro-light">
                        <Icon name="Clock" size={14} className="mr-1" />
                        Повторная отправка через {countdown}с
                      </Badge>
                    </div>
                  )}
                  
                  {countdown === 0 && (
                    <div className="text-center">
                      <Button 
                        variant="link" 
                        onClick={handleResendCode}
                        className="text-micro-blue"
                      >
                        <Icon name="RotateCcw" size={16} className="mr-2" />
                        Отправить код повторно
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleVerifyCode}
                    disabled={code.length !== 4 || isLoading}
                    className="w-full bg-micro-green hover:bg-green-600 rounded-xl py-3"
                  >
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Проверяем код...
                      </>
                    ) : (
                      <>
                        <Icon name="LogIn" size={16} className="mr-2" />
                        Войти в кабинет
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="text-center text-sm text-gray-500">
            <p>
              Нажимая "Получить код", вы соглашаетесь с{' '}
              <a href="#" className="text-micro-blue hover:underline">
                условиями использования
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;