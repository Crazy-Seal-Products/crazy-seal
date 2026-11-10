import { NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { loadProContext, publicUser } from '@/lib/pro/context'
import { shopifyErrorMessage } from '@/lib/pro/shopify'
import { getViewAs } from '@/lib/pro/view-as'

export async function GET() {
  const user = await getProUser()
  if (!user) return NextResponse.json({ user: null }, { status: 401 })

  // Set when an admin is viewing this account (read-only), for the banner
  const viewing = await getViewAs()
  const viewAs = viewing ? { adminName: viewing.admin.name, expiresAt: viewing.expiresAt, hasAccount: viewing.hasAccount } : null

  try {
    const ctx = await loadProContext(user)
    return NextResponse.json({
      user: publicUser(ctx),
      viewAs,
      shopifyError: ctx.shopifyError ? shopifyErrorMessage(ctx.shopifyError) : null,
    })
  } catch (err) {
    console.error('[pro/me]', err)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        businessName: user.business_name,
        phone: user.phone,
        statuses: ['member'],
        hasPassword: Boolean(user.password_hash),
      },
      viewAs,
      shopifyError: shopifyErrorMessage(err),
    })
  }
}
