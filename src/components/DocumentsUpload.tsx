import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

interface Props {
  documents: Record<string, { url: string; status: string; reason: string }>;
  onChanged: () => void;
}

const KINDS = [
  { key: 'passport', title: 'Фото паспорта', hint: 'Разворот с фотографией' },
  { key: 'selfie', title: 'Селфи с паспортом', hint: 'Лицо и паспорт в кадре' },
];

const resizeToJpeg = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Не удалось прочитать фото'));
    img.src = url;
  });

const DocumentsUpload: React.FC<Props> = ({ documents, onChanged }) => {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const handle = async (kind: string, file?: File) => {
    if (!file) return;
    setBusy(kind);
    setError('');
    try {
      const data = await resizeToJpeg(file);
      await callCabinet({ action: 'upload_doc', kind, data });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
    setBusy('');
  };

  const complete = KINDS.every((k) => documents[k.key]?.status === 'approved');

  return (
    <Card className="rounded-lg border border-slate-200 bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-micro-dark">Документы</h3>
            <p className="text-sm text-gray-600">Нужны для проверки заявки сотрудником</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-md text-white ${complete ? 'bg-emerald-600' : 'bg-amber-500'}`}>
            {complete ? 'Приняты' : 'Нужны документы'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {KINDS.map((k) => (
            <div key={k.key} className="space-y-2">
              <p className="text-sm font-medium text-micro-dark">{k.title}</p>
              {documents[k.key] ? (
                <img src={documents[k.key].url} alt={k.title} className="w-full h-32 object-cover rounded-md border border-slate-200" />
              ) : (
                <div className="h-32 rounded-md border border-dashed border-slate-300 flex flex-col items-center justify-center text-center px-2">
                  <Icon name="ImagePlus" size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">{k.hint}</span>
                </div>
              )}
              {documents[k.key] && (
                <p className={`text-xs font-medium ${documents[k.key].status === 'approved' ? 'text-emerald-700' : documents[k.key].status === 'rejected' ? 'text-micro-green' : 'text-amber-600'}`}>
                  {documents[k.key].status === 'approved' ? 'Принято' : documents[k.key].status === 'rejected' ? `Отклонено${documents[k.key].reason ? ': ' + documents[k.key].reason : ''}` : 'На проверке'}
                </p>
              )}
              <input
                ref={(el) => { refs.current[k.key] = el; }}
                type="file"
                accept="image/*"
                capture={k.key === 'selfie' ? 'user' : undefined}
                className="hidden"
                onChange={(e) => handle(k.key, e.target.files?.[0])}
              />
              <Button
                variant="outline"
                disabled={busy === k.key}
                onClick={() => refs.current[k.key]?.click()}
                className="w-full h-11"
              >
                <Icon name="Upload" size={16} className="mr-2" />
                {busy === k.key ? 'Загружаем...' : documents[k.key] ? 'Заменить фото' : 'Загрузить'}
              </Button>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-micro-green">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default DocumentsUpload;
