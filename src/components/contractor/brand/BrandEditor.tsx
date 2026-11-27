'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ExternalLink, ImageUp, Loader2, Phone, RotateCcw, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BrandMark } from '@/components/contractor/BrandMark'
import { Panel, PanelTitle, ViewHeader, portalButton, portalGhostButton, portalInput } from '@/components/portal/ui'
import { SEGMENT_COPY } from '@/lib/contractors/content'
import type { Segment } from '@/lib/contractors/types'
import { brandColors, brandStyle, isHex, THEME_KEYS, THEMES } from '@/lib/contractors/theme'
import { saveBrand, type BrandInput } from '@/lib/contractor/brand-actions'

/**
 * Your page: the contractor's public page (/contractor/<slug>) in their own
 * colors, logo, tagline and phone, with a live preview of its header.
 */
export function BrandEditor({
  initial,
  name,
  slug,
  listed,
  segment,
  canEdit,
}: {
  initial: BrandInput
  name: string
  slug: string
  listed: boolean
  segment: Segment
  /** False in View as (read-only). */
  canEdit: boolean
}) {
  const router = useRouter()
  const [form, setForm] = useState<BrandInput>(initial)
  // What's stored now: the starting values, then whatever the last save stored.
  const [stored, setStored] = useState<BrandInput>(initial)
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const dirty = JSON.stringify(form) !== JSON.stringify(stored)

  const set = (patch: Partial<BrandInput>) => {
    setForm((f) => ({ ...f, ...patch }))
    setResult(null)
  }

  const save = () =>
    start(async () => {
      const r = await saveBrand(form)
      setResult(r.ok ? { ok: true, text: r.message ?? 'Saved' } : { ok: false, text: r.error })
      if (r.ok && r.saved) {
        setForm(r.saved)
        setStored(r.saved)
        router.refresh()
      }
    })

  const brand = { theme: form.theme, primary: form.primary || null, accent: form.accent || null }
  const copy = SEGMENT_COPY[segment]
  const pageHref = `/contractor/${slug}/`

  return (
    <>
      <ViewHeader
        kicker="Grow"
        title="Your page"
        description="Your Crazy Seal page is where customers find you on the map and ask you for a quote. Make it yours: colors, logo, tagline and phone."
      >
        {listed && (
          <a href={pageHref} target="_blank" rel="noopener noreferrer" className={portalGhostButton}>
            View your page <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </ViewHeader>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel>
          <fieldset disabled={!canEdit || pending} className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-semibold text-blue-100/60">Palette</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {THEME_KEYS.map((key) => {
                  const t = THEMES[key]
                  const on = form.theme === key && !form.primary && !form.accent
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set({ theme: key, primary: '', accent: '' })}
                      className={twMerge(
                        'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition',
                        on ? 'border-highlight/60 bg-highlight/10 text-white' : 'border-white/10 text-blue-50/80 hover:border-white/25',
                      )}
                    >
                      <span className="relative h-5 w-7 shrink-0">
                        <span className="absolute left-0 top-0 h-5 w-5 rounded-full ring-1 ring-black/20" style={{ background: t.primary }} />
                        <span className="absolute right-0 top-0 h-5 w-5 rounded-full ring-2 ring-[#15181C]" style={{ background: t.accent }} />
                      </span>
                      <span className="truncate">{t.label}</span>
                      {on && <Check className="ml-auto h-3.5 w-3.5 text-highlight" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Main color (custom)"
                value={form.primary}
                fallback={brandColors({ theme: form.theme, primary: null, accent: null }).primary}
                onChange={(v) => set({ primary: v })}
              />
              <ColorField
                label="Accent color (custom)"
                value={form.accent}
                fallback={brandColors({ theme: form.theme, primary: null, accent: null }).accent}
                onChange={(v) => set({ accent: v })}
              />
            </div>

            <LogoField value={form.logoUrl} onChange={(v) => set({ logoUrl: v })} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Tagline (under the headline)</span>
                <input className={portalInput} value={form.tagline} maxLength={90} placeholder="Flat roofs, sealed for good." onChange={(e) => set({ tagline: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Phone customers call</span>
                <input className={portalInput} type="tel" value={form.phone} maxLength={40} placeholder="(555) 555-0123" onChange={(e) => set({ phone: e.target.value })} />
              </label>
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-5">
            <button type="button" onClick={save} disabled={!canEdit || pending || !dirty} className={portalButton}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
            {dirty && !pending && (
              <button type="button" onClick={() => setForm(stored)} className="text-sm text-blue-100/60 hover:text-white">
                Undo changes
              </button>
            )}
            {result && (
              <span role="status" className={twMerge('text-sm', result.ok ? 'text-accent-light' : 'text-red-300')}>
                {result.text}
              </span>
            )}
          </div>
        </Panel>

        <Panel delay={0.1} className="lg:sticky lg:top-6">
          <PanelTitle>Preview</PanelTitle>
          <div style={brandStyle(brand)} className="overflow-hidden rounded-2xl bg-(--cb-primary) text-(--cb-on-primary) shadow-xl">
            <div className="flex items-center gap-2.5 px-4 pt-4">
              <BrandMark name={name} logoUrl={form.logoUrl || null} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold">{name}</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] opacity-60">Certified Crazy Seal installer</span>
              </span>
            </div>
            <div className="px-4 pb-5 pt-6">
              <p className="font-[family-name:var(--font-display)] text-2xl font-extrabold leading-[1.05] tracking-tight">
                {copy.heroLines[0]}
                <span className="block text-(--cb-accent)">{copy.heroLines[1]}</span>
              </p>
              {form.tagline && <p className="mt-2 text-sm font-semibold opacity-90">{form.tagline}</p>}
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-(--cb-accent) px-3.5 py-2 text-xs font-bold text-(--cb-on-accent)">
                <Phone className="h-3.5 w-3.5" /> Call {form.phone || 'us'}
              </span>
            </div>
          </div>
          {listed ? (
            <a href={pageHref} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent-light hover:underline">
              crazyseal.com/contractor/{slug} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <p className="mt-3 text-xs text-blue-100/55">Your page isn’t listed publicly yet. Call Crazy Seal to turn it on.</p>
          )}
        </Panel>
      </div>
    </>
  )
}

function ColorField({ label, value, fallback, onChange }: { label: string; value: string; fallback: string; onChange: (v: string) => void }) {
  const shown = isHex(value) ? value : fallback
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-1"
        />
        <input className={portalInput} value={value} placeholder={`${fallback} (palette)`} maxLength={7} onChange={(e) => onChange(e.target.value.trim())} />
        {value && (
          <button type="button" onClick={() => onChange('')} title="Use the palette color" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-blue-100/70 hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function LogoField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const body = new FormData()
      body.set('file', file)
      const res = await fetch('/api/portal/brand/logo/', { method: 'POST', body })
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
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Logo (PNG, JPEG or WebP, under 2 MB)</span>
      <div className="flex flex-wrap items-center gap-2">
        {value && (
          <span className="grid h-12 w-20 shrink-0 place-items-center rounded-xl bg-white p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Your logo" className="max-h-full max-w-full object-contain" />
          </span>
        )}
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={portalGhostButton}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
          {busy ? 'Uploading…' : value ? 'Replace logo' : 'Upload logo'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1 text-sm text-blue-100/60 hover:text-white">
            <X className="h-4 w-4" /> Remove
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
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  )
}
