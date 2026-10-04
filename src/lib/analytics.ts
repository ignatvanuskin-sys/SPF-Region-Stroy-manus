/**
 * Отслеживание событий без привязки к конкретному сервису.
 *
 * Пока счётчик не настроен (нет VITE_ANALYTICS_ENDPOINT), функции работают как «пустышка»:
 * ничего не отправляют и не ломают сайт. Когда владелец выберет аналитику
 * (Яндекс.Метрика через собственный прокси, Plausible, Umami, GA4 collector и т.п.) —
 * достаточно задать переменные окружения при сборке.
 *
 * Персональные данные в события не попадают: только имена событий и обезличенные параметры.
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'cta_click'
  | 'whatsapp_click'
  | 'phone_click'
  | 'instagram_click'
  | 'map_click'
  | 'gallery_open'
  | 'calculator_started'
  | 'calculator_completed'
  | 'lead_submitted'
  | 'lead_failed'
  | 'form_step'

const endpoint = (import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined)?.trim()
const isDev = Boolean(import.meta.env.DEV)

export const analyticsEnabled = Boolean(endpoint)

type EventPayload = Record<string, string | number | boolean>

export function track(event: AnalyticsEvent, payload: EventPayload = {}) {
  if (isDev) console.debug('[analytics]', event, payload)
  if (!endpoint) return

  const body = JSON.stringify({ event, ...payload, ts: Date.now() })

  try {
    // sendBeacon не блокирует переход по ссылке — важно для клиентов WhatsApp и tel.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch(endpoint, {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    // Аналитика никогда не должна влиять на отправку заявки.
  }
}
