'use client'

import { useState, useTransition } from 'react'
import { saveContractorAccount } from '@/lib/portal/admin/contractor-portal-actions'
import { SaveState } from '../controls'
import { BUTTON, inputCls, labelCls } from '../styles'
import { Panel } from '../ui'

export interface TierOption {
  id: string
  name: string
  discountPct: number
  active: boolean
}

export interface RepOption {
  id: string
  name: string
  active: boolean
}

/** Pricing tier, Crazy Seal sales rep and payment terms for the contractor's account. */
export function AccountPanel({
  contractorId,
  initial,
  tiers,
  reps,
}: {
  contractorId: string
  initial: { pricingTierId: string; repId: string; paymentTerms: 'card' | 'terms' }
  tiers: TierOption[]
  reps: RepOption[]
}) {
  const [form, setForm] = useState(initial)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dirty = form.pricingTierId !== initial.pricingTierId || form.repId !== initial.repId || form.paymentTerms !== initial.paymentTerms

  const set = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }))
    setSaved(false)
    setError(null)
  }

  return (
    <Panel title="Pricing & account" meta="what their quotes and checkout use" tone="dealers" className="mb-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const r = await saveContractorAccount(contractorId, form)
            if (r.ok) setSaved(true)
            else setError(r.error)
          })
        }}
        className="grid gap-3 p-3 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] @2xl:items-end"
      >
        <label className={labelCls}>
          <span>Pricing tier</span>
          <select className={inputCls} value={form.pricingTierId} onChange={(e) => set({ pricingTierId: e.target.value })}>
            <option value="">Full price (no tier)</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.discountPct}% off{t.active ? '' : ' (turned off)'}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          <span>Crazy Seal sales rep</span>
          <select className={inputCls} value={form.repId} onChange={(e) => set({ repId: e.target.value })}>
            <option value="">Nobody yet</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.active ? '' : ' (inactive)'}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          <span>Payment</span>
          <select className={inputCls} value={form.paymentTerms} onChange={(e) => set({ paymentTerms: e.target.value as 'card' | 'terms' })}>
            <option value="card">Card at checkout</option>
            <option value="terms">On terms (invoiced)</option>
          </select>
        </label>
        <span className="flex items-center gap-2">
          <button type="submit" disabled={pending || !dirty} className={BUTTON.gold}>
            Save
          </button>
          <SaveState pending={pending} saved={saved && !dirty} error={error} />
        </span>
        {!tiers.length && <p className="text-[11px] text-adm-muted @2xl:col-span-4">No contractor pricing tiers yet. Add them on the Pricing page.</p>}
      </form>
    </Panel>
  )
}
