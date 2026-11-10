'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ExternalLink, ImageUp, Phone, RotateCcw, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BrandMark } from '@/components/contractor/BrandMark'
import { SEGMENT_COPY } from '@/lib/contractors/content'
import { brandColors, brandStyle, isHex, THEME_KEYS, THEMES } from '@/lib/contractors/theme'
import { SERVICE_MODE_LABEL, type AdminContractor, type ServiceMode } from '@/lib/contractors/types'
import { slugify } from '@/lib/contractors/slug'
import { createContractor, saveContractor, type ContractorInput } from '@/lib/portal/admin/contractor-actions'
import { SaveState } from './controls'
import { BUTTON, inputCls, labelCls, textareaCls } from './styles'
import { Panel } from './ui'

/**
 * Add a contractor, or edit one: their white-label brand (with a live
 * preview), their page address and their details.
 */

const BLANK: ContractorInput = {
  slug: '',
  isListed: true,
  segment: 'rv',
  company: '',
  firstName: '',
  goesBy: '',
  lastName: '',
  phone: '',
  phoneAlt: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  serviceStates: '',
  serviceMode: '',
  notes: '',
  theme: 'seal',
  primary: '',
  accent: '',
  logoUrl: '',
  tagline: '',
}

function initial(c: AdminContractor | null): ContractorInput {
  if (!c) return BLANK
  return {
    slug: c.slug,
    isListed: c.isListed,
    segment: c.segment,
    company: c.company ?? '',
    firstName: c.firstName ?? '',
    goesBy: c.goesBy ?? '',
    lastName: c.lastName ?? '',
    phone: c.phone ?? '',
    phoneAlt: c.phoneAlt ?? '',
    email: c.email ?? '',
    street: c.street ?? '',
    city: c.city ?? '',
    state: c.state ?? '',
    zip: c.zip ?? '',
    serviceStates: c.serviceStates.filter((s) => s !== c.state).join(', '),
    serviceMode: c.serviceMode ?? '',
    notes: c.notes ?? '',
    theme: c.brand.theme,
    primary: c.brand.primary ?? '',
    accent: c.brand.accent ?? '',
    logoUrl: c.brand.logoUrl ?? '',
    tagline: c.brand.tagline ?? '',
  }
}

/** `contractor` null adds a new one. */
export function ContractorEditor({ contractor }: { contractor: AdminContractor | null }) {
  const router = useRouter()
  const [form, setForm] = useState(() => initial(contractor))
  // A new contractor's page address follows their name until it's typed in.
  const [slugTyped, setSlugTyped] = useState(Boolean(contractor))
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof ContractorInput>(key: K, value: ContractorInput[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (!slugTyped && key !== 'slug') next.slug = slugify(next.company || [next.goesBy || next.firstName, next.lastName].join(' '))
      return next
    })
    setSaved(false)
  }

  const save = () =>
    start(async () => {
      setError(null)
      if (!contractor) {
        const result = await createContractor(form)
        if (result.ok && result.id) router.replace(`/portal/admin/dealers/contractors/${result.id}/?added=1`)
        else if (!result.ok) setError(result.error)
        return
      }
      const result = await saveContractor(contractor.id, form)
      if (result.ok) {
        setSaved(true)
        if (form.slug !== contractor.slug) router.refresh()
      } else setError(result.error)
    })

  const brand = { theme: form.theme, primary: form.primary || null, accent: form.accent || null }
  const name = form.company.trim() || [form.goesBy || form.firstName, form.lastName].filter(Boolean).join(' ') || 'New contractor'
  const slugChanged = Boolean(contractor) && form.slug !== contractor?.slug

  return (
    <div className="grid items-start gap-2 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-2">
        <Panel title="White label" meta="colors, logo and tagline on their page" tone="dealers" bodyClassName="space-y-4 p-3">
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-adm-muted">Palette</p>
            <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
              {THEME_KEYS.map((key) => {
                const t = THEMES[key]
                const on = form.theme === key && !form.primary && !form.accent
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, theme: key, primary: '', accent: '' }))
                      setSaved(false)
                    }}
                    className={twMerge(
                      'flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[12px] transition',
                      on ? 'border-adm-gold bg-adm-gold/10 text-adm-ink' : 'border-adm-line text-adm-text hover:border-adm-blue-bright/60',
                    )}
                  >
                    <span className="relative h-5 w-7 shrink-0">
                      <span className="absolute left-0 top-0 h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: t.primary }} />
                      <span className="absolute right-0 top-0 h-5 w-5 rounded-full ring-2 ring-adm-bg" style={{ background: t.accent }} />
                    </span>
                    <span className="truncate">{t.label}</span>
                    {on && <Check className="ml-auto h-3.5 w-3.5 text-adm-gold-text" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Main color (custom)" value={form.primary} fallback={brandColors({ theme: form.theme, primary: null, accent: null }).primary} onChange={(v) => set('primary', v)} />
            <ColorField label="Accent color (custom)" value={form.accent} fallback={brandColors({ theme: form.theme, primary: null, accent: null }).accent} onChange={(v) => set('accent', v)} />
          </div>

          <LogoField id={contractor?.id ?? null} value={form.logoUrl} onChange={(v) => set('logoUrl', v)} />

          <label className={labelCls}>
            <span>Tagline (optional, under the headline)</span>
            <input className={inputCls} value={form.tagline} maxLength={90} placeholder="Flat roofs, sealed for good." onChange={(e) => set('tagline', e.target.value)} />
          </label>
        </Panel>

        <Panel title="Details" meta="the public page shows name, phone, email, city and state" bodyClassName="grid gap-3 p-3 sm:grid-cols-2">
          <label className={twMerge(labelCls, 'sm:col-span-2')}>
            <span>Company (the brand name on their page)</span>
            <input className={inputCls} value={form.company} autoFocus={!contractor} onChange={(e) => set('company', e.target.value)} />
          </label>
          <label className={twMerge(labelCls, 'sm:col-span-2')}>
            <span>Page address</span>
            <span className="flex items-center overflow-hidden rounded-md border border-adm-line bg-adm-input focus-within:border-adm-blue-bright focus-within:ring-2 focus-within:ring-adm-blue-bright/25">
              <span className="pl-2.5 text-[12.5px] text-adm-faint">crazyseal.com/contractor/</span>
              <input
                className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 text-[12.5px] text-adm-ink placeholder:text-adm-faint focus:outline-none"
                value={form.slug}
                placeholder={contractor ? '' : 'made from the company name'}
                onChange={(e) => {
                  setSlugTyped(true)
                  set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }}
              />
            </span>
            {slugChanged && <span className="text-adm-warn">Changing it breaks links already shared to their old page address.</span>}
          </label>
          <label className={labelCls}>
            <span>First name</span>
            <input className={inputCls} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </label>
          <label className={labelCls}>
            <span>Last name</span>
            <input className={inputCls} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </label>
          <label className={labelCls}>
            <span>Goes by</span>
            <input className={inputCls} value={form.goesBy} onChange={(e) => set('goesBy', e.target.value)} />
          </label>
          <label className={labelCls}>
            <span>Type</span>
            <select className={inputCls} value={form.segment} onChange={(e) => set('segment', e.target.value as ContractorInput['segment'])}>
              <option value="rv">RV</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>
          <label className={labelCls}>
            <span>Phone</span>
            <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </label>
          <label className={labelCls}>
            <span>Second phone (admin only)</span>
            <input className={inputCls} value={form.phoneAlt} onChange={(e) => set('phoneAlt', e.target.value)} />
          </label>
          <label className={twMerge(labelCls, 'sm:col-span-2')}>
            <span>Email (quote requests from their page go here)</span>
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label className={twMerge(labelCls, 'sm:col-span-2')}>
            <span>Street (admin only, never shown publicly)</span>
            <input className={inputCls} value={form.street} onChange={(e) => set('street', e.target.value)} />
          </label>
          <label className={labelCls}>
            <span>City</span>
            <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>
              <span>State</span>
              <input className={inputCls} value={form.state} maxLength={2} placeholder="TX" onChange={(e) => set('state', e.target.value.toUpperCase())} />
            </label>
            <label className={labelCls}>
              <span>ZIP (places the pin)</span>
              <input className={inputCls} value={form.zip} inputMode="numeric" maxLength={5} onChange={(e) => set('zip', e.target.value.replace(/\D/g, ''))} />
            </label>
          </div>
          <label className={labelCls}>
            <span>Also serves (states)</span>
            <input className={inputCls} value={form.serviceStates} placeholder="OK, AR" onChange={(e) => set('serviceStates', e.target.value)} />
          </label>
          <label className={labelCls}>
            <span>Service</span>
            <select className={inputCls} value={form.serviceMode} onChange={(e) => set('serviceMode', e.target.value as ServiceMode | '')}>
              <option value="">Not set</option>
              {(Object.keys(SERVICE_MODE_LABEL) as ServiceMode[]).map((m) => (
                <option key={m} value={m}>
                  {SERVICE_MODE_LABEL[m]}
                </option>
              ))}
            </select>
          </label>
          <label className={twMerge(labelCls, 'sm:col-span-2')}>
            <span>Notes (admin only)</span>
            <textarea className={textareaCls} rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </label>
        </Panel>
      </div>

      <div className="space-y-2 lg:sticky lg:top-16">
        <Panel title="Preview" meta="their page header" bodyClassName="p-3">
          <div style={brandStyle(brand)} className="overflow-hidden rounded-lg bg-(--cb-primary) text-(--cb-on-primary) shadow-lg">
            <div className="flex items-center gap-2.5 px-3.5 pt-3.5">
              <BrandMark name={name} logoUrl={form.logoUrl || null} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-extrabold">{name}</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] opacity-60">Certified Crazy Seal installer</span>
              </span>
            </div>
            <div className="px-3.5 pb-4 pt-5">
              <p className="font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-[1.05] tracking-tight">
                {SEGMENT_COPY[form.segment].heroLines[0]}
                <span className="block text-(--cb-accent)">{SEGMENT_COPY[form.segment].heroLines[1]}</span>
              </p>
              {form.tagline && <p className="mt-2 text-[12px] font-semibold opacity-90">{form.tagline}</p>}
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-(--cb-accent) px-3 py-1.5 text-[11px] font-bold text-(--cb-on-accent)">
                <Phone className="h-3 w-3" /> Call {form.phone || 'them'}
              </span>
            </div>
          </div>
          {contractor?.isListed && (
            <a
              href={`/contractor/${contractor.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-[12px] font-medium text-adm-blue-bright hover:underline"
            >
              /contractor/{contractor.slug} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </Panel>

        <Panel bodyClassName="space-y-3 p-3">
          <label className="flex items-start gap-2 text-[12.5px] text-adm-text">
            <input type="checkbox" className="mt-0.5" checked={form.isListed} onChange={(e) => set('isListed', e.target.checked)} />
            <span>
              Listed publicly
              <span className="block text-[11px] text-adm-muted">Off hides their page and their pin on the public map.</span>
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={save} disabled={pending} className={BUTTON.gold}>
              {contractor ? 'Save changes' : 'Add contractor'}
            </button>
            <SaveState pending={pending} saved={saved} error={error} />
          </div>
          {saved && <p className="text-[11px] text-adm-muted">Their page updates on its next load.</p>}
        </Panel>
      </div>
    </div>
  )
}

function ColorField({ label, value, fallback, onChange }: { label: string; value: string; fallback: string; onChange: (v: string) => void }) {
  const shown = isHex(value) ? value : fallback
  return (
    <div className={labelCls}>
      <span>{label}</span>
      <div className="flex items-center gap-1.5">
        <input type="color" aria-label={label} value={shown} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 shrink-0 cursor-pointer rounded-md border border-adm-line bg-adm-input p-0.5" />
        <input className={inputCls} value={value} placeholder={`${fallback} (palette)`} maxLength={7} onChange={(e) => onChange(e.target.value.trim())} />
        {value && (
          <button type="button" onClick={() => onChange('')} className={twMerge(BUTTON.default, 'px-2')} title="Use the palette color">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function LogoField({ id, value, onChange }: { id: string | null; value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const body = new FormData()
      if (id) body.set('id', id)
      body.set('file', file)
      const res = await fetch('/api/admin/contractors/logo/', { method: 'POST', body })
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed. Try again.')
      onChange(json.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className={labelCls}>
      <span>Logo (PNG, JPEG or WebP, under 2 MB)</span>
      <div className="flex items-center gap-1.5">
        <input className={inputCls} value={value} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value.trim())} />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={twMerge(BUTTON.default, 'shrink-0')}>
          <ImageUp className="h-3.5 w-3.5" />
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className={twMerge(BUTTON.default, 'px-2')} title="Remove the logo">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
          }}
        />
      </div>
      {error && <span className="text-adm-red">{error}</span>}
    </div>
  )
}
