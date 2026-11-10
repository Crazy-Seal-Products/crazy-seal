'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import {
  Check,
  ChevronDown,
  Droplets,
  Hammer,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  Warehouse,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { EASE_OUT_EXPO, Marquee, Reveal, Stagger, StaggerItem } from '@/components/motion'
import { SEGMENT_COPY, type SegmentCopy, type Transformation } from '@/lib/contractors/content'
import { brandStyle } from '@/lib/contractors/theme'
import { placeLabel, SERVICE_MODE_LABEL, telHref, type PublicContractor } from '@/lib/contractors/types'
import { BrandMark } from './BrandMark'
import { QuoteForm } from './QuoteForm'

/**
 * The white-label contractor page. One layout and one set of copy for every
 * contractor; the brand (lib/contractors/theme) only sets the CSS variables
 * --cb-primary, --cb-accent and their text colors, plus the logo.
 */

const CS_LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png'

const TRAIT_ICON: Record<string, LucideIcon> = {
  Waterproof: Droplets,
  'Highly reflective': Sun,
  'Scratch resistant': ShieldCheck,
  Flexible: Waves,
  Tough: Hammer,
  'Maintenance free': Sparkles,
}

// CSS entrance for the hero, so it shows before the page's JavaScript loads.
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

const BTN = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition duration-300'
const BTN_ACCENT = twMerge(BTN, 'bg-(--cb-accent) text-(--cb-on-accent) shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:shadow-xl')
const BTN_GHOST_ON_PRIMARY = twMerge(BTN, 'border border-current/25 text-(--cb-on-primary) hover:bg-(--cb-on-primary)/10')

export function ContractorLanding({ contractor: c }: { contractor: PublicContractor }) {
  const copy = SEGMENT_COPY[c.segment]
  return (
    <div style={brandStyle(c.brand)} className="min-h-screen bg-white font-sans text-slate-900 selection:bg-(--cb-accent) selection:text-(--cb-on-accent)">
      <TopBar c={c} />
      <Hero c={c} copy={copy} />
      <Strip copy={copy} segment={c.segment} />
      <Steps copy={copy} />
      <Gallery copy={copy} />
      <Traits copy={copy} />
      <Contact c={c} />
      <Faq c={c} copy={copy} />
      <Closing c={c} copy={copy} />
      <Footer c={c} />
      <MobileBar c={c} />
    </div>
  )
}

function CallButton({ c, className }: { c: PublicContractor; className?: string }) {
  if (!c.phone) return null
  return (
    <a href={telHref(c.phone)} className={twMerge(BTN_ACCENT, className)}>
      <Phone className="h-4 w-4" />
      Call {c.phone}
    </a>
  )
}

/** Scrolls to the quote form. */
function QuoteButton({ className }: { className?: string }) {
  return (
    <a href="#contact" className={twMerge(BTN_GHOST_ON_PRIMARY, className)}>
      <Send className="h-4 w-4" />
      Request a quote
    </a>
  )
}

function TopBar({ c }: { c: PublicContractor }) {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useEffect(() => scrollY.on('change', (y) => setSolid(y > 24)), [scrollY])
  return (
    <header
      className={twMerge(
        'fixed inset-x-0 top-0 z-40 text-(--cb-on-primary) transition-[background-color,box-shadow,backdrop-filter] duration-500',
        solid ? 'bg-(--cb-primary)/90 shadow-lg shadow-black/10 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <BrandMark name={c.name} logoUrl={c.brand.logoUrl} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-tight sm:text-base">{c.name}</span>
            <span className="block truncate text-[10.5px] font-semibold uppercase tracking-[0.18em] opacity-60">Certified Crazy Seal installer</span>
          </span>
        </a>
        <div className="ml-auto flex items-center gap-2">
          {c.phone && (
            <a href={telHref(c.phone)} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold opacity-85 transition hover:opacity-100 md:inline-flex">
              <Phone className="h-4 w-4" />
              {c.phone}
            </a>
          )}
          {/* Phones get Call and Email in the bottom bar instead. */}
          <a href="#contact" className={twMerge(BTN_ACCENT, 'hidden px-4 py-2.5 shadow-md sm:inline-flex')}>
            Get a quote
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero({ c, copy }: { c: PublicContractor; copy: SegmentCopy }) {
  const place = placeLabel(c)
  return (
    <section id="top" className="relative isolate overflow-hidden bg-(--cb-primary) text-(--cb-on-primary)">
      {/* Ambient brand light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-48 h-[38rem] w-[38rem] animate-drift rounded-full bg-(--cb-accent) opacity-30 blur-[120px]" />
        <div className="absolute -bottom-56 -left-40 h-[34rem] w-[34rem] animate-drift rounded-full bg-white opacity-[0.08] blur-[110px] [animation-delay:-9s]" />
        <div className="hairline-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:px-8 lg:pb-28">
        <div>
          <p
            {...enter(0)}
            className="inline-flex max-w-full animate-fade-up items-center gap-2 rounded-full border border-current/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-semibold backdrop-blur"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-(--cb-accent)" />
              <span className="relative h-2 w-2 rounded-full bg-(--cb-accent)" />
            </span>
            <span className="truncate">
              {copy.eyebrow}
              {place && ` · ${place}`}
            </span>
          </p>

          <h1 className="mt-6 font-[family-name:var(--font-display)] text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]">
            {copy.heroLines.map((line, i) => (
              <span key={line} {...enter(100 + i * 120)} className={twMerge('block animate-fade-up pb-1', i === 1 && 'text-(--cb-accent)')}>
                {line}
              </span>
            ))}
          </h1>

          {c.brand.tagline && (
            <p {...enter(380)} className="mt-5 animate-fade-up font-[family-name:var(--font-display)] text-lg font-semibold opacity-90">
              {c.brand.tagline}
            </p>
          )}

          <p {...enter(420)} className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed opacity-80 sm:text-lg">
            {copy.lead(c.name)}
          </p>

          <div {...enter(540)} className="mt-8 flex animate-fade-up flex-wrap gap-3">
            <CallButton c={c} />
            <QuoteButton />
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            {copy.trust.map((t, i) => (
              <li key={t} {...enter(680 + i * 80)} className="flex animate-fade-up items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-(--cb-accent) text-(--cb-on-accent)">
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
                <span className="opacity-90">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div {...enter(250)} className="relative animate-fade-up">
          <SealSweep shot={copy.heroShot} />
          <div className="absolute -bottom-5 -left-3 animate-float rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-2xl sm:-left-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Backed by</p>
            <p className="font-[family-name:var(--font-display)] text-sm font-extrabold">{copy.trust[0]}</p>
          </div>
          <div className="absolute -right-2 -top-4 animate-float-slow rounded-full bg-(--cb-accent) px-4 py-2 text-xs font-extrabold text-(--cb-on-accent) shadow-xl sm:-right-5">
            Before → After
          </div>
        </div>
      </div>
    </section>
  )
}

/** A before photo with the sealed "after" sweeping across it on a loop. */
function SealSweep({ shot }: { shot: Transformation }) {
  const reduce = useReducedMotion()
  const hidden = useMotionValue(reduce ? 0 : 100)
  const clipPath = useTransform(hidden, (v) => `inset(0 ${v}% 0 0)`)
  const edge = useTransform(hidden, (v) => `${100 - v}%`)

  useEffect(() => {
    if (reduce) return
    const controls = animate(hidden, [100, 0, 0, 100, 100], {
      duration: 9,
      times: [0, 0.38, 0.62, 0.92, 1],
      ease: 'easeInOut',
      repeat: Infinity,
      delay: 1,
    })
    return () => controls.stop()
  }, [hidden, reduce])

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-black/20 shadow-2xl ring-1 ring-white/15" style={{ aspectRatio: shot.aspect }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.before} alt={`${shot.label}, before`} className="absolute inset-0 h-full w-full object-cover" />
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot.after} alt={`${shot.label}, after`} className="h-full w-full object-cover" />
      </motion.div>
      <motion.div aria-hidden="true" className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-(--cb-accent) shadow-[0_0_24px_6px_var(--cb-accent)]" style={{ left: edge }} />
      <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">After</span>
      <span className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">Before</span>
    </div>
  )
}

function Strip({ copy, segment }: { copy: SegmentCopy; segment: PublicContractor['segment'] }) {
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-6">
      <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
        {segment === 'rv' ? 'Goes over the roof you have' : 'How it works for facilities'}
      </p>
      <Marquee duration={32}>
        {copy.marquee.map((m) => (
          <span key={m} className="flex items-center gap-6 px-6 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            {m}
            <span className="h-2 w-2 rotate-45 bg-(--cb-accent)" />
          </span>
        ))}
      </Marquee>
    </section>
  )
}

function SectionHeading({ kicker, title, className }: { kicker: string; title: string; className?: string }) {
  return (
    <Reveal className={twMerge('max-w-2xl', className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-(--cb-primary)">{kicker}</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-[2.6rem] sm:leading-[1.08]">{title}</h2>
    </Reveal>
  )
}

function Steps({ copy }: { copy: SegmentCopy }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeading kicker="The system" title={copy.stepsHeading} />
      <div className="relative mt-14">
        <motion.div
          aria-hidden="true"
          className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-gradient-to-r from-(--cb-accent) via-(--cb-primary)/40 to-transparent md:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '0px 0px -20% 0px' }}
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
        />
        <Stagger className="grid gap-8 md:grid-cols-3" stagger={0.14}>
          {copy.steps.map((s, i) => (
            <StaggerItem key={s.title} className="group relative">
              <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-(--cb-primary) font-[family-name:var(--font-display)] text-xl font-extrabold text-(--cb-on-primary) shadow-lg ring-8 ring-white">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="mt-6 overflow-hidden rounded-3xl bg-slate-100 shadow-card ring-1 ring-slate-900/5">
                <div className="aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" />
                </div>
                <div className="bg-white p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function Gallery({ copy }: { copy: SegmentCopy }) {
  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker="Before and after" title={copy.galleryHeading} />
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {copy.gallery.map((g) => (
            <StaggerItem key={g.label}>
              <div className="rounded-3xl bg-white p-2 shadow-card ring-1 ring-slate-900/5 transition duration-500 hover:-translate-y-1 hover:shadow-xl">
                <BeforeAfterSlider beforeSrc={g.before} afterSrc={g.after} aspectRatio={g.aspect} />
                <p className="px-3 pb-2 pt-3 text-sm font-bold text-slate-700">{g.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-6 text-center text-xs text-slate-500">Drag the sliders to compare.</p>
      </div>
    </section>
  )
}

function Traits({ copy }: { copy: SegmentCopy }) {
  return (
    <section className="relative isolate overflow-hidden bg-(--cb-primary) py-20 text-(--cb-on-primary) sm:py-24">
      <div aria-hidden="true" className="absolute -left-24 top-0 -z-10 h-80 w-80 animate-drift rounded-full bg-(--cb-accent) opacity-20 blur-[100px]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-(--cb-accent)">Fiber-infused silicone</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-[2.6rem] sm:leading-[1.08]">
            The strength of roofing fabric, the life of silicone.
          </h2>
          <p className="mt-4 max-w-md opacity-75">
            As each piece cures, fiber strands bond into one network. The result is a seamless, fiber reinforced membrane.
          </p>
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3" stagger={0.07}>
          {copy.traits.map((t) => {
            const Icon = TRAIT_ICON[t] ?? Sparkles
            return (
              <StaggerItem key={t}>
                <div className="group h-full rounded-2xl border border-current/10 bg-white/[0.05] p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/[0.1]">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--cb-accent) text-(--cb-on-accent) transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-[family-name:var(--font-display)] font-bold">{t}</p>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}

function Contact({ c }: { c: PublicContractor }) {
  const place = placeLabel(c)
  const states = c.serviceStates.length > 1 ? c.serviceStates : []
  return (
    <section id="contact" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-900/5 sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-(--cb-primary)">Get your quote</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">Request a quote from {c.name}</h2>
          <p className="mb-8 mt-2 text-slate-600">Tell them a little about your roof. It goes straight to {c.contact ? c.contact : 'their team'}.</p>
          <QuoteForm contractor={c} />
        </Reveal>

        <div className="grid content-start gap-6">
          {(c.phone || c.email) && (
            <Reveal delay={0.08} className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white">
              <div aria-hidden="true" className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-(--cb-primary) opacity-70 blur-[90px]" />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-(--cb-accent)">Prefer to talk?</p>
                {c.contact && <p className="mt-2 text-white/70">Ask for {c.contact}.</p>}
                <div className="mt-5 grid gap-3">
                  {c.phone && (
                    <a href={telHref(c.phone)} className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition hover:bg-white/[0.1]">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--cb-accent) text-(--cb-on-accent)">
                        <Phone className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-white/60">Call</span>
                        <span className="block truncate font-bold">{c.phone}</span>
                      </span>
                    </a>
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}?subject=${encodeURIComponent('Roof quote request')}`}
                      className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition hover:bg-white/[0.1]"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--cb-accent) text-(--cb-on-accent)">
                        <Mail className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-white/60">Email</span>
                        <span className="block truncate font-bold">{c.email}</span>
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.14} className="relative overflow-hidden rounded-[2rem] bg-slate-50 p-8 ring-1 ring-slate-900/5">
            <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(15_23_42/0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-(--cb-primary)">Service area</p>
              <div className="mt-6 flex items-center gap-5">
                <span className="relative grid h-16 w-16 shrink-0 place-items-center">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-(--cb-accent)/50" />
                  <span className="absolute inset-2 animate-pulse-ring rounded-full bg-(--cb-accent)/40 [animation-delay:0.8s]" />
                  <span className="relative grid h-11 w-11 place-items-center rounded-full bg-(--cb-primary) text-(--cb-on-primary) shadow-lg">
                    <MapPin className="h-5 w-5" />
                  </span>
                </span>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">{place || 'Contact for service area'}</p>
                  {c.serviceMode && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                      {c.serviceMode === 'shop' ? <Warehouse className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                      {SERVICE_MODE_LABEL[c.serviceMode]}
                    </p>
                  )}
                </div>
              </div>
              {states.length > 0 && (
                <div className="mt-7">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Also serving</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {states.map((s) => (
                      <span key={s} className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-800 shadow-sm ring-1 ring-slate-900/5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Faq({ c, copy }: { c: PublicContractor; copy: SegmentCopy }) {
  const [open, setOpen] = useState<number | null>(0)
  const items = copy.faq(c.name)
  return (
    <section className="border-t border-slate-200 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionHeading kicker="Questions" title="Good to know" />
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {items.map((item, i) => (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
              >
                {item.q}
                <ChevronDown className={twMerge('h-5 w-5 shrink-0 text-(--cb-primary) transition-transform duration-300', open === i && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-10 leading-relaxed text-slate-600">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Closing({ c, copy }: { c: PublicContractor; copy: SegmentCopy }) {
  return (
    <section className="px-4 pb-24 sm:px-6 lg:px-8">
      <Reveal className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-(--cb-primary) px-6 py-16 text-center text-(--cb-on-primary) sm:px-12 sm:py-20">
        <div aria-hidden="true" className="absolute -bottom-32 left-1/2 -z-10 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-(--cb-accent) opacity-35 blur-[100px]" />
        <div aria-hidden="true" className="hairline-grid absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <h2 className="mx-auto max-w-3xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-[1.05]">{copy.closing}</h2>
        <p className="mx-auto mt-4 max-w-xl opacity-75">Call {c.name} or send a quote request.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CallButton c={c} />
          <QuoteButton />
        </div>
      </Reveal>
    </section>
  )
}

function Footer({ c }: { c: PublicContractor }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 pb-28 pt-10 sm:px-6 sm:pb-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <BrandMark name={c.name} logoUrl={c.brand.logoUrl} size="sm" />
          <p className="max-w-md text-xs leading-relaxed text-slate-500">
            {c.name} is an independent contractor certified to install the Crazy Seal system.
          </p>
        </div>
        <a href="https://www.crazyseal.com/" className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900">
          Powered by
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CS_LOGO} alt="Crazy Seal" className="h-8 w-auto" />
        </a>
      </div>
    </footer>
  )
}

/** Call and the quote form always in reach on phones. */
function MobileBar({ c }: { c: PublicContractor }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-xl sm:hidden">
      {c.phone && (
        <a href={telHref(c.phone)} className={twMerge(BTN_ACCENT, 'flex-1 py-3 shadow-none')}>
          <Phone className="h-4 w-4" /> Call
        </a>
      )}
      <a href="#contact" className={twMerge(BTN, 'flex-1 bg-(--cb-primary) py-3 text-(--cb-on-primary)')}>
        <Send className="h-4 w-4" /> Get a quote
      </a>
    </div>
  )
}
