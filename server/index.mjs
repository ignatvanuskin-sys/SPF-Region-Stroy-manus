import { createServer } from 'node:http'
import { appendFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT || 3000)
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '77018936787'
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || '').trim()

// Каналы доставки заявки. Ничего не выдумываем: если переменной нет — канал выключен.
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || ''
const CRM_API_TOKEN = process.env.CRM_API_TOKEN || ''
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

// Хранилище заявок. LEADS_DIR задаётся на постоянном диске (Railway Volume).
const LEADS_DIR = process.env.LEADS_DIR ? resolve(process.env.LEADS_DIR) : resolve(process.cwd(), 'server', 'data')
const UPLOAD_DIR = resolve(LEADS_DIR, 'uploads')
const LEADS_FILE = resolve(LEADS_DIR, 'leads.ndjson')
// Если путь задан явно, считаем его постоянным: именно так подключается volume.
const STORAGE_PERSISTENT = Boolean(process.env.LEADS_DIR)

const STATIC_DIR = resolve(process.cwd(), 'dist')
const MAX_BODY_BYTES = 12 * 1024 * 1024
const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const DELIVERY_TIMEOUT_MS = 8000
const DELIVERY_ATTEMPTS = 3

const APP_VERSION = (process.env.RAILWAY_GIT_COMMIT_SHA || process.env.APP_VERSION || 'local').slice(0, 7)

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

// Базовые заголовки безопасности. CORS по умолчанию выключен: фронтенд и API на одном домене.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

const originHeaders = () =>
  ALLOWED_ORIGIN
    ? {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        Vary: 'Origin',
      }
    : {}

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

/** Секреты не должны попадать в логи и в ответы API. */
const sanitizeStatus = (value) =>
  String(value ?? '')
    .replace(/bot\d+:[\w-]+/g, 'bot***')
    .replace(/(token|key|secret|authorization)=[^\s&]+/gi, '$1=***')
    .slice(0, 200)

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
    pageUrl: String(input.pageUrl || '').trim().slice(0, 300),
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
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw httpError('Only JPG, PNG and WebP photos are supported', 415)
  }

  await mkdir(UPLOAD_DIR, { recursive: true })
  const storedAs = `${leadId}-${sanitizeFileName(file.name)}`
  await writeFile(resolve(UPLOAD_DIR, storedAs), file.content)
  return { field: file.field, name: file.name, type: file.type, size: file.content.length, storedAs }
}

/** Сообщение менеджеру — используется и для Telegram, и как текст WhatsApp-ссылки. */
const buildManagerMessage = (lead) =>
  [
    'Новая заявка с сайта СПФ Регион Строй',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.service && `Интересует: ${lead.service}`,
    lead.objectType && `Объект: ${lead.objectType}`,
    `Адрес: ${lead.address}`,
    lead.openings && `Проёмов: ${lead.openings}`,
    lead.priorities.length && `Важно: ${lead.priorities.join(', ')}`,
    lead.preferredDate && `Желаемая дата: ${lead.preferredDate}`,
    lead.preferredTime && `Время: ${lead.preferredTime}`,
    lead.comment && `Комментарий: ${lead.comment}`,
    lead.photo ? `Фото: ${lead.photo.name}` : '',
  ]
    .filter(Boolean)
    .join('\n')

const makeWhatsAppUrl = (lead) => `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(buildManagerMessage(lead))}`

const postJson = async (url, payload, extraHeaders = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    return { ok: response.ok, status: `HTTP ${response.status}` }
  } finally {
    clearTimeout(timer)
  }
}

/** Отправка с таймаутом и повторами. PII в логи не пишем — только имя канала и статус. */
const deliver = async (channel, send, attempts = DELIVERY_ATTEMPTS) => {
  let last = { ok: false, status: 'not attempted' }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      last = await send()
      if (last.ok) return { channel, delivered: true, status: last.status, attempts: attempt }
    } catch (error) {
      last = { ok: false, status: error?.name === 'AbortError' ? 'timeout' : sanitizeStatus(error?.message) }
    }
    if (attempt < attempts) await new Promise((resolveLater) => setTimeout(resolveLater, 400 * attempt))
  }

  return { channel, delivered: false, status: last.status, attempts }
}

const crmPayload = (lead) => ({
  ...lead,
  tags: ['website', 'request-measurement'],
})

const runDelivery = async (lead) => {
  const channels = []

  if (CRM_WEBHOOK_URL) {
    channels.push(
      await deliver('crm', () =>
        postJson(CRM_WEBHOOK_URL, crmPayload(lead), CRM_API_TOKEN ? { Authorization: `Bearer ${CRM_API_TOKEN}` } : {}),
      ),
    )
  } else {
    channels.push({ channel: 'crm', delivered: false, status: 'not configured (CRM_WEBHOOK_URL is empty)', attempts: 0 })
  }

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    channels.push(
      await deliver('telegram', () =>
        postJson(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: TELEGRAM_CHAT_ID,
          text: buildManagerMessage(lead),
          disable_web_page_preview: true,
        }),
      ),
    )
  } else {
    channels.push({ channel: 'telegram', delivered: false, status: 'not configured', attempts: 0 })
  }

  return channels
}

const sendFile = async (response, filePath, status = 200, headOnly = false) => {
  const content = await readFile(filePath)
  const immutable =
    filePath.includes('assets') || filePath.includes('works') || filePath.includes('hero')
  response.writeHead(status, {
    'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Content-Length': content.length,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    ...SECURITY_HEADERS,
  })
  // HEAD должен вернуть те же заголовки, но без тела — иначе мониторинг и краулеры получают 404.
  response.end(headOnly ? undefined : content)
}

const serveNotFound = async (response, headOnly = false) => {
  try {
    const page = resolve(STATIC_DIR, '404.html')
    const pageInfo = await stat(page)
    if (pageInfo.isFile()) return sendFile(response, page, 404, headOnly)
  } catch {
    // Если своей страницы нет — отдаём короткий текстовый ответ.
  }
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS })
  response.end('Страница не найдена')
}

const serveStatic = async (request, response) => {
  const headOnly = request.method === 'HEAD'
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
    if (fileInfo.isFile()) return sendFile(response, filePath, 200, headOnly)
  } catch {
    // Файла нет — отдаём страницу 404 со статусом 404 (не soft-404).
  }

  return serveNotFound(response, headOnly)
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
    console.warn('[lead] honeypot triggered, submission dropped')
    return json(response, 201, { ok: true, outcome: 'dropped', leadId: randomUUID(), whatsappUrl: null })
  }

  const lead = normalizeLead(fields)
  const photo = await storePhoto(lead.id, photoFile)
  if (photo) lead.photo = photo

  // 1. Сначала пробуем сохранить. Если не сохранилось — честный отказ, а не «успех».
  let stored = false
  let storageError = ''
  try {
    await mkdir(LEADS_DIR, { recursive: true })
    await appendFile(LEADS_FILE, `${JSON.stringify(lead)}\n`, 'utf8')
    stored = true
  } catch (error) {
    storageError = sanitizeStatus(error?.message)
  }

  // 2. Затем доставляем в настроенные каналы.
  let channels = []
  try {
    channels = await runDelivery(lead)
  } catch (error) {
    channels = [{ channel: 'delivery', delivered: false, status: sanitizeStatus(error?.message), attempts: 0 }]
  }

  const delivered = channels.some((channel) => channel.delivered)

  if (!delivered && !stored) {
    console.error(`[lead ${lead.id}] not stored and not delivered: ${storageError}`)
    throw httpError('Could not accept the request', 503)
  }

  if (!delivered) {
    console.warn(`[lead ${lead.id}] stored locally only; no delivery channel configured`)
  }

  return json(response, 201, {
    ok: true,
    leadId: lead.id,
    outcome: delivered ? 'delivered' : 'stored',
    channels,
    storage: { saved: stored, persistent: STORAGE_PERSISTENT },
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
        version: APP_VERSION,
        uptimeSec: Math.round(process.uptime()),
        delivery: {
          crm: Boolean(CRM_WEBHOOK_URL),
          telegram: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
        },
        storage: { driver: 'ndjson', persistent: STORAGE_PERSISTENT },
        rateLimit: `${RATE_LIMIT_MAX}/${RATE_LIMIT_WINDOW_MS / 60000}min`,
        whatsappConfigured: Boolean(WHATSAPP_PHONE),
      })
    }

    if (pathname === '/api/leads') {
      if (request.method !== 'POST') return json(response, 405, { ok: false, error: 'Method not allowed' })
      return await handleLead(request, response)
    }

    const isRead = request.method === 'GET' || request.method === 'HEAD'
    if (isRead && pathname === '/robots.txt') return serveRobots(request, response)
    if (isRead && pathname === '/sitemap.xml') return serveSitemap(request, response)
    if (isRead) return await serveStatic(request, response)

    return json(response, 404, { ok: false, error: 'Not found' })
  } catch (error) {
    // Один плохой запрос не должен ронять сервер.
    const status = error?.statusCode ?? 500
    console.error(`[server] ${request.method} ${request.url} -> ${status}: ${sanitizeStatus(error?.message)}`)
    if (response.headersSent) return response.destroy()
    return json(response, status, { ok: false, error: status === 500 ? 'Server error' : error?.message })
  }
})

const start = async () => {
  try {
    await mkdir(LEADS_DIR, { recursive: true })
  } catch (error) {
    console.error(`[startup] не удалось создать каталог заявок: ${sanitizeStatus(error?.message)}`)
  }

  if (!STORAGE_PERSISTENT) {
    console.warn(
      '[startup] LEADS_DIR не задан: заявки пишутся в файл внутри контейнера и исчезнут при передеплое. ' +
        'Подключите постоянный диск и задайте LEADS_DIR.',
    )
  }
  if (!CRM_WEBHOOK_URL && !(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)) {
    console.warn(
      '[startup] ни один канал доставки не настроен (CRM_WEBHOOK_URL / TELEGRAM_BOT_TOKEN). ' +
        'Клиент увидит статус «заявка сохранена», а не «передана менеджеру».',
    )
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SPF Region site + lead API on http://0.0.0.0:${PORT} (version ${APP_VERSION})`)
  })
}

start()
