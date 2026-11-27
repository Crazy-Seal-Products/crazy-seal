import { createAdminClient } from '@/lib/supabase/admin'
import { adminCan } from '@/lib/portal/admin/auth'
import { listTeam } from '@/lib/contractor/team-data'
import { AccountPanel, type RepOption, type TierOption } from './AccountPanel'
import { OpenPortalButton } from './OpenPortalButton'
import { TeamPanel } from './TeamPanel'

interface AccountRow {
  email: string | null
  first_name: string | null
  goes_by: string | null
  last_name: string | null
  pricing_tier_id: string | null
  rep_id: string | null
  payment_terms: 'card' | 'terms' | null
}

/**
 * The contractor portal panels on an admin contractor page: their team (with
 * Open portal) and their pricing and account terms. Loads its own data so the
 * page only has to place it.
 */
export async function ContractorPortalPanels({ contractorId, name }: { contractorId: string; name: string }) {
  const db = createAdminClient()
  const [team, account, tiers, reps, canViewAs] = await Promise.all([
    listTeam(contractorId),
    db
      .from('contractors')
      .select('email, first_name, goes_by, last_name, pricing_tier_id, rep_id, payment_terms')
      .eq('id', contractorId)
      .maybeSingle<AccountRow>(),
    db
      .from('pricing_tiers')
      .select('id, name, discount_pct, active')
      .eq('audience', 'contractor')
      .order('sort')
      .order('name')
      .returns<{ id: string; name: string; discount_pct: number; active: boolean }[]>(),
    db.from('sales_reps').select('id, name, is_active').order('name').returns<{ id: string; name: string; is_active: boolean }[]>(),
    adminCan('view_as'),
  ])
  if (account.error) throw new Error(`contractors: ${account.error.message}`)
  const row = account.data
  if (!row) return null

  const tierId = row.pricing_tier_id ?? ''
  const repId = row.rep_id ?? ''
  const tierOptions: TierOption[] = (tiers.data ?? [])
    .filter((t) => t.active || t.id === tierId)
    .map((t) => ({ id: t.id, name: t.name, discountPct: Number(t.discount_pct) || 0, active: t.active }))
  const repOptions: RepOption[] = (reps.data ?? []).filter((r) => r.is_active || r.id === repId).map((r) => ({ id: r.id, name: r.name, active: r.is_active }))
  if (tiers.error) console.error('[contractor-portal] pricing tiers', tiers.error.message)
  if (reps.error) console.error('[contractor-portal] sales reps', reps.error.message)

  const person = [row.goes_by || row.first_name, row.last_name].filter(Boolean).join(' ')
  return (
    <>
      <TeamPanel
        contractorId={contractorId}
        members={team}
        suggested={row.email ? { email: row.email.trim().toLowerCase(), name: person } : null}
        actions={canViewAs ? <OpenPortalButton contractorId={contractorId} name={name} /> : null}
      />
      <AccountPanel
        contractorId={contractorId}
        initial={{ pricingTierId: tierId, repId, paymentTerms: row.payment_terms === 'terms' ? 'terms' : 'card' }}
        tiers={tierOptions}
        reps={repOptions}
      />
    </>
  )
}
