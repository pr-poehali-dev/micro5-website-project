import React, { useEffect, useState } from 'react';
import { callCabinet, clearToken } from '@/lib/cabinetApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import LoanSteps from '@/components/LoanSteps';
import ActiveLoanCard from '@/components/ActiveLoanCard';
import DocumentsUpload from '@/components/DocumentsUpload';
import NewApplicationCard from '@/components/NewApplicationCard';
import ApplicationStatusCard from '@/components/ApplicationStatusCard';
import VideoVerification from '@/components/VideoVerification';
import PromoBanner from '@/components/PromoBanner';
import ConfirmDataCard from '@/components/ConfirmDataCard';
import NotificationsBell, { NotificationItem } from '@/components/NotificationsBell';

interface LoanData {
  id: string;
  dbId: number;
  amount: number;
  returnAmount: number;
  dueDate: string;
  days: number;
  status: 'active' | 'overdue' | 'paid' | 'awaiting_sign' | 'signed';
  daysLeft: number;
  signedAt: string;
  extendedCount: number;
  canExtend: boolean;
}

interface ApplicationData {
  id: string;
  amount: number;
  date: string;
  status: 'new' | 'in_work' | 'need_docs' | 'approved' | 'rejected';
  statusText: string;
}

interface PaymentData {
  id: number;
  loan: string;
  kind: 'repay' | 'extend';
  amount: number;
  note: string;
  date: string;
}

interface DashboardProps {
  userPhone: string;
  onLogout: () => void;
}

const LOAN_STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: 'Активный', cls: 'bg-micro-blue text-white' },
  overdue: { label: 'Просрочен', cls: 'bg-micro-green text-white' },
  paid: { label: 'Погашен', cls: 'bg-slate-500 text-white' },
  awaiting_sign: { label: 'Ждёт подписи', cls: 'bg-amber-500 text-white' },
  signed: { label: 'Ждёт выплаты', cls: 'bg-amber-500 text-white' },
};

const money = (n: number) => `${n.toLocaleString()} ₽`;
const dateRu = (d: string) => new Date(d).toLocaleDateString('ru-RU');

const PROFILE_FIELDS: [string, string][] = [
  ['fullName', 'ФИО'], ['email', 'Email'], ['birthDate', 'Дата рождения'],
  ['address', 'Адрес'], ['income', 'Доход'], ['employment', 'Занятость'],
];

const TAB_CLS = 'flex-col sm:flex-row gap-0.5 px-1 py-2 text-[11px] sm:text-sm rounded-xl text-gray-500 data-[state=active]:bg-micro-blue data-[state=active]:text-white data-[state=active]:shadow-md';

const Dashboard: React.FC<DashboardProps> = ({ userPhone, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [confirmRequested, setConfirmRequested] = useState(false);
  const [video, setVideo] = useState<{ status: string; reason: string; date: string } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState('');

  const apply = (d: any) => {
    setLoans(d.loans);
    setApplications(d.applications);
    setPayments(d.payments);
    setDocuments(d.documents);
    setNotifications(d.notifications);
    setProfile(d.profile);
    setConfirmRequested(d.confirmRequested);
    setVideo(d.video);
  };

  const reload = () => callCabinet({ action: 'me' }).then(apply);

  useEffect(() => {
    callCabinet({ action: 'me' })
      .then(apply)
      .catch(() => {
        clearToken();
        onLogout();
      })
      .finally(() => setLoading(false));
  }, []);

  const startEdit = () => {
    setForm(Object.fromEntries(PROFILE_FIELDS.map(([k]) => [k, profile[k] || ''])));
    setEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const d = await callCabinet({ action: 'update_profile', ...form });
      setProfile(d.profile);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const downloadContract = async (loan: LoanData) => {
    setDownloading(loan.id);
    try {
      const d = await callCabinet({ action: 'contract', loanId: loan.dbId });
      window.open(d.url, '_blank');
    } finally {
      setDownloading('');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Загружаем данные...</div>;
  }

  const activeLoan = loans.find((l) => l.status === 'active' || l.status === 'overdue');
  const pendingLoans = loans.filter((l) => l.status === 'awaiting_sign' || l.status === 'signed');
  const openApplication = applications.find((a) => a.status === 'new' || a.status === 'in_work' || a.status === 'need_docs');
  const latestApplication = applications[0];
  const shownApplication = openApplication || (latestApplication?.status === 'rejected' && !activeLoan && pendingLoans.length === 0 ? latestApplication : undefined);
  const canReapply = !activeLoan && pendingLoans.length === 0 && !openApplication;
  const totalBorrowed = loans.filter((l) => l.status !== 'awaiting_sign' && l.status !== 'signed').reduce((s, l) => s + l.amount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const docsDone = documents.passport?.status === 'approved' && documents.selfie?.status === 'approved';
  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const firstName = (profile.fullName || '').trim().split(/\s+/)[1] || (profile.fullName || '').trim().split(/\s+/)[0] || 'Личный кабинет';
  const phoneText = profile.phone ? '+7' + profile.phone : userPhone;

  return (
    <div className="min-h-screen bg-micro-gray">
      <header className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-micro-blue to-micro-dark text-white flex items-center justify-center font-semibold">
              {(profile.fullName || 'М').trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 leading-none">{greeting}</p>
              <p className="font-semibold text-micro-dark truncate">{firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsBell items={notifications} onRead={reload} />
            <Button variant="ghost" onClick={onLogout} className="text-gray-600 px-2 rounded-xl" aria-label="Выйти">
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 pb-28 sm:pb-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="grid grid-cols-5 h-auto bg-white/95 backdrop-blur rounded-2xl p-1.5 shadow-lg ring-1 ring-slate-100 fixed bottom-3 left-3 right-3 z-50 sm:static sm:shadow-sm sm:max-w-3xl">
            <TabsTrigger value="overview" className={TAB_CLS}><Icon name="House" fallback="LayoutDashboard" size={20} className="sm:mr-2" />Главная</TabsTrigger>
            <TabsTrigger value="loans" className={TAB_CLS}><Icon name="Wallet" size={20} className="sm:mr-2" />Займы</TabsTrigger>
            <TabsTrigger value="applications" className={TAB_CLS}><Icon name="ClipboardList" size={20} className="sm:mr-2" />Заявки</TabsTrigger>
            <TabsTrigger value="contracts" className={TAB_CLS}><Icon name="FileSignature" size={20} className="sm:mr-2" />Договоры</TabsTrigger>
            <TabsTrigger value="profile" className={TAB_CLS}><Icon name="UserRound" size={20} className="sm:mr-2" />Профиль</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <PromoBanner available={canReapply} onApply={() => document.getElementById('new-application')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />

            {confirmRequested && <ConfirmDataCard profile={profile} phone={phoneText} onDone={reload} />}

            {pendingLoans.map((loan) => (
              <LoanSteps key={loan.id} loan={loan} fullName={profile.fullName || ''} onChanged={reload} />
            ))}

            {activeLoan && <ActiveLoanCard loan={activeLoan} onChanged={reload} />}

            {shownApplication && (
              <ApplicationStatusCard id={shownApplication.id} amount={shownApplication.amount} status={shownApplication.status} statusText={shownApplication.statusText} />
            )}

            <VideoVerification video={video} onChanged={reload} />

            {!docsDone && <DocumentsUpload documents={documents} onChanged={reload} />}

            {canReapply && <div id="new-application"><NewApplicationCard firstLoan={loans.length === 0} onCreated={reload} /></div>}

            <div className="grid grid-cols-2 gap-3">
              {[['Взято всего', totalBorrowed, 'TrendingUp', 'bg-blue-50 text-micro-blue'], ['Выплачено всего', totalPaid, 'CircleCheck', 'bg-emerald-50 text-emerald-600']].map(([label, value, icon, tone]) => (
                <Card key={label as string} className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
                  <CardContent className="p-4 space-y-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
                      <Icon name={icon as string} fallback="Circle" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-lg font-bold text-micro-dark">{money(value as number)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </TabsContent>

          <TabsContent value="loans" className="space-y-3">
            {loans.length === 0 && <p className="text-center text-gray-600 py-8">Займов пока нет</p>}
            {loans.map((loan) => (
              <Card key={loan.id} className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-micro-dark">{loan.id} · {money(loan.amount)}</p>
                    <p className="text-sm text-gray-600">К возврату {money(loan.returnAmount)} до {dateRu(loan.dueDate)}</p>
                  </div>
                  <Badge className={LOAN_STATUS[loan.status]?.cls}>{LOAN_STATUS[loan.status]?.label}</Badge>
                </CardContent>
              </Card>
            ))}

            <h3 className="font-semibold text-micro-dark pt-4">История платежей</h3>
            {payments.length === 0 && <p className="text-sm text-gray-600">Платежей пока нет</p>}
            {payments.map((p) => (
              <Card key={p.id} className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-micro-gray flex items-center justify-center">
                      <Icon name={p.kind === 'repay' ? 'CheckCircle' : 'CalendarPlus'} size={20} className="text-micro-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-micro-dark">{p.note}</p>
                      <p className="text-xs text-gray-500">{p.loan} · {p.date}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{money(p.amount)}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="applications" className="space-y-3">
            {applications.length === 0 && <p className="text-center text-gray-600 py-8">Заявок пока нет</p>}
            {applications.map((app) => (
              <ApplicationStatusCard key={app.id} id={app.id} amount={app.amount} status={app.status} statusText={`${app.statusText} · ${dateRu(app.date)}`} compact />
            ))}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-3">
            {loans.length === 0 && <p className="text-center text-gray-600 py-8">Договоров пока нет</p>}
            {loans.map((loan) => (
              <Card key={loan.id} className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl rounded-md bg-micro-gray flex items-center justify-center">
                      <Icon name="FileText" size={22} className="text-micro-blue" />
                    </div>
                    <div>
                      <p className="font-semibold text-micro-dark">Договор займа {loan.id}</p>
                      <p className="text-sm text-gray-600">
                        {money(loan.amount)} · {loan.status === 'awaiting_sign' ? 'ждёт подписи' : 'подписан'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {loan.status === 'awaiting_sign' && (
                      <Button onClick={() => setActiveTab('overview')} className="h-11 rounded-xl bg-micro-blue hover:bg-blue-800 text-white flex-1 sm:flex-none">
                        Подписать
                      </Button>
                    )}
                    <Button variant="outline" disabled={downloading === loan.id} onClick={() => downloadContract(loan)} className="h-11 rounded-xl flex-1 sm:flex-none">
                      <Icon name="Download" size={16} className="mr-2" />
                      {downloading === loan.id ? 'Готовим...' : 'Скачать PDF'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardContent className="p-4 sm:p-6 space-y-3">
                {editing ? (
                  <>
                    {PROFILE_FIELDS.map(([key, label]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-sm text-gray-600">{label}</label>
                        <input
                          className="w-full h-12 rounded-xl rounded-md border border-input px-3 text-base"
                          value={form[key] || ''}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <Button onClick={saveProfile} disabled={saving} className="flex-1 h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white">Сохранить</Button>
                      <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 h-12">Отмена</Button>
                    </div>
                  </>
                ) : (
                  <>
                    {[['Телефон', phoneText], ['ФИО', profile.fullName], ['Email', profile.email], ['Дата рождения', profile.birthDate], ['Паспорт', profile.passportSeries ? `${profile.passportSeries} ${profile.passportNumber}` : ''], ['Адрес', profile.address], ['Доход', profile.income], ['Занятость', profile.employment], ['Карта', profile.cardLast4 ? `•••• ${profile.cardLast4}` : '']].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-gray-600 text-sm">{label}</span>
                        <span className="font-medium text-right text-sm break-words">{value || '—'}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-1.5">
                      <span className="text-gray-600 text-sm">Документы</span>
                      <Badge className={profile.docsVerified ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'}>
                        {profile.docsVerified ? 'Проверены' : 'На проверке'}
                      </Badge>
                    </div>
                    <Button onClick={startEdit} className="w-full h-12 rounded-xl bg-micro-blue hover:bg-blue-800 text-white">
                      <Icon name="Pencil" size={16} className="mr-2" />
                      Обновить анкету
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
