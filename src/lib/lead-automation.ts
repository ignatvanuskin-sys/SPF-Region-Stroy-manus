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
  crmConnected?: boolean
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
      | { leadId?: string; crm?: { connected?: boolean }; error?: string }
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
      crmConnected: Boolean(data?.crm?.connected),
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

/** Маска казахстанского номера: +7 (701) 893-67-87 */
export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (!digits.startsWith('7')) digits = `7${digits}`
  digits = digits.slice(0, 11)

  const rest = digits.slice(1)
  let out = '+7'
  if (rest.length) out += ` (${rest.slice(0, 3)}`
  if (rest.length >= 3) out += ')'
  if (rest.length > 3) out += ` ${rest.slice(3, 6)}`
  if (rest.length > 6) out += `-${rest.slice(6, 8)}`
  if (rest.length > 8) out += `-${rest.slice(8, 10)}`
  return out
}

export function isPhoneComplete(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('7')
}

export function isValidName(value: string) {
  return value.trim().length >= 2
}
