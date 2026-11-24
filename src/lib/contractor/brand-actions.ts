'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isHex, isThemeKey } from '@/lib/contractors/theme'
import { diff, logActivity } from './activity'
import { portalAction, type PortalResult } from './guard'

/**
 * "Your page": the contractor edits their public page (/contractor/<slug>)
 * from the portal: palette and colors, logo, tagline and phone. Same checks
 * as the admin's editor (src/lib/portal/admin/contractor-actions.ts), and the
 * same edited_fields bookkeeping: a dealer-list field changed here (the
 * phone) is recorded so a later import leaves it alone.
 */

export interface BrandInput {
  theme: string
  primary: string
  accent: string
  logoUrl: string
  tagline: string
  phone: string
}

/** The fields the dealer-list import writes (LIST_FIELDS in contractor-actions). Only `phone` is on this page. */
const LIST_FIELDS = [
  'segment',
  'company',
  'first_name',
  'goes_by',
  'last_name',
  'phone',
  'phone_alt',
  'email',
  'street',
  'city',
  'state',
  'zip',
  'service_states',
  'service_mode',
  'notes',
] as const

const text = (v: unknown, max = 120) => String(v ?? '').trim().slice(0, max) || null

function phone(v: unknown): string | null {
  const raw = text(v, 40)
  const digits = raw?.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '') ?? ''
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : raw
}

function httpsUrl(v: string | null): boolean {
  if (!v) return true
  try {
    return new URL(v).protocol === 'https:'
  } catch {
    return false
  }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

const LABELS: Record<string, string> = {
  theme: 'palette',
  color_primary: 'main color',
  color_accent: 'accent color',
  logo_url: 'logo',
  tagline: 'tagline',
  phone: 'phone',
}

interface BrandRow {
  slug: string
  theme: string
  color_primary: string | null
  color_accent: string | null
  logo_url: string | null
  tagline: string | null
  phone: string | null
  edited_fields: string[] | null
}

/** On success, `saved` is the page as stored (the phone formatted, blanks cleared). */
export type BrandResult = PortalResult & { saved?: BrandInput }

export async function saveBrand(input: BrandInput): Promise<BrandResult> {
  const g = await portalAction('brand.manage')
  if (!g.ok) return g
  const viewer = g.viewer

  const primary = text(input?.primary, 7)?.toLowerCase() ?? null
  const accent = text(input?.accent, 7)?.toLowerCase() ?? null
  if ((primary && !isHex(primary)) || (accent && !isHex(accent))) return { ok: false, error: 'Colors need to be hex, like #003365.' }
  const logoUrl = text(input?.logoUrl, 500)
  if (!httpsUrl(logoUrl)) return { ok: false, error: 'The logo needs an https:// address.' }
  const tagline = text(input?.tagline, 90)
  const phoneValue = phone(input?.phone)

  const row = {
    theme: isThemeKey(input?.theme) ? input.theme : 'seal',
    color_primary: primary,
    color_accent: accent,
    logo_url: logoUrl,
    tagline,
    phone: phoneValue,
  }

  const db = createAdminClient()
  const { data: before, error: readError } = await db
    .from('contractors')
    .select('slug, theme, color_primary, color_accent, logo_url, tagline, phone, edited_fields')
    .eq('id', viewer.contractor.id)
    .maybeSingle<BrandRow>()
  if (readError || !before) return { ok: false, error: 'Could not load your page. Try again.' }

  const saved: BrandInput = {
    theme: row.theme,
    primary: row.color_primary ?? '',
    accent: row.color_accent ?? '',
    logoUrl: row.logo_url ?? '',
    tagline: row.tagline ?? '',
    phone: row.phone ?? '',
  }
  const changes = diff(before as unknown as Record<string, unknown>, row)
  if (!Object.keys(changes).length) return { ok: true, message: 'No changes to save', saved }

  // A dealer-list field changed here is the contractor's now: the import won't overwrite it.
  const changedListFields = LIST_FIELDS.filter((f) => f in row && !same(row[f as keyof typeof row], before[f as keyof BrandRow]))
  const edited = [...new Set([...(before.edited_fields ?? []), ...changedListFields])]

  const { error } = await db
    .from('contractors')
    .update({ ...row, edited_fields: edited, updated_at: new Date().toISOString() })
    .eq('id', viewer.contractor.id)
  if (error) {
    console.error('[contractor-brand] save', error.message)
    return { ok: false, error: 'Could not save. Try again.' }
  }

  revalidatePath(`/contractor/${before.slug}`)
  revalidatePath('/contractor')
  revalidatePath('/portal', 'layout')
  revalidatePath('/portal/admin/dealers/contractors', 'layout')
  await logActivity(viewer, {
    entity: 'brand',
    entityId: viewer.contractor.id,
    action: 'update',
    summary: `${viewer.firstName} updated your Crazy Seal page: ${Object.keys(changes)
      .map((k) => LABELS[k] ?? k)
      .join(', ')}`,
    changes,
  })
  return { ok: true, message: 'Saved. Your page shows it on its next load.', saved }
}
