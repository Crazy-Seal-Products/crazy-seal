import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getAllProjects } from '@/lib/portal/admin/projects'
import { setProjectPublished } from '@/lib/portal/admin/project-actions'
import { categoryLabel, PROJECT_CATEGORIES } from '@/lib/projects'
import { dateShort, num } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import { Badge, CellLink, Empty, PageHeader, Panel, SearchBox, Segmented, Stat, StatGrid, Table, TBody, Td, Th, THead, Toolbar, Tr } from '@/components/portal/admin/ui'
import { ActionButton } from '@/components/portal/admin/controls'
import { BUTTON } from '@/components/portal/admin/styles'

export const metadata: Metadata = { title: 'Projects' }

const BASE = '/portal/admin/projects/'
const CATEGORY_FILTERS = [{ key: 'all', label: 'All' }, ...PROJECT_CATEGORIES.map((c) => ({ key: c.slug, label: c.label }))]
const VISIBILITY = [
  { key: 'all', label: 'Any' },
  { key: 'published', label: 'Published' },
  { key: 'hidden', label: 'Hidden' },
] as const

export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const category = CATEGORY_FILTERS.some((c) => c.key === one(sp.category)) ? one(sp.category)! : 'all'
  const visibility = VISIBILITY.some((v) => v.key === one(sp.show)) ? one(sp.show)! : 'all'
  const q = one(sp.q)?.toLowerCase()
  const all = await getAllProjects()
  const searched = q ? all.filter((p) => [p.title, p.location, p.project_type, p.products_used, String(p.project_number ?? '')].some((v) => v?.toLowerCase().includes(q))) : all
  const byCategory = (c: string) => (p: (typeof all)[number]) => c === 'all' || p.category === c
  const byVisibility = (v: string) => (p: (typeof all)[number]) => v === 'all' || (v === 'published' ? p.published : !p.published)
  const rows = searched.filter(byCategory(category)).filter(byVisibility(visibility))
  const params = { category: category === 'all' ? undefined : category, show: visibility === 'all' ? undefined : visibility, q: one(sp.q) }
  const latest = all.reduce<string | null>((m, p) => (!m || p.created_at > m ? p.created_at : m), null)

  return (
    <>
      <PageHeader
        title="Projects"
        description="Project spotlights on crazyseal.com/projects. Changes go live within a few seconds."
        actions={
          <Link href={`${BASE}new/`} className={BUTTON.gold}>
            <Plus className="h-3.5 w-3.5" /> New project
          </Link>
        }
      >
        <StatGrid className="xl:grid-cols-4">
          <Stat hero label="Published" value={num(all.filter((p) => p.published).length)} sub={`of ${num(all.length)} projects`} />
          <Stat label="Hidden" value={num(all.filter((p) => !p.published).length)} tone="info" />
          <Stat label="Most common category" value={<span className="text-[15px]">{categoryLabel(mostCommon(all.map((p) => p.category)))}</span>} tone="info" />
          <Stat label="Latest added" value={<span className="text-[15px]">{dateShort(latest)}</span>} tone="info" />
        </StatGrid>
        <Toolbar>
          <Segmented options={CATEGORY_FILTERS.map((c) => ({ ...c, count: searched.filter(byCategory(c.key)).filter(byVisibility(visibility)).length }))} value={category} param="category" base={BASE} params={params} />
          <Segmented options={VISIBILITY} value={visibility} param="show" base={BASE} params={params} />
          <SearchBox base={BASE} params={params} value={one(sp.q)} placeholder="Title, number, location, product…" />
        </Toolbar>
      </PageHeader>

      <Panel>
        {rows.length ? (
          <Table>
            <THead>
              <Th>Project</Th>
              <Th className="hidden @2xl:table-cell">Category</Th>
              <Th className="hidden @3xl:table-cell">Location</Th>
              <Th className="hidden @4xl:table-cell" align="right">Photos</Th>
              <Th className="hidden @xl:table-cell">On the site</Th>
              <Th align="right">Show / hide</Th>
            </THead>
            <TBody>
              {rows.map((p) => (
                <Tr key={p.id}>
                  <Td className="max-w-[24rem]">
                    <span className="flex items-center gap-2.5">
                      <span className="h-9 w-12 shrink-0 overflow-hidden rounded border border-adm-line bg-adm-head">
                        {p.cover_photo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.cover_photo} alt="" loading="lazy" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <CellLink href={`${BASE}${p.id}/`} className="block truncate">
                          {p.title}
                        </CellLink>
                        <span className="block text-[11px] text-adm-muted">#{p.project_number ?? '—'} · {p.project_type || 'No type'}</span>
                      </span>
                    </span>
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {categoryLabel(p.category)}
                  </Td>
                  <Td muted className="hidden max-w-[12rem] truncate @3xl:table-cell">
                    {p.location || '—'}
                  </Td>
                  <Td align="right" muted className="hidden @4xl:table-cell">
                    {p.photo_urls?.length ?? 0}
                  </Td>
                  <Td className="hidden @xl:table-cell">
                    {p.published ? (
                      <a href={`/project/${p.slug}/`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        <Badge tone="good">Published</Badge>
                      </a>
                    ) : (
                      <Badge tone="neutral">Hidden</Badge>
                    )}
                  </Td>
                  <Td align="right">
                    <ActionButton action={setProjectPublished.bind(null, p.id, !p.published)} className="h-7 px-2">
                      {p.published ? 'Hide' : 'Publish'}
                    </ActionButton>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No projects match.</Empty>
        )}
      </Panel>
    </>
  )
}

function mostCommon(values: (string | null)[]): string | null {
  const counts = new Map<string, number>()
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}
