'use client'

import React, { useId, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BadgePercent, Clock, Info, Loader2, PackageX, Save, Search, Truck, Wallet, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { money, num } from '@/lib/portal/admin/format'
import type { ClientPricing } from '@/lib/pricing/load'
import { MISSING_LABEL, type ShipTo } from '@/lib/pricing/types'
import type { AdminQuoteContractorContext, QuoteContractorOption } from '@/lib/quotes/admin-builder'
import { createAdminQuote, loadAdminQuoteContractor } from '@/lib/quotes/admin-create'
import { BackLink, Badge, Empty, PageHeader, Panel } from '@/components/portal/admin/ui'
import { BUTTON, inputCls, labelCls, textareaCls } from '@/components/portal/admin/styles'
import { draftFromProject } from '../PortalQuoteBuilder'
import { EMPTY_ROOF, RoofQuestions, usePricePreview, type RoofDraft } from '../RoofQuestions'
import { AdminQuoteLines } from './AdminQuoteLines'

/**
 * Admin > Quotes > New quote: staff price a roof for a customer (the public
 * live-offer pricing; name and email, and a phone and ship-to address from
 * the same totals the public builder asks for them) or for a contractor
 * (their discount: the live offer, their order-count level or their tier),
 * picked from every contractor, with their name and email filled in and
 * optionally one of their projects. The same roof questions as the builders
 * and a live price; cost and margin only when the page was given costs
 * (roles that can open Pricing). The server prices the quote again on save.
 */

type Audience = 'public' | 'contractor'
type Buyer = { name: string; email: string; phone: string; company: string }

const EMPTY_BUYER: Buyer = { name: '', email: '', phone: '', company: '' }
const EMPTY_SHIP: ShipTo = { street: '', city: '', state: '', zip: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function buyerFor(ctx: AdminQuoteContractorContext | null): Buyer {
  if (!ctx) return EMPTY_BUYER
  const c = ctx.contractor
  return { name: c.contact || c.name, email: c.email ?? '', phone: c.phone ?? '', company: c.company ?? '' }
}

/** Keeps the address bar on the contractor being quoted, so a reload or a shared link opens them. */
function setUrl(contractorId: string | null) {
  try {
    // Only the query changes: the same page, so nothing remounts.
    const url = new URL(window.location.href)
    if (contractorId) url.searchParams.set('contractor', contractorId)
    else url.searchParams.delete('contractor')
    window.history.replaceState(null, '', url)
  } catch {
    // Nothing depends on it.
  }
}

function Field({ label, hint, children, className }: { label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={twMerge(labelCls, className)}>
      <span className="flex items-baseline justify-between gap-2">
        <span>{label}</span>
        {hint && <span className="text-[10.5px] font-normal text-adm-faint">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function Note({ icon, tone = 'info', children }: { icon: React.ReactNode; tone?: 'info' | 'warn'; children: React.ReactNode }) {
  return (
    <p
      className={twMerge(
        'flex gap-2 rounded-md px-2.5 py-2 text-[12px] leading-snug ring-1 ring-inset',
        tone === 'warn' ? 'bg-amber-400/10 text-adm-warn ring-amber-400/30' : 'bg-adm-ink/[0.03] text-adm-text ring-adm-line',
      )}
    >
      <span className="mt-px shrink-0 opacity-80">{icon}</span>
      <span>{children}</span>
    </p>
  )
}

/** Type to find a contractor by name, company, person, email, city or state; the rep's own come first. */
function ContractorPicker({ options, onPick, loadingId }: { options: QuoteContractorOption[]; onPick: (id: string) => void; loadingId: string | null }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const indexed = useMemo(() => options.map((o) => ({ o, hay: [o.name, o.contact, o.email, o.city, o.state].filter(Boolean).join(' ').toLowerCase() })), [options])
  const matches = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    const hits = terms.length ? indexed.filter((x) => terms.every((t) => x.hay.includes(t))) : indexed
    return { rows: hits.slice(0, 8).map((x) => x.o), total: hits.length }
  }, [q, indexed])
  const pick = (id: string | undefined) => id && !loadingId && onPick(id)

  return (
    <div className="grid gap-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-adm-faint" />
        <input
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-label="Find a contractor"
          autoComplete="off"
          className={twMerge(inputCls, 'pl-8')}
          placeholder={`Search ${num(options.length)} contractors: name, company, city, state…`}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => Math.min(i + 1, matches.rows.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              pick(matches.rows[active]?.id)
            }
          }}
        />
      </div>
      <ul id={listId} role="listbox" aria-label="Contractors" className="divide-y divide-adm-line-soft overflow-hidden rounded-md border border-adm-line">
        {matches.rows.map((o, i) => (
          <li key={o.id} role="option" aria-selected={i === active}>
            <button
              type="button"
              disabled={Boolean(loadingId)}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o.id)}
              className={twMerge('flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12.5px] transition disabled:opacity-60', i === active ? 'bg-adm-blue-bright/10' : 'hover:bg-adm-ink/[0.03]')}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-adm-ink">{o.name}</span>
                <span className="block truncate text-[11px] text-adm-muted">{[o.contact, [o.city, o.state].filter(Boolean).join(', '), o.email].filter(Boolean).join(' · ') || '—'}</span>
              </span>
              {o.mine && <Badge tone="gold">Yours</Badge>}
              {loadingId === o.id && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-adm-muted" />}
            </button>
          </li>
        ))}
        {!matches.rows.length && <li className="px-2.5 py-3 text-center text-[12px] text-adm-muted">No contractor matches “{q}”.</li>}
      </ul>
      {matches.total > matches.rows.length && <p className="text-[11px] text-adm-faint">{num(matches.total - matches.rows.length)} more: keep typing to narrow it down.</p>}
    </div>
  )
}

export function AdminQuoteBuilder({
  publicPricing,
  showCost,
  contractors,
  initial,
  myRepName,
  blocked,
}: {
  publicPricing: ClientPricing
  showCost: boolean
  contractors: QuoteContractorOption[]
  /** The contractor from ?contractor=, already loaded. */
  initial: AdminQuoteContractorContext | null
  /** The signed-in admin's sales rep name, when they're a rep (the quote's rep). */
  myRepName: string | null
  /** Why this admin can't save a quote (a Sales rep whose login isn't linked to a rep). */
  blocked: string | null
}) {
  const router = useRouter()
  const [audience, setAudience] = useState<Audience>(initial ? 'contractor' : 'public')
  const [picked, setPicked] = useState<AdminQuoteContractorContext | null>(initial)
  const [buyer, setBuyer] = useState<Buyer>(() => buyerFor(initial))
  const [projectId, setProjectId] = useState('')
  const [draft, setDraft] = useState<RoofDraft>(EMPTY_ROOF)
  const [ship, setShip] = useState<ShipTo>(EMPTY_SHIP)
  const [notes, setNotes] = useState('')
  const [emailBuyer, setEmailBuyer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loading, startLoading] = useTransition()
  const [saving, startSaving] = useTransition()

  const pricing = audience === 'contractor' ? (picked?.pricing ?? null) : publicPricing
  const previewBuyer = useMemo(() => ({ phone: buyer.phone, shipTo: ship }), [buyer.phone, ship])
  const preview = usePricePreview(pricing ?? publicPricing, draft, previewBuyer)
  const result = pricing ? preview.result : null
  const priced = Boolean(result && result.lines.length)
  const settings = (pricing ?? publicPricing).settings
  const isCustomer = audience === 'public'
  const total = result?.total ?? 0
  const needsPhone = isCustomer && total >= settings.capture_phone_at
  const needsAddress = isCustomer && total >= settings.capture_address_at
  const c = picked?.contractor ?? null
  const repLine = myRepName ? `You (${myRepName})` : isCustomer ? 'None' : c?.repName ? `${c.repName} (their rep)` : 'None'

  const setB = (patch: Partial<Buyer>) => setBuyer((b) => ({ ...b, ...patch }))

  function switchAudience(next: Audience) {
    if (next === audience) return
    setAudience(next)
    setError(null)
    setProjectId('')
    setBuyer(next === 'contractor' ? buyerFor(picked) : EMPTY_BUYER)
    setUrl(next === 'contractor' ? (picked?.contractor.id ?? null) : null)
  }

  function pickContractor(id: string) {
    setError(null)
    setLoadingId(id)
    startLoading(async () => {
      const r = await loadAdminQuoteContractor(id)
      setLoadingId(null)
      if (!r.ok) return setError(r.error)
      setPicked(r.data)
      setBuyer(buyerFor(r.data))
      setProjectId('')
      setUrl(id)
    })
  }

  function clearContractor() {
    setPicked(null)
    setBuyer(EMPTY_BUYER)
    setProjectId('')
    setUrl(null)
  }

  function pickProject(id: string) {
    setProjectId(id)
    const p = c?.projects.find((x) => x.id === id)
    if (p) {
      setDraft(draftFromProject(p))
      if (p.site) setShip({ ...EMPTY_SHIP, ...p.site })
    }
  }

  function save() {
    if (blocked) return setError(blocked)
    if (!isCustomer && !picked) return setError('Pick the contractor this quote is for.')
    if (!preview.inputs || !result) return setError(preview.error ?? 'Answer the roof questions first.')
    if (!priced) return setError('Nothing on this roof can be priced. Quote it by hand.')
    if (!buyer.name.trim()) return setError('Add the buyer’s name.')
    if (!EMAIL_RE.test(buyer.email.trim())) return setError('Add an email the quote can go to.')
    // The public builder's rules: a phone from capture_phone_at, a full ship-to address from capture_address_at.
    if (isCustomer && result.missing.length) {
      return setError(`${result.missing.map((m) => MISSING_LABEL[m]).join(' and ')} needed for a quote this size, as on the public builder.`)
    }
    setError(null)
    const hasShip = Boolean(ship.street || ship.city || ship.state || ship.zip)
    startSaving(async () => {
      const r = await createAdminQuote({
        audience,
        contractorId: isCustomer ? null : (picked?.contractor.id ?? null),
        projectId: isCustomer ? null : projectId || null,
        inputs: preview.inputs,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        company: buyer.company,
        shipTo: hasShip ? ship : null,
        notes,
        emailBuyer,
      })
      if (!r.ok) return setError(r.error)
      router.push(`/portal/admin/quotes/${r.id}/?created=${r.emailed == null ? '1' : r.emailed ? 'emailed' : 'email_failed'}`)
    })
  }

  const audienceBtn = (key: Audience, label: string, sub: string) => (
    <button
      type="button"
      aria-pressed={audience === key}
      onClick={() => switchAudience(key)}
      className={twMerge(
        'rounded-md border px-3 py-2 text-left transition',
        audience === key ? 'border-adm-gold bg-adm-gold/10 ring-2 ring-adm-gold/25' : 'border-adm-line bg-adm-input hover:border-adm-blue-bright/60',
      )}
    >
      <span className="block text-[12.5px] font-semibold text-adm-ink">{label}</span>
      <span className="block text-[11px] text-adm-muted">{sub}</span>
    </button>
  )

  return (
    <>
      <BackLink href="/portal/admin/quotes/">Quotes</BackLink>
      <PageHeader
        title="New quote"
        description={`Price a roof for a customer or a contractor. Saving holds the price as a live offer for ${publicPricing.settings.offer_hours} hours; the buyer gets a link to view and order it.`}
      />
      {blocked && (
        <p role="alert" className="mb-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[12.5px] text-adm-warn">
          {blocked}
        </p>
      )}

      <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="Who it’s for" tone="dealers">
            <div className="grid gap-3 p-3">
              <div className="grid grid-cols-2 gap-2">
                {audienceBtn('public', 'A customer', 'Public pricing: the live offer or a public tier')}
                {audienceBtn('contractor', 'A contractor', 'Their discount: order count or their tier')}
              </div>

              {!isCustomer &&
                (c ? (
                  <div className="rounded-md border border-adm-line bg-adm-ink/[0.02] p-2.5">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-adm-ink">{c.name}</p>
                        <p className="truncate text-[11.5px] text-adm-muted">{[c.contact !== c.name ? c.contact : null, [c.city, c.state].filter(Boolean).join(', '), c.email].filter(Boolean).join(' · ') || '—'}</p>
                      </div>
                      <button type="button" onClick={clearContractor} className={twMerge(BUTTON.default, 'h-7 px-2 text-[11.5px]')}>
                        <X className="h-3.5 w-3.5" /> Change
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge tone="gold">{c.priceLabel}</Badge>
                      <Badge tone="neutral">{c.orderCount == null ? 'Orders not counted' : `${num(c.orderCount)} Crazy Seal order${c.orderCount === 1 ? '' : 's'}`}</Badge>
                      <Badge tone={c.paymentTerms === 'terms' ? 'warn' : 'neutral'}>{c.paymentTerms === 'terms' ? 'Payment terms' : 'Card at checkout'}</Badge>
                      <Badge tone="info">Rep: {c.repName ?? 'none'}</Badge>
                    </div>
                  </div>
                ) : (
                  <ContractorPicker options={contractors} onPick={pickContractor} loadingId={loading ? loadingId : null} />
                ))}

              {(isCustomer || c) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Name *">
                    <input className={inputCls} autoComplete="off" value={buyer.name} onChange={(e) => setB({ name: e.target.value })} />
                  </Field>
                  <Field label="Email *">
                    <input className={inputCls} type="email" autoComplete="off" value={buyer.email} onChange={(e) => setB({ email: e.target.value })} />
                  </Field>
                  <Field label={needsPhone ? 'Phone *' : 'Phone'} hint={isCustomer && !needsPhone ? `needed from ${money(settings.capture_phone_at)}` : undefined}>
                    <input className={inputCls} type="tel" autoComplete="off" required={needsPhone} value={buyer.phone} onChange={(e) => setB({ phone: e.target.value })} />
                  </Field>
                  <Field label="Company">
                    <input className={inputCls} autoComplete="off" value={buyer.company} onChange={(e) => setB({ company: e.target.value })} />
                  </Field>
                </div>
              )}

              {c && (
                <Field label="Project" hint="optional · a project in Lead moves to Quoted">
                  <select className={inputCls} value={projectId} onChange={(e) => pickProject(e.target.value)}>
                    <option value="">No project</option>
                    {c.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.stage.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          </Panel>

          <Panel title="Roof" tone="sales">
            <div className="p-3">
              <RoofQuestions theme="admin" draft={draft} onChange={setDraft} className="gap-4" />
              {preview.error && draft.application && <p className="mt-2 text-[12px] text-adm-warn">{preview.error}</p>}
            </div>
          </Panel>

          <Panel title="Ship to" meta={needsAddress ? 'required for a quote this size' : isCustomer ? `needed from ${money(settings.capture_address_at)}` : 'optional'} tone="info">
            <div className="grid gap-2 p-3">
              <div className="grid grid-cols-6 gap-2">
                <input className={twMerge(inputCls, 'col-span-6')} aria-label="Street address" placeholder="Street address" required={needsAddress} value={ship.street ?? ''} onChange={(e) => setShip({ ...ship, street: e.target.value })} />
                <input className={twMerge(inputCls, 'col-span-3')} aria-label="City" placeholder="City" required={needsAddress} value={ship.city ?? ''} onChange={(e) => setShip({ ...ship, city: e.target.value })} />
                <input
                  className={twMerge(inputCls, 'col-span-1 px-1.5 text-center')}
                  aria-label="State"
                  placeholder="ST"
                  maxLength={2}
                  required={needsAddress}
                  value={ship.state ?? ''}
                  onChange={(e) => setShip({ ...ship, state: e.target.value.toUpperCase() })}
                />
                <input className={twMerge(inputCls, 'col-span-2')} aria-label="ZIP" placeholder="ZIP" inputMode="numeric" required={needsAddress} value={ship.zip ?? ''} onChange={(e) => setShip({ ...ship, zip: e.target.value })} />
              </div>
              <Field label="Notes" hint="staff only">
                <textarea className={textareaCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything staff should know about this quote" />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="grid min-w-0 content-start gap-2 xl:sticky xl:top-3">
          <Panel
            title="Live price"
            meta={result && preview.inputs ? `${result.basis.label}${showCost ? ' · cost and margin for Pricing roles' : ''}` : undefined}
            tone="sales"
          >
            {!pricing ? (
              <Empty>Pick a contractor to price it at their discount.</Empty>
            ) : !result ? (
              <Empty>Answer the roof questions to see the materials and price.</Empty>
            ) : !priced ? (
              <Empty>Nothing to price for this roof online. Quote it by hand.</Empty>
            ) : (
              <AdminQuoteLines lines={result.lines} totals={result} showCost={showCost} />
            )}
            {result && (
              <div className="grid gap-1.5 border-t border-adm-line p-3">
                <Note icon={<BadgePercent className="h-3.5 w-3.5" />}>
                  {isCustomer ? 'Customer pricing: the best of the live offer or a public tier.' : 'Contractor pricing: the best of the live offer, their order-count level or their tier.'}
                </Note>
                {priced && result.shipping === 'free' && result.shipping_total == null && (
                  <Note icon={<Truck className="h-3.5 w-3.5" />}>
                    Shipping is calculated at checkout. Free from {money(settings.free_shipping_over)} ({money(Math.max(0, settings.free_shipping_over - result.total))} more).
                  </Note>
                )}
                {result.shipping === 'freight' && <Note icon={<Truck className="h-3.5 w-3.5" />}>Ships freight: add the freight on the quote (Price override) before checkout.</Note>}
                {result.unavailable.length > 0 && (
                  <Note tone="warn" icon={<PackageX className="h-3.5 w-3.5" />}>
                    The store has nothing to price for {result.unavailable.join(', ')}; the quote goes to staff to add it.
                  </Note>
                )}
                {!isCustomer && c?.paymentTerms === 'terms' && <Note icon={<Wallet className="h-3.5 w-3.5" />}>On payment terms: Crazy Seal invoices them when they order.</Note>}
                {isCustomer && result.missing.length > 0 && (
                  <Note tone="warn" icon={<Info className="h-3.5 w-3.5" />}>
                    {result.missing.map((m) => MISSING_LABEL[m]).join(' and ')} needed for a quote this size.
                  </Note>
                )}
              </div>
            )}
            <div className="grid gap-2 border-t border-adm-line p-3">
              <label className="flex items-center gap-2 text-[12.5px] text-adm-text">
                <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--adm-gold)]" checked={emailBuyer} onChange={(e) => setEmailBuyer(e.target.checked)} />
                Email the quote link to the buyer now{buyer.email.trim() ? ` (${buyer.email.trim()})` : ''}
              </label>
              <p className="flex items-center gap-1.5 text-[11.5px] text-adm-muted">
                <Clock className="h-3.5 w-3.5" /> Held {publicPricing.settings.offer_hours} hours once saved · Sales rep on the quote: {repLine}
              </p>
              <button type="button" onClick={save} disabled={saving || loading || Boolean(blocked) || !priced || (!isCustomer && !picked)} className={twMerge(BUTTON.gold, 'h-9 w-full justify-center text-[13px]')}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : priced && result ? `Save quote · ${money(result.total)}` : 'Save quote'}
              </button>
              {error && (
                <p role="alert" className="text-[12px] font-medium text-adm-red">
                  {error}
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
