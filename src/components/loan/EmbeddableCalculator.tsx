import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface EmbeddableCalculatorProps {
  compact?: boolean;
  theme?: 'light' | 'dark';
  brandColor?: string;
  redirectUrl?: string;
  widgetId?: string;
}

export const EmbeddableCalculator: React.FC<EmbeddableCalculatorProps> = ({
  compact = false,
  theme = 'light',
  brandColor = '#2563eb',
  redirectUrl = 'https://your-mfo-site.com',
  widgetId = 'mfo-calc'
}) => {
  const [amount, setAmount] = useState([10000]);
  const [days, setDays] = useState([15]);
  const [isVisible, setIsVisible] = useState(false);

  const interestRate = 1.5; // 1.5% в день
  const totalInterest = Math.round((amount[0] * interestRate * days[0]) / 100);
  const totalAmount = amount[0] + totalInterest;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleApply = () => {
    const params = new URLSearchParams({
      amount: amount[0].toString(),
      days: days[0].toString(),
      source: 'widget',
      widget_id: widgetId
    });
    
    window.open(`${redirectUrl}?${params.toString()}`, '_blank');
  };

  const containerClass = `
    ${theme === 'dark' ? 'dark' : ''}
    ${compact ? 'max-w-sm' : 'max-w-md'}
    transition-all duration-500 transform
    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
  `;

  const cardStyle = {
    '--brand-color': brandColor,
  } as React.CSSProperties;

  return (
    <div className={containerClass} style={cardStyle}>
      <Card className={`
        ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
        shadow-lg hover:shadow-xl transition-shadow duration-300
      `}>
        <CardHeader className={compact ? 'pb-4' : 'pb-6'}>
          <CardTitle className={`
            flex items-center gap-2 text-center justify-center
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            ${compact ? 'text-lg' : 'text-xl'}
          `}>
            <Icon 
              name="Calculator" 
              size={compact ? 20 : 24} 
              style={{ color: brandColor }}
            />
            Калькулятор займа
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Сумма займа */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className={`
                font-medium
                ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}
              `}>
                Сумма займа
              </label>
              <Badge 
                variant="secondary" 
                className="font-bold"
                style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
              >
                {amount[0].toLocaleString()} ₽
              </Badge>
            </div>
            <Slider
              value={amount}
              onValueChange={setAmount}
              max={50000}
              min={3000}
              step={1000}
              className="w-full"
            />
            <div className={`
              flex justify-between text-xs
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
            `}>
              <span>3 000 ₽</span>
              <span>50 000 ₽</span>
            </div>
          </div>

          {/* Срок займа */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className={`
                font-medium
                ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}
              `}>
                Срок займа
              </label>
              <Badge 
                variant="secondary"
                className="font-bold"
                style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
              >
                {days[0]} {days[0] === 1 ? 'день' : days[0] < 5 ? 'дня' : 'дней'}
              </Badge>
            </div>
            <Slider
              value={days}
              onValueChange={setDays}
              max={30}
              min={7}
              step={1}
              className="w-full"
            />
            <div className={`
              flex justify-between text-xs
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
            `}>
              <span>7 дней</span>
              <span>30 дней</span>
            </div>
          </div>

          {/* Расчет */}
          <div className={`
            p-4 rounded-lg space-y-2
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
          `}>
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Сумма займа:
              </span>
              <span className={`
                font-medium
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {amount[0].toLocaleString()} ₽
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Проценты ({interestRate}% в день):
              </span>
              <span className={`
                font-medium
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                {totalInterest.toLocaleString()} ₽
              </span>
            </div>
            <div className="h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
            <div className="flex justify-between">
              <span className={`
                font-bold
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                К возврату:
              </span>
              <span 
                className="font-bold text-lg"
                style={{ color: brandColor }}
              >
                {totalAmount.toLocaleString()} ₽
              </span>
            </div>
          </div>

          {/* Кнопка подачи заявки */}
          <Button 
            onClick={handleApply}
            className={`
              w-full font-semibold py-3 transition-all duration-200
              hover:scale-105 hover:shadow-lg
              ${compact ? 'text-sm' : 'text-base'}
            `}
            style={{ 
              backgroundColor: brandColor,
              borderColor: brandColor 
            }}
          >
            <Icon name="CreditCard" className="mr-2" size={16} />
            Получить займ
          </Button>

          {/* Дополнительная информация */}
          {!compact && (
            <div className={`
              text-xs text-center space-y-1
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
            `}>
              <p>• Одобрение за 5 минут</p>
              <p>• Без справок и поручителей</p>
              <p>• Деньги на карту круглосуточно</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbeddableCalculator;