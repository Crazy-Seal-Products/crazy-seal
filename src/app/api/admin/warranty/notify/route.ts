import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { certificateUrl } from '@/lib/warranty/certificate'
import { sendWarrantyRegistrationConfirmations } from '@/lib/email/warranty'

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

export async function POST(request: NextRequest) {
  try {
    const staff = await requireStaff()
    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json() as { id?: string }
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('warranty_registrations')
      .select('id, name, email, phone, customer_details, order_number, install_type, installer_name, installer_phone, installer_email, photo_urls, before_photo_urls, after_photo_urls, rating, experience_notes, contractor_notes')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Registration not found.' }, { status: 404 })
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

    return NextResponse.json({ success: true, sent })
  } catch (err) {
    console.error('[warranty/notify]', err)
    return NextResponse.json({ error: 'Failed to send confirmation emails.' }, { status: 500 })
  }
}
