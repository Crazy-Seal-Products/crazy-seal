'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMissingRelation } from '@/lib/pro/auth'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin } from './auth'
import { clearAdminCache } from './cache'

function refresh() {
  clearAdminCache()
  revalidatePath('/portal/admin/dealers', 'layout')
}

/** "Looks fine": keep the account and take it out of the review queue. */
export async function keepFlaggedSignup(id: string): Promise<ActionResult> {
  const admin = await requirePortalAdmin('portal_accounts')
  const { error } = await createAdminClient()
    .from('pro_users')
    .update({ flag_reviewed_at: new Date().toISOString(), flag_reviewed_by: admin.email })
    .eq('id', id)
    .not('flagged_at', 'is', null)
  if (error) return { ok: false, error: 'Could not save that' }
  refresh()
  return { ok: true, message: 'Kept' }
}

// Anything here means a person used the account, so it is not removed from this queue.
const ACTIVITY: [table: string, column: string, label: string][] = [
  ['warranty_registrations', 'filed_by_pro_user_id', 'warranties filed'],
  ['warranty_claims', 'filed_by_pro_user_id', 'claims filed'],
  ['support_tickets', 'pro_user_id', 'support tickets'],
  ['ai_conversations', 'pro_user_id', 'assistant chats'],
  ['contractor_members', 'pro_user_id', 'contractor team memberships'],
  ['quotes', 'created_by_pro_user', 'quotes'],
]

/**
 * "Remove": delete a flagged account that has never done anything in the Pro Hub, with its
 * sessions (cascade) and its sign-in links. An account with any activity is refused.
 */
export async function removeFlaggedSignup(id: string): Promise<ActionResult> {
  const admin = await requirePortalAdmin('portal_accounts')
  const supabase = createAdminClient()

  const { data: user, error } = await supabase
    .from('pro_users')
    .select('id, email, flagged_at, flag_reviewed_at, invited_at')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false, error: 'Could not load the account' }
  if (!user) return { ok: true, message: 'Already removed' }
  if (!user.flagged_at || user.flag_reviewed_at || user.invited_at) {
    return { ok: false, error: 'Only flagged, unreviewed sign-ups can be removed here' }
  }

  const used: string[] = []
  for (const [table, column, label] of ACTIVITY) {
    const { data, error: lookupError } = await supabase.from(table).select(column).eq(column, id).limit(1)
    if (lookupError) {
      if (isMissingRelation(lookupError)) continue
      return { ok: false, error: 'Could not check what the account has done' }
    }
    if (data?.length) used.push(label)
  }
  if (used.length) return { ok: false, error: `Not removed: it has ${used.join(', ')}. Choose "Looks fine" or ask a developer.` }

  const { error: linkError } = await supabase.from('pro_magic_links').delete().eq('email', user.email)
  if (linkError) return { ok: false, error: 'Could not remove its sign-in links' }
  const { error: deleteError } = await supabase.from('pro_users').delete().eq('id', id)
  if (deleteError) return { ok: false, error: 'Could not remove the account' }

  console.info(`[portal/admin] ${admin.email} removed flagged Pro Hub sign-up ${id}`)
  refresh()
  return { ok: true, message: 'Removed' }
}
