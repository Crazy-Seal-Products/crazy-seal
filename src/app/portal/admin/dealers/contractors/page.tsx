import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Plus } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { one, pick, type SearchParams } from '@/lib/portal/admin/params'
import { listAdminContractors } from '@/lib/contractors/data'
import type { AdminContractor } from '@/lib/contractors/types'
import { ContractorsBoard } from '@/components/portal/admin/ContractorsBoard'
import { HelpTip } from '@/components/portal/admin/HelpTip'
import { BUTTON } from '@/components/portal/admin/styles'
import { PageHeader, SearchBox, Segmented, Toolbar } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Contractors' }

const BASE = '/portal/admin/dealers/contractors/'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'rv', label: 'RV' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'unmapped', label: 'Not on the map' },
  { key: 'hidden', label: 'Hidden' },
] as const

type Filter = (typeof FILTERS)[number]['key']

const test = (f: Filter, c: AdminContractor) =>
  f === 'rv' || f === 'commercial' ? c.segment === f : f === 'unmapped' ? c.lat === null : f === 'hidden' ? !c.isListed : true

export default async function AdminContractorsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('contractors')
  const sp = await searchParams
  const q = one(sp.q)?.toLowerCase()
  const filter = pick(sp.filter, FILTERS, 'all')
  const all = await listAdminContractors()

  const searched = q
    ? all.filter((c) => [c.name, c.contact, c.email, c.city, c.state, c.zip, c.slug].some((v) => v?.toLowerCase().includes(q)))
    : all
  const rows = searched.filter((c) => test(filter, c))
  const params = { q: one(sp.q), filter: filter === 'all' ? undefined : filter }

  return (
    <>
      <PageHeader
        title={
          <HelpTip id="contractors-help" title="Contractors">
            Certified installers from the dealer list. Each one has a white-label page at /contractor/&lt;their name&gt; with a quote request form. Click a
            pin or a name in the list to open it, and edit a contractor to change their details, colors and logo.
          </HelpTip>
        }
        actions={
          <>
            <a href="/contractor/" target="_blank" rel="noopener noreferrer" className={BUTTON.default}>
              Public finder <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </a>
            <Link href="/portal/admin/dealers/contractors/new/" className={BUTTON.gold}>
              <Plus className="h-3.5 w-3.5" /> Add contractor
            </Link>
          </>
        }
      />

      <Toolbar className="mb-2">
        <Segmented options={FILTERS.map((f) => ({ ...f, count: searched.filter((c) => test(f.key, c)).length }))} value={filter} param="filter" base={BASE} params={params} />
        <SearchBox base={BASE} params={params} value={one(sp.q)} placeholder="Contractor, city, state, ZIP…" />
      </Toolbar>

      {/* Keyed so a new filter or search starts the list back at 10. */}
      <ContractorsBoard key={`${filter}:${q ?? ''}`} rows={rows} />
    </>
  )
}
