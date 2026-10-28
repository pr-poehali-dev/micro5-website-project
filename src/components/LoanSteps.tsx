import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

export interface PendingLoan {
  id: string;
  dbId: number;
  amount: number;
  returnAmount: number;
  days: number;
  status: string;
}

interface Props {
  loan: PendingLoan;
  fullName: string;
  onChanged: () => void;
}

const LoanSteps: React.FC<Props> = ({ loan, fullName, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const signed = loan.status === 'signed';
  const steps = [
    { title: 'Заявка одобрена', done: true },
    { title: 'Подписать договор', done: signed },
    { title: 'Получить деньги', done: false },
  ];
  const current = signed ? 2 : 1;

  const run = async (action: 'sign' | 'payout') => {
    setBusy(true);
    setError('');
    try {
      await callCabinet({ action, loanId: loan.dbId });
      setOpen(false);
      setAgree(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
    setBusy(false);
  };

  return (
    <>
      <Card className="rounded-2xl border-0 bg-white shadow-md ring-2 ring-micro-blue">
        <CardContent className="p-4 sm:p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-micro-dark">Ваш займ одобрен</h3>
            <p className="text-sm text-gray-600">
              {loan.amount.toLocaleString()} ₽ на {loan.days} дн. К возврату {loan.returnAmount.toLocaleString()} ₽
            </p>
          </div>

          <ol className="space-y-3">
            {steps.map((s, i) => {
              const active = i === current;
              return (
                <li key={s.title} className="flex items-center gap-3">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s.done ? 'bg-micro-blue text-white' : active ? 'border-2 border-micro-blue text-micro-blue' : 'border-2 border-gray-300 text-gray-400'
                  }`}>
                    {s.done ? <Icon name="Check" size={16} /> : i + 1}
                  </div>
                  <span className={`${s.done ? 'text-gray-500' : active ? 'font-semibold text-micro-dark' : 'text-gray-400'}`}>{s.title}</span>
                </li>
              );
            })}
          </ol>

          {error && <p className="text-sm text-micro-green">{error}</p>}

          {!signed ? (
            <Button onClick={() => setOpen(true)} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white text-base">
              <Icon name="FileSignature" size={18} className="mr-2" />
              Прочитать и подписать договор
            </Button>
          ) : (
            <Button onClick={() => run('payout')} disabled={busy} className="w-full h-12 rounded-xl bg-micro-green hover:bg-red-700 text-white text-base">
              <Icon name="Wallet" size={18} className="mr-2" />
              Получить {loan.amount.toLocaleString()} ₽ на карту
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Договор займа {loan.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-700">
            <p>Заёмщик: {fullName || '—'}</p>
            <p>Сумма займа: {loan.amount.toLocaleString()} ₽</p>
            <p>Срок: {loan.days} дн.</p>
            <p>Ставка: 0.08% в день</p>
            <p>Сумма к возврату: {loan.returnAmount.toLocaleString()} ₽</p>
            <p>Заимодавец перечисляет сумму займа на банковскую карту заёмщика. Заёмщик возвращает сумму займа и проценты в срок, указанный в договоре.</p>
          </div>
          <div className="flex items-start gap-2 pt-2">
            <Checkbox id="agree-contract" checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
            <label htmlFor="agree-contract" className="text-sm leading-snug">
              Я прочитал условия и подписываю договор простой электронной подписью
            </label>
          </div>
          {error && <p className="text-sm text-micro-green">{error}</p>}
          <Button onClick={() => run('sign')} disabled={!agree || busy} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white">
            Подписать договор
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoanSteps;
