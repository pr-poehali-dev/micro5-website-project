import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

export interface ActiveLoan {
  id: string;
  dbId: number;
  amount: number;
  returnAmount: number;
  dueDate: string;
  days: number;
  daysLeft: number;
  extendedCount: number;
  canExtend: boolean;
}

interface Props {
  loan: ActiveLoan;
  onChanged: () => void;
}

const ActiveLoanCard: React.FC<Props> = ({ loan, onChanged }) => {
  const [mode, setMode] = useState<'repay' | 'extend' | null>(null);
  const [fee, setFee] = useState(0);
  const [extendDays, setExtendDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const progress = Math.min(100, Math.max(0, Math.round(((loan.days - loan.daysLeft) / loan.days) * 100)));

  const openExtend = async () => {
    setError('');
    setMode('extend');
    const q = await callCabinet({ action: 'quote_extend', loanId: loan.dbId });
    setFee(q.fee);
    setExtendDays(q.days);
  };

  const confirm = async () => {
    if (!mode) return;
    setBusy(true);
    setError('');
    try {
      await callCabinet({ action: mode, loanId: loan.dbId });
      setMode(null);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
    setBusy(false);
  };

  return (
    <>
      <div className="rounded-3xl bg-gradient-to-br from-micro-dark via-[#17308a] to-micro-blue text-white p-5 sm:p-7 shadow-lg space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/70">Ваш займ {loan.id}</p>
            <p className="text-4xl font-bold tracking-tight mt-1">{loan.amount.toLocaleString()} ₽</p>
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            {loan.daysLeft === 0 ? 'Срок сегодня' : `${loan.daysLeft} дн. до возврата`}
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2 bg-white/20" />
          <div className="flex justify-between text-sm text-white/80">
            <span>Вернуть до {new Date(loan.dueDate).toLocaleDateString('ru-RU')}</span>
            <span className="font-semibold text-white">{loan.returnAmount.toLocaleString()} ₽</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => { setError(''); setMode('repay'); }} className="flex-1 h-12 rounded-xl bg-white text-micro-dark hover:bg-slate-100 text-base font-semibold">
            <Icon name="CreditCard" size={18} className="mr-2" />
            Погасить займ
          </Button>
          {loan.canExtend && (
            <Button onClick={openExtend} className="flex-1 h-12 rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/30 text-base">
              <Icon name="CalendarPlus" size={18} className="mr-2" />
              Продлить срок
            </Button>
          )}
        </div>
      </div>

      <Dialog open={mode !== null} onOpenChange={(v) => !v && setMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === 'repay' ? 'Погашение займа' : 'Продление займа'}</DialogTitle>
          </DialogHeader>
          {mode === 'repay' ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Займ</span><span className="font-semibold">{loan.id}</span></div>
              <div className="flex justify-between text-base"><span className="text-gray-600">К оплате</span><span className="font-semibold text-micro-blue">{loan.returnAmount.toLocaleString()} ₽</span></div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Продление на</span><span className="font-semibold">{extendDays} дн.</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Новая дата возврата</span><span className="font-semibold">{new Date(new Date(loan.dueDate).getTime() + extendDays * 86400000).toLocaleDateString('ru-RU')}</span></div>
              <div className="flex justify-between text-base"><span className="text-gray-600">К оплате сейчас</span><span className="font-semibold text-micro-blue">{fee.toLocaleString()} ₽</span></div>
              <p className="text-gray-500">Оплата только процентов за новые дни. Сумма долга не меняется. Продлевать можно до 3 раз.</p>
            </div>
          )}
          {error && <p className="text-sm text-micro-green">{error}</p>}
          <Button onClick={confirm} disabled={busy} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-[#5A3DCC] text-white text-base">
            {busy ? 'Обрабатываем...' : 'Подтвердить'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActiveLoanCard;
