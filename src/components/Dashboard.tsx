import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface LoanData {
  id: string;
  amount: number;
  returnAmount: number;
  dueDate: string;
  status: 'active' | 'overdue' | 'paid';
  daysLeft: number;
}

interface ApplicationData {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  statusText: string;
}

interface DashboardProps {
  userPhone: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userPhone, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Моковые данные займов
  const loans: LoanData[] = [
    {
      id: 'LOAN-001',
      amount: 25000,
      returnAmount: 26200,
      dueDate: '2024-08-15',
      status: 'active',
      daysLeft: 12
    },
    {
      id: 'LOAN-002',
      amount: 15000,
      returnAmount: 15600,
      dueDate: '2024-07-25',
      status: 'paid',
      daysLeft: 0
    }
  ];

  // Моковые данные заявок
  const applications: ApplicationData[] = [
    {
      id: 'APP-003',
      amount: 35000,
      date: '2024-07-20',
      status: 'processing',
      statusText: 'Проходит проверку'
    },
    {
      id: 'APP-002',
      amount: 25000,
      date: '2024-07-15',
      status: 'approved',
      statusText: 'Одобрена, займ активен'
    },
    {
      id: 'APP-001',
      amount: 45000,
      date: '2024-07-10',
      status: 'rejected',
      statusText: 'Отклонена'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-micro-green text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'paid': return 'bg-gray-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'approved': return 'bg-micro-green text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'processing': return 'bg-micro-blue text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'Clock';
      case 'overdue': return 'AlertTriangle';
      case 'paid': return 'CheckCircle';
      case 'pending': return 'Clock';
      case 'approved': return 'CheckCircle';
      case 'rejected': return 'XCircle';
      case 'processing': return 'Loader2';
      default: return 'Circle';
    }
  };

  const activeLoan = loans.find(loan => loan.status === 'active');
  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPaid = loans.filter(loan => loan.status === 'paid').reduce((sum, loan) => sum + loan.returnAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-micro-gray via-white to-micro-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-micro-blue rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">М5</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-micro-dark">Личный кабинет</span>
                <p className="text-sm text-gray-600">{userPhone}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="rounded-full">
                <Icon name="Phone" size={16} className="mr-2" />
                Поддержка
              </Button>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className="rounded-full text-gray-600"
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl p-1 shadow-lg">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-micro-blue data-[state=active]:text-white">
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="loans" className="rounded-xl data-[state=active]:bg-micro-blue data-[state=active]:text-white">
              <Icon name="CreditCard" size={16} className="mr-2" />
              Займы
            </TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl data-[state=active]:bg-micro-blue data-[state=active]:text-white">
              <Icon name="FileText" size={16} className="mr-2" />
              Заявки
            </TabsTrigger>
          </TabsList>

          {/* Обзор */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-micro-blue to-blue-600 text-white rounded-3xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="Wallet" size={24} />
                    <Badge className="bg-white/20 text-white">Активный займ</Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {activeLoan ? `${activeLoan.amount.toLocaleString()} ₽` : 'Нет займов'}
                  </h3>
                  <p className="text-blue-100">
                    {activeLoan ? `К возврату: ${activeLoan.returnAmount.toLocaleString()} ₽` : 'Можете оформить новый займ'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-micro-green to-green-600 text-white rounded-3xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="TrendingUp" size={24} />
                    <Badge className="bg-white/20 text-white">Всего займов</Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{totalBorrowed.toLocaleString()} ₽</h3>
                  <p className="text-green-100">Общая сумма займов</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="CheckCircle" size={24} />
                    <Badge className="bg-white/20 text-white">Погашено</Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{totalPaid.toLocaleString()} ₽</h3>
                  <p className="text-purple-100">Выплачено всего</p>
                </CardContent>
              </Card>
            </div>

            {activeLoan && (
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="Calendar" size={20} className="mr-2 text-micro-blue" />
                    Активный займ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600">Номер займа</p>
                      <p className="font-semibold">{activeLoan.id}</p>
                    </div>
                    <Badge className={getStatusColor(activeLoan.status)}>
                      Активный
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Сумма займа:</span>
                      <span className="font-semibold">{activeLoan.amount.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">К возврату:</span>
                      <span className="font-semibold text-micro-blue">{activeLoan.returnAmount.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дата возврата:</span>
                      <span className="font-semibold">{new Date(activeLoan.dueDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Осталось дней:</span>
                      <span className="font-semibold text-micro-green">{activeLoan.daysLeft}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Прогресс до возврата</span>
                      <span className="text-sm font-medium">{Math.round((30 - activeLoan.daysLeft) / 30 * 100)}%</span>
                    </div>
                    <Progress value={(30 - activeLoan.daysLeft) / 30 * 100} className="h-2" />
                  </div>

                  <div className="flex gap-4">
                    <Button className="flex-1 bg-micro-green hover:bg-green-600 rounded-xl">
                      <Icon name="CreditCard" size={16} className="mr-2" />
                      Погасить займ
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl">
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать договор
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icon name="Plus" size={20} className="mr-2 text-micro-blue" />
                  Оформить новый займ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Получите займ до 50 000 ₽ на срок до 30 дней
                </p>
                <Button className="w-full bg-micro-blue hover:bg-blue-600 rounded-xl py-3">
                  <Icon name="Calculator" size={16} className="mr-2" />
                  Рассчитать займ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Займы */}
          <TabsContent value="loans" className="space-y-6">
            <div className="space-y-4">
              {loans.map((loan) => (
                <Card key={loan.id} className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{loan.id}</h3>
                        <p className="text-gray-600">Займ на {loan.amount.toLocaleString()} ₽</p>
                      </div>
                      <Badge className={getStatusColor(loan.status)}>
                        <Icon name={getStatusIcon(loan.status) as any} size={14} className="mr-1" />
                        {loan.status === 'active' ? 'Активный' : 
                         loan.status === 'paid' ? 'Погашен' : 'Просрочен'}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Сумма займа</p>
                        <p className="font-semibold">{loan.amount.toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">К возврату</p>
                        <p className="font-semibold">{loan.returnAmount.toLocaleString()} ₽</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Срок возврата</p>
                        <p className="font-semibold">{new Date(loan.dueDate).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>

                    {loan.status === 'active' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex gap-4">
                          <Button size="sm" className="bg-micro-green hover:bg-green-600 rounded-xl">
                            Погасить
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            Продлить
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-xl">
                            Подробнее
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Заявки */}
          <TabsContent value="applications" className="space-y-6">
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{app.id}</h3>
                        <p className="text-gray-600">Заявка на {app.amount.toLocaleString()} ₽</p>
                        <p className="text-sm text-gray-500">{new Date(app.date).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        <Icon name={getStatusIcon(app.status) as any} size={14} className="mr-1" />
                        {app.status === 'pending' ? 'Ожидает' :
                         app.status === 'approved' ? 'Одобрена' :
                         app.status === 'rejected' ? 'Отклонена' : 'Обработка'}
                      </Badge>
                    </div>

                    <div className="bg-micro-gray rounded-xl p-4">
                      <p className="text-sm font-medium text-micro-dark">{app.statusText}</p>
                      {app.status === 'processing' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Проверка документов</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-1" />
                        </div>
                      )}
                    </div>

                    {app.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button size="sm" className="bg-micro-blue hover:bg-blue-600 rounded-xl">
                          <Icon name="Download" size={14} className="mr-2" />
                          Получить деньги
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;