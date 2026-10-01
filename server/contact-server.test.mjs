import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.DRY_RUN = '1'
process.env.CONTACT_TO = 'test@example.com'
process.env.DAILY_LIMIT = '5'
const { validate, server } = await import('./contact-server.mjs')

const good = (over = {}) => ({
  navn: 'Anne Hansen',
  email: 'anne@example.dk',
  faellesskab: 'Grundejerforeningen Solbakken',
  husstande: '42',
  besked: 'Vi vil gerne høre mere.\nHvad koster det?',
  website: '',
  startet: Date.now() - 10_000,
  ...over,
})

test('accepts a normal submission', () => {
  assert.ok(validate(good()).fields)
})
test('honeypot and too-fast fill are treated as spam', () => {
  assert.equal(validate(good({ website: 'http://x' })).spam, true)
  assert.equal(validate(good({ startet: Date.now() })).spam, true)
  assert.equal(validate(good({ startet: undefined })).spam, true)
})
test('required fields, length and e-mail format', () => {
  assert.match(validate(good({ navn: '  ' })).error, /felter/)
  assert.match(validate(good({ besked: 'x'.repeat(4001) })).error, /lang/)
  assert.match(validate(good({ email: 'ikke-en-mail' })).error, /E-mail/)
  assert.match(validate(good({ email: 'a@b.dk, c@d.dk' })).error, /E-mail/)
})
test('header injection via newline in single-line fields is rejected', () => {
  assert.ok(validate(good({ navn: 'Anne\nBcc: x@y.dk' })).error)
  assert.ok(validate(good({ email: 'anne@example.dk\nBcc: x@y.dk' })).error)
})

async function post(body, ip = '1.1.1.1', type = 'application/json') {
  await new Promise((r) => (server.listening ? r() : server.listen(0, '127.0.0.1', r)))
  const { port } = server.address()
  const res = await fetch(`http://127.0.0.1:${port}/api/kontakt`, {
    method: 'POST',
    headers: { 'Content-Type': type, 'X-Real-IP': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return { status: res.status, json: await res.json() }
}

test('HTTP: success, bad input, wrong type, per-IP and daily limits', async () => {
  assert.equal((await post(good())).status, 200)
  assert.equal((await post(good({ email: 'x' }))).status, 400)
  assert.equal((await post('nope')).status, 400)
  assert.equal((await post(good(), '9.9.9.9', 'text/plain')).status, 415)
  // per IP: 3 per hour (1 already used above from 1.1.1.1)
  assert.equal((await post(good())).status, 200)
  assert.equal((await post(good())).status, 200)
  assert.equal((await post(good())).status, 429)
  // daily limit 5: two more from other IPs reach it
  assert.equal((await post(good(), '2.2.2.2')).status, 200)
  assert.equal((await post(good(), '3.3.3.3')).status, 200)
  assert.equal((await post(good(), '4.4.4.4')).status, 429)
  // spam never counts and still looks like success
  assert.equal((await post(good({ website: 'x' }), '5.5.5.5')).status, 200)
  server.close()
})
