import { createServer } from 'node:http'
import { mkdir, appendFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT || 8787)
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || ''
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '77018936787'
const DATA_DIR = resolve(process.cwd(), 'server', 'data')

const json = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS, GET' })
  response.end(JSON.stringify(body))
}

const readBody = async (request) => {
  let raw = ''
  for await (const chunk of request) raw += chunk
  if (raw.length > 1_000_000) throw new Error('Payload is too large')
  return JSON.parse(raw || '{}')
}

const normalizeLead = (input) => {
  const lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    source: 'spf-region-site',
    name: String(input.name || '').trim(),
    phone: String(input.phone || '').trim(),
    interest: String(input.interest || '').trim(),
    address: String(input.address || '').trim(),
    preferredDate: String(input.preferredDate || '').trim(),
    preferredTime: String(input.preferredTime || '').trim(),
    comment: String(input.comment || '').trim(),
    photoName: String(input.photoName || '').trim(),
    reminderDueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  }
  if (!lead.name || !lead.phone || !lead.interest || !lead.address) throw new Error('name, phone, interest and address are required')
  return lead
}

const makeWhatsAppUrl = (lead) => {
  const message = [`Здравствуйте! Запрос с сайта СПФ Регион Строй.`, `Имя: ${lead.name}`, `Телефон: ${lead.phone}`, `Интересует: ${lead.interest}`, `Адрес: ${lead.address}`, lead.preferredDate && `Дата: ${lead.preferredDate}`, lead.preferredTime && `Слот: ${lead.preferredTime}`, lead.comment && `Комментарий: ${lead.comment}`, lead.photoName && `Фото: ${lead.photoName}`].filter(Boolean).join('\n')
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

const sendToCrm = async (lead) => {
  if (!CRM_WEBHOOK_URL) return { connected: false, status: 'CRM_WEBHOOK_URL is not configured' }
  const response = await fetch(CRM_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(process.env.CRM_API_TOKEN ? { Authorization: `Bearer ${process.env.CRM_API_TOKEN}` } : {}) }, body: JSON.stringify({ ...lead, tags: ['website', 'request-measurement'], managerReminderAt: lead.reminderDueAt }) })
  return { connected: response.ok, status: `CRM responded with ${response.status}` }
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return json(response, 204, {})
  if (request.method === 'GET' && request.url === '/api/health') return json(response, 200, { ok: true, crmConfigured: Boolean(CRM_WEBHOOK_URL), whatsappConfigured: Boolean(WHATSAPP_PHONE) })
  if (request.method !== 'POST' || request.url !== '/api/leads') return json(response, 404, { error: 'Not found' })

  try {
    const lead = normalizeLead(await readBody(request))
    await mkdir(DATA_DIR, { recursive: true })
    await appendFile(resolve(DATA_DIR, 'leads.ndjson'), `${JSON.stringify(lead)}\n`, 'utf8')
    let crm = { connected: false, status: 'not attempted' }
    try { crm = await sendToCrm(lead) } catch (error) { crm = { connected: false, status: error.message } }
    return json(response, 201, { ok: true, leadId: lead.id, crm, reminder: { scheduledFor: lead.reminderDueAt, status: 'handoff-ready' }, whatsappUrl: makeWhatsAppUrl(lead) })
  } catch (error) {
    return json(response, 400, { ok: false, error: error.message })
  }
})

server.listen(PORT, () => console.log(`SPF lead API listening on http://localhost:${PORT}`))
