import React from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  id: string;
  amount: number;
  status: string;
  statusText: string;
  compact?: boolean;
}

const VIEW: Record<string, { icon: string; title: string; tone: string; ring: string; anim: string; pulse: boolean }> = {
  new: { icon: 'Clock', title: 'Заявка на рассмотрении', tone: 'bg-blue-50 text-micro-blue', ring: 'bg-micro-blue/30', anim: '', pulse: true },
  in_work: { icon: 'LoaderCircle', title: 'Сотрудник проверяет заявку', tone: 'bg-amber-50 text-amber-600', ring: 'bg-amber-400/30', anim: 'animate-spin', pulse: true },
  need_docs: { icon: 'FileWarning', title: 'Нужны ваши данные', tone: 'bg-violet-50 text-violet-600', ring: 'bg-violet-400/30', anim: 'animate-bounce', pulse: true },
  approved: { icon: 'CircleCheck', title: 'Заявка одобрена', tone: 'bg-emerald-50 text-emerald-600', ring: '', anim: '', pulse: false },
  rejected: { icon: 'CircleX', title: 'Заявка отклонена', tone: 'bg-red-50 text-micro-green', ring: '', anim: '', pulse: false },
};

const ApplicationStatusCard: React.FC<Props> = ({ id, amount, status, statusText, compact }) => {
  const v = VIEW[status] || VIEW.new;
  const showSteps = !compact && status !== 'rejected';
  const step = status === 'new' ? 1 : status === 'in_work' || status === 'need_docs' ? 2 : 3;

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 w-14 h-14">
          {v.pulse && <span className={`absolute inset-0 rounded-2xl animate-ping ${v.ring}`} />}
          <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center ${v.tone}`}>
            <Icon name={v.icon} fallback="Clock" size={28} className={v.anim} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-micro-dark">{v.title}</p>
          <p className="text-sm text-gray-600">{id} · {amount.toLocaleString()} ₽</p>
          {statusText && status !== 'new' && <p className="text-sm text-gray-500 mt-0.5 break-words">{statusText}</p>}
        </div>
      </div>

      {showSteps && (
        <div className="flex items-center gap-2">
          {['Принята', 'Проверка', 'Решение'].map((label, i) => {
            const done = i + 1 < step;
            const current = i + 1 === step;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${done ? 'bg-emerald-500 text-white' : current ? 'bg-micro-blue text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                    {done ? <Icon name="Check" size={14} /> : i + 1}
                  </span>
                  <span className={`text-xs ${current ? 'font-semibold text-micro-dark' : 'text-gray-500'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded ${done ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusCard;
