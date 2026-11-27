'use client'

import React, { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { savePricingSettings } from '@/lib/pricing/pricing-actions'
import type { PricingSettings } from '@/lib/pricing/types'
import { BUTTON, inputCls, labelCls } from '../styles'

/** Admin > Pricing settings: the live offer, shipping and capture thresholds, follow-ups, coverage rates, the public builder switch. */

function Field({ name, label, hint, value, suffix, step = 'any' }: { name: string; label: string; hint?: string; value: number; suffix?: string; step?: string }) {
  return (
    <label className={labelCls}>
      <span>{label}</span>
      <span className="flex items-center gap-1.5">
        <input name={name} type="number" step={step} min={0} defaultValue={value} className={twMerge(inputCls, 'tabular-nums')} />
        {suffix && <span className="shrink-0 text-[11.5px] text-adm-muted">{suffix}</span>}
      </span>
      {hint && <span className="block text-[10.5px] font-normal text-adm-faint">{hint}</span>}
    </label>
  )
}

function Toggle({ name, label, hint, checked }: { name: string; label: string; hint: string; checked: boolean }) {
  return (
    <label className="flex items-start gap-2 rounded-md border border-adm-line bg-adm-input px-2.5 py-2 text-[12px] text-adm-text">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-0.5 h-4 w-4 accent-[var(--adm-chart-gold)]" />
      <span>
        <span className="font-semibold text-adm-ink">{label}</span>
        <span className="block text-[11px] text-adm-muted">{hint}</span>
      </span>
    </label>
  )
}

export function SettingsForm({ settings }: { settings: PricingSettings }) {
  const [state, action, pending] = useActionState(savePricingSettings, null)
  const c = settings.coverage
  return (
    <form action={action} className="grid gap-3 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Toggle name="public_builder_live" label="Public quote builder is live" hint="On: the store, Kit Builder and cart send everyone to /quote/. Off: the store stays, and /quote/ is a 404 for everyone but signed-in staff, who see a preview." checked={settings.public_builder_live} />
        <Toggle name="auto_reoffer" label="Re-offer expired quotes on their own" hint="On: once a public quote’s offer ends, the daily run refreshes it at today’s prices and emails the new offer (once). Off: the buyer refreshes it." checked={settings.auto_reoffer} />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-adm-muted">The live offer</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field name="offer_discount_pct" label="Standard offer" value={settings.offer_discount_pct} suffix="% off" hint="Off the full price, for everyone. Contractor order discounts and tiers replace it when bigger." />
        <Field name="offer_hours" label="Offer good for" value={settings.offer_hours} suffix="hours" step="1" hint="Every quote’s price holds this long; then it can be refreshed." />
        <Field name="reminder_hours" label="Reminder before it ends" value={settings.reminder_hours} suffix="hours" step="1" hint="Public quotes, once. 0: no reminder." />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-adm-muted">Shipping and details</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field name="free_shipping_over" label="Free shipping from" value={settings.free_shipping_over} suffix="$" hint={settings.has_price_list ? 'Below it the buyer pays shipping at checkout. Match Shopify’s free-shipping rate.' : 'Needs migration 036 to change.'} />
        <Field name="free_shipping_under" label="Freight from" value={settings.free_shipping_under} suffix="$" hint="At or over this total, staff quote freight." />
        <Field name="capture_phone_at" label="Ask for a phone from" value={settings.capture_phone_at} suffix="$" />
        <Field name="capture_address_at" label="Ask for a ship-to address from" value={settings.capture_address_at} suffix="$" />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-adm-muted">Coverage (how the builder turns a roof into materials)</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Field name="coats" label="Coats of Crazy Seal" value={c.coats} step="1" />
        <Field name="seal_over_existing" label="Seal over an existing roof" value={c.sealSqftPerGallonPerCoat['over-existing']} suffix="sq ft / gal / coat" />
        <Field name="seal_direct_to_deck" label="Seal direct to deck" value={c.sealSqftPerGallonPerCoat['direct-to-deck']} suffix="sq ft / gal / coat" />
        <Field name="patchFtPerGallon" label="Crazy Patch" value={c.patchFtPerGallon} suffix="ft of seam / gal" />
        <Field name="caulkSqftPerTube" label="Crazy Caulk" value={c.caulkSqftPerTube} suffix="sq ft / tube" />
        <Field name="cleanSqftPerGallon" label="Crazy Clean" value={c.cleanSqftPerGallon} suffix="sq ft / gal" />
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save settings
        </button>
        {state && <span className={twMerge('text-[11.5px]', state.ok ? 'text-adm-green' : 'text-adm-red')}>{state.ok ? state.message ?? 'Saved' : state.error}</span>}
      </div>
    </form>
  )
}
