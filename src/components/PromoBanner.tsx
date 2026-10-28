import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  available: boolean;
  onApply: () => void;
}

const PromoBanner: React.FC<Props> = ({ available, onApply }) => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-5 sm:p-7 shadow-lg">
    <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
    <div className="absolute right-10 -bottom-12 w-32 h-32 rounded-full bg-white/10" />
    <div className="relative flex items-center gap-4">
      <div className="flex-1 space-y-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          <Icon name="Gift" size={14} />
          Акция для новых клиентов
        </span>
        <p className="text-3xl sm:text-4xl font-bold leading-tight">Первый займ под 0%</p>
        <p className="text-sm text-white/85">Верните ровно столько, сколько взяли, без процентов и скрытых платежей</p>
        {available ? (
          <Button onClick={onApply} className="mt-2 h-12 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base">
            Получить займ
            <Icon name="ArrowRight" size={18} className="ml-2" />
          </Button>
        ) : (
          <p className="text-xs text-white/80 pt-1">Подать новую заявку можно после завершения текущей</p>
        )}
      </div>
      <div className="hidden sm:flex w-24 h-24 shrink-0 rounded-3xl bg-white/15 items-center justify-center text-5xl font-bold">0%</div>
    </div>
  </div>
);

export default PromoBanner;
