import { createAdminClient } from '@/lib/supabase/admin'
import type { PricingTier, TierLite } from './types'

/** Reads pricing_tiers (031_pricing.sql). Server only. */

function toTier(r: Record<string, unknown>): PricingTier {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    audience: r.audience === 'contractor' ? 'contractor' : 'public',
    discount_pct: Number(r.discount_pct ?? 0),
    min_subtotal: r.min_subtotal == null ? null : Number(r.min_subtotal),
    active: r.active !== false,
    sort: Number(r.sort ?? 0),
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
  }
}

export async function listTiers(): Promise<PricingTier[]> {
  const { data, error } = await createAdminClient().from('pricing_tiers').select('*').order('audience').order('sort').order('name')
  if (error) throw new Error(`pricing_tiers: ${error.message}`)
  return (data ?? []).map((r) => toTier(r as Record<string, unknown>))
}

export async function getTier(id: string): Promise<PricingTier | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data, error } = await createAdminClient().from('pricing_tiers').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`pricing_tiers: ${error.message}`)
  return data ? toTier(data as Record<string, unknown>) : null
}

export function tierLite(t: PricingTier): TierLite {
  return { id: t.id, name: t.name, audience: t.audience, discount_pct: t.discount_pct, min_subtotal: t.min_subtotal, active: t.active, sort: t.sort }
}

/** "Gold (12%)", "Volume 5% from $2,000". */
export function tierLabel(t: Pick<PricingTier, 'name' | 'discount_pct' | 'min_subtotal' | 'audience'>): string {
  const pct = `${Number(t.discount_pct).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`
  const min = t.audience === 'public' && t.min_subtotal ? ` from $${Number(t.min_subtotal).toLocaleString('en-US')}` : ''
  return `${t.name} (${pct}${min})`
}
