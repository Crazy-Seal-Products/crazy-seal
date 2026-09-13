import { NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { loadProContext, publicUser } from '@/lib/pro/context'
import { shopifyErrorMessage } from '@/lib/pro/shopify'

export async function GET() {
  const user = await getProUser()
  if (!user) return NextResponse.json({ user: null }, { status: 401 })

  try {
    const ctx = await loadProContext(user)
    return NextResponse.json({
      user: publicUser(ctx),
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
      shopifyError: shopifyErrorMessage(err),
    })
  }
}
