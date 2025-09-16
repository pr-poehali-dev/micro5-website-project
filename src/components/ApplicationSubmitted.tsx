import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from '@/components/ui/icon';

interface ApplicationSubmittedProps {
  applicationId: string;
  onContinue: () => void;
  phoneNumber: string;
}

const ApplicationSubmitted: React.FC<ApplicationSubmittedProps> = ({ 
  applicationId, 
  onContinue,
  phoneNumber 
}) => {
  return (
    <div className="min-h-screen bg-micro-gray flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-white shadow-xl rounded-3xl border-0 text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-20 h-20 bg-micro-green rounded-full flex items-center justify-center mb-6">
              <Icon name="Check" size={40} className="text-white" />
            </div>
            <CardTitle className="text-3xl text-micro-dark mb-2">
              Заявка отправлена!
            </CardTitle>
            <p className="text-gray-500 text-lg">
              Ваша заявка №{applicationId} принята к рассмотрению
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="bg-micro-gray rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-micro-dark mb-4">
                Что происходит дальше?
              </h3>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-micro-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-micro-dark">Обработка заявки</h4>
                    <p className="text-gray-600 text-sm">Наша система автоматически проверяет ваши данные</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-micro-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-micro-dark">Уведомление о решении</h4>
                    <p className="text-gray-600 text-sm">
                      Результат придёт SMS на номер <span className="font-medium">{phoneNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-micro-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-micro-dark">Звонок оператора</h4>
                    <p className="text-gray-600 text-sm">
                      При одобрении с вами свяжется специалист для уточнения деталей
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-micro-blue/20 rounded-2xl p-6 bg-blue-50">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Icon name="Clock" size={20} className="text-micro-blue" />
                <span className="font-semibold text-micro-blue">Время рассмотрения</span>
              </div>
              <p className="text-micro-dark font-semibold text-lg">До 15 минут</p>
              <p className="text-gray-600 text-sm mt-1">
                В рабочее время с 9:00 до 21:00
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <Icon name="Phone" size={24} className="text-micro-green mx-auto mb-2" />
                <h4 className="font-semibold text-micro-dark text-sm">Звонок оператора</h4>
                <p className="text-gray-600 text-xs">При одобрении</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Icon name="MessageSquare" size={24} className="text-micro-blue mx-auto mb-2" />
                <h4 className="font-semibold text-micro-dark text-sm">SMS уведомление</h4>
                <p className="text-gray-600 text-xs">О статусе заявки</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-yellow-800 text-sm">Важно!</h4>
                  <p className="text-yellow-700 text-xs mt-1">
                    Пожалуйста, держите телефон включенным. Если не ответите на звонок, 
                    заявка может быть отклонена.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={onContinue}
              className="w-full bg-micro-blue hover:bg-blue-600 text-white py-4 rounded-2xl text-lg font-semibold"
            >
              Отследить статус заявки
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </Button>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Номер заявки: <span className="font-mono font-semibold">{applicationId}</span>
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Сохраните этот номер для связи с поддержкой
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationSubmitted;