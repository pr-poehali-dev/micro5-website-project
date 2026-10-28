import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmbedCodeGenerator } from '@/components/loan/EmbedCodeGenerator';
import { EmbeddableCalculator } from '@/components/loan/EmbeddableCalculator';
import Icon from '@/components/ui/icon';

const WidgetGenerator: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Генератор виджета калькулятора займа
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Создайте персонализированный калькулятор займа для вашего сайта. 
            Настройте внешний вид и получите готовый код для встраивания.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Предварительный просмотр */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Eye" size={24} />
                  Предварительный просмотр
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <EmbeddableCalculator />
              </CardContent>
            </Card>

            {/* Преимущества виджета */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Star" size={24} />
                  Преимущества виджета
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Zap" size={20} className="text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Быстрая установка</h4>
                      <p className="text-sm text-gray-600">
                        Просто скопируйте код и вставьте на любую страницу
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Icon name="Palette" size={20} className="text-red-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Настраиваемый дизайн</h4>
                      <p className="text-sm text-gray-600">
                        Адаптируется под фирменные цвета вашего бренда
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="Smartphone" size={20} className="text-red-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Мобильная адаптация</h4>
                      <p className="text-sm text-gray-600">
                        Отлично работает на всех устройствах
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="BarChart3" size={20} className="text-orange-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Увеличение конверсии</h4>
                      <p className="text-sm text-gray-600">
                        Помогает клиентам быстро рассчитать стоимость займа
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon name="Shield" size={20} className="text-red-500 mt-1" />
                    <div>
                      <h4 className="font-semibold">Безопасность</h4>
                      <p className="text-sm text-gray-600">
                        Виджет работает через защищенное соединение
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Генератор кода */}
          <div>
            <EmbedCodeGenerator />
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Users" size={20} />
                Для партнеров
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Рекомендуйте наши займы на своем сайте и получайте комиссию 
                за каждого привлеченного клиента.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="HeadphonesIcon" size={20} />
                Поддержка 24/7
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Если у вас возникли вопросы по установке виджета, 
                наша техподдержка поможет вам в любое время.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="TrendingUp" size={20} />
                Аналитика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Отслеживайте эффективность виджета через панель партнера 
                и оптимизируйте размещение.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WidgetGenerator;