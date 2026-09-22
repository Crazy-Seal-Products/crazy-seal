import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { listContactMarketingReviews, updateContactMarketingReview, ZohoScopeError } from '@/lib/zoho/client'
import { MARKETING_REVIEW_VALUES } from '@/lib/warranty/marketing-reviews'

export async function POST() {
  try {
    const contacts = await listContactMarketingReviews(MARKETING_REVIEW_VALUES)
    const supabase = createAdminClient()

    let matched = 0
    let updated = 0
    const unmatched: string[] = []

    for (const contact of contacts) {
      const { data, error } = await supabase
        .from('warranty_registrations')
        .select('id, reviews_for_marketing')
        .ilike('email', contact.email)

      if (error) {
        console.error('[sync-reviews] lookup error:', error.message)
        continue
      }
      if (!data?.length) {
        unmatched.push(contact.email)
        continue
      }

      matched += data.length
      const stale = data.filter((row) => row.reviews_for_marketing !== contact.reviews_for_marketing)
      if (!stale.length) continue

      const { error: updateError } = await supabase
        .from('warranty_registrations')
        .update({ reviews_for_marketing: contact.reviews_for_marketing })
        .in('id', stale.map((row) => row.id))

      if (updateError) {
        console.error('[sync-reviews] update error:', updateError.message)
        continue
      }
      updated += stale.length
    }

    return NextResponse.json({
      success: true,
      zoho_contacts: contacts.length,
      matched,
      updated,
      unmatched: unmatched.length,
    })
  } catch (err) {
    if (err instanceof ZohoScopeError) {
      return NextResponse.json({ error: err.message, code: 'ZOHO_SCOPE' }, { status: 403 })
    }
    console.error('[sync-reviews]', err)
    return NextResponse.json({ error: 'Failed to sync reviews from Zoho.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, reviews_for_marketing, email, push_to_zoho } = body as {
      id?: string
      reviews_for_marketing?: string | null
      email?: string
      push_to_zoho?: boolean
    }

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('warranty_registrations')
      .update({ reviews_for_marketing: reviews_for_marketing || null })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to save review.' }, { status: 500 })
    }

    let zoho_pushed = false
    if (push_to_zoho && email) {
      try {
        zoho_pushed = await updateContactMarketingReview(email, reviews_for_marketing || null)
      } catch (err) {
        if (!(err instanceof ZohoScopeError)) {
          console.error('[sync-reviews] zoho push:', err)
        }
      }
    }

    return NextResponse.json({ success: true, zoho_pushed })
  } catch (err) {
    console.error('[sync-reviews] PATCH', err)
    return NextResponse.json({ error: 'Failed to save review.' }, { status: 500 })
  }
}
