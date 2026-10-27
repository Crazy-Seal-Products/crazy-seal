'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createMagicLink, isMissingRelation, markInvited, upsertProUser } from '@/lib/pro/auth'
import { sendProMagicLink } from '@/lib/email/gmail'
import { PRO_STATUSES, type ProStatus } from '@/lib/pro/config'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin } from './auth'
import { clearAdminCache } from './cache'

const EMAIL_RE = /^[^\s@",()]+@[^\s@",()]+\.[^\s@",()]+$/

/**
 * Invite someone to the Pro Hub (/pro): creates or updates their account,
 * optionally pins a status, and emails a sign-in link. Same steps as the
 * site admin's invite, so `invited_by` points at your staff record.
 */
export async function inviteToProHub(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await requirePortalAdmin()
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Enter a valid email address' }
  const status = String(form.get('status') ?? '')
  if (status && !PRO_STATUSES.includes(status as ProStatus)) return { ok: false, error: 'Unknown status' }
  const name = String(form.get('display_name') ?? '').trim() || undefined
  const business = String(form.get('business_name') ?? '').trim() || undefined

  try {
    const supabase = createAdminClient()
    await upsertProUser(email, { display_name: name, business_name: business })
    if (status) await supabase.from('pro_users').update({ status_override: status }).eq('email', email)

    const { token, cooldown } = await createMagicLink(email)
    if (cooldown) return { ok: true, message: 'A sign-in link was sent to them in the last minute already' }

    const { data: staff } = await supabase.from('staff').select('id').eq('email', admin.email).eq('is_active', true).maybeSingle()
    await markInvited(email, staff?.id ?? null)

    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'crazyseal.com'
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    await sendProMagicLink(email, `${proto}://${host}/api/pro/auth/callback/?token=${encodeURIComponent(token)}`)

    clearAdminCache()
    revalidatePath('/portal/admin/dealers', 'layout')
    return { ok: true, message: `Invite sent to ${email}` }
  } catch (err) {
    console.error('[portal/admin] pro invite', err)
    if (isMissingRelation(err)) return { ok: false, error: 'Pro Hub tables are missing from the database' }
    return { ok: false, error: 'Could not send the invite' }
  }
}
