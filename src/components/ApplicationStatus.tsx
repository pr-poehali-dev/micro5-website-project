import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface ApplicationStatusProps {
  applicationId: string;
  onBackToMain: () => void;
}

type StatusType = 'processing' | 'document-check' | 'approval' | 'approved' | 'rejected';

interface StatusStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ applicationId, onBackToMain }) => {
  const [currentStatus, setCurrentStatus] = useState<StatusType>('processing');
  const [progress, setProgress] = useState(15);
  const [estimatedTime, setEstimatedTime] = useState(15);

  const statusSteps: StatusStep[] = [
    {
      id: 'submitted',
      title: 'Заявка принята',
      description: 'Ваша заявка успешно отправлена в обработку',
      status: 'completed',
      timestamp: '14:25'
    },
    {
      id: 'processing',
      title: 'Предварительная проверка',
      description: 'Проверяем базовые данные и скоринг',
      status: currentStatus === 'processing' ? 'current' : (progress > 30 ? 'completed' : 'pending'),
      timestamp: currentStatus === 'processing' && progress > 30 ? '14:27' : undefined
    },
    {
      id: 'document-check',
      title: 'Проверка документов',
      description: 'Анализируем загруженные документы',
      status: currentStatus === 'document-check' ? 'current' : (progress > 60 ? 'completed' : 'pending'),
      timestamp: currentStatus === 'document-check' && progress > 60 ? '14:30' : undefined
    },
    {
      id: 'approval',
      title: 'Финальное решение',
      description: 'Принимаем решение по займу',
      status: currentStatus === 'approval' ? 'current' : (progress > 90 ? 'completed' : 'pending'),
      timestamp: currentStatus === 'approval' && progress > 90 ? '14:32' : undefined
    },
    {
      id: 'completed',
      title: 'Решение принято',
      description: 'Заявка обработана, результат готов',
      status: currentStatus === 'approved' || currentStatus === 'rejected' ? 'completed' : 'pending',
      timestamp: currentStatus === 'approved' || currentStatus === 'rejected' ? '14:35' : undefined
    }
  ];

  // Симуляция процесса обработки
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    // Прогресс обработки
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          const newProgress = prev + Math.random() * 5;
          return Math.min(newProgress, 100);
        }
        return prev;
      });
    }, 2000);
    intervals.push(progressInterval);

    // Изменение статуса
    const statusTimeout1 = setTimeout(() => {
      setCurrentStatus('document-check');
      setEstimatedTime(10);
    }, 8000);
    intervals.push(statusTimeout1);

    const statusTimeout2 = setTimeout(() => {
      setCurrentStatus('approval');
      setEstimatedTime(5);
    }, 16000);
    intervals.push(statusTimeout2);

    const statusTimeout3 = setTimeout(() => {
      setCurrentStatus('approved');
      setProgress(100);
      setEstimatedTime(0);
    }, 24000);
    intervals.push(statusTimeout3);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, []);

  const getStatusIcon = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return <Icon name="CheckCircle" size={24} className="text-micro-green" />;
      case 'current':
        return <Icon name="Loader2" size={24} className="text-micro-blue animate-spin" />;
      case 'pending':
        return <Icon name="Circle" size={24} className="text-gray-300" />;
    }
  };

  const getCurrentStatusMessage = () => {
    switch (currentStatus) {
      case 'processing':
        return {
          title: 'Обрабатываем вашу заявку',
          message: 'Проверяем ваши данные и кредитную историю. Это займет несколько минут.',
          color: 'bg-micro-blue'
        };
      case 'document-check':
        return {
          title: 'Проверяем документы',
          message: 'Анализируем загруженные документы с помощью ИИ-алгоритмов.',
          color: 'bg-purple-600'
        };
      case 'approval':
        return {
          title: 'Принимаем решение',
          message: 'Последний этап - финальное решение по вашей заявке.',
          color: 'bg-orange-600'
        };
      case 'approved':
        return {
          title: 'Заявка одобрена!',
          message: 'Поздравляем! Ваша заявка одобрена. Деньги будут переведены на карту.',
          color: 'bg-micro-green'
        };
      case 'rejected':
        return {
          title: 'Заявка отклонена',
          message: 'К сожалению, мы не можем одобрить займ в данный момент.',
          color: 'bg-red-600'
        };
    }
  };

  const statusMessage = getCurrentStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-micro-gray via-white to-micro-light py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <Button variant="ghost" onClick={onBackToMain} className="mb-4">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На главную
            </Button>
            <h1 className="text-3xl font-bold text-micro-dark mb-2">Статус заявки</h1>
            <p className="text-gray-600">Заявка № {applicationId}</p>
          </div>

          {/* Основной статус */}
          <Card className={`rounded-3xl border-0 shadow-lg mb-8 ${statusMessage.color} text-white`}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                {currentStatus === 'approved' ? (
                  <Icon name="CheckCircle" size={40} className="text-white" />
                ) : currentStatus === 'rejected' ? (
                  <Icon name="XCircle" size={40} className="text-white" />
                ) : (
                  <Icon name="Clock" size={40} className="text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-4">{statusMessage.title}</h2>
              <p className="text-lg opacity-90 mb-6">{statusMessage.message}</p>
              
              {currentStatus !== 'approved' && currentStatus !== 'rejected' && (
                <div className="bg-white/20 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Прогресс обработки</span>
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/20" />
                  {estimatedTime > 0 && (
                    <p className="text-sm opacity-75 mt-2">
                      Примерное время ожидания: {estimatedTime} мин
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Детальный прогресс */}
          <Card className="rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="List" size={20} className="mr-2 text-micro-blue" />
                Этапы обработки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {statusSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(step.status)}
                    {index < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${
                        step.status === 'completed' ? 'bg-micro-green' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${
                        step.status === 'completed' ? 'text-micro-green' :
                        step.status === 'current' ? 'text-micro-blue' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      {step.timestamp && (
                        <Badge variant="secondary" className="text-xs">
                          {step.timestamp}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      step.status === 'pending' ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Информация о заявке */}
          <Card className="rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="FileText" size={20} className="mr-2 text-micro-blue" />
                Детали заявки
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Сумма займа</p>
                <p className="font-semibold text-lg">25 000 ₽</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Срок займа</p>
                <p className="font-semibold text-lg">15 дней</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">К возврату</p>
                <p className="font-semibold text-lg text-micro-blue">25 300 ₽</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Дата подачи</p>
                <p className="font-semibold text-lg">{new Date().toLocaleDateString('ru-RU')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Действия */}
          {currentStatus === 'approved' && (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-micro-dark mb-4">Что дальше?</h3>
                <p className="text-gray-600 mb-6">
                  Ваша заявка одобрена! Деньги будут переведены на указанную карту в течение 15 минут.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-micro-green hover:bg-green-600 rounded-xl">
                    <Icon name="CreditCard" size={16} className="mr-2" />
                    Получить деньги
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать договор
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStatus === 'rejected' && (
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-micro-dark mb-4">Заявка отклонена</h3>
                <p className="text-gray-600 mb-6">
                  К сожалению, мы не можем одобрить займ в данный момент. 
                  Вы можете подать новую заявку через 30 дней.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={onBackToMain} className="bg-micro-blue hover:bg-blue-600 rounded-xl">
                    <Icon name="RotateCcw" size={16} className="mr-2" />
                    Попробовать снова
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    <Icon name="Phone" size={16} className="mr-2" />
                    Связаться с поддержкой
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Поддержка */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Есть вопросы? Мы всегда готовы помочь!</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Icon name="MessageCircle" size={16} className="mr-2" />
                Чат
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Icon name="Phone" size={16} className="mr-2" />
                8 (800) 555-35-35
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;