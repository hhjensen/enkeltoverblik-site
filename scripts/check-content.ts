// Validates content/*.md before the build, so a bad edit fails CI/deploy
// instead of shipping a blank page. Run: npm run check:content
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadContent } from '../src/content-core.ts'

const root = fileURLToPath(new URL('../content/', import.meta.url))
const files: Record<string, string> = {}
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith('.md')) files[`../content/${relative(root, full).split(sep).join('/')}`] = readFileSync(full, 'utf8')
  }
}
walk(root)

const ILLUSTRATIONS = ['opslagstavle', 'chat', 'aarshjul', 'booking', 'filer', 'billeder', 'naboer', 'grupper', 'notifikationer', 'menu', 'tilmelding', 'madhold', 'raavarer', 'koekken']

try {
  const c = loadContent(files)
  for (const s of [...c.features.items, ...c.meals.items]) {
    if (!ILLUSTRATIONS.includes(s.illustration)) {
      throw new Error(`ukendt illustration "${s.illustration}" (${s.kicker}). Mulige: ${ILLUSTRATIONS.join(', ')}`)
    }
  }
  console.log(`check-content: ok (${Object.keys(files).length} filer)`)
} catch (e) {
  console.error(`\nFEJL I INDHOLD: ${(e as Error).message}\n`)
  process.exit(1)
}
