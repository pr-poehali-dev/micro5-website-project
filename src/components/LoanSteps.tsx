import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

export interface PendingLoan {
  id: string;
  dbId: number;
  amount: number;
  returnAmount: number;
  days: number;
  dueDate: string;
  status: string;
}

interface Props {
  loan: PendingLoan;
  fullName: string;
  onChanged: () => void;
}

const LoanSteps: React.FC<Props> = ({ loan, fullName, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [shownCode, setShownCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const checking = loan.status === 'signed';
  const overpay = loan.returnAmount - loan.amount;
  const steps = [
    { title: 'Заявка одобрена', done: true },
    { title: 'Подписать договор', done: checking },
    { title: 'Проверка договора', done: false },
    { title: 'Активный займ', done: false },
  ];
  const current = checking ? 2 : 1;

  const openSign = async () => {
    setError('');
    setCode('');
    setOpen(true);
    setBusy(true);
    try {
      const d = await callCabinet({ action: 'sign_code', loanId: loan.dbId });
      setShownCode(d.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
    setBusy(false);
  };

  const sign = async () => {
    setBusy(true);
    setError('');
    try {
      await callCabinet({ action: 'sign', loanId: loan.dbId, code });
      setOpen(false);
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
          <div className="flex items-start gap-3">
            <div className="relative shrink-0 w-12 h-12">
              {checking && <span className="absolute inset-0 rounded-2xl bg-amber-400/30 animate-ping" />}
              <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${checking ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <Icon name={checking ? 'ShieldCheck' : 'CircleCheck'} size={26} className={checking ? 'animate-pulse' : ''} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-micro-dark">{checking ? 'Идёт проверка договора' : 'Ваш займ одобрен'}</h3>
              <p className="text-sm text-gray-600">{checking ? 'Договор подписан. После проверки займ станет активным' : 'Проверьте условия и подпишите договор'}</p>
            </div>
          </div>

          <div className="rounded-xl bg-micro-gray p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Сумма займа</span><span className="font-semibold">{loan.amount.toLocaleString()} ₽</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Срок</span><span className="font-semibold">{loan.days} дн.</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Ставка</span><span className="font-semibold">{overpay === 0 ? '0% (акция)' : '0.08% в день'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Проценты</span><span className="font-semibold">{overpay.toLocaleString()} ₽</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><span className="text-gray-600">К возврату</span><span className="font-bold text-micro-blue">{loan.returnAmount.toLocaleString()} ₽</span></div>
          </div>

          <ol className="space-y-3">
            {steps.map((s, i) => {
              const active = i === current;
              return (
                <li key={s.title} className="flex items-center gap-3">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s.done ? 'bg-micro-blue text-white' : active ? 'border-2 border-micro-blue text-micro-blue animate-pulse' : 'border-2 border-gray-300 text-gray-400'
                  }`}>
                    {s.done ? <Icon name="Check" size={16} /> : i + 1}
                  </div>
                  <span className={s.done ? 'text-gray-500' : active ? 'font-semibold text-micro-dark' : 'text-gray-400'}>{s.title}</span>
                </li>
              );
            })}
          </ol>

          {!checking && (
            <Button onClick={openSign} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white text-base">
              <Icon name="FileSignature" size={18} className="mr-2" />
              Подписать договор
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Подписание договора {loan.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 text-sm text-gray-700">
            <p>Заёмщик: {fullName || '—'}</p>
            <p>Заимодавец: ООО «Частный займ»</p>
            <p>Сумма: {loan.amount.toLocaleString()} ₽ на {loan.days} дн., к возврату {loan.returnAmount.toLocaleString()} ₽</p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-center space-y-1">
            <p className="text-xs text-gray-600">Ваш код подписи</p>
            <p className="text-3xl font-bold tracking-[0.3em] text-micro-blue">{shownCode || '······'}</p>
            <p className="text-xs text-gray-500">Действует 10 минут. Он также сохранён в уведомлениях.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Введите код, чтобы подписать договор</label>
            <Input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="h-12 text-center text-xl tracking-[0.3em]"
            />
          </div>

          {error && <p className="text-sm text-micro-green">{error}</p>}
          <Button onClick={sign} disabled={code.length !== 6 || busy} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white text-base">
            Подписать
          </Button>
          <Button variant="ghost" onClick={openSign} disabled={busy} className="w-full text-gray-600">Получить новый код</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoanSteps;
