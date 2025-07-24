import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DocumentsStepProps {
  formData: {
    documents: {
      passport: File | null;
      income: File | null;
      employment: File | null;
    };
  };
  onFileUpload: (type: keyof FormData['documents'], file: File | null) => void;
}

interface FormData {
  documents: {
    passport: File | null;
    income: File | null;
    employment: File | null;
  };
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({
  formData,
  onFileUpload
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="Upload" size={32} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-micro-dark">Загрузка документов</h3>
        <p className="text-gray-600">Загрузите скан-копии или фотографии документов</p>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
        <div className="text-center">
          <Icon name="FileText" size={32} className="text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium mb-2">Паспорт (главная страница) *</h4>
          <p className="text-sm text-gray-600 mb-4">Загрузите фото разворота с фотографией</p>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => onFileUpload('passport', e.target.files?.[0] || null)}
            className="hidden"
            id="passport-upload"
          />
          <label htmlFor="passport-upload">
            <Button variant="outline" className="rounded-xl" asChild>
              <span>
                <Icon name="Upload" size={16} className="mr-2" />
                Выбрать файл
              </span>
            </Button>
          </label>
          {formData.documents.passport && (
            <Badge className="ml-2 bg-micro-green text-white">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              {formData.documents.passport.name}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
        <div className="text-center">
          <Icon name="FileBarChart" size={32} className="text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium mb-2">Справка о доходах</h4>
          <p className="text-sm text-gray-600 mb-4">2-НДФЛ или справка с места работы</p>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => onFileUpload('income', e.target.files?.[0] || null)}
            className="hidden"
            id="income-upload"
          />
          <label htmlFor="income-upload">
            <Button variant="outline" className="rounded-xl" asChild>
              <span>
                <Icon name="Upload" size={16} className="mr-2" />
                Выбрать файл
              </span>
            </Button>
          </label>
          {formData.documents.income && (
            <Badge className="ml-2 bg-micro-green text-white">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              {formData.documents.income.name}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
        <div className="text-center">
          <Icon name="Building" size={32} className="text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium mb-2">Справка с места работы</h4>
          <p className="text-sm text-gray-600 mb-4">Подтверждение трудоустройства</p>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => onFileUpload('employment', e.target.files?.[0] || null)}
            className="hidden"
            id="employment-upload"
          />
          <label htmlFor="employment-upload">
            <Button variant="outline" className="rounded-xl" asChild>
              <span>
                <Icon name="Upload" size={16} className="mr-2" />
                Выбрать файл
              </span>
            </Button>
          </label>
          {formData.documents.employment && (
            <Badge className="ml-2 bg-micro-green text-white">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              {formData.documents.employment.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsStep;