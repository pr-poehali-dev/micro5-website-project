import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

interface Props {
  profile: Record<string, any>;
  phone: string;
  onDone: () => void;
}

const ConfirmDataCard: React.FC<Props> = ({ profile, phone, onDone }) => {
  const [wrong, setWrong] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const rows = [
    ['ФИО', profile.fullName],
    ['Телефон', phone],
    ['Дата рождения', profile.birthDate],
    ['Паспорт', profile.passportSeries ? `${profile.passportSeries} ${profile.passportNumber}` : ''],
    ['Адрес', profile.address],
  ];

  const send = async (answer: 'confirmed' | 'wrong') => {
    setBusy(true);
    await callCabinet({ action: 'confirm_data', answer, comment });
    setBusy(false);
    onDone();
  };

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-md ring-2 ring-amber-400">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-micro-dark">Подтвердите ваши данные</h3>
          <p className="text-sm text-gray-600">Сотрудник просит проверить, всё ли указано верно</p>
        </div>
        <div className="space-y-1">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-medium text-right break-words">{value || '—'}</span>
            </div>
          ))}
        </div>

        {wrong && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Что указано неверно?"
            className="w-full min-h-[90px] rounded-md border border-input p-3 text-base"
          />
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {!wrong ? (
            <>
              <Button disabled={busy} onClick={() => send('confirmed')} className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base">
                <Icon name="Check" size={18} className="mr-2" />
                Всё верно
              </Button>
              <Button disabled={busy} variant="outline" onClick={() => setWrong(true)} className="flex-1 h-12 rounded-xl text-base">
                Есть ошибка
              </Button>
            </>
          ) : (
            <>
              <Button disabled={busy || !comment.trim()} onClick={() => send('wrong')} className="flex-1 h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white text-base">
                Отправить
              </Button>
              <Button disabled={busy} variant="outline" onClick={() => setWrong(false)} className="flex-1 h-12 rounded-xl text-base">
                Назад
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfirmDataCard;
