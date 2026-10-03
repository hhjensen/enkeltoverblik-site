import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { content, inline, type Showcase } from './content'
import './PlatformHome.css'

const { settings } = content

const DAYS = [
  { day: 'Man', date: '6. okt', dish: 'Kylling i karry med ris', veg: true, gf: true, count: 42 },
  { day: 'Tir', date: '7. okt', dish: 'Ikke mad denne dag', off: true },
  { day: 'Ons', date: '8. okt', dish: 'Lasagne med salat', veg: true, gf: false, count: 38 },
  { day: 'Tor', date: '9. okt', dish: 'Fiskefrikadeller & remoulade', veg: false, gf: true, count: 35 },
  { day: 'Fre', date: '10. okt', dish: 'Tacos med grønt', veg: true, gf: true, count: 40 },
] as const

/* ---------- Illustrated "screenshots" ---------- */

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="ph-browser" aria-hidden="true">
      <div className="ph-browser-bar">
        <span /><span /><span />
        <div className="ph-browser-url">{url}</div>
      </div>
      <div className="ph-browser-body">{children}</div>
    </div>
  )
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ph-phone" aria-hidden="true">
      <div className="ph-phone-notch" />
      <div className="ph-phone-body">{children}</div>
    </div>
  )
}

function MockAppHeader({ title = 'Uge 41' }: { title?: string }) {
  return (
    <div className="ph-m-header">
      <span className="ph-m-logo">🍲</span>
      <strong>{title}</strong>
      <span className="ph-m-chip">Deadline fre 18:00</span>
    </div>
  )
}

function WeekMenuMock() {
  return (
    <div className="ph-m">
      <MockAppHeader />
      <div className="ph-m-week">
        {DAYS.filter((d) => !('off' in d)).map((d) => (
          <div key={d.day} className={`ph-m-day${'off' in d ? ' is-off' : ''}`}>
            <div className="ph-m-day-head">
              <strong>{d.day}</strong> <span>{d.date}</span>
            </div>
            <p>{d.dish}</p>
            {'off' in d ? null : (
              <div className="ph-m-tags">
                {d.veg ? <span className="ph-tag ph-tag-green">Vegetar</span> : null}
                {d.gf ? <span className="ph-tag ph-tag-amber">Glutenfri</span> : null}
                <span className="ph-m-count">{d.count} spisende</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Stepper({ label, value }: { label: string; value: number }) {
  return (
    <div className="ph-m-stepper">
      <span>{label}</span>
      <div>
        <b>−</b>
        <output>{value}</output>
        <b>+</b>
      </div>
    </div>
  )
}

function SignupMock() {
  return (
    <div className="ph-m ph-m-phone">
      <div className="ph-m-header">
        <span className="ph-m-logo">🏡</span>
        <strong>Hus 12</strong>
        <span className="ph-m-chip ph-m-chip-ok">Logget ind</span>
      </div>
      <div className="ph-m-card">
        <div className="ph-m-day-head">
          <strong>Mandag</strong> <span>Kylling i karry</span>
        </div>
        <Stepper label="Voksne" value={2} />
        <Stepper label="Børn" value={1} />
        <Stepper label="Små børn" value={0} />
        <div className="ph-m-diet">
          <span className="ph-tag ph-tag-green">🌱 1 vegetar</span>
          <span className="ph-tag">+ kosthensyn</span>
        </div>
      </div>
      <div className="ph-m-card ph-m-card-muted">
        <div className="ph-m-day-head">
          <strong>Onsdag</strong> <span>Lasagne</span>
        </div>
        <Stepper label="Voksne" value={2} />
      </div>
      <div className="ph-m-save">Gemt ✓ Standard brugt på nye uger</div>
    </div>
  )
}

function MenuEditorMock() {
  return (
    <div className="ph-m">
      <MockAppHeader title="Madhold 3 · Uge 41" />
      <div className="ph-m-form">
        <label>Mandag · ret</label>
        <div className="ph-m-input">Kylling i karry med ris og mango-chutney</div>
        <div className="ph-m-row">
          <div className="ph-m-toggle is-on">Vegetar-mulighed <i /></div>
          <div className="ph-m-toggle is-on">Glutenfri <i /></div>
        </div>
        <label>Tirsdag</label>
        <div className="ph-m-row">
          <div className="ph-m-toggle is-on">Ikke mad denne dag <i /></div>
        </div>
        <label>Deadline for tilmelding</label>
        <div className="ph-m-row">
          <div className="ph-m-input ph-m-input-sm">Fre 3. okt</div>
          <div className="ph-m-input ph-m-input-sm">18:00</div>
        </div>
        <div className="ph-m-btn">Udgiv menu</div>
      </div>
    </div>
  )
}

function RawMaterialMock() {
  const rows = [
    ['Kyllingelår', '8 kg', 'Slagter', true],
    ['Basmatiris', '5 kg', 'Grossist', true],
    ['Kokosmælk', '12 ds', 'Grossist', false],
    ['Hakket oksekød', '6 kg', 'Slagter', false],
    ['Salat & grønt', '1 kasse', 'Gårdbutik', false],
  ] as const
  return (
    <div className="ph-m">
      <MockAppHeader title="Bestil varer · Uge 41" />
      <table className="ph-m-table">
        <thead>
          <tr><th>Vare</th><th>Mængde</th><th>Leverandør</th><th>Leveret</th></tr>
        </thead>
        <tbody>
          {rows.map(([name, qty, sup, done]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{qty}</td>
              <td><span className="ph-tag">{sup}</span></td>
              <td>{done ? <span className="ph-check">✓</span> : <span className="ph-box" />}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ph-m-row ph-m-row-end">
        <span className="ph-tag ph-tag-green">Klar til bestilling ✓</span>
        <div className="ph-m-btn ph-m-btn-sm">Send til bestiller</div>
      </div>
    </div>
  )
}

function KitchenMock() {
  return (
    <div className="ph-m">
      <MockAppHeader title="Køkkenoversigt" />
      <div className="ph-m-kitchen">
        {[
          ['Mandag', 42, 6, 3],
          ['Onsdag', 38, 5, 0],
          ['Torsdag', 35, 0, 4],
        ].map(([day, total, veg, gf]) => (
          <div key={day as string} className="ph-m-kcard">
            <strong>{day}</strong>
            <span className="ph-m-big">{total}</span>
            <small>spisende</small>
            <div className="ph-m-tags">
              <span className="ph-tag ph-tag-green">{veg} veg</span>
              <span className="ph-tag ph-tag-amber">{gf} gf</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ph-m-bars">
        {[['Voksne', 78], ['Børn', 17], ['Små børn', 5]].map(([l, p]) => (
          <div key={l as string} className="ph-m-bar">
            <span>{l}</span>
            <div><i style={{ width: `${p}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ThemesMock() {
  return (
    <div className="ph-themes" aria-hidden="true">
      <div className="ph-theme ph-theme-light">
        <b>Klassisk · lys</b>
        <i /><i /><i />
      </div>
      <div className="ph-theme ph-theme-dark">
        <b>Klassisk · mørk</b>
        <i /><i /><i />
      </div>
      <div className="ph-theme ph-theme-card">
        <b>Kartotek</b>
        <i /><i /><i />
      </div>
      <div className="ph-theme ph-theme-large">
        <b>Stor tekst</b>
        <i /><i />
      </div>
    </div>
  )
}

/* ---------- Portal mockups ---------- */

const PORTAL_NAV = ['Opslagstavle', 'Chat', 'Årshjul', 'Booking', 'Filer', 'Billeder', 'Huse & naboer', 'Madtilmelding']

function Avatar({ name, tone = 0 }: { name: string; tone?: number }) {
  return (
    <span className={`ph-av ph-av-${tone % 4}`}>
      {name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)}
    </span>
  )
}

function PortalShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="ph-portal">
      <aside className="ph-portal-side">
        <div className="ph-portal-brand">
          <span className="ph-brand-mark ph-brand-mark-sm">EO</span>
          <b>Solbakken</b>
        </div>
        {PORTAL_NAV.map((n) => (
          <span key={n} className={n === active ? 'is-active' : undefined}>
            {n}
          </span>
        ))}
      </aside>
      <div className="ph-portal-main">{children}</div>
    </div>
  )
}

function BoardMock() {
  return (
    <PortalShell active="Opslagstavle">
      <div className="ph-post ph-post-important">
        <div className="ph-post-head">
          <Avatar name="Bestyrelsen" tone={1} />
          <div>
            <b>Bestyrelsen</b>
            <small>i går · 📌 Fastgjort</small>
          </div>
          <span className="ph-tag ph-tag-amber">Vigtigt</span>
        </div>
        <strong>Fællesmøde torsdag kl. 19.30</strong>
        <p>Dagsorden ligger under Filer. Der er kaffe og kage i fælleshuset.</p>
        <div className="ph-post-foot">
          <span>👍 14</span>
          <span>❤️ 6</span>
          <span>💬 5 kommentarer</span>
        </div>
      </div>
      <div className="ph-post">
        <div className="ph-post-head">
          <Avatar name="Maja Holm" />
          <div>
            <b>Maja Holm</b>
            <small>2 t · Havegruppen</small>
          </div>
        </div>
        <p>
          Hvem vil hjælpe med at plante løg lørdag? <span className="ph-mention">@Peter</span> har
          spaden 🌷
        </p>
        <div className="ph-post-img" />
        <div className="ph-post-foot">
          <span>🌷 9</span>
          <span>💬 3</span>
        </div>
      </div>
    </PortalShell>
  )
}

function ChatMock() {
  return (
    <div className="ph-m ph-m-phone">
      <div className="ph-m-header">
        <span className="ph-m-logo">💬</span>
        <strong>Legepladsudvalget</strong>
        <span className="ph-m-chip ph-m-chip-ok">4 medlemmer</span>
      </div>
      <div className="ph-chat">
        <div className="ph-bubble">
          <small>Anne</small>
          Skal vi mødes ved sandkassen kl. 10?
        </div>
        <div className="ph-bubble is-me">Jeg tager kaffe med ☕</div>
        <div className="ph-bubble">
          <small>Jonas</small>
          Super! Jeg har tegningen med 📎 legeplads.pdf
        </div>
        <div className="ph-bubble is-me">👍</div>
      </div>
      <div className="ph-chat-input">Skriv en besked…</div>
    </div>
  )
}

function YearWheelMock() {
  const events = [
    ['12', 'OKT', 'Arbejdsweekend', 'Hele bebyggelsen · 9.00'],
    ['24', 'OKT', 'Fællesmøde', 'Fælleshuset · 19.30'],
    ['30', 'NOV', 'Juleklip for børn', 'Værkstedet · 14.00'],
    ['31', 'DEC', 'Nytårsfest', 'Fælleshuset · 18.00'],
  ] as const
  return (
    <PortalShell active="Årshjul">
      <div className="ph-portal-title">
        <b>Årshjul</b>
        <span className="ph-tag ph-tag-green">📅 Abonnér i kalender</span>
      </div>
      <div className="ph-events">
        {events.map(([d, m, t, s]) => (
          <div key={t} className="ph-event">
            <div className="ph-event-date">
              <b>{d}</b>
              <small>{m}</small>
            </div>
            <div>
              <b>{t}</b>
              <small>{s}</small>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

function BookingMock() {
  const booked: Record<number, string> = { 3: 'b', 4: 'b', 10: 'me', 17: 'b', 18: 'b', 24: 'b' }
  return (
    <PortalShell active="Booking">
      <div className="ph-portal-title">
        <b>Fælleshuset · Oktober</b>
        <span className="ph-tag">Gæsteværelse</span>
      </div>
      <div className="ph-cal">
        {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
          <small key={i}>{d}</small>
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <span key={d} className={booked[d] === 'me' ? 'is-me' : booked[d] ? 'is-booked' : undefined}>
            {d}
          </span>
        ))}
      </div>
      <div className="ph-booking-card">
        <b>Fre 10. okt · 17.00–23.00</b>
        <small>Formål: 40-års fødselsdag</small>
        <span className="ph-tag ph-tag-green">✓ Husregler accepteret</span>
      </div>
    </PortalShell>
  )
}

function FilesMock() {
  const folders = [
    ['📁', 'Referater', '48 filer'],
    ['📐', 'Tegninger & byggesag', '12 filer'],
    ['📜', 'Vedtægter', '3 filer'],
    ['🧾', 'Regnskab', '9 filer'],
    ['🔗', 'Vaskeri-booking', 'Link'],
    ['🔒', 'Bestyrelsen', 'Kun admin'],
  ] as const
  return (
    <PortalShell active="Filer">
      <div className="ph-portal-title">
        <b>Filer</b>
        <span className="ph-tag">＋ Upload</span>
      </div>
      <div className="ph-folders">
        {folders.map(([i, n, c]) => (
          <div key={n} className="ph-folder">
            <span>{i}</span>
            <b>{n}</b>
            <small>{c}</small>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

function PhotosMock() {
  return (
    <PortalShell active="Billeder">
      <div className="ph-portal-title">
        <b>Sommerfest 2026</b>
        <small>86 billeder</small>
      </div>
      <div className="ph-photos">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} className={`ph-photo ph-photo-${i % 5}`} />
        ))}
      </div>
    </PortalShell>
  )
}

function HousesMock() {
  const houses = [
    ['Hus 1', ['Anne Lund', 'Jonas Lund']],
    ['Hus 2', ['Maja Holm']],
    ['Hus 3', ['Peter Friis', 'Sara Friis', 'Ida Friis']],
    ['Hus 4', ['Karen Bech']],
  ] as const
  return (
    <PortalShell active="Huse & naboer">
      <div className="ph-portal-title">
        <b>Huse & naboer</b>
        <span className="ph-tag">🗺️ Kort</span>
      </div>
      <div className="ph-houses">
        {houses.map(([h, people], hi) => (
          <div key={h} className="ph-house">
            <b>{h}</b>
            <div>
              {people.map((p, i) => (
                <span key={p} className="ph-person">
                  <Avatar name={p} tone={hi + i} />
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

function GroupsMock() {
  const groups = [
    ['🌱', 'Havegruppen', '14 medlemmer · offentlig', 'ph-g-0'],
    ['🎸', 'Musikaften', '8 medlemmer · offentlig', 'ph-g-1'],
    ['🛠️', 'Byggeudvalget', 'Udvalg · 5 medlemmer', 'ph-g-2'],
    ['🎉', 'Festudvalget', 'Udvalg · 6 medlemmer', 'ph-g-3'],
  ] as const
  return (
    <PortalShell active="Opslagstavle">
      <div className="ph-portal-title">
        <b>Grupper & udvalg</b>
      </div>
      <div className="ph-groups">
        {groups.map(([i, n, s, c]) => (
          <div key={n} className={`ph-group ${c}`}>
            <span>{i}</span>
            <b>{n}</b>
            <small>{s}</small>
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

function NotifyMock() {
  return (
    <div className="ph-m ph-m-phone ph-m-lock">
      <div className="ph-m-time">07:42</div>
      <div className="ph-m-note">
        <b>📌 Opslagstavle</b>
        <span>Bestyrelsen: Fællesmøde torsdag kl. 19.30</span>
      </div>
      <div className="ph-m-note">
        <b>💬 Chat · Maja</b>
        <span>@Peter har du spaden med lørdag?</span>
      </div>
      <div className="ph-m-note">
        <b>🍲 Madtilmelding</b>
        <span>Ugens menu er klar – tilmeld jer inden fredag.</span>
      </div>
      <div className="ph-m-note">
        <b>🎂 Fødselsdag</b>
        <span>Ida i hus 3 fylder 10 i dag!</span>
      </div>
    </div>
  )
}

/* ---------- Page content (texts live in content/*.md) ---------- */

// Maps "illustration:" in a content file to its drawn mockup.
// Keep in sync with ILLUSTRATIONS in scripts/check-content.ts.
const ILLUSTRATIONS: Record<string, () => ReactNode> = {
  opslagstavle: () => (
    <BrowserFrame url="solbakken.enkeltoverblik.dk/tavle">
      <BoardMock />
    </BrowserFrame>
  ),
  chat: () => (
    <PhoneFrame>
      <ChatMock />
    </PhoneFrame>
  ),
  aarshjul: () => (
    <BrowserFrame url="…/kalender">
      <YearWheelMock />
    </BrowserFrame>
  ),
  booking: () => (
    <BrowserFrame url="…/booking">
      <BookingMock />
    </BrowserFrame>
  ),
  filer: () => (
    <BrowserFrame url="…/filer">
      <FilesMock />
    </BrowserFrame>
  ),
  billeder: () => (
    <BrowserFrame url="…/billeder">
      <PhotosMock />
    </BrowserFrame>
  ),
  naboer: () => (
    <BrowserFrame url="…/huse">
      <HousesMock />
    </BrowserFrame>
  ),
  grupper: () => (
    <BrowserFrame url="…/grupper">
      <GroupsMock />
    </BrowserFrame>
  ),
  notifikationer: () => (
    <PhoneFrame>
      <NotifyMock />
    </PhoneFrame>
  ),
  menu: () => (
    <BrowserFrame url="solbakken.enkeltoverblik.dk">
      <WeekMenuMock />
    </BrowserFrame>
  ),
  tilmelding: () => (
    <PhoneFrame>
      <SignupMock />
    </PhoneFrame>
  ),
  madhold: () => (
    <BrowserFrame url="…/madhold">
      <MenuEditorMock />
    </BrowserFrame>
  ),
  raavarer: () => (
    <BrowserFrame url="…/bestil-varer">
      <RawMaterialMock />
    </BrowserFrame>
  ),
  koekken: () => (
    <BrowserFrame url="…/koekken">
      <KitchenMock />
    </BrowserFrame>
  ),
}

for (const s of [...content.features.items, ...content.meals.items]) {
  if (!ILLUSTRATIONS[s.illustration]) {
    throw new Error(
      `content: ukendt illustration "${s.illustration}" (${s.kicker}). Mulige: ${Object.keys(ILLUSTRATIONS).join(', ')}`,
    )
  }
}

/** Replaces a {placeholder} in a text field, keeping it a separate text node. */
function fill(text: string, placeholder: string, value: string): ReactNode[] {
  return text.split(placeholder).flatMap((part, i) => (i ? [value, part] : [part])).filter(Boolean)
}

type FormState = 'idle' | 'sending' | 'sent' | 'error'

/** Contact form; posts JSON to /api/kontakt (server/contact-server.mjs). */
function ContactForm() {
  const { contact, settings } = content
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')
  // Time the form was shown; the server rejects submissions faster than a human.
  const [started] = useState(() => Date.now())

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]))
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, startet: started }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (res.ok && data.ok) {
        setState('sent')
        return
      }
      setError(res.status === 400 && data.error ? data.error : '')
      setState('error')
    } catch {
      setError('')
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="ph-contact ph-contact-done" role="status">
        <h3>{contact.thanksTitle}</h3>
        <p>{contact.thanksText}</p>
      </div>
    )
  }

  const l = contact.labels
  return (
    <form className="ph-contact" onSubmit={onSubmit} noValidate={false}>
      <div className="ph-contact-grid">
        <label>
          <span>{l.name} *</span>
          <input name="navn" required maxLength={100} autoComplete="name" />
        </label>
        <label>
          <span>{l.email} *</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
        <label>
          <span>{l.community} *</span>
          <input name="faellesskab" required maxLength={150} autoComplete="organization" />
        </label>
        <label>
          <span>{l.households}</span>
          <input name="husstande" inputMode="numeric" maxLength={20} />
        </label>
        <label className="ph-contact-wide">
          <span>{l.message} *</span>
          <textarea name="besked" required maxLength={4000} rows={5} />
        </label>
        {/* Honeypot: hidden from people, filled in by bots. */}
        <label className="ph-contact-hp" aria-hidden="true">
          <span>Website</span>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state === 'error' ? (
        <p className="ph-contact-error" role="alert">
          {error || fill(contact.errorText, '{email}', settings.email)}
        </p>
      ) : null}
      <div className="ph-contact-foot">
        <small>{contact.requiredNote}</small>
        <button type="submit" className="ph-btn" disabled={state === 'sending'}>
          {state === 'sending' ? contact.sending : contact.button}
        </button>
      </div>
    </form>
  )
}

/** Renders a text field that may contain inline Markdown (*kursiv*, **fed**, links). */
function Md({ as: Tag = 'span', text, className }: { as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'b' | 'strong' | 'small' | 'summary'; text: string; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: inline(text) }} />
}

function ShowcaseList({ items }: { items: Showcase[] }) {
  return (
    <div className="ph-showcases">
      {items.map((s, i) => (
        <article key={s.id} id={`funktion-${s.id}`} className={`ph-showcase${i % 2 ? ' is-flipped' : ''}`}>
          <div className="ph-showcase-text">
            <p className="ph-kicker">
              <span aria-hidden="true">{s.icon}</span> {s.kicker}
            </p>
            <Md as="h3" text={s.title} />
            <Md as="p" text={s.text} />
            <ul className="ph-checks">
              {s.bullets.map((b) => (
                <li key={b} dangerouslySetInnerHTML={{ __html: inline(b) }} />
              ))}
            </ul>
          </div>
          <div className="ph-showcase-art">{ILLUSTRATIONS[s.illustration]()}</div>
        </article>
      ))}
    </div>
  )
}

export function PlatformHome() {
  const { hero, steps, features, meals, roles, platform, pricing, sites, questions, final, footer } = content
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.title = settings.pageTitle
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', settings.pageDescription)
    const robots = document.querySelector('meta[name="robots"]')
    if (robots) robots.setAttribute('content', 'index, follow')
    const googlebot = document.querySelector('meta[name="googlebot"]')
    if (googlebot) googlebot.setAttribute('content', 'index, follow')
  }, [])

  const firstMeal = meals.items[0]

  return (
    <div className="platform-home">
      <header className="ph-nav">
        <div className="ph-wrap ph-nav-inner">
          <a href="#top" className="ph-brand">
            <span className="ph-brand-mark">EO</span>
            Enkelt Overblik
          </a>
          <button
            type="button"
            className="ph-nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="ph-nav-links"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? 'Luk' : 'Menu'}
          </button>
          <nav id="ph-nav-links" className={`ph-nav-links${menuOpen ? ' is-open' : ''}`}>
            {settings.nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
              </a>
            ))}
            <a className="ph-btn ph-btn-sm" href={settings.demoUrl}>
              {settings.navButton}
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="ph-hero">
          <div className="ph-wrap ph-hero-grid">
            <div>
              <p className="ph-kicker">{hero.kicker}</p>
              <Md as="h1" text={hero.title} />
              <Md as="p" className="ph-lead" text={hero.lead} />
              <div className="ph-cta-row">
                <a className="ph-btn" href={settings.contactHref}>
                  {hero.button}
                </a>
                <a className="ph-btn ph-btn-ghost" href={settings.demoUrl}>
                  {hero.demoButton}
                </a>
              </div>
              <ul className="ph-proof">
                {hero.proof.map((x) => (
                  <li key={x}>{`✓ ${x}`}</li>
                ))}
              </ul>
            </div>
            <div className="ph-hero-art">
              <BrowserFrame url="solbakken.enkeltoverblik.dk">
                <BoardMock />
              </BrowserFrame>
              <div className="ph-hero-phone">
                <PhoneFrame>
                  <ChatMock />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        <section className="ph-strip" aria-label="Moduler">
          <div className="ph-wrap ph-module-strip">
            {features.items.map((s) => (
              <a key={s.id} href={`#funktion-${s.id}`}>
                <span aria-hidden="true">{s.icon}</span>
                {s.kicker}
              </a>
            ))}
            {firstMeal ? (
              <a href="#madtilmelding">
                <span aria-hidden="true">{firstMeal.icon}</span>
                Madtilmelding
              </a>
            ) : null}
          </div>
        </section>

        <section id="saadan" className="ph-section">
          <div className="ph-wrap">
            <p className="ph-kicker">{steps.kicker}</p>
            <Md as="h2" text={steps.title} />
            <ol className="ph-steps">
              {steps.items.map((x, i) => (
                <li key={x.title}>
                  <span className="ph-step-n">{i + 1}</span>
                  <Md as="h3" text={x.title} />
                  <Md as="p" text={x.text} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="funktioner" className="ph-section ph-section-tint">
          <div className="ph-wrap">
            <p className="ph-kicker">{features.kicker}</p>
            <Md as="h2" text={features.title} />
            <Md as="p" className="ph-section-lead" text={features.lead} />
            <ShowcaseList items={features.items} />
          </div>
        </section>

        <section id="madtilmelding" className="ph-section ph-section-meals">
          <div className="ph-wrap">
            <p className="ph-kicker">{meals.kicker}</p>
            <Md as="h2" text={meals.title} />
            <Md as="p" className="ph-section-lead" text={meals.lead} />
            <ShowcaseList items={meals.items} />
            <div className="ph-meals-roles">
              {meals.roles.map((group) => (
                <details key={group.title} className="ph-role">
                  <summary>
                    <span className="ph-role-icon" aria-hidden="true">
                      {group.icon}
                    </span>
                    <b>{group.title}</b>
                  </summary>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item} dangerouslySetInnerHTML={{ __html: inline(item) }} />
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="roller" className="ph-section">
          <div className="ph-wrap">
            <p className="ph-kicker">{roles.kicker}</p>
            <Md as="h2" text={roles.title} />
            <div className="ph-roles">
              {roles.items.map((r) => (
                <article key={r.title} className="ph-role">
                  <span className="ph-role-icon" aria-hidden="true">
                    {r.icon}
                  </span>
                  <h3>{r.title}</h3>
                  <ul>
                    {r.items.map((item) => (
                      <li key={item} dangerouslySetInnerHTML={{ __html: inline(item) }} />
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            {roles.theme ? (
              <div className="ph-showcase ph-showcase-compact">
                <div className="ph-showcase-text">
                  <p className="ph-kicker">{roles.theme.kicker}</p>
                  <Md as="h3" text={roles.theme.title} />
                  <Md as="p" text={roles.theme.text} />
                </div>
                <div className="ph-showcase-art">
                  <ThemesMock />
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="ph-section ph-section-dark">
          <div className="ph-wrap ph-platform">
            <div>
              <p className="ph-kicker">{platform.kicker}</p>
              <Md as="h2" text={platform.title} />
              <Md as="p" text={platform.text} />
            </div>
            <div className="ph-modules">
              {platform.modules.map((m) => (
                <div key={m.title} className={`ph-module ${m.soon ? 'ph-module-soon' : 'ph-module-on'}`}>
                  <b>{m.title}</b>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="priser" className="ph-section">
          <div className="ph-wrap">
            <p className="ph-kicker">{pricing.kicker}</p>
            <Md as="h2" text={pricing.title} />
            <Md as="p" className="ph-section-lead" text={pricing.lead} />
            <div className="ph-plans">
              {pricing.plans.map((p) => (
                <article key={p.name} className={`ph-plan${p.featured ? ' is-featured' : ''}`}>
                  {p.featured ? <span className="ph-plan-badge">{pricing.badge}</span> : null}
                  <h3>{p.name}</h3>
                  <p className="ph-plan-tag">{p.tagline}</p>
                  <p className="ph-plan-price">{p.price}</p>
                  <ul className="ph-checks">
                    {p.features.map((f) => (
                      <li key={f} dangerouslySetInnerHTML={{ __html: inline(f) }} />
                    ))}
                  </ul>
                  <a className={`ph-btn${p.featured ? '' : ' ph-btn-ghost'}`} href={settings.contactHref}>
                    {p.cta}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ph-section ph-section-tint">
          <div className="ph-wrap">
            <p className="ph-kicker">{sites.kicker}</p>
            <Md as="h2" text={sites.title} />
            <div className="ph-sites">
              {sites.items.map((site) => (
                <a key={site.href} href={site.href} className="ph-site">
                  <small>{site.note}</small>
                  <strong>{site.label}</strong>
                  <span>{sites.linkText}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="ph-section">
          <div className="ph-wrap ph-faq-wrap">
            <div>
              <p className="ph-kicker">{questions.kicker}</p>
              <Md as="h2" text={questions.title} />
            </div>
            <div className="ph-faq">
              {questions.items.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <Md as="p" text={f.a} />
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="kontakt" className="ph-final">
          <div className="ph-wrap ph-final-inner">
            <Md as="h2" text={final.title} />
            <Md as="p" text={final.text} />
            <ContactForm />
            <div className="ph-cta-row">
              <a className="ph-btn ph-btn-ghost-light" href={settings.demoUrl}>
                {final.demoButton}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ph-footer">
        <div className="ph-wrap">
          <div className="ph-footer-grid">
            <div>
              <a href="#top" className="ph-brand">
                <span className="ph-brand-mark">EO</span>
                Enkelt Overblik
              </a>
              <Md as="p" text={footer.tagline} />
            </div>
            <div>
              <strong>{footer.productHeading}</strong>
              {settings.nav.map((n) => (
                <a key={n.href} href={n.href}>
                  {n.label}
                </a>
              ))}
            </div>
            <div>
              <strong>{footer.contactHeading}</strong>
              <a href="#kontakt">{footer.contactLink}</a>
              <a href={settings.demoUrl}>{settings.demoUrl.replace(/^https?:\/\//, '')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
