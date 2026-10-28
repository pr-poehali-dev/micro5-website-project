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

const APP_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: 'На рассмотрении', cls: 'bg-micro-blue text-white' },
  in_work: { label: 'В работе', cls: 'bg-amber-500 text-white' },
  need_docs: { label: 'Нужны данные', cls: 'bg-violet-600 text-white' },
  approved: { label: 'Одобрена', cls: 'bg-emerald-600 text-white' },
  rejected: { label: 'Отклонена', cls: 'bg-micro-green text-white' },
};

const money = (n: number) => `${n.toLocaleString()} ₽`;
const dateRu = (d: string) => new Date(d).toLocaleDateString('ru-RU');

const PROFILE_FIELDS: [string, string][] = [
  ['fullName', 'ФИО'], ['email', 'Email'], ['birthDate', 'Дата рождения'],
  ['address', 'Адрес'], ['income', 'Доход'], ['employment', 'Занятость'],
];

const TAB_CLS = 'flex-col sm:flex-row gap-0.5 px-1 py-2 text-[11px] sm:text-sm rounded-md data-[state=active]:bg-micro-blue data-[state=active]:text-white';

const Dashboard: React.FC<DashboardProps> = ({ userPhone, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [confirmRequested, setConfirmRequested] = useState(false);
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
  const canReapply = !activeLoan && pendingLoans.length === 0 && !openApplication;
  const totalBorrowed = loans.filter((l) => l.status !== 'awaiting_sign' && l.status !== 'signed').reduce((s, l) => s + l.amount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const docsDone = documents.passport?.status === 'approved' && documents.selfie?.status === 'approved';
  const phoneText = profile.phone ? '+7' + profile.phone : userPhone;

  return (
    <div className="min-h-screen bg-micro-gray">
      <header className="bg-white border-b-2 border-micro-blue sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 bg-micro-blue rounded-md flex items-center justify-center">
                <span className="text-white font-bold">М5</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-micro-dark leading-tight truncate">{profile.fullName || 'Личный кабинет'}</p>
                <p className="text-sm text-gray-600">{phoneText}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationsBell items={notifications} onRead={reload} />
              <Button variant="ghost" onClick={onLogout} className="text-gray-600 px-2 sm:px-4">
                <Icon name="LogOut" size={18} className="sm:mr-2" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-28 sm:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="grid grid-cols-5 h-auto bg-white rounded-lg p-1 border border-slate-200 fixed bottom-2 left-2 right-2 z-50 sm:static">
            <TabsTrigger value="overview" className={TAB_CLS}><Icon name="LayoutDashboard" size={18} className="sm:mr-2" />Обзор</TabsTrigger>
            <TabsTrigger value="loans" className={TAB_CLS}><Icon name="CreditCard" size={18} className="sm:mr-2" />Займы</TabsTrigger>
            <TabsTrigger value="applications" className={TAB_CLS}><Icon name="FileText" size={18} className="sm:mr-2" />Заявки</TabsTrigger>
            <TabsTrigger value="contracts" className={TAB_CLS}><Icon name="FileSignature" size={18} className="sm:mr-2" />Договоры</TabsTrigger>
            <TabsTrigger value="profile" className={TAB_CLS}><Icon name="UserRound" size={18} className="sm:mr-2" />Анкета</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {confirmRequested && <ConfirmDataCard profile={profile} phone={phoneText} onDone={reload} />}

            {pendingLoans.map((loan) => (
              <LoanSteps key={loan.id} loan={loan} fullName={profile.fullName || ''} onChanged={reload} />
            ))}

            {activeLoan && <ActiveLoanCard loan={activeLoan} onChanged={reload} />}

            {openApplication && (
              <Card className="rounded-lg border border-slate-200 bg-white">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-micro-dark">Заявка {openApplication.id} на {money(openApplication.amount)}</p>
                    <p className="text-sm text-gray-600">{openApplication.statusText}</p>
                  </div>
                  <Badge className={APP_STATUS[openApplication.status].cls}>{APP_STATUS[openApplication.status].label}</Badge>
                </CardContent>
              </Card>
            )}

            {!docsDone && <DocumentsUpload documents={documents} onChanged={reload} />}

            {canReapply && <NewApplicationCard onCreated={reload} />}

            <div className="grid grid-cols-2 gap-3">
              <Card className="rounded-lg border border-slate-200 bg-white">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Взято всего</p>
                  <p className="text-xl font-semibold text-micro-dark">{money(totalBorrowed)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-lg border border-slate-200 bg-white">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Выплачено всего</p>
                  <p className="text-xl font-semibold text-micro-dark">{money(totalPaid)}</p>
                </CardContent>
              </Card>
            </div>

            {docsDone && <DocumentsUpload documents={documents} onChanged={reload} />}
          </TabsContent>

          <TabsContent value="loans" className="space-y-3">
            {loans.length === 0 && <p className="text-center text-gray-600 py-8">Займов пока нет</p>}
            {loans.map((loan) => (
              <Card key={loan.id} className="rounded-lg border border-slate-200 bg-white">
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
              <Card key={p.id} className="rounded-lg border border-slate-200 bg-white">
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
              <Card key={app.id} className="rounded-lg border border-slate-200 bg-white">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-micro-dark">{app.id} · {money(app.amount)}</p>
                    <p className="text-sm text-gray-600">{app.statusText}</p>
                    <p className="text-xs text-gray-500">{dateRu(app.date)}</p>
                  </div>
                  <Badge className={APP_STATUS[app.status]?.cls}>{APP_STATUS[app.status]?.label}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-3">
            {loans.length === 0 && <p className="text-center text-gray-600 py-8">Договоров пока нет</p>}
            {loans.map((loan) => (
              <Card key={loan.id} className="rounded-lg border border-slate-200 bg-white">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-micro-gray flex items-center justify-center">
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
                      <Button onClick={() => setActiveTab('overview')} className="h-11 bg-micro-blue hover:bg-blue-800 text-white flex-1 sm:flex-none">
                        Подписать
                      </Button>
                    )}
                    <Button variant="outline" disabled={downloading === loan.id} onClick={() => downloadContract(loan)} className="h-11 flex-1 sm:flex-none">
                      <Icon name="Download" size={16} className="mr-2" />
                      {downloading === loan.id ? 'Готовим...' : 'Скачать PDF'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="rounded-lg border border-slate-200 bg-white">
              <CardContent className="p-4 sm:p-6 space-y-3">
                {editing ? (
                  <>
                    {PROFILE_FIELDS.map(([key, label]) => (
                      <div key={key} className="space-y-1">
                        <label className="text-sm text-gray-600">{label}</label>
                        <input
                          className="w-full h-12 rounded-md border border-input px-3 text-base"
                          value={form[key] || ''}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <Button onClick={saveProfile} disabled={saving} className="flex-1 h-12 bg-micro-blue hover:bg-blue-800 text-white">Сохранить</Button>
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
                    <Button onClick={startEdit} className="w-full h-12 bg-micro-blue hover:bg-blue-800 text-white">
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
