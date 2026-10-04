import { createServer } from 'node:http'
import { appendFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT || 3000)
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || ''
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '77018936787'
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || '').trim()
const DATA_DIR = resolve(process.cwd(), 'server', 'data')
const UPLOAD_DIR = resolve(DATA_DIR, 'uploads')
const STATIC_DIR = resolve(process.cwd(), 'dist')
const MAX_BODY_BYTES = 12 * 1024 * 1024
const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5

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

// Базовые заголовки безопасности. CORS по умолчанию выключен: фронтенд и API живут на одном домене.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

const originHeaders = () => (ALLOWED_ORIGIN ? { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' } : {})

const json = (response, status, body) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...SECURITY_HEADERS,
    ...originHeaders(),
  })
  response.end(JSON.stringify(body))
}

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode })

/** Безопасный decodeURIComponent: некорректный percent-encoding не должен ронять процесс. */
const safeDecode = (value) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

const requestOrigin = (request) => {
  const host = request.headers['x-forwarded-host'] || request.headers.host || `localhost:${PORT}`
  const proto = request.headers['x-forwarded-proto'] || 'http'
  return { host: String(host), url: `${proto}://${host}` }
}

/**
 * Читает тело запроса. Если лимит превышен, поток дочитывается до конца
 * (чтобы не рвать keep-alive соединение), но данные не буферизуются.
 */
const readRawBody = async (request, limit) => {
  const chunks = []
  let size = 0
  let tooLarge = false

  for await (const chunk of request) {
    size += chunk.length
    if (size > limit) {
      tooLarge = true
      chunks.length = 0
      continue
    }
    chunks.push(chunk)
  }

  if (tooLarge) throw httpError('Payload is too large', 413)
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
    name: String(input.name || '').trim().slice(0, 120),
    phone: String(input.phone || '').trim().slice(0, 32),
    service: String(input.service || input.interest || '').trim().slice(0, 80),
    objectType: String(input.objectType || '').trim().slice(0, 40),
    address: String(input.address || '').trim().slice(0, 200),
    openings: String(input.openings || '').trim().slice(0, 12),
    preferredDate: String(input.preferredDate || '').trim().slice(0, 32),
    preferredTime: String(input.preferredTime || '').trim().slice(0, 32),
    priorities: Array.isArray(input.priorities) ? input.priorities.slice(0, 8).map((item) => String(item).slice(0, 40)) : [],
    comment: String(input.comment || '').trim().slice(0, 1500),
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

const sendFile = async (response, filePath, status = 200) => {
  const content = await readFile(filePath)
  const immutable = filePath.includes('assets')
  response.writeHead(status, {
    'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    ...SECURITY_HEADERS,
  })
  response.end(content)
}

const serveNotFound = async (response) => {
  try {
    const page = resolve(STATIC_DIR, '404.html')
    const pageInfo = await stat(page)
    if (pageInfo.isFile()) return sendFile(response, page, 404)
  } catch {
    // Если своей страницы нет — отдаём короткий текстовый ответ.
  }
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS })
  response.end('Страница не найдена')
}

const serveStatic = async (request, response) => {
  const pathname = new URL(request.url || '/', 'http://localhost').pathname
  const decoded = safeDecode(pathname)
  if (decoded === null) return json(response, 400, { ok: false, error: 'Malformed URL' })

  const requestedPath = decoded === '/' ? '/index.html' : decoded
  const filePath = resolve(STATIC_DIR, `.${requestedPath}`)
  const fileRelativePath = relative(STATIC_DIR, filePath)

  if (fileRelativePath.startsWith('..') || fileRelativePath.includes('..\\') || fileRelativePath.includes('../')) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS })
    response.end('Forbidden')
    return
  }

  try {
    const fileInfo = await stat(filePath)
    if (fileInfo.isFile()) return sendFile(response, filePath)
  } catch {
    // Файла нет — отдаём страницу 404 со статусом 404 (не soft-404).
  }

  return serveNotFound(response)
}

// Клиентских маршрутов у сайта нет, поэтому sitemap и robots собираются из адреса деплоя.
const serveRobots = (request, response) => {
  const { url } = requestOrigin(request)
  response.writeHead(200, { 'Content-Type': MIME_TYPES['.txt'], 'Cache-Control': 'no-cache', ...SECURITY_HEADERS })
  response.end(`User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`)
}

const serveSitemap = (request, response) => {
  const { url } = requestOrigin(request)
  response.writeHead(200, { 'Content-Type': MIME_TYPES['.xml'], 'Cache-Control': 'no-cache', ...SECURITY_HEADERS })
  response.end(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${url}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
  )
}

const rateLimitLog = new Map()
const clientIp = (request) =>
  String(request.headers['x-forwarded-for'] || '').split(',')[0].trim() || request.socket.remoteAddress || 'unknown'

const isRateLimited = (request) => {
  const ip = clientIp(request)
  const now = Date.now()
  const recent = (rateLimitLog.get(ip) ?? []).filter((stamp) => now - stamp < RATE_LIMIT_WINDOW_MS)
  recent.push(now)
  rateLimitLog.set(ip, recent)
  if (rateLimitLog.size > 5000) rateLimitLog.clear()
  return recent.length > RATE_LIMIT_MAX
}

const handleLead = async (request, response) => {
  const origin = request.headers.origin
  if (origin) {
    let originHost = ''
    try {
      originHost = new URL(origin).host
    } catch {
      throw httpError('Invalid Origin header', 403)
    }
    if (originHost !== requestOrigin(request).host) throw httpError('Cross-origin request rejected', 403)
  }

  if (isRateLimited(request)) throw httpError('Too many requests', 429)

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
    if (typeof fields.payload === 'string') {
      try {
        fields = JSON.parse(fields.payload)
      } catch {
        throw httpError('Invalid JSON payload', 400)
      }
    }
  } else {
    try {
      fields = JSON.parse(body.toString('utf8') || '{}')
    } catch {
      throw httpError('Invalid JSON payload', 400)
    }
  }

  // Honeypot: скрытое поле заполняют только боты. Отвечаем успехом, но заявку не сохраняем.
  if (typeof fields.company === 'string' && fields.company.trim()) {
    console.warn('[lead] honeypot сработал: заявка отброшена')
    return json(response, 201, { ok: true, leadId: randomUUID(), crm: { connected: false, status: 'dropped' }, photo: null })
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
    console.warn(`[lead ${lead.id}] не передан в CRM (${crm.status}). Сохранён в server/data/leads.ndjson.`)
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
  try {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname

    if (request.method === 'OPTIONS') return json(response, 204, {})

    if (pathname === '/api/health') {
      if (request.method !== 'GET') return json(response, 405, { ok: false, error: 'Method not allowed' })
      return json(response, 200, {
        ok: true,
        crmConfigured: Boolean(CRM_WEBHOOK_URL),
        whatsappConfigured: Boolean(WHATSAPP_PHONE),
        rateLimit: `${RATE_LIMIT_MAX}/${RATE_LIMIT_WINDOW_MS / 60000}min`,
      })
    }

    if (pathname === '/api/leads') {
      if (request.method !== 'POST') return json(response, 405, { ok: false, error: 'Method not allowed' })
      return await handleLead(request, response)
    }

    if (request.method === 'GET' && pathname === '/robots.txt') return serveRobots(request, response)
    if (request.method === 'GET' && pathname === '/sitemap.xml') return serveSitemap(request, response)
    if (request.method === 'GET') return await serveStatic(request, response)

    return json(response, 404, { ok: false, error: 'Not found' })
  } catch (error) {
    // Один плохой запрос не должен ронять сервер.
    const status = error?.statusCode ?? 500
    console.error(`[server] ${request.method} ${request.url} -> ${status}: ${error?.message}`)
    if (response.headersSent) return response.destroy()
    return json(response, status, { ok: false, error: status === 500 ? 'Server error' : error?.message })
  }
})

server.listen(PORT, '0.0.0.0', () => console.log(`SPF lead API and website listening on http://localhost:${PORT}`))
