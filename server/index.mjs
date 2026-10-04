import { createServer } from 'node:http'
import { appendFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT || 3000)
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || ''
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '77018936787'
const DATA_DIR = resolve(process.cwd(), 'server', 'data')
const UPLOAD_DIR = resolve(DATA_DIR, 'uploads')
const STATIC_DIR = resolve(process.cwd(), 'dist')
const MAX_BODY_BYTES = 12 * 1024 * 1024
const MAX_PHOTO_BYTES = 10 * 1024 * 1024

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.xml': 'application/xml; charset=utf-8',
}

const json = (response, status, body) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(body))
}

const httpError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode })

const readRawBody = async (request, limit) => {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > limit) throw httpError('Payload is too large', 413)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/** Минимальный разбор multipart/form-data: текстовые поля + один файл фотографии. */
const parseMultipart = (body, boundary) => {
  const fields = {}
  const files = []
  const separator = Buffer.from(`--${boundary}`)

  let position = body.indexOf(separator)
  while (position !== -1) {
    let cursor = position + separator.length
    if (body.slice(cursor, cursor + 2).toString() === '--') break
    if (body.slice(cursor, cursor + 2).toString() === '\r\n') cursor += 2

    const headerEnd = body.indexOf('\r\n\r\n', cursor)
    if (headerEnd === -1) break

    const headerText = body.slice(cursor, headerEnd).toString('utf8')
    const contentStart = headerEnd + 4
    const nextSeparator = body.indexOf(separator, contentStart)
    if (nextSeparator === -1) break

    let contentEnd = nextSeparator
    if (body.slice(contentEnd - 2, contentEnd).toString() === '\r\n') contentEnd -= 2
    const content = body.slice(contentStart, contentEnd)

    const nameMatch = /name="([^"]*)"/i.exec(headerText)
    const fileMatch = /filename="([^"]*)"/i.exec(headerText)
    const typeMatch = /Content-Type:\s*([^\r\n]+)/i.exec(headerText)

    if (fileMatch && nameMatch) {
      files.push({
        field: nameMatch[1],
        name: fileMatch[1],
        type: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
        content,
      })
    } else if (nameMatch) {
      fields[nameMatch[1]] = content.toString('utf8')
    }

    position = nextSeparator
  }

  return { fields, files }
}

const normalizeLead = (input) => {
  const lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    source: 'spf-region-site',
    name: String(input.name || '').trim(),
    phone: String(input.phone || '').trim(),
    service: String(input.service || input.interest || '').trim(),
    objectType: String(input.objectType || '').trim(),
    address: String(input.address || '').trim(),
    openings: String(input.openings || '').trim(),
    preferredDate: String(input.preferredDate || '').trim(),
    preferredTime: String(input.preferredTime || '').trim(),
    priorities: Array.isArray(input.priorities) ? input.priorities.map(String) : [],
    comment: String(input.comment || '').trim(),
    consent: Boolean(input.consent),
    reminderDueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  }

  if (!lead.name || !lead.phone) throw httpError('name and phone are required', 400)
  if (!lead.address) throw httpError('address is required', 400)
  if (!lead.consent) throw httpError('consent is required', 400)
  return lead
}

const sanitizeFileName = (name) => {
  const cleaned = name.replace(/[^\w.-]+/g, '_').slice(-80)
  return cleaned || 'photo'
}

const storePhoto = async (leadId, file) => {
  if (!file) return null
  if (file.content.length > MAX_PHOTO_BYTES) throw httpError('Photo is too large', 413)
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw httpError('Only JPG and PNG photos are supported', 415)
  }

  await mkdir(UPLOAD_DIR, { recursive: true })
  const storedAs = `${leadId}-${sanitizeFileName(file.name)}`
  await writeFile(resolve(UPLOAD_DIR, storedAs), file.content)
  return { field: file.field, name: file.name, type: file.type, size: file.content.length, storedAs }
}

const makeWhatsAppUrl = (lead) => {
  const message = [
    'Здравствуйте! Запрос с сайта СПФ Регион Строй.',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.service && `Интересует: ${lead.service}`,
    lead.objectType && `Объект: ${lead.objectType}`,
    `Адрес: ${lead.address}`,
    lead.openings && `Проёмов: ${lead.openings}`,
    lead.priorities.length && `Важно: ${lead.priorities.join(', ')}`,
    lead.preferredDate && `Дата: ${lead.preferredDate}`,
    lead.preferredTime && `Время: ${lead.preferredTime}`,
    lead.comment && `Комментарий: ${lead.comment}`,
    lead.photo ? `Фото: ${lead.photo.name}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

const sendToCrm = async (lead) => {
  if (!CRM_WEBHOOK_URL) return { connected: false, status: 'CRM_WEBHOOK_URL is not configured' }
  const response = await fetch(CRM_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.CRM_API_TOKEN ? { Authorization: `Bearer ${process.env.CRM_API_TOKEN}` } : {}),
    },
    body: JSON.stringify({
      ...lead,
      tags: ['website', 'request-measurement'],
      managerReminderAt: lead.reminderDueAt,
    }),
  })
  return { connected: response.ok, status: `CRM responded with ${response.status}` }
}

const sendFile = async (response, filePath) => {
  const content = await readFile(filePath)
  const immutable = filePath.includes('assets')
  response.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  response.end(content)
}

const serveStatic = async (request, response) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const filePath = resolve(STATIC_DIR, `.${decodeURIComponent(requestedPath)}`)
  const fileRelativePath = relative(STATIC_DIR, filePath)

  if (fileRelativePath.startsWith('..') || fileRelativePath.includes('..\\') || fileRelativePath.includes('../')) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  try {
    const fileInfo = await stat(filePath)
    if (fileInfo.isFile()) return sendFile(response, filePath)
  } catch {
    // Дальше отдаём SPA-entrypoint для клиентских маршрутов.
  }

  if (!extname(pathname)) return sendFile(response, resolve(STATIC_DIR, 'index.html'))
  response.writeHead(404)
  response.end('Not found')
}

const handleLead = async (request, response) => {
  const contentType = request.headers['content-type'] || ''
  const body = await readRawBody(request, MAX_BODY_BYTES)

  let fields = {}
  let photoFile = null

  if (contentType.startsWith('multipart/form-data')) {
    const boundary = /boundary="?([^";]+)"?/.exec(contentType)?.[1]
    if (!boundary) throw httpError('Invalid multipart boundary', 400)
    const parsed = parseMultipart(body, boundary)
    fields = parsed.fields
    photoFile = parsed.files.find((file) => file.field === 'photo' && file.content.length > 0) ?? null
    if (typeof fields.payload === 'string') fields = JSON.parse(fields.payload)
  } else {
    fields = JSON.parse(body.toString('utf8') || '{}')
  }

  const lead = normalizeLead(fields)
  const photo = await storePhoto(lead.id, photoFile)
  if (photo) lead.photo = photo

  await mkdir(DATA_DIR, { recursive: true })
  await appendFile(resolve(DATA_DIR, 'leads.ndjson'), `${JSON.stringify(lead)}\n`, 'utf8')

  let crm = { connected: false, status: 'not attempted' }
  try {
    crm = await sendToCrm(lead)
  } catch (error) {
    crm = { connected: false, status: error.message }
  }

  if (!crm.connected) {
    console.warn(
      `[lead ${lead.id}] не передан в CRM (${crm.status}). Сохранён в server/data/leads.ndjson.`,
    )
  }

  return json(response, 201, {
    ok: true,
    leadId: lead.id,
    crm,
    photo: photo ? { name: photo.name, size: photo.size } : null,
    whatsappUrl: makeWhatsAppUrl(lead),
  })
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname

  if (request.method === 'OPTIONS') return json(response, 204, {})
  if (request.method === 'GET' && pathname === '/api/health') {
    return json(response, 200, {
      ok: true,
      crmConfigured: Boolean(CRM_WEBHOOK_URL),
      whatsappConfigured: Boolean(WHATSAPP_PHONE),
    })
  }

  if (request.method === 'POST' && pathname === '/api/leads') {
    try {
      return await handleLead(request, response)
    } catch (error) {
      const status = error?.statusCode ?? 400
      console.error(`[lead] ${status}: ${error?.message}`)
      return json(response, status, { ok: false, error: error?.message ?? 'Unexpected error' })
    }
  }

  if (request.method === 'GET') return serveStatic(request, response)
  return json(response, 404, { error: 'Not found' })
})

server.listen(PORT, '0.0.0.0', () =>
  console.log(`SPF lead API and website listening on http://localhost:${PORT}`),
)
