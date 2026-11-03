import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getStaff } from '@/lib/portal/admin/staff'
import { resetStaffPassword, setStaffActive } from '@/lib/portal/admin/staff-actions'
import { ago, dateShort, num } from '@/lib/portal/admin/format'
import { AddStaffForm } from '@/components/portal/admin/AddStaffForm'
import { ActionButton } from '@/components/portal/admin/controls'
import { Badge, Empty, PageHeader, Panel, Stat, StatGrid, Table, TBody, Td, Th, THead, Tr } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Staff' }

export default async function AdminStaffPage() {
  const me = await requirePortalAdmin()
  const staff = await getStaff()
  const active = staff.filter((s) => s.is_active)
  const recent = active.filter((s) => s.recent)

  return (
    <>
      <PageHeader
        title="Staff"
        description="Who can sign in to the Crazy Seal Admin. Staff use the same email and password they used for the old site admin."
      >
        <StatGrid>
          <Stat label="Active staff" value={num(active.length)} tone="info" />
          <Stat label="Signed in · 30 days" value={num(recent.length)} sub={`of ${num(active.length)}`} />
          <Stat label="Deactivated" value={num(staff.length - active.length)} sub="no access" />
        </StatGrid>
      </PageHeader>

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Staff accounts" meta="deactivated staff can't sign in">
          {staff.length ? (
            <Table>
              <THead>
                <Th>Name</Th>
                <Th className="hidden @xl:table-cell">Email</Th>
                <Th className="hidden @lg:table-cell">Status</Th>
                <Th className="hidden @2xl:table-cell">Last sign-in</Th>
                <Th className="hidden @4xl:table-cell">Added</Th>
                <Th align="right">Actions</Th>
              </THead>
              <TBody>
                {staff.map((s) => {
                  const self = s.email.toLowerCase() === me.email
                  return (
                    <Tr key={s.id}>
                      <Td>
                        <span className="font-medium text-adm-ink">{s.name || s.email}</span>
                        {self && <span className="ml-1.5 text-[11px] text-adm-muted">(you)</span>}
                        <span className="block text-[11.5px] text-adm-muted @xl:hidden">{s.email}</span>
                        {!s.is_active && (
                          <span className="mt-1 block @lg:hidden">
                            <Badge tone="neutral">Deactivated</Badge>
                          </span>
                        )}
                      </Td>
                      <Td muted className="hidden @xl:table-cell">
                        {s.email}
                      </Td>
                      <Td className="hidden @lg:table-cell">
                        <Badge tone={s.is_active ? 'good' : 'neutral'}>{s.is_active ? 'Active' : 'Deactivated'}</Badge>
                      </Td>
                      <Td muted className="hidden @2xl:table-cell">
                        {s.lastSignInAt ? ago(s.lastSignInAt) : 'Never'}
                      </Td>
                      <Td muted className="hidden @4xl:table-cell">
                        {s.created_at ? dateShort(s.created_at) : '—'}
                      </Td>
                      <Td align="right">
                        <span className="inline-flex flex-wrap justify-end gap-1.5">
                          {s.auth_user_id && s.is_active && (
                            <ActionButton
                              action={resetStaffPassword.bind(null, s.id)}
                              confirm={`Set a new temporary password for ${s.name || s.email}? Their current password stops working.`}
                            >
                              Reset password
                            </ActionButton>
                          )}
                          {!self &&
                            (s.is_active ? (
                              <ActionButton
                                action={setStaffActive.bind(null, s.id, false)}
                                confirm={`Remove admin access for ${s.name || s.email}?`}
                                tone="danger"
                              >
                                Deactivate
                              </ActionButton>
                            ) : (
                              <ActionButton action={setStaffActive.bind(null, s.id, true)}>Reactivate</ActionButton>
                            ))}
                        </span>
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          ) : (
            <Empty>No staff yet.</Empty>
          )}
        </Panel>

        <div className="grid content-start gap-2">
          <Panel title="Add a staff member">
            <AddStaffForm />
          </Panel>
        </div>
      </div>
    </>
  )
}
