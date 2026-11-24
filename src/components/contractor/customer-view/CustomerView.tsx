'use client'

/* eslint-disable @next/next/no-img-element -- the contractor's own logo */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, EyeOff, FileText, Loader2, Monitor, Palette, Phone, Send, ShieldCheck, Smartphone } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { SEGMENT_COPY } from '@/lib/contractors/content'
import { brandStyle } from '@/lib/contractors/theme'
import type { Segment } from '@/lib/contractors/types'
import type { SampleProposal } from '@/lib/contractor/sample-proposal'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle } from '@/components/portal/ui'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'
import { ProposalSheet } from '@/components/quotes/ProposalSheet'
import { BrandMark } from '../BrandMark'
import { MiniLabel, tint } from '../projects/kit'
import { Segmented } from '../Segmented'

export interface CustomerViewProps {
  name: string
  segment: Segment
  /** Their public page's address (/contractor/<slug>/), and whether Crazy Seal lists it. */
  page: { path: string; host: string; listed: boolean }
  brand: {
    theme: string
    themeLabel: string
    primary: string
    accent: string
    logoUrl: string | null
    tagline: string | null
    /** Whether they picked their own colors, or use the preset's. */
    custom: boolean
  }
  phone: string | null
  place: string
  /** A sample proposal at their prices plus a markup; null when prices can't be read. */
  proposal: SampleProposal | null
  canBrand: boolean
  canQuote: boolean
}

type Device = 'desktop' | 'phone'

/**
 * What the contractor's customers see (Thermo's Customer view): their Crazy
 * Seal page as visitors get it, framed in a browser (the live page when
 * Crazy Seal lists it, otherwise a preview of its top in their brand), a
 * sample of the proposal they hand customers, and their brand with the way
 * into Brand studio.
 */
export function CustomerView({ name, segment, page, brand, phone, place, proposal, canBrand, canQuote }: CustomerViewProps) {
  const [device, setDevice] = useState<Device>('desktop')
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="space-y-6">
      <Panel className="overflow-hidden !p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5 md:px-6">
          <div className="min-w-0">
            <MiniLabel>Your page</MiniLabel>
            <h2 className="mt-1 text-base font-bold text-[var(--p-ink,#fff)] md:text-lg">{page.listed ? 'What visitors see' : 'A preview of your page'}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {page.listed && (
              <Segmented
                id="customer-device"
                label="Preview size"
                value={device}
                onChange={(d) => {
                  if (d !== device) setLoaded(false)
                  setDevice(d)
                }}
                options={[
                  { key: 'desktop', label: 'Desktop', icon: Monitor },
                  { key: 'phone', label: 'Phone', icon: Smartphone },
                ]}
              />
            )}
            {page.listed && (
              <a href={page.path} target="_blank" rel="noopener noreferrer" className={portalGhostButton}>
                Open your page <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {!page.listed && (
          <p className="mx-5 mb-4 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm ring-1 md:mx-6" style={tint('var(--p-accent, #F9EA1C)')}>
            <EyeOff className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong className="font-semibold">Your page isn’t public yet. Crazy Seal lists it.</strong> Once it’s on the contractor finder, it lives at {page.host}
              {page.path} and shows here as visitors see it. This is how its top will look in your brand.
            </span>
          </p>
        )}

        <div className="border-t border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/25 px-3 pb-3 pt-3 md:px-5 md:pb-5">
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className={twMerge(
              'mx-auto overflow-hidden border border-white/10 bg-[#0b1220] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]',
              device === 'phone' && page.listed ? 'max-w-[400px] rounded-[2.2rem] border-[6px] border-[#1b1f26]' : 'w-full rounded-2xl',
            )}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#151a22] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/80" />
              <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-black/30 px-3 py-1 font-mono text-[11.5px] text-white/55">
                {page.host}
                {page.path}
              </span>
            </div>

            {page.listed ? (
              <div className="relative bg-white" style={{ height: device === 'phone' ? 720 : 680 }}>
                {!loaded && (
                  <div className="absolute inset-0 grid place-items-center bg-[#0b1220] text-white/60">
                    <span className="inline-flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading your page…
                    </span>
                  </div>
                )}
                {/*
                  The contractor's own public page, from this site. Sandboxed without
                  forms, pop-ups or top navigation, so the preview can't send a real
                  quote request; scripts and its own origin stay on so it renders as live.
                */}
                <iframe
                  key={device}
                  src={page.path}
                  title={`${name}: your Crazy Seal page`}
                  sandbox="allow-scripts allow-same-origin"
                  referrerPolicy="same-origin"
                  loading="lazy"
                  onLoad={() => setLoaded(true)}
                  className={twMerge('h-full w-full border-0 transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
                />
              </div>
            ) : (
              <PagePreview name={name} segment={segment} brand={brand} phone={phone} place={place} />
            )}
          </motion.div>
          {page.listed && <p className="mt-3 text-center text-[11px] text-[var(--p-muted,#9DA3AB)]">A preview: the quote form and buttons work on your live page.</p>}
        </div>
      </Panel>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0">
          {proposal ? (
            <>
              <ProposalSheet
                brandName={name}
                preparedFor="Sample customer"
                subtitle={proposal.subtitle}
                meta={['Sample', proposal.date]}
                lines={proposal.lines}
                totals={proposal.totals}
              />
              <p className="mt-3 text-center text-[11px] text-[var(--p-muted,#9DA3AB)]">
                Sample materials at your price plus a {proposal.markupPct}% markup. Each quote’s proposal sets its own markup, labor and notes.
              </p>
            </>
          ) : (
            <Panel>
              <PanelTitle>Your proposal</PanelTitle>
              <p className="text-sm text-[var(--p-muted,#9DA3AB)]">The sample proposal needs today’s prices, which aren’t available right now. Try again in a minute.</p>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel delay={0.08}>
            <PanelTitle>What your customers get</PanelTitle>
            <ul className="space-y-3 text-sm text-[var(--p-ink,#fff)]">
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent,#F9EA1C)]" />
                <span>Your name on every proposal, powered by Crazy Seal, with the 50 year warranty behind the system.</span>
              </li>
              <li className="flex gap-3">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent,#F9EA1C)]" />
                <span>A printable proposal from any quote: your logo and colors, materials at your marked-up price, labor and notes. Crazy Seal’s prices to you never show.</span>
              </li>
              <li className="flex gap-3">
                <Send className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent,#F9EA1C)]" />
                <span>Quote requests from your page land in your pipeline as new customers and projects.</span>
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {canQuote && (
                <Link href="/portal/quotes/" className={portalButton}>
                  <FileText className="h-4 w-4" /> Your quotes
                </Link>
              )}
              <Link href="/portal/projects/" className={portalGhostButton}>
                Pipeline
              </Link>
            </div>
          </Panel>

          <Panel delay={0.14}>
            <PanelTitle
              action={
                canBrand ? (
                  <Link href="/portal/brand/" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
                    Brand studio <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null
              }
            >
              Your brand
            </PanelTitle>
            <div className="flex items-center gap-4">
              <div style={brandStyle(brand)}>
                <BrandMark name={name} logoUrl={brand.logoUrl} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--p-ink,#fff)]">{name}</p>
                <p className="truncate text-xs text-[var(--p-muted,#9DA3AB)]">{brand.tagline || 'No tagline yet'}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Swatch label="Main color" color={brand.primary} />
              <Swatch label="Accent" color={brand.accent} />
            </div>
            <p className="mt-3 text-xs text-[var(--p-muted,#9DA3AB)]">
              {brand.custom ? `Your own colors, on the ${brand.themeLabel} look.` : `The ${brand.themeLabel} look.`} {brand.logoUrl ? '' : 'No logo yet: your initials show instead.'}
            </p>
            {canBrand ? (
              <Link href="/portal/brand/" className={twMerge(portalGhostButton, 'mt-4 w-full')}>
                <Palette className="h-4 w-4" /> Change your logo and colors
              </Link>
            ) : (
              <p className="mt-4 text-xs text-[var(--p-muted,#9DA3AB)]">Your company’s owner or admin changes these in Brand studio.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/15 p-2.5">
      <span className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-white/15" style={{ background: color }} />
      <span className="min-w-0">
        <span className="block text-[11px] text-[var(--p-muted,#9DA3AB)]">{label}</span>
        <span className="block font-mono text-xs uppercase text-[var(--p-ink,#fff)]">{color}</span>
      </span>
    </div>
  )
}

const BTN = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold'

/**
 * The top of their page in their brand, for a page Crazy Seal hasn't listed
 * yet: the same words, colors and logo the live page uses
 * (ContractorLanding), drawn here rather than framed.
 */
function PagePreview({ name, segment, brand, phone, place }: Pick<CustomerViewProps, 'name' | 'segment' | 'brand' | 'phone' | 'place'>) {
  const copy = SEGMENT_COPY[segment]
  return (
    <div style={brandStyle(brand)} className="font-sans text-slate-900" aria-label={`Preview of ${name}’s page`}>
      <section className="relative isolate overflow-hidden bg-(--cb-primary) text-(--cb-on-primary)">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-32 -top-48 h-[30rem] w-[30rem] rounded-full bg-(--cb-accent) opacity-30 blur-[110px]" />
          <div className="absolute -bottom-48 -left-40 h-[26rem] w-[26rem] rounded-full bg-white opacity-[0.08] blur-[100px]" />
        </div>
        <div className="flex items-center gap-3 px-5 py-4 sm:px-8">
          <BrandMark name={name} logoUrl={brand.logoUrl} size="sm" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-extrabold tracking-tight">{name}</span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">Certified Crazy Seal installer</span>
          </span>
          <span className={twMerge(BTN, 'ml-auto hidden bg-(--cb-accent) px-4 py-2 text-(--cb-on-accent) shadow-md sm:inline-flex')}>Get a quote</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }}
          className="grid items-center gap-8 px-5 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10 md:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="min-w-0">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-current/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-semibold">
              <span className="h-2 w-2 shrink-0 rounded-full bg-(--cb-accent)" />
              <span className="truncate">
                {copy.eyebrow}
                {place ? ` · ${place}` : ''}
              </span>
            </p>
            <h3 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
              <span className="block">{copy.heroLines[0]}</span>
              <span className="block text-(--cb-accent)">{copy.heroLines[1]}</span>
            </h3>
            {brand.tagline && <p className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold opacity-90">{brand.tagline}</p>}
            <p className="mt-3 max-w-lg text-sm leading-relaxed opacity-80 sm:text-base">{copy.lead(name)}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {phone && (
                <span className={twMerge(BTN, 'bg-(--cb-accent) text-(--cb-on-accent) shadow-lg shadow-black/20')}>
                  <Phone className="h-4 w-4" /> Call {phone}
                </span>
              )}
              <span className={twMerge(BTN, 'border border-current/25 text-(--cb-on-primary)')}>
                <Send className="h-4 w-4" /> Request a quote
              </span>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold opacity-80">
              {copy.trust.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-(--cb-accent)" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative hidden md:block">
            <img src={copy.heroShot.after} alt={copy.heroShot.label} className="w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/15" style={{ aspectRatio: copy.heroShot.aspect }} />
            <span className="absolute -right-2 -top-3 rounded-full bg-(--cb-accent) px-3.5 py-1.5 text-[11px] font-extrabold text-(--cb-on-accent) shadow-xl">Before → After</span>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
