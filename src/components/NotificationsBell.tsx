import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { callCabinet } from '@/lib/cabinetApi';

export interface NotificationItem {
  id: number;
  text: string;
  isRead: boolean;
  date: string;
}

interface Props {
  items: NotificationItem[];
  onRead: () => void;
}

const NotificationsBell: React.FC<Props> = ({ items, onRead }) => {
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => !i.isRead).length;

  const toggle = (value: boolean) => {
    setOpen(value);
    if (value && unread > 0) {
      callCabinet({ action: 'read_notifications' }).then(onRead).catch(() => undefined);
    }
  };

  return (
    <>
      <button onClick={() => toggle(true)} aria-label="Уведомления" className="relative p-2 rounded-md hover:bg-slate-100">
        <Icon name="Bell" size={22} className="text-micro-dark" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-micro-green text-white text-[11px] font-semibold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={toggle}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Уведомления</DialogTitle>
          </DialogHeader>
          {items.length === 0 && <p className="text-center text-gray-600 py-6">Пока уведомлений нет</p>}
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} className={`rounded-md border p-3 text-sm ${n.isRead ? 'border-slate-200 bg-white' : 'border-micro-blue bg-blue-50'}`}>
                <p className="text-micro-dark">{n.text}</p>
                <p className="text-xs text-gray-500 mt-1">{n.date}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationsBell;
