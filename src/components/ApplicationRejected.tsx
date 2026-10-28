import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from '@/components/ui/icon';

interface ApplicationRejectedProps {
  applicationId: string;
  debtAmount: number;
  onBackToMain: () => void;
  onNewApplication: () => void;
}

const ApplicationRejected: React.FC<ApplicationRejectedProps> = ({
  applicationId,
  debtAmount,
  onBackToMain,
  onNewApplication
}) => {
  const [timeUntilNewApplication, setTimeUntilNewApplication] = useState({
    days: 5,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [canApplyAgain, setCanApplyAgain] = useState(false);

  useEffect(() => {
    // Симуляция отсчета времени до следующей заявки
    // В реальном приложении здесь будет проверка с сервера
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setCanApplyAgain(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeUntilNewApplication({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDebtImpact = () => {
    if (debtAmount >= 50000) {
      return {
        level: 'critical',
        color: 'red',
        title: 'Критический уровень задолженности',
        description: 'Очень высокая задолженность требует урегулирования'
      };
    } else if (debtAmount >= 25000) {
      return {
        level: 'high',
        color: 'orange',
        title: 'Высокий уровень задолженности',
        description: 'Значительная задолженность влияет на кредитный рейтинг'
      };
    } else {
      return {
        level: 'medium',
        color: 'yellow',
        title: 'Средний уровень задолженности',
        description: 'Задолженность превышает допустимый лимит'
      };
    }
  };

  const debtInfo = getDebtImpact();

  return (
    <div className="min-h-screen bg-micro-gray flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={onBackToMain}
          className="mb-6 text-micro-blue hover:bg-blue-50"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          На главную
        </Button>

        <Card className="bg-white shadow-md rounded-lg border border-slate-200">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Icon name="XCircle" size={40} className="text-red-500" />
            </div>
            <CardTitle className="text-3xl text-micro-dark mb-2">
              Заявка отклонена
            </CardTitle>
            <p className="text-gray-500 text-lg">
              Заявка №{applicationId} не может быть одобрена
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Причина отказа */}
            <div className={`border border-${debtInfo.color}-200 rounded-lg p-6 bg-${debtInfo.color}-50`}>
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={24} className={`text-${debtInfo.color}-600 flex-shrink-0 mt-1`} />
                <div>
                  <h3 className={`text-lg font-semibold text-${debtInfo.color}-800 mb-2`}>
                    Причина отказа
                  </h3>
                  <p className={`text-${debtInfo.color}-700 mb-3`}>
                    {debtInfo.title}
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Обнаруженная задолженность по ФССП:</span>
                      <span className="font-bold text-red-600 text-xl">
                        {debtAmount.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                  <p className={`text-${debtInfo.color}-600 text-sm mt-3`}>
                    {debtInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Что делать дальше */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-micro-blue mb-4 flex items-center">
                <Icon name="Lightbulb" size={20} className="mr-2" />
                Что делать дальше?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-micro-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-xs">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-micro-dark">Погасите задолженность</h4>
                    <p className="text-gray-600 text-sm">
                      Обратитесь в службу судебных приставов для урегулирования долга
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-micro-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-xs">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-micro-dark">Дождитесь обновления данных</h4>
                    <p className="text-gray-600 text-sm">
                      После погашения долга база ФССП обновляется в течение 1-3 рабочих дней
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-micro-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-xs">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-micro-dark">Подайте новую заявку</h4>
                    <p className="text-gray-600 text-sm">
                      Через 5 дней вы сможете подать повторную заявку на займ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Таймер до следующей заявки */}
            {!canApplyAgain && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-micro-dark mb-4">
                  Повторная заявка через:
                </h3>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-micro-blue">
                      {timeUntilNewApplication.days}
                    </div>
                    <div className="text-sm text-gray-500">дней</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-micro-blue">
                      {timeUntilNewApplication.hours}
                    </div>
                    <div className="text-sm text-gray-500">часов</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-micro-blue">
                      {timeUntilNewApplication.minutes}
                    </div>
                    <div className="text-sm text-gray-500">минут</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-2xl font-bold text-micro-blue">
                      {timeUntilNewApplication.seconds}
                    </div>
                    <div className="text-sm text-gray-500">секунд</div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">
                  Система автоматически разрешит подачу новой заявки
                </p>
              </div>
            )}

            {/* Контакты поддержки */}
            <div className="bg-micro-gray rounded-lg p-6">
              <h3 className="text-lg font-semibold text-micro-dark mb-4 flex items-center">
                <Icon name="Headphones" size={20} className="mr-2" />
                Нужна помощь?
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                  <Icon name="Phone" size={20} className="text-micro-blue" />
                  <div>
                    <div className="font-semibold text-micro-dark">8 (800) 555-35-35</div>
                    <div className="text-sm text-gray-500">Горячая линия</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                  <Icon name="MessageCircle" size={20} className="text-micro-green" />
                  <div>
                    <div className="font-semibold text-micro-dark">Онлайн-чат</div>
                    <div className="text-sm text-gray-500">24/7 поддержка</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col space-y-3">
              {canApplyAgain ? (
                <Button 
                  onClick={onNewApplication}
                  className="w-full bg-micro-green hover:bg-red-700 text-white py-4 rounded-lg text-lg font-semibold"
                >
                  Подать новую заявку
                  <Icon name="Plus" size={20} className="ml-2" />
                </Button>
              ) : (
                <Button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-4 rounded-lg text-lg font-semibold cursor-not-allowed"
                >
                  Подача заявки заблокирована
                  <Icon name="Clock" size={20} className="ml-2" />
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={onBackToMain}
                className="w-full py-4 rounded-lg text-lg font-semibold border-micro-blue text-micro-blue hover:bg-blue-50"
              >
                Вернуться на главную
              </Button>
            </div>

            {/* Дополнительная информация */}
            <div className="text-center text-sm text-gray-500">
              <p>
                Номер отклоненной заявки: <span className="font-mono">{applicationId}</span>
              </p>
              <p className="mt-1">
                Все решения принимаются автоматически на основе данных ФССП
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationRejected;