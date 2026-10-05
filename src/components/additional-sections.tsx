import {
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  Clock,
  DoorOpen,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Ruler,
  Sparkles,
} from 'lucide-react'
import { PriceCalculator } from '@/components/price-calculator'
import { Cases, Reviews } from '@/components/showcase'
import { WorksGallery } from '@/components/works-gallery'
import { CASES, CONTACT, DEMO_MODE, ENTERPRISE_TYPE, type Service } from '@/lib/site-config'

const solutions: Array<{
  title: string
  text: string
  icon: typeof Ruler
  tag: string
  cta: string
  preset?: Service
}> = [
  {
    title: 'Для квартиры',
    text: 'Пластиковые окна и двери для замены или нового ремонта.',
    icon: Ruler,
    tag: 'Жилые помещения',
    cta: 'Рассчитать окна',
    preset: 'Окна',
  },
  {
    title: 'Для дома',
    text: 'Алюминиевые и пластиковые конструкции для частного дома.',
    icon: Sparkles,
    tag: 'Индивидуальный проект',
    cta: 'Обсудить дом',
    preset: 'Окна',
  },
  {
    title: 'Для бизнеса',
    text: 'Фасадные витражи и входные группы для коммерческих объектов.',
    icon: LayoutGrid,
    tag: 'Коммерческие объекты',
    cta: 'Запросить фасадный расчёт',
    preset: 'Фасадные витражи',
  },
  {
    title: 'Нужен совет',
    text: 'Опишите задачу — специалист поможет выбрать направление.',
    icon: DoorOpen,
    tag: 'Без лишних вопросов',
    cta: 'Задать вопрос',
  },
]

const processSteps = [
  {
    n: '01',
    title: 'Опишите задачу',
    text: 'Выберите окна, двери или фасадные витражи.',
  },
  {
    n: '02',
    title: 'Добавьте контекст',
    text: 'Укажите адрес, количество проёмов и, если удобно, прикрепите фото объекта.',
  },
  {
    n: '03',
    title: 'Получите связь',
    text: 'Менеджер уточнит параметры и согласует следующий шаг.',
  },
]

const faq = [
  {
    q: 'Можно ли прислать фото объекта?',
    a: 'Да. В форме заявки можно прикрепить фото в формате JPG или PNG — файл уходит вместе с заявкой. Это необязательно, но помогает быстрее понять задачу.',
  },
  {
    q: 'Какие решения можно запросить?',
    a: 'Пластиковые и алюминиевые окна, двери и фасадные витражи. Если вашей задачи нет в списке, опишите её в комментарии — подскажем подходящее решение.',
  },
  {
    q: 'Можно ли сразу узнать точную цену?',
    a: 'Точная стоимость зависит от размеров, открываний, цвета и монтажа, поэтому её подтверждает менеджер после замера. В заявке можно указать, что для вас важнее: цена, тепло, тишина или срок.',
  },
  {
    q: 'Как согласуется время замера?',
    a: 'Вы выбираете желаемую дату и удобную половину дня. Это пожелание, а точное время менеджер подтверждает по телефону или в WhatsApp.',
  },
  {
    q: 'Почему на сайте нет цен?',
    a: 'Одинаковые на вид окна отличаются в цене в разы — разница в комплектации и монтаже, а не в «окне». Поэтому мы не ставим усреднённую цифру, а считаем по вашим параметрам и объясняем, из чего складывается сумма. Пришлите размеры и фото в WhatsApp — расчёт подготовим по вашей задаче.',
  },
  {
    q: 'Можно приехать в офис?',
    a: 'Да. Мы находимся в Астане, проспект Республики, 56/2а, район Сарыарка. Работаем по будням и в субботу с 09:00 до 19:00, воскресенье — выходной. Маршрут и вход указаны в карточке 2ГИС.',
  },
  {
    q: 'Работаете только с квартирами?',
    a: 'Нет. Помимо квартир и частных домов работаем с коммерческими объектами: фасадные витражи, входные группы, остекление для офисов. Опишите объект в заявке — подскажем подходящее решение.',
  },
  {
    q: 'Неудобно разговаривать по телефону — что делать?',
    a: 'Выберите в заявке удобное время или сразу напишите в WhatsApp: сообщение придёт менеджеру с параметрами вашего объекта, и отвечать можно текстом.',
  },
]

export function AdditionalSections({ onOrder }: { onOrder: (service?: Service) => void }) {
  return (
    <>
      <section
        id="solutions-detail"
        className="border-y border-black/8 bg-[#fffdf9] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Подбор по задаче</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-5xl">
                Не каталог ради каталога — решение под ваш объект.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOrder()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#173d35]/20 px-5 text-sm font-medium text-[#173d35] transition-colors hover:bg-[#f4f1eb]"
            >
              Получить подбор <ArrowUpRight size={16} />
            </button>
          </div>

          <div data-stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map(({ title, text, icon: Icon, tag, cta, preset }) => (
              <article
                key={title}
                className="group rounded-[1.5rem] border border-black/8 bg-[#f4f1eb] p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e5eee8] text-[#173d35]">
                    <Icon size={21} />
                  </div>
                  <span className="text-xs uppercase tracking-[0.12em] text-[#7a5c2c]">
                    {tag}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-semibold text-[#173d35]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5c665f]">{text}</p>
                <button
                  type="button"
                  onClick={() => onOrder(preset)}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#173d35]/25 px-4 text-sm font-semibold text-[#173d35] transition-colors hover:bg-[#e6eee8]"
                >
                  {cta} <ArrowUpRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

        <WorksGallery />

      <Cases />

      <PriceCalculator onOrder={() => onOrder()} />

      <section
        id="price"
        className="border-y border-black/8 bg-[#f7f4ee] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"
      >
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Про цену честно</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-4xl">
              Мы не пишем «окно от 30 000 ₸». И вот почему.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5c665f]">
              Одинаковые на вид окна отличаются в цене в разы — и почти всегда разница не в самом
              окне, а в комплектации и монтаже. Поэтому вместо усреднённой цифры мы считаем по вашим
              параметрам и объясняем, из чего складывается сумма.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-[#59635d]">
              {[
                'Размер, количество створок и тип открывания',
                'Профиль: металлопластик или алюминий',
                'Стеклопакет: камерность и энергосбережение',
                'Фурнитура, откосы, подоконник и монтаж',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#173d35]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onOrder()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173d35] px-6 text-sm font-semibold !text-[#f7f4ee] hover:bg-[#24594c]"
              >
                Рассчитать стоимость <ArrowUpRight size={17} />
              </button>
              <a
                href={`https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent('Здравствуйте! Хочу узнать стоимость. Параметры объекта: ')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#173d35]/25 px-6 text-sm font-medium text-[#173d35] hover:bg-white"
              >
                <MessageCircle size={17} /> Расчёт в WhatsApp
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Что выбрать</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-4xl">
              Металлопластик или алюминий?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/8 bg-white p-5">
                <p className="text-lg font-semibold text-[#173d35]">Металлопластик</p>
                <p className="mt-2 text-sm leading-6 text-[#5c665f]">
                  Тёплый профиль для квартир и жилых домов: держит тепло и уличный шум, подходит для
                  стандартных и нестандартных проёмов.
                </p>
              </div>
              <div className="rounded-2xl border border-black/8 bg-white p-5">
                <p className="text-lg font-semibold text-[#173d35]">Алюминий</p>
                <p className="mt-2 text-sm leading-6 text-[#5c665f]">
                  Тонкие прочные рамы и большие площади остекления: фасадные витражи, входные группы,
                  панорамные конструкции для коммерческих объектов.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5c665f]">
              Не уверены, что подойдёт именно вам? Опишите объект — подскажем вариант и объясним
              разницу на вашем примере, без навязывания более дорогого решения.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Как проходит запрос</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-5xl">
              Короткий путь от идеи до точного разговора.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#5c665f]">
              Не нужно заранее знать профиль или размеры. Достаточно выбрать направление, приложить
              фото и оставить контакты.
            </p>
          </div>
          <div data-stagger className="grid gap-4 sm:grid-cols-3">
            {processSteps.map((item) => (
              <div key={item.n} className="rounded-[1.5rem] bg-[#173d35] p-6 text-[#f7f4ee]">
                <span className="text-sm text-[#d4b477]">{item.n}</span>
                <h3 className="mt-12 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#d9e4dc]/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {CASES.length > 0 && (
        <section
          id="cases"
          className="border-y border-black/8 bg-[#e9e5dc] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1240px]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Наши работы</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-5xl">
              Объекты, которые мы уже сделали.
            </h2>
            <div data-stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CASES.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-[1.5rem] border border-black/8 bg-[#fffdf9]"
                >
                  <img
                    src={item.photo}
                    alt={`${item.title} — ${item.object}`}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#173d35]">{item.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#7a5c2c]">
                      {item.object} · {item.city} · {item.date}
                    </p>
                    <dl className="mt-4 space-y-2 text-sm leading-6 text-[#5c665f]">
                      <div>
                        <dt className="font-semibold text-[#173d35]">Задача</dt>
                        <dd>{item.task}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#173d35]">Решение</dt>
                        <dd>{item.solution}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#173d35]">Результат</dt>
                        <dd>{item.result}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="trust"
        className="border-y border-black/8 bg-[#e9e5dc] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"
      >
        <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Доверие до обращения</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-4xl">
              Проверьте компанию так, как удобно вам.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5c665f]">
              Рейтинг, отзывы, фотографии и контакты СПФ Регион Строй открыты в 2GIS — по данным
              карточки на {CONTACT.mapUpdatedAt}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#59635d]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-4 py-2">
                <Check size={15} className="text-[#173d35]" /> 4,9 в 2GIS
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-4 py-2">
                <Check size={15} className="text-[#173d35]" /> 43 отзыва
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ee] px-4 py-2">
                <Check size={15} className="text-[#173d35]" /> {ENTERPRISE_TYPE}
              </span>
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f7f4ee] px-4 underline underline-offset-4"
                href="#works"
              >
                <Check size={15} className="text-[#173d35]" /> 26 фото работ
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
            <a
              href={CONTACT.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#173d35] px-6 text-sm font-semibold !text-[#f7f4ee] hover:bg-[#24594c]"
            >
              Открыть 2GIS <ArrowUpRight size={16} />
            </a>
            <button
              type="button"
              onClick={() => onOrder()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#173d35]/20 px-6 text-sm font-medium text-[#173d35] hover:bg-[#f7f4ee]"
            >
              Запросить расчёт
            </button>
          </div>
        </div>
      </section>

      <Reviews />

      <section
        id="contact-details"
        className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Контакты</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-5xl">
              Можно начать с удобного канала.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#5c665f]">
              Адрес и телефон подтверждены открытой карточкой 2GIS.
            </p>
            <div data-stagger className="mt-8 grid gap-3">
              <a
                href={CONTACT.phoneHref}
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-black/8 bg-[#fffdf9] p-4"
              >
                <PhoneIcon />
                <span>
                  <span className="block text-xs text-[#7a5c2c]">Телефон</span>
                  <span className="font-semibold text-[#173d35]">{CONTACT.phone}</span>
                </span>
              </a>
              <a
                href={CONTACT.phone2Href}
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-black/8 bg-[#fffdf9] p-4"
              >
                <PhoneIcon />
                <span>
                  <span className="block text-xs text-[#7a5c2c]">Дополнительный номер</span>
                  <span className="font-semibold text-[#173d35]">{CONTACT.phone2}</span>
                </span>
              </a>
              <div className="flex min-h-24 items-center gap-4 rounded-2xl border border-black/8 bg-[#fffdf9] p-4">
                <Clock size={19} className="text-[#b18b52]" />
                <span>
                  <span className="block text-xs text-[#7a5c2c]">График работы</span>
                  <span className="block font-semibold text-[#173d35]">Пн–Сб 09:00–19:00</span>
                  <span className="block text-xs text-[#5c665f]">Воскресенье — выходной</span>
                </span>
              </div>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-black/8 bg-[#fffdf9] p-4"
              >
                <Mail size={19} className="text-[#b18b52]" />
                <span>
                  <span className="block text-xs text-[#7a5c2c]">Email</span>
                  <span className="font-semibold text-[#173d35]">{CONTACT.email}</span>
                </span>
              </a>
              <a
                href={`https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent('Здравствуйте! Пишу с сайта СПФ Регион Строй.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-24 items-center gap-4 rounded-2xl border border-black/8 bg-[#fffdf9] p-4"
              >
                <MessageCircle size={19} className="text-[#b18b52]" />
                <span>
                  <span className="block text-xs text-[#7a5c2c]">WhatsApp</span>
                  <span className="font-semibold text-[#173d35]">{CONTACT.phone}</span>
                </span>
              </a>
              {/* Пока актуальный профиль не подтверждён, карточка не показывается вовсе. */}
              {CONTACT.instagramHandle && (
                <a
                  href={`https://www.instagram.com/${CONTACT.instagramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-24 items-center gap-4 rounded-2xl border border-black/8 bg-[#fffdf9] p-4"
                >
                  <Camera size={19} className="text-[#b18b52]" />
                  <span>
                    <span className="block text-xs text-[#7a5c2c]">Instagram</span>
                    <span className="font-semibold text-[#173d35]">@{CONTACT.instagramHandle}</span>
                  </span>
                </a>
              )}
            </div>
          </div>
          <div className="flex min-h-[320px] flex-col justify-between rounded-[2rem] bg-[#173d35] p-6 text-[#f7f4ee] sm:p-8">
            <div>
              <MapPin size={25} className="text-[#d4b477]" />
              <p className="mt-8 text-xs uppercase tracking-[0.16em] text-[#d4b477]">Адрес</p>
              <h3 className="mt-2 text-2xl font-semibold">{CONTACT.address}</h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#d9e4dc]/80">
                Район Сарыарка. Маршрут и ориентиры для входа — в карточке 2GIS.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={CONTACT.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#b18b52] px-5 text-sm font-semibold !text-[#14201c] transition-colors hover:bg-[#c39a5d]"
              >
                Открыть маршрут <ArrowUpRight size={16} />
              </a>
              <button
                type="button"
                onClick={() => onOrder()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-sm font-medium !text-[#f7f4ee]"
              >
                Записаться на замер
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[900px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-5xl">
            Ответы до разговора с менеджером.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-black/10 rounded-[1.5rem] border border-black/8 bg-[#fffdf9] px-5 sm:px-8">
          {faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#173d35]">
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className="shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="max-w-2xl pt-3 text-sm leading-6 text-[#5c665f]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="privacy" className="mx-auto max-w-[900px] px-5 pb-16 sm:px-8 lg:pb-24">
        <h2 className="text-lg font-semibold text-[#173d35]">Обработка персональных данных</h2>
        {/*
          Текст политики зависит от режима: в демонстрации утверждение «данные передаются в
          CRM-систему» было бы неправдой — форма не отправляет и не сохраняет ничего.
        */}
        <p className="mt-3 text-sm leading-6 text-[#5c665f]">
          {DEMO_MODE
            ? 'Это демонстрационный показ сайта: данные, которые вы заполняете в форме, никуда не отправляются и не сохраняются — ни на сервере компании, ни в браузере. Настоящие персональные данные в форме оставлять не нужно, достаточно любого примера. Реальную заявку можно оставить по телефону, в WhatsApp или письмом на '
            : 'Имя, телефон, адрес объекта, комментарий и фотографии, которые вы оставляете в форме, используются только для подготовки расчёта и согласования замера. Данные передаются в CRM-систему, которая обрабатывает заявки компании, и не передаются третьим лицам для рекламы. Чтобы изменить или удалить свои данные, напишите на '}
          <a className="font-medium text-[#173d35] underline" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          .
        </p>
      </section>
    </>
  )
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 text-[#b18b52]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 4.5 8 3l2.2 4.8-2 1.5a13 13 0 0 0 6.5 6.5l1.5-2L21 16l-1.5 3c-.4.8-1.3 1.2-2.2 1C10 18.3 5.7 14 4 7c-.2-1 .2-1.9 1-2.5Z" />
    </svg>
  )
}
