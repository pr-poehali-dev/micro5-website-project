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
  need_docs: { label: 'Нужны данные', cls: 'bg-violet-600 text-white' },
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

const CALL_RESULTS: Record<string, string> = {
  reached: 'Дозвонились',
  no_answer: 'Не ответил',
  wrong_number: 'Неверный номер',
  callback: 'Просил перезвонить',
};

const DOC_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Ждёт проверки', cls: 'bg-amber-500 text-white' },
  approved: { label: 'Принято', cls: 'bg-emerald-600 text-white' },
  rejected: { label: 'Отклонено', cls: 'bg-micro-green text-white' },
};

const CONFIRM: Record<string, { label: string; cls: string }> = {
  requested: { label: 'Ждём ответ клиента', cls: 'bg-amber-500 text-white' },
  confirmed: { label: 'Клиент подтвердил данные', cls: 'bg-emerald-600 text-white' },
  wrong: { label: 'Клиент указал ошибку', cls: 'bg-micro-green text-white' },
};

const Flag = ({ ok, icon, text }: { ok: boolean; icon: string; text: string }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-1 ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
    <Icon name={icon} size={12} fallback="Circle" />
    {text}
  </span>
);

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
  const [photo, setPhoto] = useState('');

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

  const rejectDoc = (kind: string) => {
    const reason = prompt('Почему фото не подходит? Клиент увидит причину');
    if (reason !== null) act('doc_review', { kind, decision: 'rejected', reason });
  };

  const rejectVideo = () => {
    const reason = prompt('Почему видео не подходит? Клиент увидит причину');
    if (reason !== null) act('video_review', { decision: 'rejected', reason });
  };

  const rejectContract = () => {
    const reason = prompt('Почему договор возвращается на подпись?');
    if (reason !== null) act('confirm_contract', { decision: 'reject', reason });
  };

  const needInfo = () => {
    const reason = prompt('Что нужно уточнить у клиента?');
    if (reason !== null) act('need_docs', { reason });
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

            <Card className="bg-white"><CardContent className="p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-micro-dark">Проверка телефона</h3>
                <Badge className={d.phoneVerified ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'}>
                  {d.phoneVerified ? 'Номер подтверждён' : 'Не подтверждён'}
                </Badge>
              </div>
              <a href={`tel:+7${d.phone}`} className="flex items-center justify-center gap-2 h-12 rounded-md bg-micro-blue hover:bg-blue-800 text-white font-semibold">
                <Icon name="Phone" size={18} />
                Позвонить +7{d.phone}
              </a>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CALL_RESULTS).map(([k, label]) => (
                  <Button key={k} variant="outline" disabled={busy} onClick={() => act('log_call', { result: k })} className="h-11 text-sm">{label}</Button>
                ))}
              </div>
              <Button variant="ghost" disabled={busy} onClick={() => act('phone_verify', { value: !d.phoneVerified })} className="w-full h-10 text-micro-blue">
                {d.phoneVerified ? 'Снять отметку «номер подтверждён»' : 'Отметить номер подтверждённым'}
              </Button>
              {d.calls.length > 0 && (
                <div className="space-y-1 pt-1">
                  {d.calls.map((c: any) => (
                    <div key={c.id} className="flex justify-between text-sm rounded-md bg-micro-gray px-3 py-2">
                      <span>{CALL_RESULTS[c.result] || c.result}</span>
                      <span className="text-gray-500">{c.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent></Card>

            <Card className="bg-white"><CardContent className="p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-micro-dark">Подтверждение данных клиентом</h3>
                {CONFIRM[d.dataConfirm] && <Badge className={CONFIRM[d.dataConfirm].cls}>{CONFIRM[d.dataConfirm].label}</Badge>}
              </div>
              <p className="text-sm text-gray-600">Клиент увидит просьбу в личном кабинете и ответит «данные верны» или «есть ошибка».</p>
              {d.dataConfirmComment && <p className="text-sm rounded-md bg-micro-gray p-3">{d.dataConfirmComment}</p>}
              <Button variant="outline" disabled={busy || d.dataConfirm === 'requested'} onClick={() => act('request_confirm')} className="w-full h-11">
                <Icon name="ShieldCheck" size={16} className="mr-2" />
                {d.dataConfirm === 'none' ? 'Попросить подтвердить данные' : 'Запросить подтверждение ещё раз'}
              </Button>
            </CardContent></Card>

            {d.loan && d.loan.status === 'signed' && (
              <Card className="bg-white ring-2 ring-amber-400"><CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-micro-dark">Проверка договора</h3>
                  <Badge className="bg-amber-500 text-white">Ждёт проверки</Badge>
                </div>
                <p className="text-sm text-gray-600">Клиент подписал договор на {d.loan.amount.toLocaleString()} ₽ ({d.loan.signedAt}). После подтверждения займ станет активным.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button disabled={busy} onClick={rejectContract} className="h-11 bg-micro-green hover:bg-red-700 text-white">Вернуть на подпись</Button>
                  <Button disabled={busy} onClick={() => act('confirm_contract', { decision: 'approve' })} className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white">Подтвердить</Button>
                </div>
              </CardContent></Card>
            )}

            <Card className="bg-white"><CardContent className="p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-micro-dark">Видеоидентификация</h3>
                {d.video && <Badge className={DOC_STATUS[d.video.status]?.cls}>{DOC_STATUS[d.video.status]?.label}</Badge>}
              </div>
              {d.video ? (
                <>
                  <video src={d.video.url} controls playsInline className="w-full max-h-96 rounded-md bg-black" />
                  <p className="text-xs text-gray-500">Записано {d.video.createdAt}</p>
                  {d.video.code && (
                    <p className="text-sm rounded-md bg-micro-gray p-3">
                      Код, который клиент должен назвать на видео: <span className="font-bold tracking-widest text-micro-dark">{d.video.code}</span>
                    </p>
                  )}
                  <p className={`text-sm rounded-md p-3 ${d.video.autoIssues ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
                    {d.video.autoIssues ? `Автопроверка: ${d.video.autoIssues}` : 'Автопроверка: лицо в кадре видно чётко, одно лицо, по центру'}
                  </p>
                  {d.video.reason && <p className="text-xs text-gray-600">Причина отказа: {d.video.reason}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <Button disabled={busy || d.video.status === 'approved'} onClick={() => act('video_review', { decision: 'approved' })} className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Icon name="Check" size={16} className="mr-1" />Принять
                    </Button>
                    <Button disabled={busy || d.video.status === 'rejected'} onClick={rejectVideo} className="h-11 bg-micro-green hover:bg-red-700 text-white">
                      <Icon name="X" size={16} className="mr-1" />Отклонить
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Клиент ещё не записал видео</p>
              )}
            </CardContent></Card>

            <Card className="bg-white"><CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-micro-dark mb-3">Документы клиента</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[['passport', 'Паспорт'], ['selfie', 'Селфи с паспортом']].map(([k, label]) => {
                  const doc = d.documents?.[k];
                  return (
                    <div key={k} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-micro-dark">{label}</p>
                        {doc && <Badge className={DOC_STATUS[doc.status]?.cls}>{DOC_STATUS[doc.status]?.label}</Badge>}
                      </div>
                      {doc ? (
                        <>
                          <button onClick={() => setPhoto(doc.url)} className="block w-full">
                            <img src={doc.url} alt={label} className="w-full h-48 object-cover rounded-md border border-slate-200" />
                          </button>
                          {doc.reason && <p className="text-xs text-gray-600">Причина: {doc.reason}</p>}
                          <div className="grid grid-cols-2 gap-2">
                            <Button disabled={busy || doc.status === 'approved'} onClick={() => act('doc_review', { kind: k, decision: 'approved' })} className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Icon name="Check" size={16} className="mr-1" />Принять
                            </Button>
                            <Button disabled={busy || doc.status === 'rejected'} onClick={() => rejectDoc(k)} className="h-11 bg-micro-green hover:bg-red-700 text-white">
                              <Icon name="X" size={16} className="mr-1" />Отклонить
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="h-48 rounded-md border border-dashed border-slate-300 flex items-center justify-center text-sm text-gray-500">Клиент не загрузил</div>
                      )}
                    </div>
                  );
                })}
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

      {photo && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-3" onClick={() => setPhoto('')}>
          <img src={photo} alt="Документ" className="max-w-full max-h-full object-contain" />
          <button className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white text-micro-dark flex items-center justify-center" aria-label="Закрыть">
            <Icon name="X" size={22} />
          </button>
        </div>
      )}

      {d && !closed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3">
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
            {d.status !== 'in_work' && (
              <Button variant="outline" disabled={busy} onClick={() => act('in_work')} className="h-12">Взять в работу</Button>
            )}
            {d.status !== 'need_docs' && (
              <Button variant="outline" disabled={busy} onClick={needInfo} className="h-12">Запросить данные</Button>
            )}
            <Button disabled={busy} onClick={reject} className="h-12 bg-micro-green hover:bg-red-700 text-white">Отклонить</Button>
            <Button disabled={busy} onClick={() => act('approve')} className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white">Одобрить</Button>
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
  const tabs = [['', 'Все', total], ['new', 'Новые', counts.new || 0], ['in_work', 'В работе', counts.in_work || 0], ['need_docs', 'Нужны данные', counts.need_docs || 0], ['approved', 'Одобрены', counts.approved || 0], ['rejected', 'Отклонены', counts.rejected || 0]] as const;
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
                <div className="min-w-0 space-y-1.5">
                  <p className="font-semibold text-micro-dark truncate">№{i.id} · {i.fullName || 'Без имени'}</p>
                  <p className="text-sm text-gray-600">+7{i.phone} · {i.createdAt}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Flag ok={i.phoneVerified} icon="Phone" text={i.phoneVerified ? 'Номер подтверждён' : 'Номер не проверен'} />
                    <Flag ok={i.videoStatus === 'approved'} icon="Video" text={i.videoStatus === 'approved' ? 'Видео принято' : i.videoStatus === 'pending' ? 'Видео на проверке' : i.videoStatus === 'rejected' ? 'Видео отклонено' : 'Нет видео'} />
                    <Flag ok={i.docsApproved >= 2} icon="FileCheck" text={`Документы ${i.docsApproved}/2`} />
                    {i.dataConfirm !== 'none' && <Flag ok={i.dataConfirm === 'confirmed'} icon="ShieldCheck" text={i.dataConfirm === 'confirmed' ? 'Данные подтверждены' : i.dataConfirm === 'wrong' ? 'Клиент нашёл ошибку' : 'Ждём ответ'} />}
                  </div>
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
