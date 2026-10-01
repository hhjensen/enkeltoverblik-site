// Contact form endpoint for enkeltoverblik.dk.
//
// POST /api/kontakt (JSON) → mail to CONTACT_TO with Reply-To = sender, plus a
// receipt to the sender. Listens on 127.0.0.1 only; nginx proxies to it.
//
// Config (environment, see deploy/site-contact.env.example):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, CONTACT_TO
//   PORT (default 3100), DAILY_LIMIT (default 50), DRY_RUN=1 (log instead of send)
//
// Never logs message bodies, e-mail addresses or SMTP credentials.
import http from 'node:http'
import nodemailer from 'nodemailer'

const env = process.env
const PORT = Number(env.PORT || 3100)
const DRY_RUN = env.DRY_RUN === '1'
const DAILY_LIMIT = Number(env.DAILY_LIMIT || 50)
const PER_IP_LIMIT = 3
const PER_IP_WINDOW_MS = 60 * 60 * 1000
const MIN_FILL_MS = 3000
const MAX_BODY_BYTES = 16 * 1024

const required = DRY_RUN ? ['CONTACT_TO'] : ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'CONTACT_TO']
const missing = required.filter((k) => !env[k])
if (missing.length) {
  console.error(`contact: missing config ${missing.join(', ')}`)
  process.exit(1)
}

const transport = DRY_RUN
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: Number(env.SMTP_PORT || 587) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
const FROM = env.MAIL_FROM || 'Enkelt Overblik <besked@enkeltoverblik.dk>'

const FIELDS = {
  navn: { max: 100, required: true },
  email: { max: 200, required: true },
  faellesskab: { max: 150, required: true },
  husstande: { max: 20, required: false },
  besked: { max: 4000, required: true },
}
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i

const perIp = new Map() // ip -> timestamps
let day = ''
let sentToday = 0

/** Returns an error string or the cleaned fields. */
export function validate(input, now = Date.now()) {
  if (typeof input !== 'object' || input === null) return { error: 'Ugyldig forespørgsel.' }
  if (input.website) return { spam: true } // honeypot
  const started = Number(input.startet)
  if (!Number.isFinite(started) || now - started < MIN_FILL_MS) return { spam: true }
  const out = {}
  for (const [key, rule] of Object.entries(FIELDS)) {
    const raw = input[key]
    const v = typeof raw === 'string' ? raw.replace(/\r\n?/g, '\n').trim() : ''
    if (rule.required && !v) return { error: 'Udfyld venligst alle felter markeret med *.' }
    if (v.length > rule.max) return { error: 'En af teksterne er for lang.' }
    // Header-bearing fields must be single line.
    if (key !== 'besked' && /\n/.test(v)) return { error: 'Ugyldig forespørgsel.' }
    out[key] = v
  }
  if (!EMAIL_RE.test(out.email)) return { error: 'E-mailadressen ser ikke rigtig ud.' }
  return { fields: out }
}

export function allow(ip, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10)
  if (today !== day) {
    day = today
    sentToday = 0
  }
  if (sentToday >= DAILY_LIMIT) return false
  const recent = (perIp.get(ip) || []).filter((t) => now - t < PER_IP_WINDOW_MS)
  if (recent.length >= PER_IP_LIMIT) {
    perIp.set(ip, recent)
    return false
  }
  recent.push(now)
  perIp.set(ip, recent)
  sentToday++
  return true
}

function summary(f) {
  return [
    `Navn: ${f.navn}`,
    `E-mail: ${f.email}`,
    `Fællesskab/forening: ${f.faellesskab}`,
    `Antal husstande: ${f.husstande || '—'}`,
    '',
    f.besked,
  ].join('\n')
}

async function send(f) {
  await transport.sendMail({
    from: FROM,
    to: env.CONTACT_TO,
    replyTo: { name: f.navn, address: f.email },
    subject: `Henvendelse fra ${f.faellesskab} via enkeltoverblik.dk`,
    text: `Ny henvendelse fra kontaktformularen på enkeltoverblik.dk.\nSvar på denne mail for at skrive direkte til afsenderen.\n\n${summary(f)}\n`,
  })
  await transport.sendMail({
    from: FROM,
    to: { name: f.navn, address: f.email },
    subject: 'Tak for din henvendelse til Enkelt Overblik',
    text:
      `Hej ${f.navn}\n\nTak for din henvendelse. Vi vender tilbage hurtigst muligt.\n\n` +
      `Her er en kopi af det, du sendte:\n\n${summary(f)}\n\n` +
      `Med venlig hilsen\nEnkelt Overblik\n\n` +
      `Du modtager denne mail, fordi din adresse blev skrevet i kontaktformularen på enkeltoverblik.dk. ` +
      `Har du ikke selv skrevet til os, kan du se bort fra den.\n`,
  })
}

function reply(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

export const server = http.createServer((req, res) => {
  if (req.url !== '/api/kontakt') return reply(res, 404, { ok: false })
  if (req.method !== 'POST') return reply(res, 405, { ok: false })
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return reply(res, 415, { ok: false })

  let size = 0
  const chunks = []
  req.on('data', (c) => {
    size += c.length
    if (size > MAX_BODY_BYTES) {
      reply(res, 413, { ok: false, error: 'Beskeden er for lang.' })
      req.destroy()
    } else chunks.push(c)
  })
  req.on('end', async () => {
    if (res.writableEnded) return
    let input
    try {
      input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      return reply(res, 400, { ok: false, error: 'Ugyldig forespørgsel.' })
    }
    const v = validate(input)
    // Spam gets a normal-looking success so bots learn nothing.
    if (v.spam) return reply(res, 200, { ok: true })
    if (v.error) return reply(res, 400, { ok: false, error: v.error })

    // nginx sets X-Real-IP; we only listen on loopback so it cannot be spoofed from outside.
    const ip = String(req.headers['x-real-ip'] || req.socket.remoteAddress || '')
    if (!allow(ip)) {
      return reply(res, 429, { ok: false, error: 'Der er sendt mange henvendelser. Prøv igen senere, eller skriv direkte på mail.' })
    }
    try {
      await send(v.fields)
      console.log(`contact: sent (today ${sentToday}/${DAILY_LIMIT})`)
      reply(res, 200, { ok: true })
    } catch (e) {
      console.error(`contact: send failed: ${e && e.code ? e.code : 'error'}`)
      reply(res, 502, { ok: false, error: 'Beskeden kunne ikke sendes lige nu. Prøv igen senere, eller skriv direkte på mail.' })
    }
  })
})

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(PORT, '127.0.0.1', () => console.log(`contact: listening on 127.0.0.1:${PORT}${DRY_RUN ? ' (dry run)' : ''}`))
}
