import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Copies the contractor's website quote requests (leads sent from their
 * Crazy Seal page) that haven't been imported yet into their customers and
 * projects, with an activity line each (import_contractor_leads in
 * 032_contractor_projects.sql). Each lead is imported once. Returns how many
 * it imported; never throws, so a failed import can't take the portal down.
 */
export async function importWebsiteLeads(contractorId: string): Promise<number> {
  try {
    const { data, error } = await createAdminClient().rpc('import_contractor_leads', { p_contractor: contractorId })
    if (error) {
      console.error('[contractor-leads] import failed', error.message)
      return 0
    }
    return typeof data === 'number' ? data : 0
  } catch (err) {
    console.error('[contractor-leads] import failed', err)
    return 0
  }
}
