import { getFlaggedSignups } from '@/lib/portal/admin/flagged-signups'
import { keepFlaggedSignup, removeFlaggedSignup } from '@/lib/portal/admin/flagged-signup-actions'
import type { PortalAccountRow } from '@/lib/portal/admin/dealers'
import { ago, dateShort, num } from '@/lib/portal/admin/format'
import { signupFlagLabel } from '@/lib/pro/signup-flags'
import { ActionButton } from './controls'
import { CellLink, Panel, Table, TBody, Td, Th, THead, Tr } from './ui'

/**
 * Pro Hub sign-ups flagged as possible bots (lib/pro/signup-flags), for staff to keep or remove.
 * Shown on Portal accounts only while something is waiting. `accounts` supplies what each one
 * can see in the Pro Hub (orders and warranties under its email).
 */
export async function FlaggedSignups({ accounts }: { accounts: PortalAccountRow[] }) {
  const flagged = await getFlaggedSignups()
  if (!flagged.length) return null
  const byId = new Map(accounts.map((a) => [a.id, a]))

  return (
    <Panel
      title="Flagged sign-ups"
      meta={`${num(flagged.length)} to review · a flag changes nothing for the account until you act`}
      tone="info"
    >
      <Table>
        <THead>
          <Th>Account</Th>
          <Th>Why it was flagged</Th>
          <Th className="hidden @2xl:table-cell">Used it?</Th>
          <Th align="right" className="hidden @xl:table-cell">Can see</Th>
          <Th align="right">
            <span className="sr-only">Actions</span>
          </Th>
        </THead>
        <TBody>
          {flagged.map((f) => {
            const a = byId.get(f.id)
            return (
              <Tr key={f.id}>
                <Td className="max-w-[16rem]">
                  {a?.customerLegacyId ? (
                    <CellLink href={`/portal/admin/customers/${a.customerLegacyId}/`} className="block truncate">
                      {a.name}
                    </CellLink>
                  ) : (
                    <span className="block truncate font-semibold text-adm-ink">{a?.name ?? f.email}</span>
                  )}
                  <span className="block truncate text-[11px] text-adm-muted">
                    {f.email} · signed up {dateShort(f.created_at)}
                    {f.signup_ip && ` · IP ${f.signup_ip}`}
                  </span>
                </Td>
                <Td>
                  <ul className="list-disc space-y-0.5 pl-4 text-[12px] text-adm-text">
                    {f.reasons.map((r) => (
                      <li key={r}>{signupFlagLabel(r)}</li>
                    ))}
                  </ul>
                </Td>
                <Td muted className="hidden @2xl:table-cell">
                  {f.last_login_at ? `Signed in ${ago(f.last_login_at)}` : 'Never opened its link'}
                  {f.has_password && <span className="block text-[11px]">Has a password</span>}
                </Td>
                <Td align="right" muted className="hidden @xl:table-cell">
                  {a && (a.orders || a.warranties)
                    ? [a.orders && `${num(a.orders)} orders`, a.warranties && `${num(a.warranties)} warranties`].filter(Boolean).join(' · ')
                    : 'Nothing'}
                </Td>
                <Td align="right">
                  <span className="inline-flex flex-wrap justify-end gap-1.5">
                    <ActionButton action={keepFlaggedSignup.bind(null, f.id)}>Looks fine</ActionButton>
                    <ActionButton
                      action={removeFlaggedSignup.bind(null, f.id)}
                      tone="danger"
                      confirm={`Remove the Pro Hub account for ${f.email}? This deletes the account and signs it out. They can sign up again.`}
                    >
                      Remove
                    </ActionButton>
                  </span>
                </Td>
              </Tr>
            )
          })}
        </TBody>
      </Table>
    </Panel>
  )
}
