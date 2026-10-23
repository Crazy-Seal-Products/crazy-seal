'use client'

import { Check, Mail, Phone, ShieldCheck, Star } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { initials, type PartnerBrand } from '@/lib/portal/accounts'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'
const CS_LOGO = `${MEDIA}/2019/03/CRAZY-SEAL-LOGO-150.png`
const HERO_IMG = `${MEDIA}/2022/03/18-Installation-1024x576.jpg`
const CLOSEUP_IMG = `${MEDIA}/2019/07/Metal-Closeup-1024x1024.jpg`

export type PreviewKind = 'presentation' | 'brochure' | 'email'

/** Picks white or near-black text for a given background hex. */
export function inkFor(hex: string): string {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return '#ffffff'
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#111827' : '#ffffff'
}

function Mark({ brand, size = 'md' }: { brand: PartnerBrand; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-10 w-10 text-xs'
  if (brand.logoDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={brand.logoDataUrl} alt={brand.companyName} className={twMerge(dims, 'rounded-lg bg-white object-contain p-0.5')} />
    )
  }
  return (
    <span
      className={twMerge(dims, 'grid shrink-0 place-items-center rounded-lg font-black')}
      style={{ background: brand.accent, color: inkFor(brand.accent) }}
    >
      {initials(brand.companyName)}
    </span>
  )
}

function PoweredBy({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider',
        dark ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-600'
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={CS_LOGO} alt="" className="h-3.5 w-auto" />
      Powered by Crazy Seal
    </span>
  )
}

export function BrandPreview({ brand, kind, className }: { brand: PartnerBrand; kind: PreviewKind; className?: string }) {
  if (kind === 'brochure') return <Brochure brand={brand} className={className} />
  if (kind === 'email') return <EmailPreview brand={brand} className={className} />
  return <PresentationPage brand={brand} className={className} />
}

function PresentationPage({ brand, className }: { brand: PartnerBrand; className?: string }) {
  const ink = inkFor(brand.primary)
  const accentInk = inkFor(brand.accent)
  const domain = brand.website.replace(/^https?:\/\//, '')

  return (
    <div className={twMerge('overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl ring-1 ring-black/10', className)}>
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2">
        <span className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </span>
        <span className="mx-auto max-w-[70%] truncate rounded-md bg-white px-3 py-0.5 text-[10px] text-gray-500">
          {domain}/roof
        </span>
      </div>

      {/* nav */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="flex items-center gap-2">
          <Mark brand={brand} size="sm" />
          <span className="text-xs font-extrabold">{brand.companyName}</span>
        </span>
        <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: brand.accent, color: accentInk }}>
          {brand.phone}
        </span>
      </div>

      {/* hero */}
      {brand.template === 'split' ? (
        <div className="grid grid-cols-2" style={{ background: brand.primary, color: ink }}>
          <div className="p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Seamless roofing</p>
            <p className="mt-1 text-base font-extrabold leading-tight">{brand.tagline}</p>
            <p className="mt-2 text-[10px] opacity-75">50 year warranty · installed by {brand.companyName}</p>
            <span className="mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: brand.accent, color: accentInk }}>
              Get my free quote
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="relative overflow-hidden" style={{ background: brand.primary, color: ink }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt=""
            className={twMerge('absolute inset-0 h-full w-full object-cover', brand.template === 'bold' ? 'opacity-35' : 'opacity-15')}
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(120deg, ${brand.primary} 30%, transparent)` }}
          />
          <div className={twMerge('relative p-5', brand.template === 'clean' && 'text-center')}>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Seamless roofing</p>
            <p className={twMerge('mt-1 font-extrabold leading-tight', brand.template === 'bold' ? 'text-xl' : 'text-lg')}>
              {brand.tagline}
            </p>
            <p className="mt-2 text-[10px] opacity-80">A seamless roof with a 50 year warranty — installed by {brand.companyName}.</p>
            <span className="mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: brand.accent, color: accentInk }}>
              Get my free quote
            </span>
          </div>
        </div>
      )}

      {/* body */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {['Fiber-infused', 'More silicone', '3 part system'].map((t) => (
          <div key={t} className="rounded-lg bg-gray-50 p-2 text-center ring-1 ring-gray-200">
            <span className="mx-auto grid h-5 w-5 place-items-center rounded-full" style={{ background: brand.accent, color: accentInk }}>
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </span>
            <p className="mt-1 text-[9px] font-semibold">{t}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
        <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-1">Local reviews</span>
        </span>
        {brand.coBrand && <PoweredBy />}
      </div>
    </div>
  )
}

function Brochure({ brand, className }: { brand: PartnerBrand; className?: string }) {
  const ink = inkFor(brand.primary)
  const accentInk = inkFor(brand.accent)
  return (
    <div className={twMerge('mx-auto aspect-[8.5/11] w-full max-w-[22rem] overflow-hidden rounded-xl bg-white text-gray-900 shadow-2xl ring-1 ring-black/10', className)}>
      <div className="relative h-[46%] overflow-hidden" style={{ background: brand.primary, color: ink }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CLOSEUP_IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full opacity-60 blur-2xl" style={{ background: brand.accent }} />
        <div className="relative flex h-full flex-col justify-between p-5">
          <Mark brand={brand} size="lg" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-75">{brand.companyName}</p>
            <p className="mt-1 text-xl font-extrabold leading-tight">{brand.tagline}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-sm font-extrabold">The Crazy Seal Roofing System</p>
        <ul className="space-y-1.5 text-[11px] text-gray-600">
          {['Seamless, fluid-applied membrane', 'Fiber-reinforced silicone', 'Backed by a 50 year warranty'].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="grid h-4 w-4 place-items-center rounded-full" style={{ background: brand.accent, color: accentInk }}>
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
              {t}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 rounded-lg p-2.5 text-[11px] font-semibold" style={{ background: `${brand.primary}12` }}>
          <ShieldCheck className="h-4 w-4" style={{ color: brand.primary }} />
          50 year warranty registered by {brand.companyName}
        </div>
        <div className="flex items-end justify-between pt-1">
          <div className="text-[10px] leading-relaxed text-gray-600">
            <p className="font-bold text-gray-900">{brand.phone}</p>
            <p>{brand.website}</p>
          </div>
          {brand.coBrand && <PoweredBy />}
        </div>
      </div>
    </div>
  )
}

function EmailPreview({ brand, className }: { brand: PartnerBrand; className?: string }) {
  const ink = inkFor(brand.primary)
  const accentInk = inkFor(brand.accent)
  return (
    <div className={twMerge('overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl ring-1 ring-black/10', className)}>
      <div className="space-y-1 border-b border-gray-200 bg-gray-50 px-4 py-3 text-[11px] text-gray-500">
        <p>
          <span className="font-semibold text-gray-700">From:</span> {brand.companyName} &lt;hello@{brand.website}&gt;
        </p>
        <p>
          <span className="font-semibold text-gray-700">Subject:</span> Your Crazy Seal roof quote is ready
        </p>
      </div>
      <div className="px-5 py-4" style={{ background: brand.primary, color: ink }}>
        <div className="flex items-center gap-2">
          <Mark brand={brand} size="sm" />
          <span className="text-sm font-extrabold">{brand.companyName}</span>
        </div>
      </div>
      <div className="space-y-3 px-5 py-4 text-[12px] leading-relaxed text-gray-700">
        <p>Hi Pat,</p>
        <p>
          Thanks for having us out. Your quote for a seamless Crazy Seal roof is attached — it&apos;s a one-time
          install backed by a 50 year warranty.
        </p>
        <span className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold" style={{ background: brand.accent, color: accentInk }}>
          View my quote
        </span>
        <div className="mt-2 border-t border-gray-100 pt-3 text-[11px]">
          <p className="font-bold text-gray-900">The {brand.companyName} team</p>
          <p className="mt-1 flex items-center gap-3 text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {brand.phone}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {brand.website}
            </span>
          </p>
          {brand.coBrand && (
            <div className="mt-3">
              <PoweredBy />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
