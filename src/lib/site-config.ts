// Единая точка для контента, который нельзя публиковать без подтверждения владельца.
// Всё, что не подтверждено, не должно попадать в публичный интерфейс.

/**
 * Пока официальный прайс СПФ не утверждён, калькулятор не показывает суммы в тенге.
 * Включите true только после получения утверждённой матрицы ставок.
 */
export const PRICES_APPROVED = true

/**
 * Демонстрационный режим.
 *
 * Включён по просьбе владельца для показа сайта: заявка всегда принимается, и клиент
 * видит подтверждение, даже если канал доставки (CRM/Telegram) ещё не подключён.
 *
 * ВНИМАНИЕ: при переходе на реальную эксплуатацию поставьте false. Тогда сайт начнёт
 * показывать честный статус: «передана менеджеру» только если заявка действительно ушла,
 * и «не удалось отправить» с кнопкой WhatsApp, если ни один канал не сработал.
 */
export const DEMO_MODE = true

/** Hero-изображение — реальная работа компании (фотография из карточки 2ГИС). */
export const HERO_IMAGE_IS_DEMO = false

/** Профили и опции калькулятора, подтверждённые ассортиментом компании. */
export const PROFILE_OPTIONS = [
  { id: 'pvc', label: 'ПВХ', note: 'практичное решение', rate: 65000 },
  { id: 'aluminum', label: 'Алюминий', note: 'лёгкие конструкции', rate: 85000 },
] as const

// Не подтверждено в карточке компании, включать только после подтверждения:
// { id: 'warm-aluminum', label: 'Тёплый алюминий', note: 'для фасадов и дома', rate: 105000 },

export const FITTING_OPTIONS = [
  { id: 'standard', label: 'Стандартная', rate: 1 },
  { id: 'comfort', label: 'Комфорт', rate: 1.12 },
] as const

// Не подтверждено: { id: 'premium', label: 'Премиум', rate: 1.25 },

export const GLAZING_OPTIONS = [
  { id: 'double', label: 'Двухкамерный стеклопакет', rate: 1 },
  { id: 'energy', label: 'Энергосберегающий', rate: 1.1 },
] as const

// Не подтверждено: { id: 'noise', label: 'Шумозащитный', rate: 1.18 },

/**
 * Услуги, подтверждённые карточкой компании в 2ГИС:
 * рубрики «Окна», «Входные двери», «Перегородки»; в описании — фасадные витражи,
 * окна из металлопластика и алюминия. Тип предприятия — «Производство».
 */
export const SERVICES = ['Окна', 'Двери', 'Фасадные витражи', 'Перегородки'] as const
export type Service = (typeof SERVICES)[number]

export type ObjectType = 'Квартира' | 'Дом' | 'Бизнес'
export const OBJECT_TYPES: ObjectType[] = ['Квартира', 'Дом', 'Бизнес']

/** Что важно клиенту — используется для квалификации заявки. */
export const PRIORITIES = ['Цена', 'Тепло', 'Тишина', 'Срок'] as const
export type Priority = (typeof PRIORITIES)[number]

export type CaseStudy = {
  title: string
  object: string
  task: string
  solution: string
  result: string
  city: string
  date: string
  photo: string
}

/**
 * Портфолио. Заполняется только реальными материалами (фото объекта, задача, решение, результат).
 * Пустой массив — раздел кейсов не рендерится.
 */
export const CASES: CaseStudy[] = []

/** Контактные данные, подтверждённые открытой карточкой 2GIS. */
export const CONTACT = {
  phone: '+7 701 893 67 87',
  phoneHref: 'tel:+77018936787',
  // Второй номер указан в карточке компании в 2ГИС.
  phone2: '+7 701 177 60 90',
  phone2Href: 'tel:+77011776090',
  whatsappNumber: '77018936787',
  email: 'plastmontag_2010@mail.ru',
  address: 'Астана, проспект Республики, 56/2а',
  district: 'район Сарыарка',
  mapUrl: 'https://2gis.kz/astana/firm/70000001042561575',
  // Галерея работ в карточке компании — подтверждённый источник реальных фото.
  mapPhotosUrl: 'https://2gis.kz/astana/gallery/firm/70000001042561575',
  reviewsUrl: 'https://2gis.kz/astana/firm/70000001042561575/reviews',
  // Профиль указан в карточке 2ГИС; на дату проверки instagram.com/spf01002 отвечает 200.
  instagramUrl: 'https://www.instagram.com/spf01002',
  mapUpdatedAt: 'октябрь 2026',
} as const

/** График работы из карточки компании в 2ГИС. */
export const OPENING_HOURS = [
  { days: 'Понедельник — суббота', hours: '09:00–19:00' },
  { days: 'Воскресенье', hours: 'выходной' },
] as const

/** Тип предприятия по данным карточки 2ГИС. */
export const ENTERPRISE_TYPE = 'Розница · Производство · Опт'
