import type { Metadata } from 'next'
import { loadAccountSummary } from '@/lib/contractor/account-summary'
import { requireAccount } from '@/lib/contractor/guard'
import { RewardsView } from '@/components/contractor/account/RewardsView'

export const metadata: Metadata = { title: 'Rewards' }

/** Pro Hub's Perks & status: status pills and how they're earned, the rebate meter, and what every Pro gets. */
export default async function RewardsPage() {
  const { account } = await requireAccount('dashboard.view')
  const summary = await loadAccountSummary(account.user)
  return <RewardsView statuses={summary.statuses} rebate={summary.rebate} orderCount={summary.stats.orderCount} memberOnly={summary.memberOnly} />
}
