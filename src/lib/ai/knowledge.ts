import { createAdminClient } from '@/lib/supabase/admin'
import { KNOWLEDGE_RESULTS } from './config'

/**
 * What the assistants answer from: chunks of the public crazyseal.com pages
 * (refreshed from the admin) plus notes staff write when a review finds a
 * gap. Search is Postgres full-text (see ai_search_knowledge in migration 019).
 */

/** Pages read into the knowledge base. `dealer` pages are only given to the Pro Hub and staff assistants. */
export const KNOWLEDGE_PAGES: { path: string; audience: 'all' | 'dealer' }[] = [
  { path: '/faq/', audience: 'all' },
  { path: '/warranty/', audience: 'all' },
  { path: '/products/', audience: 'all' },
  { path: '/products/crazy-caulk/', audience: 'all' },
  { path: '/products/crazy-clean/', audience: 'all' },
  { path: '/products/crazy-patch/', audience: 'all' },
  { path: '/products/crazy-seal-roof-membrane/', audience: 'all' },
  { path: '/products/crazy-tape/', audience: 'all' },
  { path: '/technical-data/', audience: 'all' },
  { path: '/installation/', audience: 'all' },
  { path: '/installation/direct-to-deck/', audience: 'all' },
  { path: '/installation/membrane-roof/', audience: 'all' },
  { path: '/return-policy/', audience: 'all' },
  { path: '/shipping/', audience: 'all' },
  { path: '/ordering/', audience: 'all' },
  { path: '/custom-orders/', audience: 'all' },
  { path: '/advantages/', audience: 'all' },
  { path: '/crazy-seal/', audience: 'all' },
  { path: '/about/', audience: 'all' },
  { path: '/rv-roofing/', audience: 'all' },
  { path: '/commercial-roofing/', audience: 'all' },
  { path: '/kit-builder/', audience: 'all' },
  { path: '/professionals/', audience: 'all' },
  { path: '/professionals/rv/', audience: 'all' },
  { path: '/professionals/facilities/', audience: 'all' },
  { path: '/professionals/restaurants/', audience: 'all' },
  { path: '/business-accelerator-program/', audience: 'all' },
  { path: '/professional-tools/', audience: 'dealer' },
  { path: '/ways-to-earn/', audience: 'dealer' },
  { path: '/resources/sales/', audience: 'dealer' },
  { path: '/resources/sales/rv/', audience: 'dealer' },
  { path: '/resources/sales/facilities/', audience: 'dealer' },
  { path: '/resources/warranty/', audience: 'dealer' },
  { path: '/resources/installation/', audience: 'dealer' },
  { path: '/resources/building-a-kit/', audience: 'dealer' },
  { path: '/resources/welcome-to-crazy-seal/', audience: 'dealer' },
]

export interface KnowledgeHit {
  id: string
  source: 'page' | 'note'
  url: string | null
  title: string
  body: string
  rank: number
}

export async function searchKnowledge(query: string, includeDealer: boolean, max = KNOWLEDGE_RESULTS): Promise<KnowledgeHit[]> {
  const q = query.slice(0, 500)
  const { data, error } = await createAdminClient().rpc('ai_search_knowledge', {
    q,
    include_dealer: includeDealer,
    max_rows: max,
  })
  if (error) {
    console.error('[ai/knowledge] search failed', error.message)
    return []
  }
  return (data ?? []) as KnowledgeHit[]
}

/** The hits as numbered reference material for the model. */
export function formatKnowledge(hits: KnowledgeHit[]): string {
  if (!hits.length) return 'No reference material matched this question.'
  return hits
    .map((h, i) => `[${i + 1}] ${h.title}${h.url ? ` (${h.url})` : ''}\n${h.body}`)
    .join('\n\n---\n\n')
}

// ─── Refreshing site pages ───────────────────────────────────────────────

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', reg: '®', trade: '™', deg: '°' }

function decode(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
}

/** Readable text of a page's main content, keeping paragraph breaks. */
export function pageText(html: string): { title: string; text: string } {
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s*\|.*$/, '').trim()
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html
  const text = decode(
    main
      .replace(/<(script|style|noscript|svg|template|iframe)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/summary|\/details)[^>]*>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<[^>]+>/g, ' '),
  )
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
  return { title, text }
}

/** Splits text into ~350-word chunks on line breaks, with a little overlap. */
export function chunkText(text: string, words = 350, overlap = 40): string[] {
  const lines = text.split('\n')
  const chunks: string[] = []
  let current: string[] = []
  let count = 0
  for (const line of lines) {
    const n = line.split(' ').length
    if (count + n > words && current.length) {
      chunks.push(current.join('\n'))
      const tail = current.join(' ').split(' ').slice(-overlap).join(' ')
      current = [tail]
      count = overlap
    }
    current.push(line)
    count += n
  }
  if (current.length && count > overlap / 2) chunks.push(current.join('\n'))
  return chunks
}

export interface RefreshResult {
  pages: number
  chunks: number
  failed: string[]
}

/** Re-reads every page in KNOWLEDGE_PAGES from the live site and replaces the page chunks. */
export async function refreshSiteKnowledge(origin: string): Promise<RefreshResult> {
  const rows: Record<string, unknown>[] = []
  const failed: string[] = []
  let pages = 0

  const queue = [...KNOWLEDGE_PAGES]
  async function worker() {
    for (let page = queue.shift(); page; page = queue.shift()) {
      const url = `${origin}${page.path}`
      try {
        const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'CrazySealAssistant/1.0 (knowledge refresh)' }, cache: 'no-store' })
        // A login redirect or a missing page is skipped, not stored.
        if (!res.ok || /\/(login|pro\/login)\/?$/.test(new URL(res.url).pathname)) throw new Error(`HTTP ${res.status}`)
        const { title, text } = pageText(await res.text())
        if (text.length < 200) throw new Error('no readable content')
        const parts = chunkText(text)
        parts.forEach((body, i) =>
          rows.push({
            source: 'page',
            audience: page.audience,
            url: `${origin.replace(/^http:\/\/localhost:\d+/, 'https://crazyseal.com')}${page.path}`,
            title: parts.length > 1 ? `${title || page.path} (part ${i + 1})` : title || page.path,
            body,
            position: i,
          }),
        )
        pages++
      } catch (err) {
        failed.push(`${page.path}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()])

  if (!rows.length) return { pages: 0, chunks: 0, failed }

  const supabase = createAdminClient()
  const { error: delError } = await supabase.from('ai_knowledge').delete().eq('source', 'page')
  if (delError) throw new Error(`Could not clear old page knowledge: ${delError.message}`)
  const { error } = await supabase.from('ai_knowledge').insert(rows)
  if (error) throw new Error(`Could not save page knowledge: ${error.message}`)
  return { pages, chunks: rows.length, failed }
}
