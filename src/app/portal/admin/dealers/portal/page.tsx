import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getPortalAccounts } from '@/lib/portal/admin/dealers'
import { ago, dateShort, money0, num } from '@/lib/portal/admin/format'
import { ViewAsButton } from '@/components/portal/admin/ViewAsButton'
import { ProInviteButton } from '@/components/portal/admin/ProInviteButton'
import { BUTTON } from '@/components/portal/admin/styles'
import {
  Badge,
  CellLink,
  Empty,
  PageHeader,
  Panel,
  Stat,
  StatGrid,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from '@/components/portal/admin/ui'
import { PORTAL_BADGE } from '@/components/portal/admin/portal-state'

export const metadata: Metadata = { title: 'Portal accounts' }

export default async function AdminPortalAccountsPage() {
  await requirePortalAdmin()
  const { rows, summary } = await getPortalAccounts()

  return (
    <>
      <PageHeader
        title="Portal accounts"
        description="Dealers who sign in to the Pro Hub, the dealer portal live today. View as opens their Pro Hub, read-only."
        actions={
          <>
            <a href="/portal/demo/summit/" target="_blank" rel="noopener noreferrer" className={BUTTON.default} title="The new Pro Portal, with made-up data">
              New portal demo <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </a>
            <ProInviteButton />
          </>
        }
      >
        <StatGrid className="xl:grid-cols-4">
          <Stat label="Pro Hub accounts" value={num(summary.total)} sub={`${num(summary.linked)} linked to Shopify`} tone="dealers" />
          <Stat label="Active · 30 days" value={num(summary.active30)} sub={`${num(summary.active7)} this week`} />
          <Stat label="Never signed in" value={num(summary.neverSignedIn)} sub="invited or started" tone="info" />
          <Stat label="Warranties filed" value={num(summary.warranties)} sub="by these accounts" tone="info" />
        </StatGrid>
      </PageHeader>

      <Panel title="Pro Hub accounts" meta="sorted by last sign-in" tone="dealers">
        {rows.length ? (
          <Table>
            <THead>
              <Th>Account</Th>
              <Th>Status</Th>
              <Th className="hidden @2xl:table-cell">Pro status</Th>
              <Th>Last sign-in</Th>
              <Th align="right" className="hidden @xl:table-cell">Orders</Th>
              <Th align="right" className="hidden @xl:table-cell">Lifetime</Th>
              <Th className="hidden @6xl:table-cell">Sign-in</Th>
              <Th className="hidden @6xl:table-cell">Joined</Th>
              <Th align="right">
                <span className="sr-only">View as</span>
              </Th>
            </THead>
            <TBody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td className="max-w-[15rem]">
                    {r.customerLegacyId ? (
                      <CellLink href={`/portal/admin/customers/${r.customerLegacyId}/`} className="block truncate">
                        {r.name}
                      </CellLink>
                    ) : (
                      <span className="block truncate font-semibold text-adm-ink">{r.name}</span>
                    )}
                    <span className="block truncate text-[11px] text-adm-muted">
                      {r.email}
                      {r.location !== '—' && ` · ${r.location}`}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={PORTAL_BADGE[r.state].tone}>{PORTAL_BADGE[r.state].label}</Badge>
                  </Td>
                  <Td className="hidden @2xl:table-cell">
                    <span className="flex gap-1">
                      {r.statuses.map((s) => (
                        <Badge key={s} tone={s === 'Member' ? 'neutral' : 'gold'} dot={false}>
                          {s}
                        </Badge>
                      ))}
                    </span>
                  </Td>
                  <Td muted>{r.last_login_at ? `${dateShort(r.last_login_at)} · ${ago(r.last_login_at)}` : '—'}</Td>
                  <Td align="right" className="hidden @xl:table-cell">
                    {num(r.orders)}
                  </Td>
                  <Td align="right" className="hidden font-semibold text-adm-ink @xl:table-cell">
                    {money0(r.spent)}
                  </Td>
                  <Td muted className="hidden @6xl:table-cell">
                    {r.has_password ? 'Password' : 'Email link'}
                  </Td>
                  <Td muted className="hidden @6xl:table-cell">
                    {dateShort(r.created_at)}
                  </Td>
                  <Td align="right">
                    <ViewAsButton proUserId={r.id} name={r.name} />
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No Pro Hub accounts yet.</Empty>
        )}
      </Panel>
    </>
  )
}
