import { loadContent } from './content-core'

export { inline, type Showcase } from './content-core'

export const content = loadContent(
  import.meta.glob('../content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
)
