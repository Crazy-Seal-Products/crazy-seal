import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminSections, requirePortalAdmin } from '@/lib/portal/admin/auth'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import { ADMIN_SECTIONS, roleLabel, TOP_ROLE } from '@/lib/portal/admin/sections'
import { PageHeader, Panel } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'No access' }

/** Where requirePortalAdmin sends someone whose role can't open a section. */
export default async function AdminNoAccessPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requirePortalAdmin()
  const allowed = await getAdminSections()
  const section = one((await searchParams).section)
  const wanted = ADMIN_SECTIONS.find((s) => s.key === section)
  const open = ADMIN_SECTIONS.filter((s) => allowed.includes(s.key))

  return (
    <>
      <PageHeader
        title={wanted ? `${wanted.label} isn’t open to you` : 'No admin sections yet'}
        description={`You’re signed in as ${roleLabel(admin.role)}. A ${roleLabel(TOP_ROLE)} can change what each role can open on the Users & roles page.`}
      />
      <Panel title="Sections you can open">
        {open.length ? (
          <ul className="grid gap-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {open.map((s) => (
              <li key={s.key}>
                <Link href={s.href} className="block rounded-md border border-adm-line px-2.5 py-1.5 text-[12.5px] font-medium text-adm-ink transition hover:border-adm-blue-bright/60">
                  {s.label}
                  <span className="block text-[11px] font-normal text-adm-muted">{s.group}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-6 text-center text-[12.5px] text-adm-muted">Your role can’t open any admin sections right now.</p>
        )}
      </Panel>
    </>
  )
}
