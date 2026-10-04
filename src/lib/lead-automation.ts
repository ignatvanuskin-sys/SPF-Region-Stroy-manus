export type LeadInterest = 'Окна' | 'Двери' | 'Фасадные витражи' | 'Перегородки'

export type LeadDraft = {
  id: string
  createdAt: string
  name: string
  phone: string
  interest: LeadInterest
  address: string
  preferredDate: string
  preferredTime: string
  comment: string
  photoName?: string
  source: 'website-order-flow'
  reminder: {
    enabled: boolean
    dueAt: string
  }
}

export const CRM_ENDPOINT = '/api/leads'

export function createLeadDraft(input: Omit<LeadDraft, 'id' | 'createdAt' | 'source' | 'reminder'>): LeadDraft {
  const now = new Date()
  const reminderAt = new Date(now.getTime() + 15 * 60 * 1000)

  return {
    ...input,
    id: `spf-${now.getTime()}`,
    createdAt: now.toISOString(),
    source: 'website-order-flow',
    reminder: { enabled: true, dueAt: reminderAt.toISOString() },
  }
}

export function saveLeadDraft(lead: LeadDraft) {
  const existing = JSON.parse(localStorage.getItem('spf-lead-outbox') ?? '[]') as LeadDraft[]
  localStorage.setItem('spf-lead-outbox', JSON.stringify([lead, ...existing].slice(0, 25)))
}

export function buildWhatsAppUrl(lead: LeadDraft) {
  const text = [
    'Здравствуйте! Хочу записаться на замер.',
    `Интересует: ${lead.interest}.`,
    lead.address ? `Адрес: ${lead.address}.` : '',
    lead.preferredDate ? `Желаемая дата: ${lead.preferredDate}.` : '',
    lead.preferredTime ? `Время: ${lead.preferredTime}.` : '',
    lead.comment ? `Комментарий: ${lead.comment}.` : '',
    lead.photoName ? `Фото приложу отдельно: ${lead.photoName}.` : '',
  ].filter(Boolean).join('\n')

  return `https://wa.me/77018936787?text=${encodeURIComponent(text)}`
}

export async function trySendToCrm(lead: LeadDraft) {
  try {
    const response = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    })
    return response.ok
  } catch {
    return false
  }
}
