import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

interface Props {
  firstLoan?: boolean;
  onCreated: () => void;
}

const RATE = 0.0008;

const NewApplicationCard: React.FC<Props> = ({ firstLoan, onCreated }) => {
  const [amount, setAmount] = useState([15000]);
  const [days, setDays] = useState([14]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const total = firstLoan ? amount[0] : Math.round(amount[0] * (1 + RATE * days[0]));

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await callCabinet({ action: 'reapply', loanAmount: amount[0], loanDays: days[0] });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
    setBusy(false);
  };

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
      <CardContent className="p-4 sm:p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-micro-dark">Новый займ в один клик</h3>
          <p className="text-sm text-gray-600">Анкету заполнять заново не нужно, мы используем ваши данные</p>
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm text-gray-600">Сумма</span>
            <span className="font-semibold text-micro-blue">{amount[0].toLocaleString()} ₽</span>
          </div>
          <Slider value={amount} onValueChange={setAmount} min={1000} max={50000} step={500} />
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm text-gray-600">Срок</span>
            <span className="font-semibold text-micro-blue">{days[0]} дн.</span>
          </div>
          <Slider value={days} onValueChange={setDays} min={1} max={30} step={1} />
        </div>

        {firstLoan && <p className="text-sm font-semibold text-emerald-700">Первый займ под 0%: переплаты нет</p>}
        <div className="flex justify-between rounded-md bg-micro-gray p-3 text-sm">
          <span className="text-gray-600">К возврату</span>
          <span className="font-semibold">{total.toLocaleString()} ₽</span>
        </div>

        {error && <p className="text-sm text-micro-green">{error}</p>}
        <Button onClick={submit} disabled={busy} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white text-base">
          Подать заявку
          <Icon name="ArrowRight" size={18} className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewApplicationCard;
