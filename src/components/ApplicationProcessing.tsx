import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Icon from '@/components/ui/icon';

interface ApplicationProcessingProps {
  applicationId: string;
  onProcessingComplete: (approved: boolean, debtAmount?: number) => void;
  onBackToMain: () => void;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const ApplicationProcessing: React.FC<ApplicationProcessingProps> = ({
  applicationId,
  onProcessingComplete,
  onBackToMain
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const steps: ProcessingStep[] = [
    {
      id: 'provider',
      title: 'Подключение к провайдеру',
      description: 'Установка защищенного соединения с банками',
      icon: 'Wifi',
      duration: 15,
      status: 'pending'
    },
    {
      id: 'loading',
      title: 'Загрузка данных',
      description: 'Получение информации о клиенте',
      icon: 'Download',
      duration: 20,
      status: 'pending'
    },
    {
      id: 'documents',
      title: 'Проверка документов',
      description: 'Верификация паспортных данных',
      icon: 'FileCheck',
      duration: 25,
      status: 'pending'
    },
    {
      id: 'fssp',
      title: 'Проверка ФССП',
      description: 'Анализ задолженности в базе данных',
      icon: 'Search',
      duration: 30,
      status: 'pending'
    }
  ];

  const [processSteps, setProcessSteps] = useState(steps);

  useEffect(() => {
    if (currentStep < processSteps.length) {
      const currentStepData = processSteps[currentStep];
      
      // Устанавливаем время выполнения шага
      setTimeRemaining(currentStepData.duration);
      
      // Обновляем статус на "processing"
      setProcessSteps(prev => prev.map((step, index) => 
        index === currentStep 
          ? { ...step, status: 'processing' as const }
          : step
      ));

      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            
            // Завершаем текущий шаг
            setProcessSteps(prevSteps => prevSteps.map((step, index) => 
              index === currentStep 
                ? { ...step, status: 'completed' as const }
                : step
            ));
            
            // Переходим к следующему шагу
            if (currentStep < processSteps.length - 1) {
              setTimeout(() => {
                setCurrentStep(currentStep + 1);
                setProgress(((currentStep + 1) / processSteps.length) * 100);
              }, 500);
            } else {
              // Все шаги завершены - запускаем финальную проверку
              setTimeout(() => {
                performFinalCheck();
              }, 1000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  const performFinalCheck = () => {
    // Симуляция проверки ФССП с различными сценариями
    const debtScenarios = [
      { debt: 0, probability: 0.4 },      // 40% - нет долгов
      { debt: 5000, probability: 0.2 },   // 20% - небольшой долг
      { debt: 12000, probability: 0.15 }, // 15% - средний долг
      { debt: 18000, probability: 0.15 }, // 15% - большой долг (отказ)
      { debt: 25000, probability: 0.1 }   // 10% - очень большой долг (отказ)
    ];

    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedDebt = 0;

    for (const scenario of debtScenarios) {
      cumulativeProbability += scenario.probability;
      if (random <= cumulativeProbability) {
        selectedDebt = scenario.debt;
        break;
      }
    }

    const approved = selectedDebt < 15000;
    
    setTimeout(() => {
      onProcessingComplete(approved, selectedDebt);
    }, 1500);
  };

  const getStepIcon = (step: ProcessingStep) => {
    if (step.status === 'completed') {
      return <Icon name="Check" size={24} className="text-white" />;
    } else if (step.status === 'processing') {
      return <Icon name={step.icon as any} size={24} className="text-white animate-pulse" />;
    } else {
      return <Icon name={step.icon as any} size={24} className="text-gray-400" />;
    }
  };

  const getStepColor = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-micro-green border-micro-green';
      case 'processing':
        return 'bg-micro-blue border-micro-blue';
      case 'error':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-micro-gray flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={onBackToMain}
          className="mb-6 text-micro-blue hover:bg-blue-50"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          На главную
        </Button>

        <Card className="bg-white shadow-xl rounded-3xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl text-micro-dark mb-2">
              Обработка заявки
            </CardTitle>
            <p className="text-gray-500 text-lg">
              Заявка №{applicationId}
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Общий прогресс */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Общий прогресс</span>
                <span className="text-micro-blue font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Шаги обработки */}
            <div className="space-y-6">
              {processSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${getStepColor(step)}`}>
                      {getStepIcon(step)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold transition-colors ${
                        step.status === 'processing' ? 'text-micro-blue' : 
                        step.status === 'completed' ? 'text-micro-green' : 'text-gray-600'
                      }`}>
                        {step.title}
                        {step.status === 'processing' && timeRemaining > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({timeRemaining}с)
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500 mt-1">{step.description}</p>
                      
                      {step.status === 'processing' && (
                        <div className="mt-3">
                          <Progress 
                            value={((step.duration - timeRemaining) / step.duration) * 100} 
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      {step.status === 'completed' && (
                        <div className="text-micro-green">
                          <Icon name="CheckCircle" size={20} />
                        </div>
                      )}
                      {step.status === 'processing' && (
                        <div className="w-4 h-4 border-2 border-micro-blue border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>

                  {/* Линия соединения между шагами */}
                  {index < processSteps.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-8 transition-colors ${
                      processSteps[index + 1].status !== 'pending' ? 'bg-micro-green' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Информационное сообщение */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Icon name="Info" size={20} className="text-micro-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-micro-blue text-sm">
                    Автоматическая обработка
                  </h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Ваша заявка обрабатывается автоматически. Все данные проверяются 
                    в режиме реального времени через защищенные каналы связи.
                  </p>
                </div>
              </div>
            </div>

            {/* Время ожидания */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-gray-600">
                <Icon name="Clock" size={16} />
                <span className="text-sm">
                  Общее время обработки: до 2 минут
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationProcessing;