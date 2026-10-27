import type { Metadata } from 'next'
import { ArrowUpRight, GraduationCap } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getPortalAccounts } from '@/lib/portal/admin/dealers'
import { DEMO_ACCOUNT, TIER_LABELS } from '@/lib/portal/accounts'
import { PORTAL_MODULES, TOTAL_LESSONS } from '@/lib/portal/modules'
import { ago, dateShort, money0, num } from '@/lib/portal/admin/format'
import {
  Badge,
  CellLink,
  Empty,
  KV,
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
import { ProInviteForm } from '@/components/portal/admin/ProInviteForm'

export const metadata: Metadata = { title: 'Portal accounts' }

export default async function AdminPortalAccountsPage() {
  await requirePortalAdmin()
  const { rows, summary } = await getPortalAccounts()

  return (
    <>
      <PageHeader
        title="Portal accounts"
        description="Everyone with a Pro Hub login, the dealer portal partners use today, plus the new Pro Portal they'll move to."
      >
        <StatGrid>
          <Stat label="Pro Hub accounts" value={num(summary.total)} tone="dealers" />
          <Stat label="Active · 7 days" value={num(summary.active7)} sub="signed in this week" />
          <Stat label="Active · 30 days" value={num(summary.active30)} sub={`of ${num(summary.total)}`} />
          <Stat label="Never signed in" value={num(summary.neverSignedIn)} sub="invited or started" tone="info" />
          <Stat label="Linked to Shopify" value={num(summary.linked)} sub="matched to a customer" tone="info" />
          <Stat label="Warranties filed" value={num(summary.warranties)} sub="by these accounts" tone="info" />
        </StatGrid>
      </PageHeader>

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <Empty>No Pro Hub accounts yet.</Empty>
          )}
        </Panel>

        <div className="grid content-start gap-2">
          <Panel title="Invite to the Pro Hub" tone="dealers">
            <ProInviteForm />
          </Panel>

          <Panel
            title="New Pro Portal · demo"
            tone="info"
            actions={
              <a
                href="/portal/demo/summit/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-highlight px-2 py-1 text-[11.5px] font-bold text-primary transition hover:bg-highlight-light"
              >
                Open demo <ArrowUpRight className="h-3 w-3" />
              </a>
            }
          >
            <KV
              rows={[
                ['Demo dealer', DEMO_ACCOUNT.company],
                ['Contact', `${DEMO_ACCOUNT.contactName} · ${DEMO_ACCOUNT.region}`],
                ['Tier', TIER_LABELS[DEMO_ACCOUNT.tier]],
                ['Dealer sign-in', 'Not live yet: dealers stay on the Pro Hub'],
              ]}
            />
            <p className="border-t border-adm-line px-3 py-2 text-[11.5px] leading-snug text-adm-muted">
              Only made-up data. When dealers move over, their training progress and white-label status will show here per account.
            </p>
          </Panel>

          <Panel title="Accelerator Program" meta={`${PORTAL_MODULES.length} modules · ${TOTAL_LESSONS} lessons`}>
            <ol className="divide-y divide-adm-line-soft text-[12.5px]">
              {PORTAL_MODULES.map((m) => (
                <li key={m.slug} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-adm-ink/[0.06] text-[10.5px] font-bold text-adm-soft">{m.number}</span>
                  <span className="min-w-0 flex-1 truncate text-adm-text">{m.title}</span>
                  <span className="flex items-center gap-1 text-[11px] text-adm-muted">
                    <GraduationCap className="h-3 w-3" />
                    {m.lessons.length}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  )
}
