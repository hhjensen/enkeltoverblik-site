import { useEffect, useState, type ReactNode } from 'react'
import { APP_VERSION, FEATURE_GROUPS, VERSION_HISTORY } from './version'
import './PlatformHome.css'

const CONTACT_EMAIL = 'henrik@vores-it.dk'
const DEMO_URL = 'https://demo.enkeltoverblik.dk'
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'Enkelt Overblik til vores fællesskab',
)}`

const SITES = [
  { href: DEMO_URL, label: 'demo.enkeltoverblik.dk', note: 'Prøv selv' },
  {
    href: 'https://bakkefaldet.enkeltoverblik.dk',
    label: 'bakkefaldet.enkeltoverblik.dk',
    note: 'Bofællesskabet Bakkefaldet',
  },
] as const

const NAV = [
  { href: '#funktioner', label: 'Funktioner' },
  { href: '#madtilmelding', label: 'Madtilmelding' },
  { href: '#roller', label: 'Roller' },
  { href: '#priser', label: 'Priser' },
  { href: '#faq', label: 'Spørgsmål' },
] as const

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

/* ---------- Page content ---------- */

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


/* ---------- Page content ---------- */

type Showcase = {
  id: string
  icon: string
  kicker: string
  title: string
  text: string
  bullets: readonly string[]
  mock: ReactNode
}

const PORTAL_SHOWCASES: Showcase[] = [
  {
    id: 'opslagstavle',
    icon: '📌',
    kicker: 'Opslagstavle',
    title: 'Fællesskabets fælles opslagstavle',
    text: 'Del nyt, billeder og beskeder med hele bebyggelsen. Nævn en nabo med @, reagér med emoji og svar i kommentarer. Vigtige opslag kan markeres og fastgøres, så ingen overser dem.',
    bullets: ['Vigtige og fastgjorte opslag', '@-omtaler, reaktioner og kommentarer', 'Automatiske fødselsdagshilsner'],
    mock: (
      <BrowserFrame url="solbakken.enkeltoverblik.dk/tavle">
        <BoardMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'chat',
    icon: '💬',
    kicker: 'Chat',
    title: 'Snak med naboen — uden at dele telefonnummer',
    text: 'Skriv direkte til en nabo eller opret en gruppesamtale til udvalget, festen eller legepladsen. Vedhæft billeder og filer, og slå lyden fra i tråde, du ikke behøver følge tæt.',
    bullets: ['Direkte beskeder og gruppesamtaler', 'Billeder og filer i chatten', 'Slå lyd fra pr. samtale'],
    mock: (
      <PhoneFrame>
        <ChatMock />
      </PhoneFrame>
    ),
  },
  {
    id: 'aarshjul',
    icon: '📅',
    kicker: 'Årshjul',
    title: 'Alle fællesdatoer — direkte i jeres kalender',
    text: 'Fællesmøder, arbejdsweekender og fester samles i årshjulet. Hver beboer kan abonnere, så datoerne automatisk dukker op i telefonens kalender og holdes opdateret.',
    bullets: ['Kommende og tidligere begivenheder', 'Sted, tidspunkt og beskrivelse', 'Levende kalenderabonnement'],
    mock: (
      <BrowserFrame url="…/kalender">
        <YearWheelMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'booking',
    icon: '🔑',
    kicker: 'Booking',
    title: 'Book fælleshuset på to minutter',
    text: 'Se hvornår fælleshus, gæsteværelse eller trailer er ledig, vælg tid og formål, og acceptér husreglerne. Systemet forhindrer dobbeltbookinger, og dine bookinger kan ligge i din egen kalender.',
    bullets: ['Flere ressourcer med egne regler', 'Ingen dobbeltbookinger', 'Kalenderlink til egne bookinger'],
    mock: (
      <BrowserFrame url="…/booking">
        <BookingMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'filer',
    icon: '🗂️',
    kicker: 'Filer',
    title: 'Referater og vedtægter, der er til at finde',
    text: 'Et fælles dokumentarkiv med mapper, ikoner og links. Nogle mapper kan være kun for admin, og slettede filer ligger i papirkurven, så intet forsvinder ved et uheld.',
    bullets: ['Mapper i flere niveauer', 'Kun-admin-mapper og uploadrettigheder', 'Papirkurv med gendannelse'],
    mock: (
      <BrowserFrame url="…/filer">
        <FilesMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'billeder',
    icon: '📷',
    kicker: 'Billeder',
    title: 'Fællesskabets fotoalbum',
    text: 'Saml billederne fra sommerfesten, arbejdsdagen og juletræet i fælles albums. Alle kan kigge med, og dem med uploadret kan lægge nye billeder op.',
    bullets: ['Albums med forsidebillede', 'Galleri og fuldskærmsvisning', 'Styr hvem der kan uploade'],
    mock: (
      <BrowserFrame url="…/billeder">
        <PhotosMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'naboer',
    icon: '🏡',
    kicker: 'Huse & naboer',
    title: 'Hvem bor egentlig i hus 14?',
    text: 'En levende beboeroversigt med huse, navne og profiler — også på kort. Perfekt til nye beboere og til alle os, der aldrig helt lærte navnene på børnene.',
    bullets: ['Beboere grupperet pr. hus', 'Profiler med billede', 'Kortvisning'],
    mock: (
      <BrowserFrame url="…/huse">
        <HousesMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'grupper',
    icon: '🌱',
    kicker: 'Grupper & udvalg',
    title: 'Plads til havegruppen, festudvalget og bestyrelsen',
    text: 'Grupper har deres egne opslag og filer og kan være åbne eller lukkede. Udvalg har medlemmer med titler, en præsentation og egne mapper.',
    bullets: ['Åbne og lukkede grupper', 'Udvalg med roller og egne mapper', 'Gruppeopslag vises også på tavlen'],
    mock: (
      <BrowserFrame url="…/grupper">
        <GroupsMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'notifikationer',
    icon: '🔔',
    kicker: 'Notifikationer',
    title: 'Vid besked — uden at blive druknet',
    text: 'Hver beboer vælger selv, hvad de vil have besked om: chat, nye opslag, omtaler eller madtilmelding. Som pop-up på telefonen, med lyd eller helt stille.',
    bullets: ['Push-beskeder på mobil og computer', 'Personlige indstillinger', 'Kan lægges på hjemmeskærmen som en app'],
    mock: (
      <PhoneFrame>
        <NotifyMock />
      </PhoneFrame>
    ),
  },
]

const MEALS_SHOWCASES: Showcase[] = [
  {
    id: 'menu',
    icon: '🍲',
    kicker: 'Ugens menu',
    title: 'Alle kan se, hvad der er til aftensmad',
    text: 'Menuen ligger åbent — også uden login. Dage uden fællesspisning skjules, deadline står tydeligt, og vegetar og glutenfri er markeret pr. ret.',
    bullets: ['Mobil, tablet og storskærm', 'Del link direkte til ugen'],
    mock: (
      <BrowserFrame url="solbakken.enkeltoverblik.dk">
        <WeekMenuMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'tilmelding',
    icon: '🙋',
    kicker: 'Tilmelding',
    title: 'Tilmeld hele husstanden på ti sekunder',
    text: 'Tæl voksne, børn og små børn op og ned, markér kosthensyn pr. person og lad en standard-tilmelding klare de faste uger.',
    bullets: ['Standard-tilmelding', 'Påmindelse før deadline'],
    mock: (
      <PhoneFrame>
        <SignupMock />
      </PhoneFrame>
    ),
  },
  {
    id: 'madhold',
    icon: '👩‍🍳',
    kicker: 'Madholdet',
    title: 'Menu og deadline på få minutter',
    text: 'Madholdet skriver retterne, svarer på vegetar- og glutenfri-muligheder og sætter deadline — og kan stadig rette tilmeldinger bagefter.',
    bullets: ['«Ikke mad denne dag»', 'Ret efter deadline'],
    mock: (
      <BrowserFrame url="…/madhold">
        <MenuEditorMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'varer',
    icon: '🧺',
    kicker: 'Råvarer',
    title: 'Indkøbslisten skriver næsten sig selv',
    text: 'Ugeskema pr. dag, leverandør og kategori. Bestilleren får en færdig liste på mail, og varer krydses af som leveret.',
    bullets: ['Mail til bestiller', 'Leveret-status'],
    mock: (
      <BrowserFrame url="…/bestil-varer">
        <RawMaterialMock />
      </BrowserFrame>
    ),
  },
  {
    id: 'koekken',
    icon: '🍽️',
    kicker: 'Køkken & regnskab',
    title: 'Det rigtige antal tallerkener',
    text: 'Køkkenoversigten viser spisende pr. dag og kosthensyn — klar til print. Madregnskabet sendes automatisk, når ugen er slut.',
    bullets: ['Printvenlig køkkenoversigt', 'Automatisk madregnskab'],
    mock: (
      <BrowserFrame url="…/koekken">
        <KitchenMock />
      </BrowserFrame>
    ),
  },
]

function ShowcaseList({ items }: { items: Showcase[] }) {
  return (
    <div className="ph-showcases">
      {items.map((s, i) => (
        <article key={s.id} id={`funktion-${s.id}`} className={`ph-showcase${i % 2 ? ' is-flipped' : ''}`}>
          <div className="ph-showcase-text">
            <p className="ph-kicker">
              <span aria-hidden="true">{s.icon}</span> {s.kicker}
            </p>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <ul className="ph-checks">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="ph-showcase-art">{s.mock}</div>
        </article>
      ))}
    </div>
  )
}

const PORTAL_ROLES = [
  {
    icon: '🙂',
    title: 'Beboer',
    items: ['Opslag, kommentarer og reaktioner', 'Chat med naboer og grupper', 'Book fælleshus og ressourcer', 'Se årshjul, filer, billeder og naboer', 'Egne notifikationer og kalenderlinks'],
  },
  {
    icon: '🗂️',
    title: 'Admin i fællesskabet',
    items: ['Invitér og administrér beboere', 'Opret huse, udvalg og ressourcer', 'Fællesdatoer i årshjulet', 'Styr filer, mapper og rettigheder', 'Slå moduler til og fra'],
  },
  {
    icon: '📋',
    title: 'Kun opslagstavle',
    items: ['Til fx udlejere, vicevært eller kommende beboere', 'Læser og følger med på tavlen', 'Ingen adgang til resten'],
  },
] as const

const ROLE_ICONS: Record<string, string> = {
  'For alle (uden login)': '👀',
  'For huset': '🏡',
  'For madhold': '👩‍🍳',
  'For admin': '🗂️',
  'Bestiller og madregnskab': '🧾',
}

const PLANS = [
  {
    name: 'Pilot',
    tagline: 'Prøv det med jeres fællesskab',
    price: 'Gratis i opstarten',
    features: ['Egen adresse på enkeltoverblik.dk', 'Hjælp til opsætning af huse og beboere', 'Hele portalen', 'Direkte kontakt til udvikleren'],
    cta: 'Start en pilot',
  },
  {
    name: 'Fællesskab',
    tagline: 'Til bofællesskaber i drift',
    price: 'Pris efter antal huse',
    features: ['Opslagstavle, chat og grupper', 'Årshjul, booking og filer', 'Billeder og beboeroversigt', 'Push-notifikationer', 'Madtilmelding som tilvalg'],
    cta: 'Få et tilbud',
    featured: true,
  },
  {
    name: 'Forening',
    tagline: 'Større fællesskaber og netværk',
    price: 'Efter aftale',
    features: ['Flere fællesskaber', 'Eget domæne og branding', 'Hjælp til flytning af data', 'Prioriteret support'],
    cta: 'Kontakt os',
  },
] as const

const FAQ = [
  {
    q: 'Hvordan logger beboerne ind?',
    a: 'Med deres e-mail. De får et login-link tilsendt — ingen adgangskoder at huske. Kun inviterede beboere kan komme ind.',
  },
  {
    q: 'Skal vi bruge alle funktionerne?',
    a: 'Nej. Admin slår de moduler til, I har brug for, og bestemmer rækkefølgen i menuen. Madtilmelding er et tilvalg.',
  },
  {
    q: 'Virker det på telefonen?',
    a: 'Ja. Enkelt Overblik er lavet mobil-først og kan lægges på hjemmeskærmen som en app — også med pop-up-beskeder på iPhone.',
  },
  {
    q: 'Kan vi erstatte Facebook-gruppen og mailinglisten?',
    a: 'Det er netop tanken: opslag, chat, datoer og dokumenter samlet ét sted, som kun jeres fællesskab har adgang til — uden reklamer.',
  },
  {
    q: 'Hvor ligger vores data?',
    a: 'Hvert fællesskab er holdt adskilt fra de andre, og data bliver ikke delt eller solgt. Der er ingen reklamer eller sporing.',
  },
  {
    q: 'Hvordan kommer vi i gang?',
    a: 'Skriv til os. Vi opretter jeres fællesskab på en egen adresse, lægger huse og beboere ind sammen med jer og sender invitationerne.',
  },
] as const

export function PlatformHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Legacy /om redirects to #versioner; keep that history visible on arrival.
  const [versionsOpen, setVersionsOpen] = useState(
    () => window.location.hash === '#versioner',
  )

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#versioner') setVersionsOpen(true)
    }
    if (window.location.hash === '#versioner') {
      document.getElementById('versioner')?.scrollIntoView()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.title = 'Enkelt Overblik — hele fællesskabet samlet ét sted'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        'content',
        'Enkelt Overblik er portalen til bofællesskaber: opslagstavle, chat, årshjul, booking, filer, billeder, naboer og madtilmelding — samlet ét sted.',
      )
    }
    const robots = document.querySelector('meta[name="robots"]')
    if (robots) robots.setAttribute('content', 'index, follow')
    const googlebot = document.querySelector('meta[name="googlebot"]')
    if (googlebot) googlebot.setAttribute('content', 'index, follow')
  }, [])

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
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
              </a>
            ))}
            <a className="ph-btn ph-btn-sm" href={DEMO_URL}>
              Se demo
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="ph-hero">
          <div className="ph-wrap ph-hero-grid">
            <div>
              <p className="ph-kicker">Portalen til bofællesskaber</p>
              <h1>
                Hele fællesskabet — <em>ét</em> sted
              </h1>
              <p className="ph-lead">
                Opslagstavle, chat, årshjul, booking af fælleshuset, dokumenter,
                billeder, naboer og madtilmelding. Enkelt Overblik erstatter
                Facebook-gruppen, mailinglisten og sedlerne på køleskabet.
              </p>
              <div className="ph-cta-row">
                <a className="ph-btn" href={CONTACT_HREF}>
                  Kom i gang
                </a>
                <a className="ph-btn ph-btn-ghost" href={DEMO_URL}>
                  Prøv demoen →
                </a>
              </div>
              <ul className="ph-proof">
                <li>✓ Kun for jeres fællesskab</li>
                <li>✓ Ingen reklamer</li>
                <li>✓ Login uden adgangskode</li>
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
            {[...PORTAL_SHOWCASES, MEALS_SHOWCASES[0]].map((s) => (
              <a key={s.id} href={s.id === 'menu' ? '#madtilmelding' : `#funktion-${s.id}`}>
                <span aria-hidden="true">{s.icon}</span>
                {s.id === 'menu' ? 'Madtilmelding' : s.kicker}
              </a>
            ))}
          </div>
        </section>

        <section id="saadan" className="ph-section">
          <div className="ph-wrap">
            <p className="ph-kicker">Sådan kommer I i gang</p>
            <h2>Klar på under en uge</h2>
            <ol className="ph-steps">
              <li>
                <span className="ph-step-n">1</span>
                <h3>Vi opretter jer</h3>
                <p>Jeres egen adresse, farver og de moduler, I vil bruge.</p>
              </li>
              <li>
                <span className="ph-step-n">2</span>
                <h3>Huse og beboere</h3>
                <p>Vi lægger huse ind sammen med jer — admin inviterer beboerne.</p>
              </li>
              <li>
                <span className="ph-step-n">3</span>
                <h3>Beboerne logger ind</h3>
                <p>Et link på mail, og så er de inde. Læg den på hjemmeskærmen.</p>
              </li>
              <li>
                <span className="ph-step-n">4</span>
                <h3>Fællesskabet flytter ind</h3>
                <p>Første opslag, første booking, første fællesspisning.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="funktioner" className="ph-section ph-section-tint">
          <div className="ph-wrap">
            <p className="ph-kicker">Funktioner</p>
            <h2>Alt det, et fællesskab har brug for</h2>
            <p className="ph-section-lead">
              Bygget sammen med et rigtigt bofællesskab — og formet af hverdagen der.
            </p>
            <ShowcaseList items={PORTAL_SHOWCASES} />
          </div>
        </section>

        <section id="madtilmelding" className="ph-section ph-section-meals">
          <div className="ph-wrap">
            <p className="ph-kicker">Tilvalg · Madtilmelding</p>
            <h2>Fællesspisning uden sedler på køleskabet</h2>
            <p className="ph-section-lead">
              Slå Madtilmelding til, og få menu, tilmelding, madhold, råvarebestilling,
              køkkenoversigt og madregnskab — tæt koblet til resten af portalen.
            </p>
            <ShowcaseList items={MEALS_SHOWCASES} />
            <div className="ph-meals-roles">
              {FEATURE_GROUPS.map((group) => (
                <details key={group.title} className="ph-role">
                  <summary>
                    <span className="ph-role-icon" aria-hidden="true">
                      {ROLE_ICONS[group.title] ?? '✨'}
                    </span>
                    <b>{group.title}</b>
                  </summary>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="roller" className="ph-section">
          <div className="ph-wrap">
            <p className="ph-kicker">Roller</p>
            <h2>Den rigtige adgang til de rigtige mennesker</h2>
            <div className="ph-roles">
              {PORTAL_ROLES.map((r) => (
                <article key={r.title} className="ph-role">
                  <span className="ph-role-icon" aria-hidden="true">
                    {r.icon}
                  </span>
                  <h3>{r.title}</h3>
                  <ul>
                    {r.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="ph-showcase ph-showcase-compact">
              <div className="ph-showcase-text">
                <p className="ph-kicker">🎨 Til alle aldre</p>
                <h3>Let at læse — også for bedstemor</h3>
                <p>Lys eller mørk tilstand, klassisk eller kartotek, og stor tekst med ét tryk.</p>
              </div>
              <div className="ph-showcase-art">
                <ThemesMock />
              </div>
            </div>
          </div>
        </section>

        <section className="ph-section ph-section-dark">
          <div className="ph-wrap ph-platform">
            <div>
              <p className="ph-kicker">Platformen</p>
              <h2>Én portal — moduler efter behov</h2>
              <p>
                Hvert fællesskab får sin egen adresse og er holdt helt adskilt fra alle
                andre. Admin vælger, hvilke moduler der er slået til, og i hvilken
                rækkefølge de står i menuen.
              </p>
            </div>
            <div className="ph-modules">
              <div className="ph-module ph-module-on">
                <b>🏘️ Portalen</b>
                <span>Opslagstavle · Chat · Årshjul · Booking · Filer · Billeder · Huse & naboer · Grupper & udvalg</span>
              </div>
              <div className="ph-module ph-module-on">
                <b>🍲 Madtilmelding</b>
                <span>Menu · Tilmelding · Madhold · Råvarer · Køkken · Madregnskab</span>
              </div>
              <div className="ph-module ph-module-soon">
                <b>🔎 Søgning på tværs</b>
                <span>På vej</span>
              </div>
            </div>
          </div>
        </section>

        <section id="priser" className="ph-section">
          <div className="ph-wrap">
            <p className="ph-kicker">Priser</p>
            <h2>Enkel pris til jeres fællesskab</h2>
            <p className="ph-section-lead">
              Ingen binding i piloten. Skriv til os, så finder vi den rigtige løsning.
            </p>
            <div className="ph-plans">
              {PLANS.map((p) => (
                <article key={p.name} className={`ph-plan${'featured' in p ? ' is-featured' : ''}`}>
                  {'featured' in p ? <span className="ph-plan-badge">Mest valgt</span> : null}
                  <h3>{p.name}</h3>
                  <p className="ph-plan-tag">{p.tagline}</p>
                  <p className="ph-plan-price">{p.price}</p>
                  <ul className="ph-checks">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <a className={`ph-btn${'featured' in p ? '' : ' ph-btn-ghost'}`} href={CONTACT_HREF}>
                    {p.cta}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ph-section ph-section-tint">
          <div className="ph-wrap">
            <p className="ph-kicker">I brug</p>
            <h2>Se det i virkeligheden</h2>
            <div className="ph-sites">
              {SITES.map((site) => (
                <a key={site.href} href={site.href} className="ph-site">
                  <small>{site.note}</small>
                  <strong>{site.label}</strong>
                  <span>Besøg →</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="ph-section">
          <div className="ph-wrap ph-faq-wrap">
            <div>
              <p className="ph-kicker">Spørgsmål</p>
              <h2>Godt at vide</h2>
            </div>
            <div className="ph-faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ph-final">
          <div className="ph-wrap ph-final-inner">
            <h2>Klar til at samle fællesskabet?</h2>
            <p>Fortæl os om jeres fællesskab — så viser vi, hvordan det kan se ud hos jer.</p>
            <div className="ph-cta-row">
              <a className="ph-btn ph-btn-light" href={CONTACT_HREF}>
                Skriv til {CONTACT_EMAIL}
              </a>
              <a className="ph-btn ph-btn-ghost-light" href={DEMO_URL}>
                Prøv demoen
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
              <p>Portalen til bofællesskaber — med madtilmelding som tilvalg.</p>
            </div>
            <div>
              <strong>Produkt</strong>
              {NAV.map((n) => (
                <a key={n.href} href={n.href}>
                  {n.label}
                </a>
              ))}
            </div>
            <div>
              <strong>Kontakt</strong>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <a href={DEMO_URL}>demo.enkeltoverblik.dk</a>
            </div>
          </div>
          <details
            id="versioner"
            className="ph-versions"
            open={versionsOpen}
            onToggle={(e) => setVersionsOpen(e.currentTarget.open)}
          >
            <summary>Madtilmelding version {APP_VERSION} · se versionshistorik</summary>
            <ol>
              {VERSION_HISTORY.map((entry) => (
                <li key={entry.version}>
                  <strong>
                    Version {entry.version}
                    {entry.version === APP_VERSION ? ' (aktuel)' : ''}
                  </strong>
                  <span>
                    {' '}
                    · {entry.date} · {entry.title}
                  </span>
                  <ul>
                    {entry.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </footer>
    </div>
  )
}
