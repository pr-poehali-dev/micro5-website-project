import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ChatWidget from '@/components/ChatWidget';
import LoginModal from '@/components/LoginModal';
import Dashboard from '@/components/Dashboard';
import ExtendedApplicationForm from '@/components/ExtendedApplicationForm';
import ImprovedLoanForm from '@/components/ImprovedLoanForm';
import ApplicationSubmitted from '@/components/ApplicationSubmitted';
import ApplicationProcessing from '@/components/ApplicationProcessing';
import ApplicationReview from '@/components/ApplicationReview';
import ApplicationRejected from '@/components/ApplicationRejected';
import { submitLoanApplication } from '@/utils/amoCrmIntegration';
import { callCabinet, clearToken, getToken } from '@/lib/cabinetApi';

const Index = () => {
  const [loanAmount, setLoanAmount] = useState([25000]);
  const [loanDays, setLoanDays] = useState([15]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [userPhone, setUserPhone] = useState('');
  const [currentView, setCurrentView] = useState<'main' | 'form' | 'submitted' | 'processing' | 'review' | 'rejected'>('main');
  const [applicationId] = useState(`ML${Date.now().toString().slice(-6)}`);
  const [formData, setFormData] = useState(null);
  const [debtAmount, setDebtAmount] = useState(0);

  const dailyRate = 0.08; // 0.08% в день
  const totalInterest = (loanAmount[0] * dailyRate * loanDays[0]) / 100;
  const totalPayment = loanAmount[0] + totalInterest;



  const handleLogin = (phone: string) => {
    setUserPhone(phone);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    callCabinet({ action: 'logout' }).catch(() => undefined);
    clearToken();
    setIsLoggedIn(false);
    setUserPhone('');
  };

  const handleStartApplication = () => {
    setCurrentView('form');
  };

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    callCabinet({ action: 'apply', ...data, loanAmount: loanAmount[0], loanDays: loanDays[0] }).catch(() => undefined);
    setCurrentView('submitted');
  };

  const handleContinueFromSubmitted = () => {
    setCurrentView('processing');
  };

  const handleProcessingComplete = (approved: boolean, debt = 0) => {
    setDebtAmount(debt);
    if (approved) {
      setCurrentView('review');
    } else {
      setCurrentView('rejected');
    }
  };

  const handleNewApplication = () => {
    setCurrentView('form');
  };

  const handleApplicationSubmit = async (formData: any) => {
    const applicationData = {
      ...formData,
      loanAmount: loanAmount[0],
      loanDays: loanDays[0]
    };

    const result = await submitLoanApplication(applicationData);
    
    if (result.success) {
      setApplicationId(result.leadId || '');
      setCurrentView('status');
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
  };

  if (isLoggedIn) {
    return <Dashboard userPhone={userPhone} onLogout={handleLogout} />;
  }

  if (currentView === 'form') {
    return (
      <ImprovedLoanForm
        loanAmount={loanAmount[0]}
        loanDays={loanDays[0]}
        onAmountChange={(v) => setLoanAmount([v])}
        onDaysChange={(v) => setLoanDays([v])}
        onSubmit={handleFormSubmit}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentView === 'submitted') {
    return (
      <ApplicationSubmitted
        applicationId={applicationId}
        phoneNumber={formData?.phone || '+7 (999) XXX-XX-XX'}
        onContinue={handleContinueFromSubmitted}
      />
    );
  }

  if (currentView === 'processing') {
    return (
      <ApplicationProcessing
        applicationId={applicationId}
        onProcessingComplete={handleProcessingComplete}
        onBackToMain={handleBackToMain}
      />
    );
  }

  if (currentView === 'rejected') {
    return (
      <ApplicationRejected
        applicationId={applicationId}
        debtAmount={debtAmount}
        onBackToMain={handleBackToMain}
        onNewApplication={handleNewApplication}
      />
    );
  }

  if (currentView === 'review') {
    return (
      <ApplicationReview
        applicationId={applicationId}
        onBackToMain={handleBackToMain}
      />
    );
  }



  const returnDate = new Date(Date.now() + loanDays[0] * 86400000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const faq = [
    ['Как получить заём?', 'Выберите сумму и срок на калькуляторе, нажмите «Получить деньги» и заполните анкету. Затем запишите короткое видео лица, дождитесь одобрения, подпишите договор по коду из уведомления и после проверки получите деньги на карту.'],
    ['Как погасить заём?', 'Зайдите в личный кабинет, откройте карточку активного займа и нажмите «Погасить». Нужно вернуть сумму займа и проценты до даты, указанной в договоре.'],
    ['Как продлить заём?', 'В личном кабинете в карточке активного займа нажмите «Продлить». Срок увеличится на 7 дней после оплаты процентов за эти дни. Продлить можно не более 3 раз.'],
    ['Что делать при просрочке?', 'Погасите заём как можно скорее в личном кабинете: за каждый день просрочки начисляются проценты. Если вы не успеваете, продлите срок до даты возврата. А если возникли трудности, напишите нам в чат, и мы подскажем решение.'],
  ];

  const steps = [
    { title: 'Выберите срок и сумму займа', sub: 'на сайте или в приложении', text: 'Если вы уже брали деньги в Микро5, создайте новую заявку через личный кабинет.', img: 'https://cdn.poehali.dev/projects/e3537bf7-cb66-4f9a-9bc1-129fdca111a7/files/f7c07ff8-23bc-46f8-b40b-93f85031162e.jpg' },
    { title: 'Заполните анкету', sub: 'как в паспорте', text: 'Укажите данные и пройдите короткую видеоидентификацию: достаточно 6 секунд.', icon: 'IdCard' },
    { title: 'Подпишите договор', sub: 'по коду из уведомления', text: 'Условия займа видны заранее. Подпись занимает минуту.', icon: 'FileSignature' },
    { title: 'Получите деньги', sub: 'на карту', text: 'После проверки договора займ становится активным, деньги уходят на вашу карту.', icon: 'Wallet' },
  ];

  return (
    <div className="min-h-screen bg-white text-micro-dark">
      <header className="bg-brand-gradient sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-white/90 text-sm">
            <a href="#calculator" className="hover:text-white">Калькулятор</a>
            <a href="#how" className="hover:text-white">Как получить</a>
            <a href="#faq" className="hover:text-white">Вопросы</a>
            <a href="#app" className="hover:text-white">Личный кабинет</a>
            <a href="#contacts" className="hover:text-white">Контакты</a>
          </nav>
          <div className="flex items-center gap-3">
            <LoginModal onLogin={handleLogin}>
              <Button className="h-10 rounded-lg bg-micro-dark hover:bg-black text-white px-6 text-base font-medium">Войти</Button>
            </LoginModal>
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Меню">
              <Icon name={menuOpen ? 'X' : 'Menu'} size={28} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-micro-dark/95 text-white px-4 py-3 space-y-3 text-base">
            {[['#calculator', 'Калькулятор'], ['#how', 'Как получить заём'], ['#app', 'Личный кабинет'], ['#contacts', 'Контакты']].map(([h, t]) => (
              <a key={h} href={h} onClick={() => setMenuOpen(false)} className="block py-1">{t}</a>
            ))}
          </div>
        )}
        <div className="bg-micro-dark/30 text-center text-white text-sm py-2">Быстрые онлайн-займы на карту</div>
      </header>

      <section id="calculator" className="py-8 md:py-14">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight text-micro-blue">
              Первый заём —<br /><span className="text-emerald-500">без процентов*</span>
            </h1>
            <p className="mt-5 text-gray-600 text-lg hidden lg:block">Деньги на карту за 15 минут. Без справок и поручителей, только паспорт и короткое видео.</p>
            <div className="mt-6 hidden lg:flex flex-wrap gap-5 text-sm text-gray-700">
              <span className="flex items-center gap-2"><Icon name="Clock" size={18} className="text-micro-blue" />15 минут на решение</span>
              <span className="flex items-center gap-2"><Icon name="ShieldCheck" size={18} className="text-micro-blue" />Безопасно</span>
              <span className="flex items-center gap-2"><Icon name="CreditCard" size={18} className="text-micro-blue" />На любую карту</span>
            </div>
          </div>

          <div className="max-w-xl w-full mx-auto lg:mx-0 lg:ml-auto space-y-7">
            <div>
              <div className="flex items-end justify-between">
                <Label className="text-gray-600 text-lg">Сумма</Label>
                <span className="font-display font-semibold text-2xl md:text-3xl">{loanAmount[0].toLocaleString('ru-RU')} ₽</span>
              </div>
              <Slider value={loanAmount} onValueChange={setLoanAmount} max={50000} min={1000} step={500} className="mt-4 [&_[role=slider]]:h-8 [&_[role=slider]]:w-8 [&_[role=slider]]:border-4 [&_[role=slider]]:border-micro-blue [&_[role=slider]]:shadow-lg [&>span:first-child]:h-3 [&>span:first-child]:bg-gray-200 [&>span:first-child>span]:bg-micro-blue" />
              <div className="flex justify-between text-gray-400 mt-2"><span>1 000 ₽</span><span>50 000 ₽</span></div>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <Label className="text-gray-600 text-lg">Срок</Label>
                <span className="font-display font-semibold text-2xl md:text-3xl">{loanDays[0]} {loanDays[0] % 10 === 1 && loanDays[0] !== 11 ? 'день' : [2, 3, 4].includes(loanDays[0] % 10) && ![12, 13, 14].includes(loanDays[0]) ? 'дня' : 'дней'}</span>
              </div>
              <Slider value={loanDays} onValueChange={setLoanDays} max={30} min={1} step={1} className="mt-4 [&_[role=slider]]:h-8 [&_[role=slider]]:w-8 [&_[role=slider]]:border-4 [&_[role=slider]]:border-micro-blue [&_[role=slider]]:shadow-lg [&>span:first-child]:h-3 [&>span:first-child]:bg-gray-200 [&>span:first-child>span]:bg-micro-blue" />
              <div className="flex justify-between text-gray-400 mt-2"><span>1 день</span><span>30 дней</span></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Возвращаете</span>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="rounded-lg bg-emerald-400 text-white font-bold px-2.5 py-1">0%</span>
                  <span className="line-through text-gray-500">{Math.round(totalPayment).toLocaleString('ru-RU')} ₽</span>
                  <span className="font-display font-semibold text-xl md:text-2xl text-micro-blue">{loanAmount[0].toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">До</span>
                <span className="font-semibold">{returnDate}</span>
              </div>
            </div>

            <Button onClick={handleStartApplication} className="w-full h-14 rounded-xl bg-micro-blue hover:bg-[#5A3DCC] text-white text-xl font-display font-medium">
              Получить деньги
            </Button>

            <div className="flex items-center justify-center gap-6 text-sm font-bold text-gray-500">
              <span className="text-emerald-700 italic">МИР</span>
              <span className="flex"><span className="w-6 h-6 rounded-full bg-red-500" /><span className="w-6 h-6 rounded-full bg-amber-400 -ml-2.5 opacity-90" /></span>
              <span className="text-blue-800 italic font-extrabold text-lg">VISA</span>
            </div>
            <p className="text-xs text-gray-400 text-center">* Акция для новых клиентов. Далее ставка 0.08% в день.</p>
          </div>
        </div>
      </section>

      <section id="how" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl">Как получить заём</h2>
          <p className="mt-4 text-lg text-micro-dark/80 max-w-xl">Чтобы оформить онлайн заём, вам нужно выполнить несколько простых действий:</p>
          <div className="mt-8 flex gap-5 overflow-x-auto snap-x pb-6 -mx-4 px-4">
            {steps.map((st, i) => (
              <div key={st.title} className="snap-start shrink-0 w-[82%] sm:w-[360px] rounded-2xl bg-white shadow-[0_8px_30px_rgba(108,78,224,0.14)] p-6 flex flex-col">
                <span className="text-sm font-semibold text-gray-400">Шаг {i + 1}</span>
                <h3 className="mt-1 font-display font-bold text-2xl leading-snug">{st.title}</h3>
                <p className="mt-3 font-display font-medium text-lg text-micro-blue">{st.sub}</p>
                <div className="my-4 flex-1 flex items-center justify-center min-h-[140px]">
                  {st.img ? <img src={st.img} alt="" className="h-40 w-40 object-contain" /> : (
                    <div className="w-24 h-24 rounded-3xl bg-brand-gradient flex items-center justify-center">
                      <Icon name={st.icon as string} size={44} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 bg-micro-gray">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">Частые вопросы</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faq.map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`} className="rounded-2xl border-0 bg-white px-5 shadow-sm">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="app" className="bg-brand-gradient text-white overflow-hidden">
        <div className="container mx-auto px-4 pt-12 grid md:grid-cols-2 gap-6 items-center">
          <div className="pb-6 md:pb-12">
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight">Управляйте займом в личном кабинете</h2>
            <p className="mt-4 text-white/90 text-lg max-w-md">Подавайте заявки, подписывайте договор, погашайте и продлевайте заём с телефона.</p>
            <LoginModal onLogin={handleLogin}>
              <Button className="mt-7 h-14 rounded-xl bg-micro-dark hover:bg-black text-white text-lg px-8 font-display font-medium">
                Войти в кабинет
                <Icon name="ArrowRight" size={20} className="ml-3" />
              </Button>
            </LoginModal>
          </div>
          <div className="flex justify-center md:justify-end">
            <img src="https://cdn.poehali.dev/projects/e3537bf7-cb66-4f9a-9bc1-129fdca111a7/files/4a9121bb-3ceb-441f-a400-aee970e3001f.jpg" alt="Личный кабинет Микро5" className="w-full max-w-md rounded-t-3xl object-cover" />
          </div>
        </div>
      </section>

      <ChatWidget />

      <footer id="contacts" className="bg-micro-dark text-white/80 py-12">
        <div className="container mx-auto px-4 space-y-8">
          <div className="flex flex-wrap items-center gap-6">
            <Logo />
            <div className="flex items-center gap-3">
              {['Phone', 'Mail', 'MessageCircle'].map((n) => (
                <span key={n} className="w-12 h-12 rounded-full bg-slate-400/60 flex items-center justify-center text-white"><Icon name={n} size={22} /></span>
              ))}
            </div>
          </div>
          <div className="border-t border-white/25 pt-6 space-y-3 text-sm leading-relaxed">
            <p className="text-lg text-white/70">© 2026, Микро5</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <span className="flex items-center gap-2"><Icon name="Phone" size={16} />8 (800) 555-35-35</span>
              <span className="flex items-center gap-2"><Icon name="Mail" size={16} />info@micro5.ru</span>
              <span className="flex items-center gap-2"><Icon name="Clock" size={16} />Ежедневно, круглосуточно</span>
            </div>
            <p className="text-white/60">Сайт использует cookie для персонализации сервисов. Оставаясь на сайте, вы даёте согласие на обработку персональных данных.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
