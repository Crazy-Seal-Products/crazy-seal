import { createAdminClient } from '@/lib/supabase/admin'
import { contractorCustomerIds, type OrderContractor } from '@/lib/contractor/orders'

/**
 * How many Crazy Seal orders a contractor has placed, for the order-count
 * discount (pricing_settings.job_discounts: 26+ orders 20%, 51+ 30%). The
 * same orders the portal's Orders page shows (contractorCustomerIds: the
 * contractor's linked Shopify customers and its active team members'), from
 * the local copy of Shopify, without cancelled, deleted or test orders.
 * Server only. Throws when the count can't be read.
 */
export async function contractorOrderCount(contractor: OrderContractor): Promise<number> {
  const ids = await contractorCustomerIds(contractor)
  if (!ids.length) return 0
  const { count, error } = await createAdminClient()
    .from('shopify_orders')
    .select('shopify_id', { count: 'exact', head: true })
    .in('customer_shopify_id', ids)
    .is('deleted_at', null)
    .is('cancelled_at', null)
    .eq('test', false)
  if (error) throw new Error(`shopify_orders count: ${error.message}`)
  return count ?? 0
}
