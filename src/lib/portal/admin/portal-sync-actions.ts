'use server'

import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/components/portal/admin/controls'
import { syncProAccounts } from '@/lib/contractor/link'
import { requirePortalAdmin } from './auth'

/**
 * "Bring Pro Hub accounts over": links every Pro Hub account that isn't on a
 * contractor's team to its matching contractor as owner (src/lib/contractor/link.ts).
 * Adds team rows only; no account, order or warranty is changed or deleted.
 * Accounts with no matching contractor keep their personal portal.
 */
export async function syncProAccountsAction(): Promise<ActionResult> {
  const admin = await requirePortalAdmin('contractors')
  try {
    const r = await syncProAccounts(admin.name?.split(' ')[0] || admin.email)
    revalidatePath('/portal/admin/dealers/portal/')
    revalidatePath('/portal/admin/dealers/contractors', 'layout')
    const parts = [
      `${r.linked.length} linked to their contractor`,
      `${r.alreadyOnTeam} already on a team`,
      `${r.noMatch} with no matching contractor (they keep a personal portal)`,
    ]
    if (r.hasOwner.length) parts.push(`${r.hasOwner.length} match a contractor that already has an owner (their owner can add them): ${r.hasOwner.join(', ')}`)
    if (r.several.length) parts.push(`${r.several.length} match more than one contractor, so link them by hand: ${r.several.join(', ')}`)
    return { ok: true, message: `${parts.join('; ')}.` }
  } catch (err) {
    console.error('[portal-sync]', err)
    return { ok: false, error: 'Could not bring the accounts over. Nothing was removed; try again.' }
  }
}
