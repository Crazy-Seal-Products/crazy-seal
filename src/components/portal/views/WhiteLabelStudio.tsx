'use client'

import React, { useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  Check,
  FileText,
  ImagePlus,
  Mail,
  MonitorSmartphone,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { PartnerBrand, PortalAccount } from '@/lib/portal/accounts'
import { EASE_OUT_EXPO } from '@/components/motion'
import { usePortal } from '../PortalContext'
import { BrandPreview, type PreviewKind } from '../BrandPreview'
import { Panel, PanelTitle, StatusPill, ViewHeader, portalButton, portalGhostButton, portalInput } from '../ui'

const STEPS = [
  { title: 'Brand basics', desc: 'Name, contact, logo' },
  { title: 'Colors & style', desc: 'Pick a template' },
  { title: 'Crazy Seal review', desc: 'Our asset team checks it' },
  { title: 'Live', desc: 'Co-branded assets unlock' },
]

const STATUS_STEP: Record<PortalAccount['whiteLabelStatus'], number> = {
  not_started: 0,
  draft: 1,
  in_design: 2,
  live: 3,
}

const STATUS_LABEL: Record<PortalAccount['whiteLabelStatus'], string> = {
  not_started: 'Not started',
  draft: 'Draft',
  in_design: 'In review',
  live: 'Live',
}

const PALETTES: { name: string; primary: string; accent: string }[] = [
  { name: 'Crimson', primary: '#7A1F2B', accent: '#E0A23B' },
  { name: 'Harbor', primary: '#0F6E7A', accent: '#F2B441' },
  { name: 'Forest', primary: '#2F4A3A', accent: '#C9D84A' },
  { name: 'Midnight', primary: '#1B1F3B', accent: '#5BC0EB' },
  { name: 'Slate', primary: '#33404D', accent: '#FF7A45' },
  { name: 'Crazy Seal', primary: '#003365', accent: '#5BA411' },
]

const TEMPLATES: { id: PartnerBrand['template']; name: string }[] = [
  { id: 'bold', name: 'Bold' },
  { id: 'clean', name: 'Clean' },
  { id: 'split', name: 'Split' },
]

const PREVIEWS: { id: PreviewKind; label: string; icon: LucideIcon }[] = [
  { id: 'presentation', label: 'Presentation page', icon: MonitorSmartphone },
  { id: 'brochure', label: 'Brochure', icon: FileText },
  { id: 'email', label: 'Quote email', icon: Mail },
]

const MAX_LOGO_BYTES = 600 * 1024

export function WhiteLabelStudio() {
  const { account, brand, updateBrand, resetBrand } = usePortal()
  const [status, setStatus] = useState<PortalAccount['whiteLabelStatus']>(
    account.whiteLabelStatus === 'not_started' ? 'draft' : account.whiteLabelStatus
  )
  const [preview, setPreview] = useState<PreviewKind>('presentation')
  const [notice, setNotice] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const step = STATUS_STEP[status]

  const onLogo = (file?: File) => {
    setLogoError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) return setLogoError('Use a PNG, JPG or SVG.')
    if (file.size > MAX_LOGO_BYTES) return setLogoError('Keep the logo under 600 KB.')
    const reader = new FileReader()
    reader.onload = () => updateBrand({ logoDataUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  const submit = () => {
    setStatus('in_design')
    setNotice('Sent to the Crazy Seal asset team. Co-branded assets usually go live within 2 business days.')
    window.setTimeout(() => setNotice(null), 6000)
  }

  return (
    <>
      <ViewHeader
        kicker="White Label Studio"
        title="Your brand on every customer touchpoint"
        description="Set your brand once. We co-brand your presentation page, brochures and quote emails — powered by Crazy Seal."
      >
        <StatusPill status={status === 'in_design' ? 'in_design' : status} label={STATUS_LABEL[status]} />
        <button onClick={resetBrand} className={portalGhostButton}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button onClick={submit} className={portalButton} disabled={status === 'in_design'}>
          <Send className="h-4 w-4" />
          {status === 'live' ? 'Submit changes' : 'Submit for review'}
        </button>
      </ViewHeader>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-accent/15 px-4 py-3 text-sm ring-1 ring-accent/40">
              <Sparkles className="h-4 w-4 shrink-0 text-highlight" />
              {notice}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Process */}
      <Panel className="mb-5 !py-4">
        <ol className="grid gap-4 sm:grid-cols-4">
          {STEPS.map((s, i) => {
            const done = i < step
            const current = i === step
            return (
              <li key={s.title} className="relative flex items-center gap-3 sm:flex-col sm:items-start">
                {i < STEPS.length - 1 && (
                  <span className="absolute left-[2.25rem] right-0 top-4 hidden h-0.5 overflow-hidden rounded-full bg-white/10 sm:block">
                    <motion.span
                      className="block h-full bg-gradient-to-r from-accent to-highlight"
                      initial={{ width: 0 }}
                      animate={{ width: done ? '100%' : '0%' }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: EASE_OUT_EXPO }}
                    />
                  </span>
                )}
                <span
                  className={twMerge(
                    'relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ring-4 ring-[#001a33]',
                    done ? 'bg-accent text-white' : current ? 'bg-highlight text-primary' : 'bg-white/10 text-blue-100/60'
                  )}
                >
                  {current && <span className="absolute inset-0 rounded-full bg-highlight/50 animate-pulse-ring" />}
                  {done ? <Check className="h-4 w-4" strokeWidth={3.5} /> : i + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{s.title}</span>
                  <span className="block text-xs text-blue-100/50">{s.desc}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Form */}
        <div className="space-y-5">
          <Panel delay={0.05}>
            <PanelTitle>Business details</PanelTitle>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Company name">
                <input className={portalInput} value={brand.companyName} onChange={(e) => updateBrand({ companyName: e.target.value })} />
              </Field>
              <Field label="Tagline">
                <input className={portalInput} value={brand.tagline} maxLength={60} onChange={(e) => updateBrand({ tagline: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={portalInput} value={brand.phone} onChange={(e) => updateBrand({ phone: e.target.value })} />
              </Field>
              <Field label="Website">
                <input className={portalInput} value={brand.website} onChange={(e) => updateBrand({ website: e.target.value })} />
              </Field>
            </div>
          </Panel>

          <Panel delay={0.1}>
            <PanelTitle>Logo</PanelTitle>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onLogo(e.dataTransfer.files?.[0])
              }}
              className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-white/15 p-4 transition hover:border-accent/50"
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06]">
                {brand.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.logoDataUrl} alt="Your logo" className="h-full w-full bg-white object-contain p-1" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-blue-100/40" />
                )}
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">Drop your logo here</p>
                <p className="text-xs text-blue-100/50">PNG or SVG with a transparent background · under 600 KB</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => fileRef.current?.click()} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15">
                    Choose file
                  </button>
                  {brand.logoDataUrl && (
                    <button
                      onClick={() => updateBrand({ logoDataUrl: undefined })}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-blue-100/60 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
                {logoError && <p className="mt-2 text-xs text-red-300">{logoError}</p>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
            </div>
          </Panel>

          <Panel delay={0.15}>
            <PanelTitle>Colors & template</PanelTitle>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Primary" value={brand.primary} onChange={(v) => updateBrand({ primary: v })} />
              <ColorField label="Accent" value={brand.accent} onChange={(v) => updateBrand({ accent: v })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PALETTES.map((p) => {
                const active = p.primary.toLowerCase() === brand.primary.toLowerCase() && p.accent.toLowerCase() === brand.accent.toLowerCase()
                return (
                  <button
                    key={p.name}
                    onClick={() => updateBrand({ primary: p.primary, accent: p.accent })}
                    title={p.name}
                    className={twMerge(
                      'flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[11px] font-semibold ring-1 transition',
                      active ? 'bg-white/10 ring-accent' : 'ring-white/10 hover:ring-white/30'
                    )}
                  >
                    <span className="flex">
                      <span className="h-5 w-5 rounded-full ring-2 ring-[#001a33]" style={{ background: p.primary }} />
                      <span className="-ml-1.5 h-5 w-5 rounded-full ring-2 ring-[#001a33]" style={{ background: p.accent }} />
                    </span>
                    {p.name}
                  </button>
                )
              })}
            </div>

            <p className="mb-2 mt-5 text-xs font-semibold text-blue-100/60">Template</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateBrand({ template: t.id })}
                  className={twMerge(
                    'rounded-2xl p-2 text-xs font-semibold ring-1 transition',
                    brand.template === t.id ? 'bg-white/10 ring-accent' : 'ring-white/10 hover:ring-white/30'
                  )}
                >
                  <TemplateThumb id={t.id} primary={brand.primary} accent={brand.accent} />
                  <span className="mt-1.5 block">{t.name}</span>
                </button>
              ))}
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.07]">
              <span>
                <span className="block text-sm font-semibold">Show “Powered by Crazy Seal”</span>
                <span className="block text-xs text-blue-100/50">Borrow the trust of the brand and the 50 year warranty.</span>
              </span>
              <button
                role="switch"
                aria-checked={brand.coBrand}
                onClick={() => updateBrand({ coBrand: !brand.coBrand })}
                className={twMerge('relative h-6 w-11 shrink-0 rounded-full transition-colors', brand.coBrand ? 'bg-accent' : 'bg-white/15')}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className={twMerge('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', brand.coBrand ? 'right-0.5' : 'left-0.5')}
                />
              </button>
            </label>
          </Panel>
        </div>

        {/* Preview */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <Panel delay={0.1} className="overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-40" style={{ background: brand.accent }} />
            <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
              <LayoutGroup id="preview-tabs">
                <div className="flex gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
                  {PREVIEWS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPreview(id)}
                      className={twMerge(
                        'relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                        preview === id ? 'text-primary' : 'text-blue-100/70 hover:text-white'
                      )}
                    >
                      {preview === id && (
                        <motion.span layoutId="preview-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                      )}
                      <Icon className="relative h-3.5 w-3.5" />
                      <span className="relative hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
              <span className="text-xs text-blue-100/50">Live preview</span>
            </div>

            <div className="relative grid min-h-[26rem] place-items-center rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_70%)] p-2 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={preview}
                  initial={{ opacity: 0, y: 16, rotateX: 8 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                  className="w-full max-w-xl [perspective:1200px]"
                >
                  <BrandPreview brand={brand} kind={preview} />
                </motion.div>
              </AnimatePresence>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">{label}</span>
      {children}
    </label>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <span className="font-mono text-xs uppercase text-blue-100/80">{value}</span>
      </span>
    </label>
  )
}

function TemplateThumb({ id, primary, accent }: { id: PartnerBrand['template']; primary: string; accent: string }) {
  return (
    <span className="block overflow-hidden rounded-lg bg-white">
      {id === 'split' ? (
        <span className="grid h-10 grid-cols-2">
          <span style={{ background: primary }} className="p-1.5">
            <span className="block h-1 w-6 rounded bg-white/80" />
            <span className="mt-1 block h-1.5 w-4 rounded" style={{ background: accent }} />
          </span>
          <span className="bg-gray-300" />
        </span>
      ) : (
        <span className="block h-10 p-1.5" style={{ background: primary }}>
          <span className={twMerge('block h-1 rounded bg-white/80', id === 'clean' ? 'mx-auto w-8' : 'w-10')} />
          <span className={twMerge('mt-1 block h-1.5 w-4 rounded', id === 'clean' && 'mx-auto')} style={{ background: accent }} />
        </span>
      )}
      <span className="flex gap-1 p-1.5">
        <span className="h-2 flex-1 rounded bg-gray-200" />
        <span className="h-2 flex-1 rounded bg-gray-200" />
        <span className="h-2 flex-1 rounded bg-gray-200" />
      </span>
    </span>
  )
}
