// Loads the editable page texts from content/*.md at build time.
// Each file has YAML front matter (fields) and an optional Markdown body.
// Missing or wrongly typed fields fail the build with the file and field name.
import { marked } from 'marked'
import { parse as parseYaml } from 'yaml'

// Keys look like "../content/<path>.md"; values are the raw file text.
type Files = Record<string, string>

type Doc = { file: string; data: Record<string, unknown>; body: string }

function fail(file: string, msg: string): never {
  throw new Error(`content/${file}: ${msg}`)
}

function parseDoc(path: string, raw: string): Doc {
  const file = path.replace(/^\.\.\/content\//, '')
  const text = raw.replace(/\r\n/g, '\n')
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text)
  if (!m) fail(file, 'skal starte med en ---blok med felter')
  let data: unknown
  try {
    data = parseYaml(m[1]) ?? {}
  } catch (e) {
    fail(file, `fejl i felterne øverst: ${(e as Error).message}`)
  }
  if (typeof data !== 'object' || Array.isArray(data)) fail(file, 'felterne øverst er ikke gyldige')
  return { file, data: data as Record<string, unknown>, body: m[2].trim() }
}

function doc(files: Files, name: string): Doc {
  const raw = files[`../content/${name}`]
  if (raw === undefined) throw new Error(`content/${name} mangler`)
  return parseDoc(`../content/${name}`, raw)
}

function folder(files: Files, name: string): Doc[] {
  return Object.keys(files)
    .filter((p) => p.startsWith(`../content/${name}/`))
    .sort()
    .map((p) => parseDoc(p, files[p]))
}

/** Inline Markdown (*kursiv*, **fed**, [link](url)) → HTML. Content is repo-owned. */
export function inline(s: string): string {
  return marked.parseInline(s, { async: false }) as string
}

function str(d: Doc, key: string, obj: Record<string, unknown> = d.data, where = key): string {
  const v = obj[key]
  if (typeof v === 'number') return String(v)
  if (typeof v !== 'string' || !v.trim()) fail(d.file, `feltet "${where}" mangler eller er tomt`)
  return v.trim()
}

function optStr(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function strList(d: Doc, key: string, obj: Record<string, unknown> = d.data, where = key): string[] {
  const v = obj[key]
  if (!Array.isArray(v) || v.length === 0) fail(d.file, `feltet "${where}" skal være en liste med mindst ét punkt`)
  return v.map((x, i) => {
    if (typeof x !== 'string' && typeof x !== 'number') fail(d.file, `punkt ${i + 1} i "${where}" er ikke tekst`)
    return String(x).trim()
  })
}

function objList(d: Doc, key: string): Record<string, unknown>[] {
  const v = d.data[key]
  if (!Array.isArray(v) || v.length === 0) fail(d.file, `feltet "${key}" skal være en liste med mindst ét element`)
  return v.map((x, i) => {
    if (typeof x !== 'object' || x === null || Array.isArray(x)) fail(d.file, `element ${i + 1} i "${key}" er ikke gyldigt`)
    return x as Record<string, unknown>
  })
}

function body(d: Doc): string {
  if (!d.body) fail(d.file, 'mangler brødtekst under ---blokken')
  return d.body.replace(/\s*\n\s*/g, ' ')
}

function heading(d: Doc) {
  return { kicker: str(d, 'etiket'), title: str(d, 'overskrift') }
}

export type Showcase = {
  id: string
  icon: string
  kicker: string
  title: string
  text: string
  bullets: string[]
  illustration: string
}

function showcases(files: Files, name: string): Showcase[] {
  return folder(files, name).map((d) => ({
    id: d.file.replace(/^.*\/(\d+-)?/, '').replace(/\.md$/, ''),
    icon: str(d, 'ikon'),
    kicker: str(d, 'etiket'),
    title: str(d, 'overskrift'),
    text: body(d),
    bullets: strList(d, 'punkter'),
    illustration: str(d, 'illustration'),
  }))
}

function roleList(d: Doc) {
  return objList(d, 'roller').map((r, i) => ({
    title: str(d, 'titel', r, `roller ${i + 1} → titel`),
    icon: str(d, 'ikon', r, `roller ${i + 1} → ikon`),
    items: strList(d, 'punkter', r, `roller ${i + 1} → punkter`),
  }))
}

function faq(d: Doc) {
  const parts = d.body.split(/^## +/m).slice(1)
  if (parts.length === 0) fail(d.file, 'ingen spørgsmål fundet (hvert spørgsmål starter med "## ")')
  return parts.map((p) => {
    const [q, ...rest] = p.split('\n')
    const a = rest.join('\n').trim().replace(/\s*\n\s*/g, ' ')
    if (!a) fail(d.file, `spørgsmålet "${q.trim()}" mangler et svar`)
    return { q: q.trim(), a }
  })
}

export function loadContent(files: Files) {
  const s = doc(files, 'indstillinger.md')
  const email = str(s, 'kontakt_email')
  const settings = {
    email,
    contactHref: '#kontakt',
    pageTitle: str(s, 'side_titel'),
    pageDescription: str(s, 'side_beskrivelse'),
    nav: objList(s, 'menu').map((n, i) => ({
      label: str(s, 'tekst', n, `menu ${i + 1} → tekst`),
      href: str(s, 'link', n, `menu ${i + 1} → link`),
    })),
    navButton: str(s, 'menu_knap'),
  }

  const t = doc(files, 'top.md')
  const hero = {
    ...heading(t),
    lead: body(t),
    button: str(t, 'knap'),
    demoButton: str(t, 'knap_demo'),
    proof: strList(t, 'fordele'),
  }

  const k = doc(files, 'kom-i-gang.md')
  const steps = {
    ...heading(k),
    items: objList(k, 'trin').map((x, i) => ({
      title: str(k, 'titel', x, `trin ${i + 1} → titel`),
      text: str(k, 'tekst', x, `trin ${i + 1} → tekst`),
    })),
  }

  const f = doc(files, 'funktioner.md')
  const features = { ...heading(f), lead: body(f), items: showcases(files, 'funktioner') }

  const m = doc(files, 'madtilmelding.md')
  const meals = { ...heading(m), lead: body(m), items: showcases(files, 'madtilmelding'), roles: roleList(m) }

  const r = doc(files, 'roller.md')
  const roles = {
    ...heading(r),
    items: roleList(r),
    // Optional: the theme box is shown only when all three fields are set.
    theme: r.data.tema_overskrift === undefined
      ? null
      : { kicker: str(r, 'tema_etiket'), title: str(r, 'tema_overskrift'), text: str(r, 'tema_tekst') },
  }

  const p = doc(files, 'platform.md')
  const platform = {
    ...heading(p),
    text: body(p),
    modules: objList(p, 'moduler').map((x, i) => ({
      title: str(p, 'titel', x, `moduler ${i + 1} → titel`),
      text: str(p, 'tekst', x, `moduler ${i + 1} → tekst`),
      soon: optStr(x, 'status') === 'på-vej',
    })),
  }

  const pr = doc(files, 'priser.md')
  const pricing = {
    ...heading(pr),
    lead: body(pr),
    badge: str(pr, 'fremhævet_maerke'),
    plans: objList(pr, 'planer').map((x, i) => ({
      name: str(pr, 'navn', x, `planer ${i + 1} → navn`),
      tagline: str(pr, 'undertitel', x, `planer ${i + 1} → undertitel`),
      price: str(pr, 'pris', x, `planer ${i + 1} → pris`),
      features: strList(pr, 'punkter', x, `planer ${i + 1} → punkter`),
      cta: str(pr, 'knap', x, `planer ${i + 1} → knap`),
      featured: x['fremhævet'] === true,
    })),
  }

  const b = doc(files, 'i-brug.md')
  const sites = {
    ...heading(b),
    linkText: str(b, 'link_tekst'),
    items: objList(b, 'steder').map((x, i) => ({
      note: str(b, 'note', x, `steder ${i + 1} → note`),
      label: str(b, 'navn', x, `steder ${i + 1} → navn`),
      href: str(b, 'link', x, `steder ${i + 1} → link`),
    })),
  }

  const q = doc(files, 'faq.md')
  const questions = { ...heading(q), items: faq(q) }

  const a = doc(files, 'afslutning.md')
  const final = {
    title: str(a, 'overskrift'),
    text: body(a),
    demoButton: str(a, 'knap_demo'),
  }

  const c = doc(files, 'kontakt.md')
  const contact = {
    labels: {
      name: str(c, 'felt_navn'),
      email: str(c, 'felt_email'),
      community: str(c, 'felt_faellesskab'),
      households: str(c, 'felt_husstande'),
      message: str(c, 'felt_besked'),
    },
    button: str(c, 'knap'),
    sending: str(c, 'knap_sender'),
    requiredNote: str(c, 'obligatorisk_note'),
    thanksTitle: str(c, 'tak_overskrift'),
    thanksText: str(c, 'tak_tekst'),
    errorText: str(c, 'fejl_tekst'),
  }

  const fo = doc(files, 'bund.md')
  const footer = {
    tagline: body(fo),
    productHeading: str(fo, 'kolonne_produkt'),
    contactHeading: str(fo, 'kolonne_kontakt'),
    versionsLink: str(fo, 'versioner_link'),
    contactLink: str(fo, 'kontakt_link'),
  }

  return { settings, hero, steps, features, meals, roles, platform, pricing, sites, questions, final, contact, footer }
}

export type Content = ReturnType<typeof loadContent>
