import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/admin/require-staff'
import { createMagicLink, isMissingRelation, markInvited, requestOrigin, upsertProUser } from '@/lib/pro/auth'
import { sendProMagicLink } from '@/lib/email/gmail'
import { PRO_STATUSES, type ProStatus } from '@/lib/pro/config'
import { createAdminClient } from '@/lib/supabase/admin'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const staff = await requireStaff()
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const statusOverride = typeof body?.status_override === 'string' ? body.status_override : null
  if (statusOverride && !PRO_STATUSES.includes(statusOverride as ProStatus)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  try {
    await upsertProUser(email, {
      display_name: typeof body?.display_name === 'string' ? body.display_name : undefined,
      business_name: typeof body?.business_name === 'string' ? body.business_name : undefined,
    })
    if (statusOverride) {
      const supabase = createAdminClient()
      await supabase.from('pro_users').update({ status_override: statusOverride }).eq('email', email)
    }

    const { token, cooldown } = await createMagicLink(email)
    if (cooldown) {
      return NextResponse.json({ success: true, message: 'A sign-in link was already sent recently.' })
    }

    await markInvited(email, staff.id)
    const url = `${requestOrigin(request)}/api/pro/auth/callback/?token=${encodeURIComponent(token)}`
    await sendProMagicLink(email, url)

    return NextResponse.json({ success: true, message: `Invite sent to ${email}.` })
  } catch (err) {
    console.error('[admin/pros/invite]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({
        error: 'Pro Hub tables are not in the database yet. Run supabase/migrations/013_pro_hub.sql.',
      }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not send invite.' }, { status: 500 })
  }
}
