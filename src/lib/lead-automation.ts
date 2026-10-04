import type { ObjectType, Service } from '@/lib/site-config'

export type LeadDraft = {
  id: string
  createdAt: string
  name: string
  phone: string
  service: Service
  objectType: ObjectType
  address: string
  openings: string
  preferredDate: string
  preferredTime: string
  priorities: string[]
  comment: string
  consent: boolean
  photoName?: string
  source: 'website-order-flow'
}

export const CRM_ENDPOINT = '/api/leads'
const OUTBOX_KEY = 'spf-lead-outbox'
const REQUEST_TIMEOUT_MS = 20000

export function createLeadDraft(
  input: Omit<LeadDraft, 'id' | 'createdAt' | 'source'>,
): LeadDraft {
  return {
    ...input,
    // В поле хранится только локальная часть, в заявку уходит номер целиком.
    phone: toFullPhone(input.phone),
    id: `spf-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: 'website-order-flow',
  }
}

/** Локальный outbox на случай, если сеть недоступна: черновик не теряется. */
export function saveLeadDraft(lead: LeadDraft) {
  try {
    const existing = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? '[]') as LeadDraft[]
    localStorage.setItem(OUTBOX_KEY, JSON.stringify([lead, ...existing].slice(0, 25)))
  } catch {
    // localStorage может быть недоступен (приватный режим) — это не повод ломать форму.
  }
}

export function buildWhatsAppMessage(lead: LeadDraft) {
  return [
    'Здравствуйте! Хочу оставить заявку на замер.',
    `Интересует: ${lead.service}.`,
    `Объект: ${lead.objectType}.`,
    lead.address ? `Адрес: ${lead.address}.` : '',
    lead.openings ? `Проёмов: ${lead.openings}.` : '',
    lead.priorities.length ? `Важно: ${lead.priorities.join(', ')}.` : '',
    lead.preferredDate ? `Желаемая дата: ${lead.preferredDate}.` : '',
    lead.preferredTime ? `Время: ${lead.preferredTime}.` : '',
    lead.comment ? `Комментарий: ${lead.comment}.` : '',
    lead.photoName ? `Фото приложу в чат: ${lead.photoName}.` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildWhatsAppUrl(lead: LeadDraft, whatsappNumber: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(lead))}`
}

export type SubmitResult = {
  ok: boolean
  status: number
  leadId?: string
  /**
   * delivered — заявка передана в канал доставки (CRM/Telegram);
   * stored — сохранена на сервере, но канал доставки не настроен;
   * dropped — отброшена антиспамом.
   * UI обязан различать эти состояния: обещать «передана менеджеру» можно только при delivered.
   */
  outcome?: 'delivered' | 'stored' | 'dropped'
  storage?: { saved: boolean; persistent: boolean }
  error?: string
}

/**
 * Отправляет заявку на backend вместе с файлом фотографии.
 * Успех — только при HTTP 2xx: иначе UI обязан показать ошибку и запасной канал связи.
 */
export async function submitLead(lead: LeadDraft, photo?: File, honeypot = ''): Promise<SubmitResult> {
  const body = new FormData()
  // `company` — скрытое honeypot-поле: его заполняют только спам-боты.
  body.append('payload', JSON.stringify({ ...lead, company: honeypot }))
  if (photo) body.append('photo', photo, photo.name)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      body,
      signal: controller.signal,
    })
    const data = (await response.json().catch(() => null)) as
      | {
          leadId?: string
          outcome?: 'delivered' | 'stored' | 'dropped'
          storage?: { saved: boolean; persistent: boolean }
          error?: string
        }
      | null

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.error || `Сервер ответил ${response.status}`,
      }
    }

    return {
      ok: true,
      status: response.status,
      leadId: data?.leadId,
      outcome: data?.outcome,
      storage: data?.storage,
    }
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError'
    return {
      ok: false,
      status: 0,
      error: aborted ? 'Превышено время ожидания ответа' : 'Нет связи с сервером',
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Маска локальной части казахстанского номера: «701 893-67-87».
 *
 * Код страны «+7» показывается отдельным статичным префиксом поля и в само значение не входит.
 * Так ввод становится однозначным: раньше, когда код страны был внутри значения, а казахстанские
 * номера сами начинаются с 7 (701…) или вводятся с 8, номер искажался — например «7018936787»
 * превращалось в «+7 (018) 936-78-7», а посимвольный набор «87018936787» — в «+7 (770) 189-36-78».
 */
export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (!digits) return ''

  // Больше 10 цифр — значит номер пришёл целиком (вставка или набор с кодом страны).
  // Убираем код страны: 8 (местный набор) или 7 (международный).
  if (digits.length > 10 && (digits.startsWith('8') || digits.startsWith('7'))) {
    digits = digits.slice(1)
  }
  digits = digits.slice(0, 10)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}

/** Полный номер для заявки: +7 (701) 893-67-87 */
export function toFullPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length !== 10) return value.trim()
  return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
}

/** В поле хранится локальная часть без кода страны — значит, нужно ровно 10 цифр. */
export function isPhoneComplete(value: string) {
  return value.replace(/\D/g, '').length === 10
}

export function isValidName(value: string) {
  return value.trim().length >= 2
}
