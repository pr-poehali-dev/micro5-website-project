import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface ApplicationReviewProps {
  applicationId: string;
  onBackToMain: () => void;
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({
  applicationId,
  onBackToMain
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [status, setStatus] = useState<'processing' | 'approved' | 'rejected'>('processing');
  const [hasDebts, setHasDebts] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          checkFsspDebts();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkFsspDebts = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const hasDebtsResult = Math.random() < 0.3;
    setHasDebts(hasDebtsResult);
    
    if (hasDebtsResult) {
      setStatus('rejected');
    } else {
      setStatus('approved');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((60 - timeLeft) / 60) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-micro-gray via-white to-micro-light py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {status === 'processing' && (
            <Card className="rounded-3xl border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-micro-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Clock" size={40} className="text-micro-blue" />
                </div>
                <CardTitle className="text-2xl text-micro-dark">Заявка на рассмотрении</CardTitle>
                <p className="text-gray-600">
                  Заявка №{applicationId} обрабатывается нашими специалистами
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-micro-blue mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-gray-600">Осталось времени до результата</p>
                </div>
                
                <Progress value={progress} className="h-3" />
                
                <div className="bg-micro-gray rounded-2xl p-6">
                  <h3 className="font-semibold text-micro-dark mb-4">Что происходит сейчас:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Icon name="CheckCircle" size={16} className="text-micro-green mr-3" />
                      <span className="text-sm">Заявка получена и зарегистрирована</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="Clock" size={16} className="text-micro-blue mr-3" />
                      <span className="text-sm">Проверяем данные в базах ФССП</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="Shield" size={16} className="text-gray-400 mr-3" />
                      <span className="text-sm text-gray-500">Принятие решения по займу</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Пожалуйста, не закрывайте страницу до получения результата
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {status === 'approved' && (
            <Card className="rounded-3xl border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-micro-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={40} className="text-micro-green" />
                </div>
                <CardTitle className="text-2xl text-micro-green">Заявка одобрена!</CardTitle>
                <p className="text-gray-600">
                  Поздравляем! Ваша заявка на займ успешно одобрена
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-micro-green/5 border border-micro-green/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Заявка №</span>
                    <Badge className="bg-micro-green text-white">{applicationId}</Badge>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Статус</span>
                    <Badge className="bg-micro-green text-white">
                      <Icon name="CheckCircle" size={14} className="mr-1" />
                      Одобрено
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Время обработки</span>
                    <span className="font-semibold">1 минута</span>
                  </div>
                </div>
                
                <div className="bg-micro-blue/5 border border-micro-blue/20 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <Icon name="Phone" size={20} className="text-micro-blue mr-3" />
                    <h3 className="font-semibold text-micro-dark">Что дальше?</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Наш специалист свяжется с вами в течение <strong>15 минут</strong> для завершения оформления займа и выдачи денежных средств.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Icon name="Clock" size={16} className="mr-2" />
                    Ожидайте звонка с номера 8 (800) 555-35-35
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={onBackToMain}
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    На главную
                  </Button>
                  <Button 
                    className="flex-1 bg-micro-green hover:bg-green-600 rounded-xl"
                  >
                    <Icon name="Phone" size={16} className="mr-2" />
                    Перезвонить мне
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {status === 'rejected' && (
            <Card className="rounded-3xl border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="XCircle" size={40} className="text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-600">Заявка отклонена</CardTitle>
                <p className="text-gray-600">
                  К сожалению, мы не можем одобрить ваш займ
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <Icon name="AlertTriangle" size={20} className="text-red-600 mr-3" />
                    <h3 className="font-semibold text-red-800">Причина отказа</h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    В базе данных ФССП найдены непогашенные долговые обязательства. 
                    Согласно внутренним правилам компании, мы не можем предоставить займ при наличии задолженности.
                  </p>
                  <div className="flex items-center text-sm text-red-600">
                    <Icon name="Info" size={16} className="mr-2" />
                    Рекомендуем погасить задолженность и подать заявку повторно
                  </div>
                </div>
                
                <div className="bg-micro-gray rounded-2xl p-6">
                  <h3 className="font-semibold text-micro-dark mb-4">Что можно сделать:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Icon name="CheckCircle2" size={16} className="text-micro-blue mr-3 mt-0.5" />
                      <span className="text-sm">Проверить задолженность на сайте ФССП</span>
                    </div>
                    <div className="flex items-start">
                      <Icon name="CheckCircle2" size={16} className="text-micro-blue mr-3 mt-0.5" />
                      <span className="text-sm">Погасить имеющиеся долги</span>
                    </div>
                    <div className="flex items-start">
                      <Icon name="CheckCircle2" size={16} className="text-micro-blue mr-3 mt-0.5" />
                      <span className="text-sm">Подать заявку повторно через 3-5 рабочих дней</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={onBackToMain}
                    className="flex-1 bg-micro-blue hover:bg-blue-600 rounded-xl"
                  >
                    На главную
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Проверить ФССП
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationReview;