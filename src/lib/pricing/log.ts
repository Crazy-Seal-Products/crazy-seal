import { createAdminClient } from '@/lib/supabase/admin'
import type { PricingLogRow } from './types'

/** The newest pricing_log rows (who changed a setting, cost or tier). Server only. */
export async function listPricingLog(limit = 100): Promise<PricingLogRow[]> {
  const { data, error } = await createAdminClient().from('pricing_log').select('*').order('at', { ascending: false }).limit(Math.min(limit, 500))
  if (error) throw new Error(`pricing_log: ${error.message}`)
  return (data ?? []) as PricingLogRow[]
}
