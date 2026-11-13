import type { Metadata } from 'next'
import Link from 'next/link'
import { X } from 'lucide-react'
import { adminCan, requirePortalAdmin, type PortalAdmin } from '@/lib/portal/admin/auth'
import { recentAccess } from '@/lib/portal/admin/access-log'
import { ago, dateShort, dateTime, money0, num } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import { getPermissionMatrix, sectionsForRole } from '@/lib/portal/admin/permissions'
import {
  ADMIN_ROLES,
  ADMIN_SECTIONS,
  assignableRoles,
  canEditPermissions,
  canManageRole,
  roleLabel,
  TOP_ROLE,
} from '@/lib/portal/admin/sections'
import { resetStaffPassword, setStaffActive, setStaffRole } from '@/lib/portal/admin/staff-actions'
import {
  ACCOUNT_TYPE_LABEL,
  accessText,
  getAdminUsers,
  getUserDetail,
  signedInWithin,
  USER_STATUS,
  type AdminUserRow,
} from '@/lib/portal/admin/users'
import { AddStaffButton, AddStaffForm } from '@/components/portal/admin/AddStaffForm'
import { ActionButton, StatusSelect } from '@/components/portal/admin/controls'
import { PermissionMatrix } from '@/components/portal/admin/PermissionMatrix'
import { ViewAsButton } from '@/components/portal/admin/ViewAsButton'
import {
  Badge,
  CellLink,
  Empty,
  hrefWith,
  KV,
  PageHeader,
  Pagination,
  Panel,
  SearchBox,
  Segmented,
  Stat,
  StatGrid,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Toolbar,
  Tr,
} from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Users & roles' }

const BASE = '/portal/admin/users/'
const PER_PAGE = 50

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'roles', label: 'Roles & permissions' },
] as const

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'staff', label: 'Admin staff' },
  { key: 'dealer', label: 'Pro Hub dealers' },
  { key: 'other', label: 'Other logins' },
] as const

const STATUSES = [
  { key: 'all', label: 'Any status' },
  { key: 'active', label: 'Active' },
  { key: 'idle', label: 'Idle 30d+' },
  { key: 'never', label: 'Never signed in' },
  { key: 'off', label: 'No access' },
] as const

const ROLES = [{ key: 'all', label: 'Any role' }, ...ADMIN_ROLES.map((r) => ({ key: r.key, label: r.label }))] as const

function typeMatches(row: AdminUserRow, type: string) {
  if (type === 'all') return true
  if (type === 'other') return row.type === 'backup' || row.type === 'login'
  return row.type === type
}

const ROLE_TONE = { developer: 'gold', admin: 'good', staff: 'info', sales_rep: 'neutral' } as const

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const me = await requirePortalAdmin('users')
  const sp = await searchParams
  const tab = pick(sp.tab, TABS, 'users')
  const type = pick(sp.type, TYPES, 'all')
  const status = pick(sp.status, STATUSES, 'all')
  const role = pick(sp.role, ROLES, 'all')
  const q = one(sp.q)
  const selected = one(sp.u)
  const params = { tab: tab === 'users' ? undefined : tab, type: type === 'all' ? undefined : type, status: status === 'all' ? undefined : status, role: role === 'all' ? undefined : role, q, u: selected }

  const users = await getAdminUsers()
  const staff = users.filter((u) => u.type === 'staff')
  const dealers = users.filter((u) => u.type === 'dealer')
  const roleCounts = Object.fromEntries(ADMIN_ROLES.map((r) => [r.key, users.filter((u) => u.role === r.key && u.status !== 'off').length]))
  const addable = assignableRoles(me.role).map((r) => ({ key: r, label: roleLabel(r) }))

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Everyone who can sign in: admin staff, backup logins and Pro Hub dealers. A staff member’s role decides which admin sections they can open."
        actions={addable.length > 0 && <AddStaffButton roles={addable} defaultRole={addable.some((r) => r.key === 'admin') ? 'admin' : addable[0].key} />}
      >
        <StatGrid className="xl:grid-cols-5">
          <Stat label="Admin staff" value={num(staff.filter((s) => s.status !== 'off').length)} sub={`${num(staff.length)} on the list`} tone="info" />
          <Stat label="Developers" value={num(roleCounts.developer)} sub={`${num(roleCounts.admin)} admins · ${num(roleCounts.staff)} staff · ${num(roleCounts.sales_rep)} sales reps`} tone="dealers" />
          <Stat label="Pro Hub dealers" value={num(dealers.length)} sub={`${num(dealers.filter((d) => d.status === 'active').length)} active · 30 days`} tone="dealers" />
          <Stat label="Signed in · 7 days" value={num(signedInWithin(users, 7))} sub="all account types" />
          <Stat label="Never signed in" value={num(users.filter((u) => u.status === 'never').length)} sub="invited or added" tone="info" />
        </StatGrid>
      </PageHeader>

      <Segmented options={TABS} value={tab} param="tab" base={BASE} params={{ ...params, u: undefined }} className="mb-2 w-fit" />

      {tab === 'roles' ? (
        <RolesTab me={me} counts={roleCounts} users={users} />
      ) : (
        <UsersTab me={me} users={users} filters={{ type, status, role, q }} params={params} page={pageNum(sp.page)} selected={selected} />
      )}
    </>
  )
}

async function UsersTab({
  me,
  users,
  filters,
  params,
  page,
  selected,
}: {
  me: PortalAdmin
  users: AdminUserRow[]
  filters: { type: string; status: string; role: string; q?: string }
  params: Record<string, string | undefined>
  page: number
  selected?: string
}) {
  const needle = filters.q?.toLowerCase()
  const rows = users.filter(
    (u) =>
      typeMatches(u, filters.type) &&
      (filters.status === 'all' || u.status === filters.status) &&
      (filters.role === 'all' || u.role === filters.role) &&
      (!needle || [u.name, u.email, u.business].some((v) => v?.toLowerCase().includes(needle))),
  )
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE))
  const current = Math.min(page, pages)
  const shown = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const typeCounts = { all: users.length, staff: users.filter((u) => u.type === 'staff').length, dealer: users.filter((u) => u.type === 'dealer').length, other: users.filter((u) => typeMatches(u, 'other')).length }
  const detailRow = selected ? users.find((u) => u.key === selected) : undefined
  const listParams = { ...params, page: current > 1 ? String(current) : undefined }

  return (
    // Sized by the content area (it narrows when the activity rail is open), so the
    // detail panel only sits beside the table when both fit.
    <div className="@container">
      <div className={detailRow ? 'grid grid-cols-1 gap-2 @5xl:grid-cols-[minmax(0,1fr)_380px]' : 'grid grid-cols-1 gap-2'}>
        <div className="grid min-w-0 grid-cols-1 content-start gap-2">
          <Toolbar>
            <Segmented options={TYPES.map((t) => ({ ...t, count: typeCounts[t.key] }))} value={filters.type} param="type" base={BASE} params={{ ...params, u: undefined }} />
            <SearchBox base={BASE} params={{ ...params, u: undefined }} value={filters.q} placeholder="Name, email or business…" />
          </Toolbar>
          <Toolbar>
            <Segmented options={STATUSES} value={filters.status} param="status" base={BASE} params={{ ...params, u: undefined }} />
            {(filters.type === 'all' || filters.type === 'staff' || filters.type === 'other') && (
              <Segmented options={ROLES} value={filters.role} param="role" base={BASE} params={{ ...params, u: undefined }} />
            )}
          </Toolbar>

          <Panel title="Accounts" meta="staff first, then by last sign-in" tone="info">
            {shown.length ? (
              <Table>
                <THead>
                  <Th>Name</Th>
                  <Th className="hidden @lg:table-cell">Type</Th>
                  <Th>Role</Th>
                  <Th className="hidden @md:table-cell">Status</Th>
                  <Th>Last sign-in</Th>
                  <Th className="hidden @3xl:table-cell">Created</Th>
                </THead>
                <TBody>
                  {shown.map((u) => (
                    <Tr key={u.key} className={u.key === selected ? 'bg-adm-blue-bright/[0.08]' : undefined}>
                      <Td className="max-w-[16rem]">
                        <CellLink href={hrefWith(BASE, listParams, { u: u.key })} className="block truncate">
                          {u.name}
                          {u.email === me.email && <span className="ml-1.5 text-[11px] font-normal text-adm-muted">(you)</span>}
                        </CellLink>
                        <span className="block truncate text-[11px] text-adm-muted">
                          {u.email}
                          {u.business && ` · ${u.business}`}
                        </span>
                      </Td>
                      <Td muted className="hidden @lg:table-cell">
                        {ACCOUNT_TYPE_LABEL[u.type]}
                      </Td>
                      <Td>
                        {u.role ? (
                          <Badge tone={ROLE_TONE[u.role]} dot={false}>
                            {roleLabel(u.role)}
                          </Badge>
                        ) : (
                          <span className="text-adm-faint">—</span>
                        )}
                        {u.backup && u.type === 'staff' && <span className="ml-1 text-[10.5px] text-adm-muted">+ backup</span>}
                      </Td>
                      <Td className="hidden @md:table-cell">
                        <Badge tone={USER_STATUS[u.status].tone}>{USER_STATUS[u.status].label}</Badge>
                      </Td>
                      <Td muted title={u.lastSignInAt ? dateTime(u.lastSignInAt) : undefined}>
                        {u.lastSignInAt ? ago(u.lastSignInAt) : u.type === 'backup' ? 'Not logged yet' : 'Never'}
                      </Td>
                      <Td muted className="hidden @3xl:table-cell">
                        {u.createdAt ? dateShort(u.createdAt) : '—'}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <Empty>No accounts match.</Empty>
            )}
            <Pagination page={current} pages={pages} total={rows.length} base={BASE} params={{ ...params, u: undefined }} noun="accounts" />
          </Panel>
        </div>

        {detailRow && (
          <div className="order-first grid content-start gap-2 @5xl:order-none">
            <UserPanel me={me} row={detailRow} users={users} closeHref={hrefWith(BASE, listParams, { u: undefined })} />
          </div>
        )}
      </div>
    </div>
  )
}

async function UserPanel({ me, row, users, closeHref }: { me: PortalAdmin; row: AdminUserRow; users: AdminUserRow[]; closeHref: string }) {
  const [detail, sections, canViewAs] = await Promise.all([
    getUserDetail(row, users),
    row.role ? sectionsForRole(row.role) : Promise.resolve([]),
    adminCan('view_as'),
  ])
  const self = row.email === me.email
  const manageable = row.type === 'staff' && row.role !== null && !self && canManageRole(me.role, row.role)
  const roles = assignableRoles(me.role)
  const dealer = row.dealer

  const facts: [React.ReactNode, React.ReactNode][] = [
    ['Account', ACCOUNT_TYPE_LABEL[row.type]],
    ['Sign-in', row.signIn],
    ['Last sign-in', row.lastSignInAt ? `${dateTime(row.lastSignInAt)} · ${ago(row.lastSignInAt)}` : 'Never'],
    ['Created', row.createdAt ? dateShort(row.createdAt) : '—'],
  ]
  if (detail.auth) {
    facts.push(['Email confirmed', detail.auth.confirmedAt ? dateShort(detail.auth.confirmedAt) : 'No'])
    facts.push(['Two-step sign-in', detail.auth.factors ? `${detail.auth.factors} factor${detail.auth.factors === 1 ? '' : 's'}` : 'Off'])
    if (detail.auth.bannedUntil) facts.push(['Blocked until', dateShort(detail.auth.bannedUntil)])
  }
  if (dealer) {
    if (dealer.business_name) facts.push(['Business', dealer.business_name])
    facts.push(['Pro status', dealer.statuses.join(', ') || '—'])
    facts.push(['Orders', `${num(dealer.orders)} · ${money0(dealer.spent)}`])
    facts.push(['Warranties filed', num(dealer.warranties)])
  }

  return (
    <Panel
      title={row.name}
      meta={row.email}
      tone={row.type === 'dealer' ? 'dealers' : 'info'}
      actions={
        <Link href={closeHref} scroll={false} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md border border-adm-line text-adm-soft transition hover:text-adm-ink">
          <X className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="flex flex-wrap items-center gap-1.5 px-3 pt-2.5">
        <Badge tone={USER_STATUS[row.status].tone}>{USER_STATUS[row.status].label}</Badge>
        {row.role && (
          <Badge tone={ROLE_TONE[row.role]} dot={false}>
            {roleLabel(row.role)}
          </Badge>
        )}
        {row.backup && (
          <Badge tone="gold" dot={false}>
            Backup login · {roleLabel(TOP_ROLE)}
          </Badge>
        )}
        {self && <span className="text-[11px] text-adm-muted">This is you</span>}
      </div>

      <KV rows={facts} className="mt-1.5" />

      {row.type === 'staff' && row.staffId && (
        <Section title="Access">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-adm-muted">Role</span>
            {manageable && row.status !== 'off' && roles.length > 1 ? (
              <StatusSelect
                value={row.role!}
                options={ADMIN_ROLES.filter((r) => roles.includes(r.key) || r.key === row.role).map((r) => ({ key: r.key, label: r.label }))}
                action={setStaffRole.bind(null, row.staffId)}
                label={`Role for ${row.name}`}
              />
            ) : (
              <span className="text-[12.5px] font-semibold text-adm-ink">{roleLabel(row.role)}</span>
            )}
          </div>
          {manageable && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {row.status !== 'off' ? (
                <>
                  {row.authUserId && (
                    <ActionButton
                      action={resetStaffPassword.bind(null, row.staffId)}
                      confirm={`Set a new temporary password for ${row.name}? Their current password stops working.`}
                    >
                      Reset password
                    </ActionButton>
                  )}
                  <ActionButton action={setStaffActive.bind(null, row.staffId, false)} confirm={`Remove admin access for ${row.name}?`} tone="danger">
                    Turn off access
                  </ActionButton>
                </>
              ) : (
                <ActionButton action={setStaffActive.bind(null, row.staffId, true)}>Turn access back on</ActionButton>
              )}
            </div>
          )}
          {!manageable && !self && (
            <p className="mt-1.5 text-[11.5px] text-adm-muted">
              {roleLabel(me.role)}s can’t change a {roleLabel(row.role)}. Ask a {roleLabel(TOP_ROLE)}.
            </p>
          )}
          {self && <p className="mt-1.5 text-[11.5px] text-adm-muted">You can’t change your own role or access. Ask another {roleLabel(TOP_ROLE)}.</p>}
        </Section>
      )}

      {row.type === 'backup' && (
        <Section title="Access">
          <p className="text-[11.5px] leading-snug text-adm-muted">
            A backup login from PORTAL_ADMIN_USERS on Vercel. It always signs in as {roleLabel(TOP_ROLE)} and is changed in the environment settings, not here.
          </p>
        </Section>
      )}

      {row.type === 'login' && (
        <Section title="Access">
          <p className="mb-1 text-[11.5px] leading-snug text-adm-muted">This Supabase login isn’t on the staff list, so it can’t open the admin.</p>
          {roles.length > 0 ? (
            <div className="-mx-3 -mb-2">
              <AddStaffForm roles={roles.map((r) => ({ key: r, label: roleLabel(r) }))} defaultRole={roles.includes('staff') ? 'staff' : roles[0]} name={row.name === row.email ? '' : row.name} email={row.email} submitLabel="Give admin access" />
            </div>
          ) : null}
        </Section>
      )}

      {row.role && row.status !== 'off' && (
        <Section title={`Can open · ${sections.length} of ${ADMIN_SECTIONS.length}`}>
          <p className="flex flex-wrap gap-1">
            {ADMIN_SECTIONS.map((s) => (
              <span
                key={s.key}
                className={
                  sections.includes(s.key)
                    ? 'rounded bg-adm-blue-bright/12 px-1.5 py-0.5 text-[10.5px] font-medium text-adm-blue-bright ring-1 ring-inset ring-adm-blue-bright/30'
                    : 'rounded px-1.5 py-0.5 text-[10.5px] text-adm-faint line-through ring-1 ring-inset ring-adm-ink/10'
                }
              >
                {s.label}
              </span>
            ))}
          </p>
        </Section>
      )}

      {row.type === 'dealer' && row.proUserId && (
        <Section title="Pro Hub">
          <div className="flex flex-wrap gap-1.5">
            {canViewAs && <ViewAsButton proUserId={row.proUserId} name={row.name} />}
            {dealer?.customerLegacyId && (
              <Link href={`/portal/admin/customers/${dealer.customerLegacyId}/`} className="inline-flex h-7 items-center rounded-md border border-adm-line px-2 text-[11.5px] font-medium text-adm-soft transition hover:text-adm-ink">
                Shopify customer
              </Link>
            )}
          </div>
        </Section>
      )}

      {detail.linked.length > 0 && (
        <Section title="Same email, other accounts">
          <ul className="space-y-0.5 text-[12px]">
            {detail.linked.map((l) => (
              <li key={l.key}>
                <CellLink href={hrefWith(BASE, {}, { u: l.key })}>{ACCOUNT_TYPE_LABEL[l.type]}</CellLink>
                <span className="text-adm-muted"> · {USER_STATUS[l.status].label}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Recent activity">
        {detail.activity.length ? (
          <ol className="space-y-1">
            {detail.activity.map((a, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 text-[12px]">
                {a.href ? (
                  <CellLink href={a.href} className="min-w-0 truncate font-medium">
                    {a.text}
                  </CellLink>
                ) : (
                  <span className="min-w-0 truncate">{a.text}</span>
                )}
                <span className="shrink-0 text-[10.5px] text-adm-muted" title={dateTime(a.at)}>
                  {ago(a.at)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[12px] text-adm-muted">Nothing recorded yet.</p>
        )}
      </Section>

      {detail.access.length > 0 && (
        <Section title="Access changes">
          <ol className="space-y-1">
            {detail.access.map((l) => (
              <li key={l.id} className="text-[12px] leading-snug">
                <span className="text-adm-ink">{accessText(l)}</span>
                <span className="text-adm-muted">
                  {' '}
                  · {l.actor_email === row.email ? `for ${l.target_email ?? 'everyone'}` : `by ${l.actor_name || l.actor_email}`} · {ago(l.created_at)}
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </Panel>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-adm-line px-3 py-2">
      <h3 className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-adm-muted">{title}</h3>
      {children}
    </section>
  )
}

async function RolesTab({ me, counts, users }: { me: PortalAdmin; counts: Record<string, number>; users: AdminUserRow[] }) {
  const [matrix, log] = await Promise.all([getPermissionMatrix(), recentAccess({ limit: 30 })])
  const changes = log.filter((l) => l.action !== 'sign_in')

  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Panel title="Permission matrix" meta="which sections each role can open" tone="info">
        <PermissionMatrix matrix={matrix} canEdit={canEditPermissions(me.role)} counts={counts} />
      </Panel>

      <div className="grid content-start gap-2">
        <Panel title="Roles">
          <ul className="divide-y divide-adm-line-soft">
            {ADMIN_ROLES.map((r) => {
              const people = users.filter((u) => u.role === r.key && u.status !== 'off')
              return (
                <li key={r.key} className="px-3 py-2">
                  <p className="flex items-center gap-2 text-[12.5px] font-semibold text-adm-ink">
                    <Badge tone={ROLE_TONE[r.key]} dot={false}>
                      {r.label}
                    </Badge>
                    <span className="text-[11px] font-normal text-adm-muted">{people.length}</span>
                  </p>
                  <p className="mt-1 text-[11.5px] leading-snug text-adm-muted">{r.description}</p>
                  {people.length > 0 && (
                    <p className="mt-1 text-[11.5px] leading-snug">
                      {people.map((p, i) => (
                        <span key={p.key}>
                          {i > 0 && ', '}
                          <CellLink href={hrefWith(BASE, {}, { u: p.key })} className="font-medium">
                            {p.name}
                          </CellLink>
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="border-t border-adm-line px-3 py-2 text-[11px] leading-snug text-adm-muted">
            Developers manage everyone and this matrix. Admins can add Staff and Sales reps and switch their access off and on. Nobody can change their own role, and the last active Developer can’t be removed.
          </p>
        </Panel>

        <Panel title="Recent access changes">
          {changes.length ? (
            <ol className="divide-y divide-adm-line-soft">
              {changes.map((l) => {
                const detail = l.detail as { changes?: string[] } | null
                return (
                  <li key={l.id} className="px-3 py-1.5 text-[12px] leading-snug">
                    <span className="font-medium text-adm-ink">{accessText(l)}</span>
                    {l.target_email && <span className="text-adm-soft"> · {l.target_email}</span>}
                    {detail?.changes && <span className="block text-[11px] text-adm-muted">{detail.changes.join(', ')}</span>}
                    <span className="block text-[10.5px] text-adm-muted">
                      by {l.actor_name || l.actor_email} · {ago(l.created_at)}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : (
            <Empty>No changes yet.</Empty>
          )}
        </Panel>
      </div>
    </div>
  )
}
