import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ImagePlus,
  Info,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import heroImage from '@/assets/spf-hero.webp'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AdditionalSections } from '@/components/additional-sections'
import {
  buildWhatsAppUrl,
  createLeadDraft,
  formatPhone,
  isPhoneComplete,
  isValidName,
  saveLeadDraft,
  submitLead,
  type SubmitResult,
} from '@/lib/lead-automation'
import {
  CONTACT,
  HERO_IMAGE_IS_DEMO,
  OBJECT_TYPES,
  PRIORITIES,
  SERVICES,
  type ObjectType,
  type Service,
} from '@/lib/site-config'

const primaryLink =
  'inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#173d35] px-7 text-base font-medium !text-[#f7f4ee] shadow-[0_12px_30px_-14px_#173d35] transition-colors hover:bg-[#24594c]'
const outlineLink =
  'inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#173d35]/20 px-7 text-base font-medium text-[#173d35] transition-colors hover:bg-white/50'
const smallPrimary =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#173d35] px-5 text-sm font-semibold !text-[#f7f4ee] hover:bg-[#24594c]'
const smallOutline =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#173d35]/25 px-5 text-sm font-medium text-[#173d35] hover:bg-white/60'
const fieldClass =
  'mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-[#202522] outline-none placeholder:text-[#9ca39d] focus:ring-2 focus:ring-[#173d35]'
const errorClass = 'mt-2 text-xs leading-5 text-[#b91c1c]'

const whatsappHref = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(
  'Здравствуйте! Хочу узнать стоимость окон.',
)}`

const PHOTO_LIMIT_MB = 10
const PHOTO_MAX_BYTES = PHOTO_LIMIT_MB * 1024 * 1024

function OrderFlow({ onBack, initialService }: { onBack: () => void; initialService?: Service }) {
  const [step, setStep] = useState(1)
  const [service, setService] = useState<Service>(initialService ?? SERVICES[0])
  const [objectType, setObjectType] = useState<ObjectType>(OBJECT_TYPES[0])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [openings, setOpenings] = useState('')
  const [comment, setComment] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('До обеда')
  const [priorities, setPriorities] = useState<string[]>([])
  const [photo, setPhoto] = useState<File>()
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<SubmitResult | null>(null)

  const draft = useMemo(
    () =>
      createLeadDraft({
        name,
        phone,
        service,
        objectType,
        address,
        openings,
        preferredDate: date,
        preferredTime: time,
        priorities,
        comment,
        consent,
        photoName: photo?.name,
      }),
    [name, phone, service, objectType, address, openings, date, time, priorities, comment, consent, photo],
  )
  const whatsappUrl = buildWhatsAppUrl(draft, CONTACT.whatsappNumber)

  const togglePriority = (value: string) => {
    setPriorities((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const onPhotoChange = (file?: File) => {
    setErrors((current) => ({ ...current, photo: '' }))
    if (!file) {
      setPhoto(undefined)
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhoto(undefined)
      setErrors((current) => ({ ...current, photo: 'Подойдёт только JPG или PNG.' }))
      return
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhoto(undefined)
      setErrors((current) => ({ ...current, photo: `Файл больше ${PHOTO_LIMIT_MB} МБ.` }))
      return
    }
    setPhoto(file)
  }

  const validateStep = (current: number) => {
    const next: Record<string, string> = {}
    if (current === 1) {
      if (!service) next.service = 'Выберите, что нужно рассчитать.'
      if (!objectType) next.objectType = 'Выберите тип объекта.'
    }
    if (current === 2 && address.trim().length < 5) {
      next.address = 'Укажите улицу, дом и квартиру или офис.'
    }
    if (current === 4) {
      if (!isValidName(name)) next.name = 'Как к вам обращаться? Минимум 2 символа.'
      if (!isPhoneComplete(phone)) next.phone = 'Проверьте номер: +7 (7XX) XXX-XX-XX.'
      if (!consent) next.consent = 'Нужно согласие на обработку данных.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goBack = () => {
    setErrors({})
    setStep((current) => Math.max(1, current - 1))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (step < 4) {
      if (validateStep(step)) setStep((current) => current + 1)
      return
    }
    if (!validateStep(4)) return

    setStatus('sending')
    saveLeadDraft(draft)
    const response = await submitLead(draft, photo)
    if (!response.ok) {
      // Технические детали оставляем в консоли, пользователю показываем понятный текст.
      console.error('Lead submit failed:', response.status, response.error)
    }
    setResult(response)
    setStatus(response.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <section className="page-enter min-h-screen bg-[#f4f1eb] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#173d35]"
          >
            <ArrowLeft size={17} /> Вернуться на сайт
          </button>
          <Card className="border-black/8 bg-[#fffdf9] shadow-none">
            <CardContent className="p-6 sm:p-8">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#dce9df] text-[#173d35]">
                <CheckCircle2 size={28} />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#173d35]">
                Заявка отправлена
              </h1>
              <p className="mt-3 leading-7 text-[#66716a]">
                Мы получили вашу заявку на {service.toLowerCase()} и передали её менеджеру. Он свяжется
                с вами по номеру {phone}, чтобы уточнить детали и согласовать время замера.
              </p>
              <div className="mt-6 rounded-2xl bg-[#e9e5dc] p-4 text-sm text-[#59635d]">
                <p className="font-semibold text-[#173d35]">Что дальше</p>
                <p className="mt-2">
                  {time}
                  {date ? `, ${date}` : ''} — ваше пожелание по времени. Точное время менеджер
                  подтвердит отдельно.
                </p>
                {photo && <p className="mt-2">Фото «{photo.name}» приложено к заявке.</p>}
                {result?.leadId && (
                  <p className="mt-2 text-xs text-[#6d756f]">Номер заявки: {result.leadId}</p>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <a className={primaryLink} href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle size={18} /> Написать в WhatsApp
                </a>
                <a className={outlineLink} href={CONTACT.phoneHref}>
                  <Phone size={17} /> Позвонить менеджеру
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#f4f1eb] px-5 py-6 pb-10 sm:px-8">
      <div className="mx-auto max-w-xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#173d35]"
        >
          <ArrowLeft size={17} /> Вернуться на сайт
        </button>
        <p className="text-xs uppercase tracking-[0.18em] text-[#846536]">Запрос расчёта</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#173d35]">
          Оставьте заявку на замер
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#66716a]">
          Фото, адрес и количество проёмов помогут менеджеру быстрее подготовить расчёт. Точную
          стоимость специалист подтвердит после замера.
        </p>

        <div className="my-6 flex items-center gap-2" aria-label={`Шаг ${step} из 4`}>
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className={`h-1.5 flex-1 rounded-full ${step >= item ? 'bg-[#173d35]' : 'bg-[#d9d5cc]'}`}
            />
          ))}
        </div>

        <Card className="border-black/8 bg-[#fffdf9] shadow-none">
          <CardContent className="p-5 sm:p-7">
            <form onSubmit={onSubmit} noValidate>
              {step === 1 && (
                <div>
                  <p className="text-sm font-semibold text-[#173d35]">Что нужно рассчитать?</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {SERVICES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={service === item}
                        onClick={() => setService(item)}
                        className={`min-h-14 rounded-xl border px-3 text-left text-sm transition-colors ${
                          service === item
                            ? 'border-[#173d35] bg-[#e6eee8] font-semibold text-[#173d35]'
                            : 'border-black/10 text-[#59635d] hover:bg-[#f4f1eb]'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {errors.service && <p className={errorClass}>{errors.service}</p>}

                  <p className="mt-6 text-sm font-semibold text-[#173d35]">Тип объекта</p>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {OBJECT_TYPES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={objectType === item}
                        onClick={() => setObjectType(item)}
                        className={`min-h-12 rounded-xl border px-3 text-sm transition-colors ${
                          objectType === item
                            ? 'border-[#173d35] bg-[#e6eee8] font-semibold text-[#173d35]'
                            : 'border-black/10 text-[#59635d] hover:bg-[#f4f1eb]'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {errors.objectType && <p className={errorClass}>{errors.objectType}</p>}

                  <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#b18b52]/60 bg-[#fffaf1] p-4">
                    <ImagePlus size={21} className="text-[#b18b52]" />
                    <span className="flex-1 text-sm text-[#59635d]">
                      <span className="block font-medium text-[#173d35]">Добавить фото объекта</span>
                      <span className="block text-xs">
                        Необязательно · JPG, PNG до {PHOTO_LIMIT_MB} МБ
                      </span>
                    </span>
                    <Upload size={18} className="text-[#846536]" />
                    <input
                      type="file"
                      name="photo"
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      onChange={(event) => onPhotoChange(event.target.files?.[0])}
                    />
                  </label>
                  {photo && (
                    <p className="mt-2 truncate text-xs text-[#66716a]">Прикреплено: {photo.name}</p>
                  )}
                  {errors.photo && <p className={errorClass}>{errors.photo}</p>}

                  <button type="submit" className={primaryLink + ' mt-6 w-full'}>
                    Продолжить <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-sm font-semibold text-[#173d35]">Куда нужен выезд?</p>
                  <label className="mt-4 block text-sm text-[#59635d]">
                    Адрес объекта
                    <input
                      name="address"
                      autoComplete="street-address"
                      value={address}
                      aria-invalid={Boolean(errors.address)}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Улица, дом, квартира / офис"
                      className={fieldClass}
                    />
                  </label>
                  {errors.address && <p className={errorClass}>{errors.address}</p>}

                  <label className="mt-4 block text-sm text-[#59635d]">
                    Сколько проёмов? <span className="text-[#9ca39d]">необязательно</span>
                    <input
                      name="openings"
                      type="number"
                      min="1"
                      max="200"
                      inputMode="numeric"
                      value={openings}
                      onChange={(event) => setOpenings(event.target.value)}
                      placeholder="Например: 3"
                      className={fieldClass}
                    />
                  </label>

                  <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#f4f1eb] p-4 text-sm text-[#66716a]">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-[#b18b52]" /> Адрес нужен, чтобы
                    менеджер подготовил выезд и уточнил доступность замера.
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button type="button" className={outlineLink + ' flex-1'} onClick={goBack}>
                      Назад
                    </button>
                    <button type="submit" className={primaryLink + ' flex-1'}>
                      Далее <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-sm font-semibold text-[#173d35]">Когда удобно связаться?</p>
                  <label className="mt-4 block text-sm text-[#59635d]">
                    Желаемая дата
                    <input
                      name="preferredDate"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className={fieldClass}
                    />
                  </label>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {['До обеда', 'После обеда'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={time === item}
                        onClick={() => setTime(item)}
                        className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm ${
                          time === item
                            ? 'border-[#173d35] bg-[#e6eee8] font-semibold text-[#173d35]'
                            : 'border-black/10 text-[#59635d]'
                        }`}
                      >
                        <Clock3 size={16} /> {item}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#8b918b]">
                    Дата и половина дня — пожелание, точное время подтвердит менеджер.
                  </p>

                  <p className="mt-6 text-sm font-semibold text-[#173d35]">
                    Что для вас важнее? <span className="font-normal text-[#9ca39d]">необязательно</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRIORITIES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={priorities.includes(item)}
                        onClick={() => togglePriority(item)}
                        className={`h-11 rounded-full border px-4 text-sm transition-colors ${
                          priorities.includes(item)
                            ? 'border-[#173d35] bg-[#e6eee8] font-semibold text-[#173d35]'
                            : 'border-black/10 text-[#59635d] hover:bg-[#f4f1eb]'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button type="button" className={outlineLink + ' flex-1'} onClick={goBack}>
                      Назад
                    </button>
                    <button type="submit" className={primaryLink + ' flex-1'}>
                      Далее <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <p className="text-sm font-semibold text-[#173d35]">Куда отправить ответ?</p>
                  <label className="mt-4 block text-sm text-[#59635d]">
                    Имя
                    <input
                      name="name"
                      autoComplete="name"
                      value={name}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Как к вам обращаться"
                      className={fieldClass}
                    />
                  </label>
                  {errors.name && <p className={errorClass}>{errors.name}</p>}

                  <label className="mt-4 block text-sm text-[#59635d]">
                    Телефон
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      aria-invalid={Boolean(errors.phone)}
                      onChange={(event) => setPhone(formatPhone(event.target.value))}
                      placeholder="+7 (701) 000-00-00"
                      className={fieldClass}
                    />
                  </label>
                  {errors.phone && <p className={errorClass}>{errors.phone}</p>}

                  <label className="mt-4 block text-sm text-[#59635d]">
                    Комментарий <span className="text-[#9ca39d]">необязательно</span>
                    <textarea
                      name="comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Например: нужно остеклить балкон"
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[#202522] outline-none placeholder:text-[#9ca39d] focus:ring-2 focus:ring-[#173d35]"
                    />
                  </label>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-[#66716a]">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-[#173d35]"
                    />
                    <span>
                      Согласен на обработку персональных данных для подготовки расчёта.{' '}
                      <a className="font-medium text-[#173d35] underline" href="#privacy">
                        Как мы работаем с данными
                      </a>
                    </span>
                  </label>
                  {errors.consent && <p className={errorClass}>{errors.consent}</p>}

                  <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#f4f1eb] p-4 text-xs leading-5 text-[#66716a]">
                    <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#b18b52]" /> Менеджер
                    свяжется в удобное для вас время и подтвердит слот замера.
                  </div>

                  {status === 'error' && (
                    <div
                      role="alert"
                      className="mt-4 rounded-xl border border-[#b91c1c]/25 bg-[#fef2f2] p-4 text-xs leading-5 text-[#7f1d1d]"
                    >
                      <p className="flex items-start gap-2 font-semibold">
                        <Info size={16} className="mt-0.5 shrink-0" /> Не удалось отправить заявку
                      </p>
                      <p className="mt-2">
                        Заявка сохранена на этом устройстве. Отправьте её в WhatsApp или позвоните —
                        так менеджер точно получит обращение.
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <a
                          className={smallPrimary}
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={16} /> Отправить в WhatsApp
                        </a>
                        <a className={smallOutline} href={CONTACT.phoneHref}>
                          <Phone size={16} /> Позвонить
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button type="button" className={outlineLink + ' flex-1'} onClick={goBack}>
                      Назад
                    </button>
                    <button
                      type="submit"
                      className={primaryLink + ' flex-1'}
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [screen, setScreen] = useState<'home' | 'order'>('home')
  const [preset, setPreset] = useState<Service>()

  const openOrder = (service?: Service) => {
    setPreset(service)
    setScreen('order')
  }

  if (screen === 'order') return <OrderFlow initialService={preset} onBack={() => setScreen('home')} />

  return (
    <main className="page-enter min-h-screen overflow-x-hidden bg-[#f4f1eb] pb-20 text-[#202522] md:pb-0">
      <header className="relative z-20 border-b border-black/8 bg-[#f4f1eb]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-3" aria-label="СПФ Регион Строй — на главную">
            <img
              src="/spf-logo.svg"
              alt="СПФ Регион Строй — окна и конструкции"
              className="h-10 w-auto sm:h-11"
            />
          </a>
          <nav
            className="hidden items-center gap-8 text-sm text-[#59635d] lg:flex"
            aria-label="Основная навигация"
          >
            <a className="transition-colors hover:text-[#173d35]" href="#solutions-detail">
              Решения
            </a>
            <a className="transition-colors hover:text-[#173d35]" href="#calculator">
              Калькулятор
            </a>
            <a className="transition-colors hover:text-[#173d35]" href="#how-it-works">
              Как работаем
            </a>
            <a className="transition-colors hover:text-[#173d35]" href="#faq">
              FAQ
            </a>
            <a className="transition-colors hover:text-[#173d35]" href="#contacts">
              Контакты
            </a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <a className="text-sm font-medium text-[#173d35]" href={CONTACT.phoneHref}>
              {CONTACT.phone}
            </a>
            <a
              className={primaryLink + ' h-11 px-5 text-sm shadow-none'}
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              Написать в WhatsApp
            </a>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-[#173d35] sm:hidden"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-black/8 px-5 py-4 sm:hidden">
            <div className="flex flex-col gap-4 text-sm text-[#59635d]">
              <a href="#solutions-detail" onClick={() => setMenuOpen(false)}>
                Решения
              </a>
              <a href="#calculator" onClick={() => setMenuOpen(false)}>
                Калькулятор
              </a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                Как работаем
              </a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>
                FAQ
              </a>
              <a href="#contacts" onClick={() => setMenuOpen(false)}>
                Контакты
              </a>
              <a className="font-semibold text-[#173d35]" href={CONTACT.phoneHref}>
                {CONTACT.phone}
              </a>
            </div>
          </div>
        )}
      </header>

      <section
        id="top"
        className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-12 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-20 lg:pt-16"
      >
        <div>
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-[#b18b52]/40 bg-[#b18b52]/10 px-3 py-1 text-[#846536]"
          >
            Окна · двери · фасадные витражи
          </Badge>
          <h1 className="max-w-[680px] text-[clamp(2.7rem,7vw,5.7rem)] font-semibold leading-[0.96] tracking-[-0.065em] text-[#173d35]">
            Свет, тепло и тишина — в вашем доме.
          </h1>
          <p className="mt-6 max-w-[530px] text-base leading-7 text-[#66716a] sm:text-lg">
            Окна и конструкции из металлопластика и алюминия в Астане. Подберём решение под ваш
            объект, организуем замер и подготовим расчёт.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className={primaryLink} onClick={() => openOrder()}>
              Запросить расчёт <ArrowUpRight size={18} />
            </button>
            <a className={outlineLink} href={CONTACT.phoneHref}>
              <Phone size={17} /> Позвонить
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#66716a]">
            <span className="font-semibold text-[#173d35]">
              4,9 <span className="font-normal text-[#66716a]">· 46 оценок</span>
            </span>
            <span>43 отзыва</span>
            <span>26 фото в 2GIS</span>
          </div>
          <p className="mt-4 text-sm text-[#66716a]">{CONTACT.address}</p>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#d7d4cc] shadow-[0_30px_80px_-35px_rgba(23,61,53,.35)] sm:min-h-[540px]">
          <img
            src={heroImage}
            alt={
              HERO_IMAGE_IS_DEMO
                ? 'Демонстрационное изображение оконной конструкции'
                : 'Оконная конструкция в интерьере'
            }
            className="absolute inset-0 size-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width="900"
            height="1100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173d35]/70 via-transparent to-transparent" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/30 bg-[#f7f4ee]/90 p-4 backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#6d756f]">Подберём решение</p>
                <p className="mt-1 text-lg font-semibold text-[#173d35]">
                  для квартиры, дома или бизнеса
                </p>
              </div>
              <Ruler className="mt-1 text-[#b18b52]" size={22} />
            </div>
            {HERO_IMAGE_IS_DEMO && (
              <p className="mt-3 text-[11px] leading-4 text-[#8b918b]">
                Демонстрационное изображение — заменим на фото выполненных объектов.
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-[1240px] px-5 pb-14 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-black/8 bg-[#fffdf9] shadow-none">
            <CardContent className="p-6">
              <Ruler className="mb-5 text-[#b18b52]" size={24} />
              <h2 className="text-lg font-semibold text-[#173d35]">Окна по размеру</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d756f]">
                Пластиковые и алюминиевые окна для жилых и коммерческих помещений.
              </p>
            </CardContent>
          </Card>
          <Card className="border-black/8 bg-[#fffdf9] shadow-none">
            <CardContent className="p-6">
              <ShieldCheck className="mb-5 text-[#b18b52]" size={24} />
              <h2 className="text-lg font-semibold text-[#173d35]">Конструкции и двери</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d756f]">
                Решения для входных групп, фасадов и офисных пространств.
              </p>
            </CardContent>
          </Card>
          <Card className="border-black/8 bg-[#fffdf9] shadow-none">
            <CardContent className="p-6">
              <MessageCircle className="mb-5 text-[#b18b52]" size={24} />
              <h2 className="text-lg font-semibold text-[#173d35]">Расчёт в WhatsApp</h2>
              <p className="mt-2 text-sm leading-6 text-[#6d756f]">
                Отправьте задачу — специалист уточнит параметры и подготовит расчёт.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <AdditionalSections onOrder={openOrder} />

      <section id="process" className="border-y border-black/8 bg-[#e9e5dc] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#846536]">Следующий шаг</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.04em] text-[#173d35] sm:text-4xl">
              Расскажите, что нужно остеклить — остальное уточним вместе.
            </h2>
          </div>
          <button type="button" className={primaryLink + ' shrink-0'} onClick={() => openOrder()}>
            Записаться на замер <ArrowUpRight size={18} />
          </button>
        </div>
      </section>

      <footer
        id="contacts"
        className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-8 text-sm text-[#6d756f] sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12"
      >
        <span>СПФ Регион Строй · Астана</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a className="font-medium text-[#173d35]" href={CONTACT.phoneHref}>
            {CONTACT.phone}
          </a>
          <a className="text-[#6d756f] underline underline-offset-2" href="#privacy">
            Обработка данных
          </a>
        </div>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-2 gap-2 rounded-2xl border border-white/60 bg-[#173d35]/95 p-2 shadow-[0_20px_45px_-18px_rgba(0,0,0,.45)] backdrop-blur-md sm:hidden">
        <button
          type="button"
          onClick={() => openOrder()}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-medium text-[#f7f4ee]"
        >
          <Ruler size={17} /> Запись на замер
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b18b52] text-sm font-semibold text-[#fffdf9]"
        >
          <MessageCircle size={17} /> WhatsApp
        </a>
      </div>
    </main>
  )
}

export default App
