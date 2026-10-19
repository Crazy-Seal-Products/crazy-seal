import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { certificateUrl } from '@/lib/warranty/certificate'
import { sendWarrantyRegistrationConfirmations } from '@/lib/email/warranty'
import { isSendableCustomerEmail, isWarrantyRegistrationForm, mapLegacyWarrantyEntry, WARRANTY_REGISTRATION_FORM_IDS } from '@/lib/warranty/legacy'

export const maxDuration = 60

const REG_SELECT = 'id, name, email, phone, customer_details, order_number, install_type, installer_name, installer_phone, installer_email, photo_urls, before_photo_urls, after_photo_urls, rating, experience_notes, contractor_notes, gf_entry_id'

async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: staff } = await admin
    .from('staff')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .single()

  return staff
}

async function loadOrMapRegistration(input: {
  id?: string
  gf_entry_id?: number
  legacy_id?: string
}) {
  const supabase = createAdminClient()

  if (input.id) {
    const { data, error } = await supabase
      .from('warranty_registrations')
      .select(REG_SELECT)
      .eq('id', input.id)
      .maybeSingle()
    if (error || !data) return { error: 'Registration not found.', status: 404 as const }
    return { data }
  }

  let gfEntryId = input.gf_entry_id
  let legacy: {
    gf_entry_id: number
    gf_form_id: number
    entry_data: Record<string, string>
    file_urls: string[] | null
    submitted_at: string | null
    imported_at: string | null
  } | null = null

  if (input.legacy_id) {
    const { data, error } = await supabase
      .from('legacy_gf_entries')
      .select('gf_entry_id, gf_form_id, entry_data, file_urls, submitted_at, imported_at')
      .eq('id', input.legacy_id)
      .maybeSingle()
    if (error || !data) return { error: 'Legacy entry not found.', status: 404 as const }
    if (!isWarrantyRegistrationForm(data.gf_form_id)) {
      return { error: 'This legacy form is not a warranty registration.', status: 400 as const }
    }
    legacy = data
    gfEntryId = data.gf_entry_id
  }

  if (gfEntryId) {
    let query = supabase
      .from('warranty_registrations')
      .select(REG_SELECT)
      .eq('gf_entry_id', gfEntryId)
    if (legacy) query = query.eq('wp_form_id', legacy.gf_form_id)
    const { data } = await query.limit(1).maybeSingle()
    if (data) return { data }
  }

  if (!legacy && gfEntryId) {
    const { data } = await supabase
      .from('legacy_gf_entries')
      .select('gf_entry_id, gf_form_id, entry_data, file_urls, submitted_at, imported_at')
      .eq('gf_entry_id', gfEntryId)
      .in('gf_form_id', [...WARRANTY_REGISTRATION_FORM_IDS])
      .limit(1)
      .maybeSingle()
    legacy = data
  }

  if (!legacy) return { error: 'Legacy warranty entry not found.', status: 404 as const }

  const mapped = mapLegacyWarrantyEntry(legacy)
  if (!isSendableCustomerEmail(mapped.email)) {
    return { error: 'This legacy entry has no customer email.', status: 400 as const }
  }

  const { data: created, error: insertError } = await supabase
    .from('warranty_registrations')
    .insert(mapped)
    .select(REG_SELECT)
    .single()

  if (insertError || !created) {
    console.error('[warranty/notify] map insert:', insertError)
    return { error: 'Failed to map this legacy warranty entry.', status: 500 as const }
  }

  return { data: created }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireStaff()
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { id?: string; gf_entry_id?: number; legacy_id?: string }
    if (!body.id && !body.gf_entry_id && !body.legacy_id) {
      return NextResponse.json({ error: 'id, gf_entry_id, or legacy_id is required' }, { status: 400 })
    }

    const resolved = await loadOrMapRegistration(body)
    if ('error' in resolved && resolved.error) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const data = resolved.data!
    if (!isSendableCustomerEmail(data.email)) {
      return NextResponse.json({ error: 'This entry has no customer email to send to.' }, { status: 400 })
    }

    const photo_urls = [
      ...(data.before_photo_urls || []),
      ...(data.after_photo_urls || []),
      ...(data.photo_urls || []),
    ].filter((url, i, all) => url && all.indexOf(url) === i)

    const sent = await sendWarrantyRegistrationConfirmations({
      name: data.name,
      email: data.email,
      phone: data.phone,
      order_number: data.order_number,
      customer_details: data.customer_details,
      install_type: data.install_type,
      installer_name: data.installer_name,
      installer_phone: data.installer_phone,
      installer_email: data.installer_email,
      rating: data.rating,
      experience_notes: data.experience_notes,
      contractor_notes: data.contractor_notes,
      photo_urls,
      certificate_url: certificateUrl(data.id),
    })

    return NextResponse.json({ success: true, sent, registration_id: data.id })
  } catch (err) {
    console.error('[warranty/notify]', err)
    return NextResponse.json({ error: 'Failed to send confirmation emails.' }, { status: 500 })
  }
}
