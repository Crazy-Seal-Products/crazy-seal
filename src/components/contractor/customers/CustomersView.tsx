'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { CustomerListItem } from '@/lib/contractor/customers'
import type { TeamOption } from '@/lib/contractor/projects'
import { dateShort } from '@/lib/portal/admin/format'
import { Panel, ViewHeader } from '@/components/portal/ui'
import { DataTable, EmptyNote, OwnerPill, SearchPill, cellCls, initials, placeLine, rowCls, rowMotion } from '../projects/kit'
import { CustomerFormButton } from './CustomerForm'

export interface CustomersViewProps {
  customers: CustomerListItem[]
  canEdit: boolean
  canAssign: boolean
  viewAll: boolean
  team: TeamOption[]
  me: string | null
}

function matches(c: CustomerListItem, q: string): boolean {
  if (!q) return true
  const hay = [c.name, c.type, c.contact_name, c.email, c.phone, c.city, c.state, c.zip].filter(Boolean).join(' ').toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word))
}

/** The Customers page, as Thermo's customer table: everyone the contractor works for (a sales rep's own), searchable. */
export function CustomersView({ customers, canEdit, canAssign, viewAll, team, me }: CustomersViewProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const q = query.trim()
  const rows = useMemo(() => customers.filter((c) => matches(c, q)), [customers, q])
  const openTotal = customers.reduce((sum, c) => sum + c.open_projects, 0)

  return (
    <div>
      <ViewHeader
        kicker={viewAll ? 'All customers' : 'My customers'}
        title={`${customers.length} customer${customers.length === 1 ? '' : 's'}`}
        description={`Homeowners, RV owners, building owners and property managers you work for · ${openTotal} open project${openTotal === 1 ? '' : 's'}`}
      >
        <SearchPill value={query} onChange={setQuery} label="Search customers" placeholder="Search" className="w-full sm:w-64" />
        {canEdit && (
          <CustomerFormButton
            team={team}
            canAssign={canAssign}
            me={me}
            onSaved={(id) => {
              if (id) router.push(`/portal/customers/${id}/`)
            }}
          />
        )}
      </ViewHeader>

      <Panel>
        {q && (
          <p className="mb-4 text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
            {rows.length} of {customers.length} match “{q}”
          </p>
        )}
        {rows.length === 0 ? (
          <EmptyNote>{customers.length ? 'No customers match.' : 'No customers yet.'}</EmptyNote>
        ) : (
          <DataTable
            minWidth={canEdit ? 900 : 840}
            head={[
              { label: 'Customer' },
              { label: 'Contact' },
              { label: 'Location' },
              { label: 'Owner' },
              { label: 'Open projects', align: 'right' },
              { label: 'Added' },
              ...(canEdit ? [{ label: 'Edit', srOnly: true }] : []),
            ]}
          >
            {rows.map((c, i) => {
              const hasContact = Boolean(c.contact_name && c.contact_name !== c.name)
              return (
                <motion.tr key={c.id} {...rowMotion(i)} className={`${rowCls} group`}>
                  <td className={cellCls}>
                    <Link href={`/portal/customers/${c.id}/`} className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-[11px] font-bold text-[var(--p-accent,#F9EA1C)] ring-1 ring-white/[0.08] transition duration-300 group-hover:bg-[var(--p-primary,#5BA411)] group-hover:bg-[image:var(--p-primary-grad)] group-hover:text-[var(--p-primary-ink,#fff)] group-hover:shadow-[var(--p-glow)]">
                        {initials(c.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold transition-colors group-hover:text-[var(--p-accent,#F9EA1C)]">{c.name}</span>
                        {c.type && <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">{c.type}</span>}
                      </span>
                    </Link>
                  </td>
                  <td className={cellCls}>
                    <span className="block">{hasContact ? c.contact_name : (c.email ?? c.phone ?? '—')}</span>
                    {hasContact && (c.email || c.phone) && <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">{c.email ?? c.phone}</span>}
                    {!hasContact && c.email && c.phone && <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">{c.phone}</span>}
                  </td>
                  <td className={`${cellCls} text-[var(--p-muted,#9DA3AB)]`}>{placeLine(c) || '—'}</td>
                  <td className={cellCls}>
                    <OwnerPill name={c.owner_name} />
                  </td>
                  <td className={`${cellCls} text-right tabular-nums`}>
                    {c.open_projects ? <span className="font-semibold">{c.open_projects}</span> : <span className="text-[var(--p-muted,#9DA3AB)]">—</span>}
                    {c.projects > c.open_projects && <span className="block text-[11px] text-[var(--p-muted,#9DA3AB)]">{c.projects} total</span>}
                  </td>
                  <td className={`${cellCls} whitespace-nowrap text-[var(--p-muted,#9DA3AB)]`}>{dateShort(c.created_at)}</td>
                  {canEdit && (
                    <td className={`${cellCls} text-right`}>
                      <CustomerFormButton
                        customer={c}
                        team={team}
                        canAssign={canAssign}
                        me={me}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--p-accent,#F9EA1C)] transition hover:bg-white/[0.06] [&_svg]:h-3.5 [&_svg]:w-3.5"
                      />
                    </td>
                  )}
                </motion.tr>
              )
            })}
          </DataTable>
        )}
      </Panel>
    </div>
  )
}
