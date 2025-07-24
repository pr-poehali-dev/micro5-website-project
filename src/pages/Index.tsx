import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import LoginModal from '@/components/LoginModal';
import Dashboard from '@/components/Dashboard';
import ExtendedApplicationForm from '@/components/ExtendedApplicationForm';
import ApplicationStatus from '@/components/ApplicationStatus';
import { submitLoanApplication } from '@/utils/amoCrmIntegration';

const Index = () => {
  const [loanAmount, setLoanAmount] = useState([25000]);
  const [loanDays, setLoanDays] = useState([15]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [currentView, setCurrentView] = useState<'main' | 'application' | 'status'>('main');
  const [applicationId, setApplicationId] = useState('');

  const dailyRate = 0.08; // 0.08% в день
  const totalInterest = (loanAmount[0] * dailyRate * loanDays[0]) / 100;
  const totalPayment = loanAmount[0] + totalInterest;



  const handleLogin = (phone: string, code: string) => {
    setUserPhone(phone);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserPhone('');
  };

  const handleStartApplication = () => {
    setCurrentView('application');
  };

  const handleApplicationSubmit = async (formData: any) => {
    const applicationData = {
      ...formData,
      loanAmount: loanAmount[0],
      loanDays: loanDays[0]
    };

    const result = await submitLoanApplication(applicationData);
    
    if (result.success) {
      setApplicationId(result.leadId || '');
      setCurrentView('status');
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  if (isLoggedIn) {
    return <Dashboard userPhone={userPhone} onLogout={handleLogout} />;
  }

  if (currentView === 'application') {
    return (
      <ExtendedApplicationForm
        loanAmount={loanAmount[0]}
        loanDays={loanDays[0]}
        onSubmit={handleApplicationSubmit}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentView === 'status') {
    return (
      <ApplicationStatus
        applicationId={applicationId}
        onBackToMain={handleBackToMain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-micro-gray via-white to-micro-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-micro-blue rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">М5</span>
              </div>
              <span className="text-2xl font-bold text-micro-dark">Микро5</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#calculator" className="text-micro-dark hover:text-micro-blue transition-colors">Калькулятор</a>
              <a href="#about" className="text-micro-dark hover:text-micro-blue transition-colors">О компании</a>
              <a href="#contacts" className="text-micro-dark hover:text-micro-blue transition-colors">Контакты</a>
              <Button variant="outline" className="rounded-full">
                <Icon name="Phone" size={16} className="mr-2" />
                Обратный звонок
              </Button>
              <LoginModal onLogin={handleLogin}>
                <Button className="bg-micro-blue hover:bg-blue-600 rounded-full">
                  <Icon name="User" size={16} className="mr-2" />
                  Личный кабинет
                </Button>
              </LoginModal>
            </nav>

            <Button variant="ghost" className="md:hidden">
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge className="bg-micro-green/10 text-micro-green border-micro-green/20 mb-6">
                💰 Займы до 50 000 ₽
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-micro-dark mb-6 leading-tight">
                Быстрые займы от
                <span className="text-micro-blue"> 1000 ₽</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Получите деньги на карту за 15 минут. Ставка всего 0.08% в день. 
                Без справок и поручителей.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Icon name="Clock" size={20} className="text-micro-green mr-2" />
                  <span>15 минут на решение</span>
                </div>
                <div className="flex items-center">
                  <Icon name="Shield" size={20} className="text-micro-green mr-2" />
                  <span>100% безопасно</span>
                </div>
                <div className="flex items-center">
                  <Icon name="CreditCard" size={20} className="text-micro-green mr-2" />
                  <span>На любую карту</span>
                </div>
              </div>
            </div>

            {/* Калькулятор займов */}
            <Card className="animate-slide-up bg-white shadow-2xl rounded-3xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-micro-dark">Калькулятор займа</CardTitle>
                <p className="text-gray-500">Рассчитайте выгодные условия</p>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-micro-dark font-medium">Сумма займа</Label>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-micro-blue">{loanAmount[0].toLocaleString()} ₽</span>
                    </div>
                  </div>
                  <Slider
                    value={loanAmount}
                    onValueChange={setLoanAmount}
                    max={50000}
                    min={1000}
                    step={500}
                    className="[&>.slider-track]:bg-micro-blue/20 [&>.slider-range]:bg-micro-blue [&>.slider-thumb]:bg-micro-blue"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1 000 ₽</span>
                    <span>50 000 ₽</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-micro-dark font-medium">Срок займа</Label>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-micro-green">{loanDays[0]} дней</span>
                    </div>
                  </div>
                  <Slider
                    value={loanDays}
                    onValueChange={setLoanDays}
                    max={30}
                    min={1}
                    step={1}
                    className="[&>.slider-track]:bg-micro-green/20 [&>.slider-range]:bg-micro-green [&>.slider-thumb]:bg-micro-green"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1 день</span>
                    <span>30 дней</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-micro-gray rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сумма займа:</span>
                    <span className="font-semibold">{loanAmount[0].toLocaleString()} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Проценты:</span>
                    <span className="font-semibold">{totalInterest.toFixed(0)} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ставка в день:</span>
                    <span className="font-semibold text-micro-green">0.08%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">К возврату:</span>
                    <span className="font-bold text-micro-blue">{totalPayment.toFixed(0)} ₽</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-micro-blue hover:bg-blue-600 text-white py-4 rounded-2xl text-lg font-semibold"
                  onClick={handleStartApplication}
                >
                  Получить займ
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Преимущества */}
      <section className="py-16 bg-micro-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-micro-dark mb-4">Почему выбирают Микро5</h2>
            <p className="text-gray-600">Надежные займы с выгодными условиями</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-micro-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon name="Zap" size={32} className="text-micro-blue" />
                </div>
                <h3 className="text-xl font-semibold text-micro-dark mb-4">Быстрое решение</h3>
                <p className="text-gray-600">Рассматриваем заявки за 15 минут. Деньги поступают на карту моментально.</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-micro-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon name="Percent" size={32} className="text-micro-green" />
                </div>
                <h3 className="text-xl font-semibold text-micro-dark mb-4">Низкая ставка</h3>
                <p className="text-gray-600">Всего 0.08% в день. Без скрытых комиссий и дополнительных платежей.</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icon name="FileText" size={32} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-micro-dark mb-4">Без справок</h3>
                <p className="text-gray-600">Только паспорт и видеоидентификация. Никаких справок о доходах.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Чат-бот */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="w-16 h-16 rounded-full bg-micro-blue hover:bg-blue-600 shadow-lg animate-bounce-soft">
          <Icon name="MessageCircle" size={24} />
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-micro-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-micro-blue rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">М5</span>
                </div>
                <span className="text-2xl font-bold">Микро5</span>
              </div>
              <p className="text-gray-300">Надежные займы с выгодными условиями. Лицензия ЦБ РФ.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Займы до 50 000 ₽</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Калькулятор займа</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Личный кабинет</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Лицензии</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <Icon name="Phone" size={16} className="mr-2" />
                  <span>8 (800) 555-35-35</span>
                </div>
                <div className="flex items-center">
                  <Icon name="Mail" size={16} className="mr-2" />
                  <span>info@micro5.ru</span>
                </div>
                <div className="flex items-center">
                  <Icon name="Clock" size={16} className="mr-2" />
                  <span>24/7</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-gray-300">
            <p>&copy; 2024 Микро5. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;