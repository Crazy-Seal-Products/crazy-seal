'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWarrantyRegistrationConfirmations } from '@/lib/email/warranty'
import { certificateUrl } from '@/lib/warranty/certificate'
import { isSendableCustomerEmail } from '@/lib/warranty/legacy'
import { IMAGE_TYPES, REVIEWS_FOR_MARKETING } from '@/lib/warranty/classification'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin } from './auth'
import { clearAdminCache } from './cache'
import { CLAIM_STATUSES, photosOf, REGISTRATION_STATUSES, TRANSFER_STATUSES, type Registration } from './warranty'

const EMAIL_RE = /^[^\s@",()]+@[^\s@",()]+\.[^\s@",()]+$/

function done(): ActionResult {
  clearAdminCache()
  revalidatePath('/portal/admin/warranties', 'layout')
  return { ok: true }
}

async function updateRegistration(id: string, patch: Partial<Registration>): Promise<ActionResult> {
  await requirePortalAdmin()
  const { error } = await createAdminClient().from('warranty_registrations').update(patch).eq('id', id)
  return error ? { ok: false, error: 'Could not save' } : done()
}

export async function setRegistrationStatus(id: string, status: string): Promise<ActionResult> {
  if (!REGISTRATION_STATUSES.some((s) => s.key === status)) return { ok: false, error: 'Unknown status' }
  return updateRegistration(id, { status })
}

/** Image type, marketing classification, status and Lucid link (the review lightbox and the detail page). */
export async function classifyRegistration(
  id: string,
  patch: { image_type: string | null; reviews_for_marketing: string | null; status: string; lucid_link: string | null },
): Promise<ActionResult> {
  if (patch.image_type && !(IMAGE_TYPES as readonly string[]).includes(patch.image_type)) return { ok: false, error: 'Unknown image type' }
  if (patch.reviews_for_marketing && !(REVIEWS_FOR_MARKETING as readonly string[]).includes(patch.reviews_for_marketing)) return { ok: false, error: 'Unknown classification' }
  if (!REGISTRATION_STATUSES.some((s) => s.key === patch.status)) return { ok: false, error: 'Unknown status' }
  const lucid = patch.lucid_link?.trim() || null
  if (lucid && !/^https?:\/\//i.test(lucid)) return { ok: false, error: 'Lucid link must start with http' }
  return updateRegistration(id, { ...patch, lucid_link: lucid })
}

/** Photo order / before-after split / favorites, from the review lightbox. */
export async function updateRegistrationPhotos(
  id: string,
  patch: { before_photo_urls?: string[] | null; after_photo_urls?: string[] | null; favorite_photo_urls?: string[] | null },
): Promise<ActionResult> {
  const clean = (v: string[] | null | undefined) => (v == null ? v : v.filter((u) => typeof u === 'string' && /^https?:\/\//.test(u)))
  return updateRegistration(id, {
    ...('before_photo_urls' in patch ? { before_photo_urls: clean(patch.before_photo_urls) ?? null } : {}),
    ...('after_photo_urls' in patch ? { after_photo_urls: clean(patch.after_photo_urls) ?? null } : {}),
    ...('favorite_photo_urls' in patch ? { favorite_photo_urls: clean(patch.favorite_photo_urls) ?? null } : {}),
  })
}

export async function saveInstaller(id: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const text = (k: string) => String(form.get(k) ?? '').trim() || null
  const installType = text('install_type')
  if (installType && installType !== 'diy' && installType !== 'contractor') return { ok: false, error: 'Unknown install type' }
  const email = text('installer_email')?.toLowerCase() ?? null
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: 'Installer email looks wrong' }
  const r = await updateRegistration(id, {
    install_type: installType,
    installer_name: text('installer_name'),
    installer_phone: text('installer_phone'),
    installer_email: email,
  })
  return r.ok ? { ok: true, message: 'Saved' } : r
}

export async function resendWarrantyEmails(id: string): Promise<ActionResult> {
  await requirePortalAdmin()
  const { data } = await createAdminClient().from('warranty_registrations').select('*').eq('id', id).maybeSingle<Registration>()
  if (!data) return { ok: false, error: 'Registration not found' }
  if (!isSendableCustomerEmail(data.email)) return { ok: false, error: 'No customer email to send to' }
  try {
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
      photo_urls: photosOf(data),
      certificate_url: certificateUrl(data.id),
    })
    return { ok: true, message: sent?.installer ? 'Sent to the customer and installer' : 'Sent to the customer' }
  } catch (err) {
    console.error('[portal/admin] resend warranty emails', err)
    return { ok: false, error: 'Email failed to send' }
  }
}

export async function saveClaim(id: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requirePortalAdmin()
  const status = String(form.get('status') ?? '')
  if (!CLAIM_STATUSES.some((s) => s.key === status)) return { ok: false, error: 'Unknown status' }
  const notes = String(form.get('resolution_notes') ?? '').trim() || null
  const { error } = await createAdminClient().from('warranty_claims').update({ status, resolution_notes: notes }).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  done()
  return { ok: true, message: 'Saved' }
}

export async function saveTransfer(id: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requirePortalAdmin()
  const status = String(form.get('status') ?? '')
  if (!TRANSFER_STATUSES.some((s) => s.key === status)) return { ok: false, error: 'Unknown status' }
  const notes = String(form.get('transfer_notes') ?? '').trim() || null
  const { error } = await createAdminClient().from('warranty_transfers').update({ status, transfer_notes: notes }).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  done()
  return { ok: true, message: 'Saved' }
}
