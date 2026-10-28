import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const API = 'https://functions.poehali.dev/83906020-8b31-4e57-8818-e3c45a2940a8';
const KEY = 'crm_token';

const STATUSES: Record<string, { label: string; cls: string }> = {
  new: { label: 'Новая', cls: 'bg-micro-blue text-white' },
  in_work: { label: 'В работе', cls: 'bg-amber-500 text-white' },
  approved: { label: 'Одобрена', cls: 'bg-emerald-600 text-white' },
  rejected: { label: 'Отклонена', cls: 'bg-micro-green text-white' },
};

const EMPLOYMENT: Record<string, string> = {
  employed: 'Работает по найму', business: 'Собственный бизнес', freelance: 'Фриланс',
  pension: 'Пенсионер', student: 'Студент', unemployed: 'Не работает',
};

const call = async (body: Record<string, unknown>, query = '') => {
  const token = localStorage.getItem(KEY) || '';
  const res = await fetch(body ? `${API}${query}` : API, {
    method: body.action ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    body: body.action ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Ошибка'), { status: res.status });
  return data;
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge className={STATUSES[status]?.cls || 'bg-slate-500 text-white'}>{STATUSES[status]?.label || status}</Badge>
);

const Row = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-medium text-right text-sm break-words">{value || '—'}</span>
  </div>
);

const Login = ({ onDone }: { onDone: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const d = await call({ action: 'login', password });
      localStorage.setItem(KEY, d.token);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-micro-gray flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-micro-blue rounded-md flex items-center justify-center mx-auto mb-3">
              <Icon name="Lock" size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-micro-dark">CRM Микро5</h1>
            <p className="text-sm text-gray-600">Вход для сотрудников</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="h-12 text-base" />
            {error && <p className="text-sm text-micro-green">{error}</p>}
            <Button type="submit" disabled={!password || loading} className="w-full h-12 bg-micro-blue hover:bg-blue-800 text-white">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const Details = ({ id, onClose, onChanged }: { id: number; onClose: () => void; onChanged: () => void }) => {
  const [d, setD] = useState<any>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => call({}, `?action=get&id=${id}`).then(setD), [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    try {
      await call({ action, id, ...extra });
      await load();
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
    setBusy(false);
  };

  const reject = () => {
    const reason = prompt('Причина отказа (необязательно)') ;
    if (reason !== null) act('reject', { reason });
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await call({ action: 'add_note', id, text: note });
    setNote('');
    load();
  };

  const closed = d && (d.status === 'approved' || d.status === 'rejected');

  return (
    <div className="fixed inset-0 z-50 bg-micro-gray overflow-y-auto">
      <div className="max-w-3xl mx-auto p-3 sm:p-6 pb-28">
        <Button variant="ghost" onClick={onClose} className="mb-3 -ml-2 text-micro-blue">
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          К списку заявок
        </Button>
        {!d ? <p className="text-gray-600">Загрузка...</p> : (
          <div className="space-y-4">
            <Card className="bg-white"><CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-micro-dark">Заявка №{d.id}</h2>
                  <p className="text-sm text-gray-600">от {d.createdAt}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-2xl font-semibold text-micro-blue">{d.amount.toLocaleString()} ₽ на {d.days} дн.</p>
              <p className="text-sm text-gray-600 mt-1">{d.statusText}</p>
            </CardContent></Card>

            <Card className="bg-white"><CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-micro-dark mb-2">Клиент</h3>
              <Row label="ФИО" value={d.fullName} />
              <Row label="Телефон" value={'+7' + d.phone} />
              <Row label="Email" value={d.email} />
              <Row label="Дата рождения" value={d.birthDate} />
              <Row label="Паспорт" value={`${d.passportSeries} ${d.passportNumber}`} />
              <Row label="Дата выдачи" value={d.passportDate} />
              <Row label="Кем выдан" value={d.passportIssuer} />
              <Row label="Адрес" value={d.address} />
              <Row label="Занятость" value={EMPLOYMENT[d.employment] || d.employment} />
              <Row label="Доход" value={d.income} />
              <Row label="Карта" value={d.cardLast4 ? `•••• ${d.cardLast4} (${d.cardBank})` : ''} />
              <Row label="Выдано займов" value={`${d.loansCount} на ${Number(d.loansSum).toLocaleString()} ₽`} />
            </CardContent></Card>

            <Card className="bg-white"><CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-micro-dark mb-3">Документы клиента</h3>
              <div className="grid grid-cols-2 gap-3">
                {[['passport', 'Паспорт'], ['selfie', 'Селфи с паспортом']].map(([k, label]) => (
                  <div key={k}>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    {d.documents?.[k] ? (
                      <a href={d.documents[k]} target="_blank" rel="noreferrer">
                        <img src={d.documents[k]} alt={label} className="w-full h-36 object-cover rounded-md border border-slate-200" />
                      </a>
                    ) : (
                      <div className="h-36 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-sm text-gray-500">Не загружено</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent></Card>

            <Card className="bg-white"><CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-semibold text-micro-dark">Заметки сотрудников</h3>
              <div className="flex gap-2">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Добавить заметку" className="h-11 text-base" />
                <Button onClick={addNote} disabled={!note.trim()} className="h-11 bg-micro-blue hover:bg-blue-800 text-white">Добавить</Button>
              </div>
              {d.notes.length === 0 && <p className="text-sm text-gray-500">Заметок пока нет</p>}
              {d.notes.map((n: any) => (
                <div key={n.id} className="rounded-md bg-micro-gray p-3 text-sm">
                  <p>{n.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.createdAt}</p>
                </div>
              ))}
            </CardContent></Card>
          </div>
        )}
      </div>

      {d && !closed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3">
          <div className="max-w-3xl mx-auto flex gap-2">
            {d.status === 'new' && (
              <Button variant="outline" disabled={busy} onClick={() => act('in_work')} className="h-12 flex-1">Взять в работу</Button>
            )}
            <Button disabled={busy} onClick={reject} className="h-12 flex-1 bg-micro-green hover:bg-red-700 text-white">Отклонить</Button>
            <Button disabled={busy} onClick={() => act('approve')} className="h-12 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">Одобрить</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Crm = () => {
  const [authed, setAuthed] = useState(!!localStorage.getItem(KEY));
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    call({ action: 'logout' }).catch(() => undefined);
    localStorage.removeItem(KEY);
    setAuthed(false);
  };

  const load = useCallback(async () => {
    try {
      const d = await call({}, `?action=list&status=${filter}`);
      setItems(d.items);
      setCounts(d.counts);
    } catch (e: any) {
      if (e.status === 401) {
        localStorage.removeItem(KEY);
        setAuthed(false);
      }
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  useEffect(() => {
    if (!authed) return;
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [authed, load]);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tabs = [['', 'Все', total], ['new', 'Новые', counts.new || 0], ['in_work', 'В работе', counts.in_work || 0], ['approved', 'Одобрены', counts.approved || 0], ['rejected', 'Отклонены', counts.rejected || 0]] as const;
  const q = search.trim().toLowerCase();
  const shown = items.filter((i) => !q || i.fullName.toLowerCase().includes(q) || i.phone.includes(q.replace(/\D/g, '') || '@@') || String(i.id) === q);

  return (
    <div className="min-h-screen bg-micro-gray">
      <header className="bg-white border-b-2 border-micro-blue">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-micro-blue rounded-md flex items-center justify-center text-white font-bold">М5</div>
            <span className="text-lg font-semibold text-micro-dark">CRM · Заявки</span>
          </div>
          <Button variant="outline" onClick={logout} className="h-10">
            <Icon name="LogOut" size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(([key, label, n]) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setLoading(true); }}
              className={`shrink-0 rounded-md border px-4 h-10 text-sm font-medium ${filter === key ? 'bg-micro-blue border-micro-blue text-white' : 'bg-white border-slate-200 text-micro-dark'}`}
            >
              {label} · {n}
            </button>
          ))}
        </div>

        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по ФИО, телефону или номеру заявки" className="h-11 bg-white text-base" />

        {loading ? <p className="text-gray-600">Загрузка...</p> : shown.length === 0 ? (
          <p className="text-center text-gray-600 py-10">Заявок нет</p>
        ) : (
          <div className="space-y-2">
            {shown.map((i) => (
              <button key={i.id} onClick={() => setOpenId(i.id)} className="w-full text-left bg-white border border-slate-200 hover:border-micro-blue rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-micro-dark truncate">№{i.id} · {i.fullName || 'Без имени'}</p>
                  <p className="text-sm text-gray-600">+7{i.phone} · {i.createdAt}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="font-semibold text-micro-blue">{i.amount.toLocaleString()} ₽ / {i.days} дн.</p>
                  <StatusBadge status={i.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {openId !== null && <Details id={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
};

export default Crm;
