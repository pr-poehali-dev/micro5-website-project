import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import Logo from '@/components/Logo';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  passportSeries: string;
  passportNumber: string;
  passportDate: string;
  passportIssuer: string;
  address: string;
  income: string;
  employment: string;
  cardNumber: string;
  cardBank: string;
  agreedToTerms: boolean;
  agreedToDataProcessing: boolean;
}

interface Props {
  loanAmount: number;
  loanDays: number;
  onAmountChange: (v: number) => void;
  onDaysChange: (v: number) => void;
  onSubmit: (formData: FormData) => void;
  onBack: () => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  maxLength?: number;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, hint, type = 'text', inputMode, autoComplete, maxLength, required = true }) => {
  const lifted = type === 'date' || !!value;
  return (
    <div>
      <label className="relative block rounded-lg bg-[#F4F5F7] focus-within:ring-2 focus-within:ring-micro-blue/40">
        <span className={`pointer-events-none absolute left-4 text-gray-500 transition-all ${lifted ? 'top-2 text-xs' : 'top-1/2 -translate-y-1/2 text-base'}`}>
          {label}{required && <span className="text-red-500"> *</span>}
        </span>
        <input
          type={type}
          value={value}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="h-[68px] w-full rounded-lg bg-transparent px-4 pt-6 pb-1 text-base text-micro-dark outline-none"
        />
      </label>
      {hint && <p className="mt-1.5 text-xs text-gray-600">{hint}</p>}
    </div>
  );
};

const SelectField: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: [string, string][] }> = ({ label, value, onChange, options }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="h-[68px] w-full rounded-lg border border-slate-300 bg-white px-4 text-left [&>span]:line-clamp-none">
      <div className="text-left">
        <span className="block text-xs text-gray-500">{label} <span className="text-red-500">*</span></span>
        <span className="block text-base text-micro-dark"><SelectValue placeholder="Выберите..." /></span>
      </div>
    </SelectTrigger>
    <SelectContent>
      {options.map(([v, t]) => <SelectItem key={v} value={v}>{t}</SelectItem>)}
    </SelectContent>
  </Select>
);

const formatPhone = (value: string) => {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return '';
  let r = '+7 (' + d.slice(0, 3);
  if (d.length >= 3) r += ')';
  if (d.length > 3) r += ' ' + d.slice(3, 6);
  if (d.length > 6) r += '-' + d.slice(6, 8);
  if (d.length > 8) r += '-' + d.slice(8, 10);
  return r;
};

const SLIDER_CLS = 'mt-4 [&_[role=slider]]:h-8 [&_[role=slider]]:w-8 [&_[role=slider]]:border-4 [&_[role=slider]]:border-micro-blue [&_[role=slider]]:shadow-lg [&>span:first-child]:h-3 [&>span:first-child]:bg-[#D3D5F0] [&>span:first-child>span]:bg-micro-blue';

const dayWord = (n: number) => (n % 10 === 1 && n !== 11 ? 'день' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n) ? 'дня' : 'дней');

const ImprovedLoanForm: React.FC<Props> = ({ loanAmount, loanDays, onAmountChange, onDaysChange, onSubmit, onBack }) => {
  const [step, setStep] = useState(1);
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [citizenship, setCitizenship] = useState('Российская Федерация');
  const [region, setRegion] = useState('');
  const [data, setData] = useState<FormData>({
    fullName: '', phone: '', email: '', birthDate: '', passportSeries: '', passportNumber: '', passportDate: '',
    passportIssuer: '', address: '', income: '', employment: '', cardNumber: '', cardBank: '',
    agreedToTerms: false, agreedToDataProcessing: false,
  });

  const set = (field: keyof FormData, value: string | boolean) => setData((p) => ({ ...p, [field]: value }));

  const interest = Math.round((loanAmount * 0.08 * loanDays) / 100);
  const returnDate = new Date(Date.now() + loanDays * 86400000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  const valid = () => {
    if (step === 1) return surname && name && patronymic && data.phone.length >= 18 && data.birthDate && region && data.email.includes('@');
    if (step === 2) return data.passportSeries.length === 4 && data.passportNumber.length === 6 && data.passportDate && data.passportIssuer;
    if (step === 3) return data.address && data.income && data.employment;
    return data.cardNumber && data.cardBank && data.agreedToTerms && data.agreedToDataProcessing;
  };

  const next = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    onSubmit({ ...data, fullName: [surname, name, patronymic].join(' ').trim(), address: [region, data.address].filter(Boolean).join(', ') });
  };

  const back = () => {
    if (step === 1) onBack();
    else setStep(step - 1);
  };

  const titles = ['Заполните анкету', 'Паспортные данные', 'Работа и доходы', 'Карта для получения денег'];

  return (
    <div className="min-h-screen bg-white text-micro-dark">
      <header className="sticky top-0 z-40 bg-white">
        <div className="mx-auto max-w-xl px-4 pt-3 flex items-center justify-between">
          <button onClick={back} className="flex items-center gap-1 text-micro-blue" aria-label="Назад">
            <Icon name="ChevronLeft" size={24} />
            <Logo tone="dark" />
          </button>
          <span className="text-sm text-micro-blue">Шаг {step} из 4</span>
        </div>
        <div className="mx-auto max-w-xl px-4 mt-3 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`h-1.5 rounded-full ${n <= step ? 'bg-micro-blue' : 'bg-gray-200'}`} />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-10">
        <section className="py-5 space-y-6 border-b-[10px] border-[#F1F1F5] -mx-4 px-4">
          <div>
            <div className="flex items-end justify-between">
              <span className="text-gray-600">Сумма</span>
              <span className="font-display font-semibold text-2xl">{loanAmount.toLocaleString('ru-RU')} ₽</span>
            </div>
            <Slider value={[loanAmount]} onValueChange={(v) => onAmountChange(v[0])} min={1000} max={50000} step={500} className={SLIDER_CLS} />
            <div className="mt-2 flex justify-between text-sm text-gray-400"><span>1 000 ₽</span><span>50 000 ₽</span></div>
          </div>
          <div>
            <div className="flex items-end justify-between">
              <span className="text-gray-600">Срок</span>
              <span className="font-display font-semibold text-2xl">{loanDays} {dayWord(loanDays)}</span>
            </div>
            <Slider value={[loanDays]} onValueChange={(v) => onDaysChange(v[0])} min={1} max={30} step={1} className={SLIDER_CLS} />
            <div className="mt-2 flex justify-between text-sm text-gray-400"><span>1 день</span><span>30 дней</span></div>
          </div>
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Возвращаете</span>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-400 px-2 py-0.5 text-sm font-bold text-white">0%</span>
                <span className="text-gray-600 line-through">{(loanAmount + interest).toLocaleString('ru-RU')} ₽</span>
                <span className="font-display font-semibold text-micro-blue">{loanAmount.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">До</span>
              <span className="text-sm font-medium">{returnDate}</span>
            </div>
          </div>
        </section>

        <h2 className="mt-5 mb-4 font-display text-2xl font-semibold">{titles[step - 1]}</h2>

        <div className="space-y-3">
          {step === 1 && (
            <>
              <Field label="Мобильный телефон" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={(v) => set('phone', formatPhone(v))} hint="На указанный номер будет отправлено подтверждающее СМС" />
              <Field label="Фамилия" autoComplete="family-name" value={surname} onChange={setSurname} />
              <Field label="Имя" autoComplete="given-name" value={name} onChange={setName} />
              <Field label="Отчество" autoComplete="additional-name" value={patronymic} onChange={setPatronymic} />
              <Field label="Дата рождения" type="date" value={data.birthDate} onChange={(v) => set('birthDate', v)} />
              <SelectField label="Гражданство" value={citizenship} onChange={setCitizenship} options={[['Российская Федерация', 'Российская Федерация'], ['Республика Беларусь', 'Республика Беларусь'], ['Республика Казахстан', 'Республика Казахстан']]} />
              <Field label="Регион проживания" autoComplete="address-level1" value={region} onChange={setRegion} />
              <Field label="Электронная почта" type="email" inputMode="email" autoComplete="email" value={data.email} onChange={(v) => set('email', v)} hint="Укажите корректный email, он необходим для получения договора и документов об оплате" />
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Серия паспорта" inputMode="numeric" maxLength={4} value={data.passportSeries} onChange={(v) => set('passportSeries', v.replace(/\D/g, ''))} />
              <Field label="Номер паспорта" inputMode="numeric" maxLength={6} value={data.passportNumber} onChange={(v) => set('passportNumber', v.replace(/\D/g, ''))} />
              <Field label="Дата выдачи" type="date" value={data.passportDate} onChange={(v) => set('passportDate', v)} />
              <Field label="Кем выдан" value={data.passportIssuer} onChange={(v) => set('passportIssuer', v)} />
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Адрес регистрации" autoComplete="street-address" value={data.address} onChange={(v) => set('address', v)} hint="Улица, дом, квартира" />
              <SelectField label="Трудовая деятельность" value={data.employment} onChange={(v) => set('employment', v)} options={[['employed', 'Работаю по найму'], ['business', 'Собственный бизнес'], ['freelance', 'Фриланс'], ['pension', 'Пенсионер'], ['student', 'Студент'], ['unemployed', 'Не работаю']]} />
              <SelectField label="Ежемесячный доход" value={data.income} onChange={(v) => set('income', v)} options={[['0-20000', 'До 20 000 ₽'], ['20000-40000', '20 000 - 40 000 ₽'], ['40000-60000', '40 000 - 60 000 ₽'], ['60000-100000', '60 000 - 100 000 ₽'], ['100000+', 'Свыше 100 000 ₽']]} />
            </>
          )}

          {step === 4 && (
            <>
              <Field label="Номер карты" inputMode="numeric" autoComplete="cc-number" maxLength={19} value={data.cardNumber} onChange={(v) => set('cardNumber', v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} hint="Деньги будут отправлены на эту карту" />
              <SelectField label="Банк" value={data.cardBank} onChange={(v) => set('cardBank', v)} options={[['sberbank', 'Сбербанк'], ['vtb', 'ВТБ'], ['gazprombank', 'Газпромбанк'], ['alfabank', 'Альфа-Банк'], ['tinkoff', 'Т-Банк'], ['raiffeisen', 'Райффайзенбанк'], ['other', 'Другой банк']]} />
              <label className="flex items-start gap-3 pt-3 text-sm">
                <Checkbox checked={data.agreedToTerms} onCheckedChange={(c) => set('agreedToTerms', !!c)} className="mt-0.5" />
                <span>Я согласен с условиями займа и публичной офертой</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox checked={data.agreedToDataProcessing} onCheckedChange={(c) => set('agreedToDataProcessing', !!c)} className="mt-0.5" />
                <span>Я согласен на обработку персональных данных</span>
              </label>
            </>
          )}
        </div>

        <Button onClick={next} disabled={!valid()} className="mt-5 h-16 w-full rounded-lg bg-micro-blue text-xl font-display font-medium text-white hover:bg-[#5A3DCC] disabled:opacity-50">
          {step < 4 ? 'Продолжить' : 'Отправить заявку'}
        </Button>
        <p className="mt-3 text-center text-xs text-gray-600">Нажимая «{step < 4 ? 'Продолжить' : 'Отправить заявку'}», я даю согласие на обработку моих персональных данных</p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm font-bold text-gray-500">
          <span className="italic text-emerald-700">МИР</span>
          <span className="flex"><span className="h-6 w-6 rounded-full bg-red-500" /><span className="-ml-2.5 h-6 w-6 rounded-full bg-amber-400 opacity-90" /></span>
          <span className="text-lg font-extrabold italic text-blue-800">VISA</span>
        </div>
      </main>
    </div>
  );
};

export default ImprovedLoanForm;
