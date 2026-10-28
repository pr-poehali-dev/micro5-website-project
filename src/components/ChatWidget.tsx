import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  from: 'bot' | 'user' | 'operator';
  text: string;
}

const QUICK = ['Как получить займ?', 'Какая ставка?', 'Как погасить займ?', 'Позвать оператора'];

const getAnswer = (q: string): string => {
  const t = q.toLowerCase();
  if (t.includes('ставк') || t.includes('процент')) return 'Ставка 0.08% в день. Например, 25 000 ₽ на 15 дней: переплата 300 ₽, к возврату 25 300 ₽. Скрытых комиссий нет.';
  if (t.includes('получ') || t.includes('оформ') || t.includes('заявк')) return 'Выберите сумму и срок в калькуляторе, нажмите «Получить займ» и заполните анкету из 4 шагов. Решение приходит за 15 минут, деньги идут на вашу карту.';
  if (t.includes('погас') || t.includes('вернут') || t.includes('оплат')) return 'Погасить займ можно в личном кабинете на вкладке «Займы» кнопкой «Погасить». Продлить срок можно там же.';
  if (t.includes('документ') || t.includes('паспорт')) return 'Нужен только паспорт и банковская карта на ваше имя. Справки о доходах не требуются.';
  if (t.includes('отказ') || t.includes('долг') || t.includes('фссп')) return 'Мы проверяем наличие долгов в ФССП. При долге более 15 000 ₽ заявка отклоняется, повторно подать её можно через 5 дней.';
  return 'Могу рассказать про ставку, оформление, погашение и документы. Если нужен человек, нажмите «Позвать оператора».';
};

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [operator, setOperator] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'bot', text: 'Здравствуйте! Я помощник Микро5. Чем могу помочь?' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open && window.matchMedia('(max-width: 639px)').matches) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const push = (from: Message['from'], text: string) =>
    setMessages((prev) => [...prev, { id: prev.length + 1, from, text }]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    push('user', value);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (value === 'Позвать оператора' || value.toLowerCase().includes('оператор')) {
        setOperator(true);
        push('operator', 'Вы переключены на оператора. Мы отвечаем ежедневно с 9:00 до 21:00, оставьте вопрос, и мы свяжемся с вами. Телефон: 8 (800) 555-35-35.');
      } else if (operator) {
        push('operator', 'Спасибо, ваше сообщение передано оператору. Ответим в ближайшее время.');
      } else {
        push('bot', getAnswer(value));
      }
    }, 800);
  };

  return (
    <>
      {!open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            onClick={() => setOpen(true)}
            aria-label="Открыть чат"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-micro-blue hover:bg-blue-800 shadow-lg"
          >
            <Icon name="MessageCircle" size={26} />
          </Button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[60] flex flex-col bg-white sm:w-[380px] sm:h-[560px] sm:rounded-lg sm:border sm:border-slate-200 sm:shadow-2xl">
          <div className="flex items-center justify-between bg-micro-blue text-white px-4 py-3 sm:rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Icon name={operator ? 'Headset' : 'Bot'} size={22} />
              </div>
              <div>
                <p className="font-semibold leading-tight">{operator ? 'Оператор' : 'Помощник Микро5'}</p>
                <p className="text-xs text-blue-100">{operator ? 'Онлайн с 9:00 до 21:00' : 'Отвечает сразу'}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Закрыть чат" className="p-2 -mr-2">
              <Icon name="X" size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-micro-gray px-3 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 text-[15px] leading-snug rounded-lg ${
                    m.from === 'user'
                      ? 'bg-micro-blue text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-micro-dark rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-gray-500 text-sm">Печатает...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-200 bg-white">
            <div className="flex gap-2 overflow-x-auto px-3 pt-2 pb-1">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full border border-micro-blue px-3 py-1.5 text-sm text-micro-blue active:bg-blue-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение"
                className="flex-1 h-12 rounded-md border border-input px-3 text-base outline-none focus:border-micro-blue"
              />
              <Button type="submit" disabled={!input.trim()} className="h-12 w-12 p-0 bg-micro-green hover:bg-red-700 rounded-md" aria-label="Отправить">
                <Icon name="Send" size={20} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
