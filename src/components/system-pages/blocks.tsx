/**
 * Shared, server-safe building blocks for the Crazy Seal system, product,
 * kit, installation and warranty pages. They follow the homepage idiom
 * (src/app/page.tsx): navy heroes with glow orbs + hairline grid, gradient
 * light cards, accent icon tiles and checklists.
 */
import React from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Check,
  CreditCard,
  Download,
  PackageCheck,
  Phone,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { LinkButton, SectionHeading } from '@/lib/design-system'
import { CountUp, GlowOrb } from '@/components/motion'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

export const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

/** Section card wrappers (match the homepage padding). */
export const SECTION_WHITE =
  'section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12'
export const SECTION_NAVY = 'section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12'

/** Light card surface used across the refreshed pages. */
export const LIGHT_CARD =
  'rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl'

/** Inner card for navy sections. */
export const DARK_CARD =
  'rounded-3xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25'

/** Hero h1 sizing. Pair with `animate-fade-up` + `style={fadeDelay(n)}`. */
export const HERO_H1 =
  'animate-fade-up text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] mb-4 text-balance'

/** Inline style for staggered CSS hero entrances (runs before hydration). */
export const fadeDelay = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` })

/* ───────────────────────────── Hero ───────────────────────────── */

export function HeroShell({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}) {
  return (
    <div className={twMerge('relative section-bleed bg-primary overflow-hidden', className)}>
      <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
      <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
      <div
        aria-hidden="true"
        className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div
        className={twMerge(
          'relative z-10 px-5 py-9 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:px-12 lg:py-16',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}


export function HeroChips({
  items,
  delay = 400,
  className,
}: {
  items: { icon: LucideIcon; label: string }[]
  delay?: number
  className?: string
}) {
  return (
    <ul
      className={twMerge('animate-fade-up flex flex-wrap gap-x-6 gap-y-2.5', className)}
      style={fadeDelay(delay)}
    >
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
            <Icon className="h-3.5 w-3.5 text-accent-light" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}

/** Hero media wrapper: blurred brand halo behind the content. */
export function HeroMedia({
  children,
  className,
  delay = 200,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div className={twMerge('animate-fade-up relative', className)} style={fadeDelay(delay)}>
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/30 via-secondary/20 to-accent/30 blur-2xl"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

/* ─────────────────────────── Primitives ─────────────────────────── */

export function IconTile({
  icon: Icon,
  className,
  iconClassName,
}: {
  icon: LucideIcon
  className?: string
  iconClassName?: string
}) {
  return (
    <span
      className={twMerge(
        'grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105',
        className
      )}
    >
      <Icon className={twMerge('h-5 w-5', iconClassName)} />
    </span>
  )
}

export function Checklist({
  items,
  variant = 'light',
  className,
  itemClassName,
}: {
  items: React.ReactNode[]
  variant?: 'light' | 'dark'
  className?: string
  itemClassName?: string
}) {
  const dark = variant === 'dark'
  return (
    <ul className={twMerge('space-y-2.5', className)}>
      {items.map((item, i) => (
        <li
          key={i}
          className={twMerge(
            'flex items-start gap-3 text-left leading-relaxed',
            dark ? 'text-white/80' : 'text-gray-700',
            itemClassName
          )}
        >
          <span
            className={twMerge(
              'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
              dark ? 'bg-accent/25 text-accent-light' : 'bg-accent/15 text-accent-dark'
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Small stat tile. Pass `value` for a count-up; `display` for static text. */
export function StatTile({
  value,
  display,
  prefix,
  suffix,
  label,
  variant = 'light',
  className,
}: {
  value?: number
  display?: string
  prefix?: string
  suffix?: string
  label: string
  variant?: 'light' | 'dark'
  className?: string
}) {
  const dark = variant === 'dark'
  return (
    <div
      className={twMerge(
        'rounded-2xl px-3 py-4 text-center',
        dark
          ? 'bg-white/[0.06] ring-1 ring-white/10'
          : 'bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08]',
        className
      )}
    >
      <p
        className={twMerge(
          'text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-display)] leading-none',
          dark ? 'text-white' : 'text-primary'
        )}
      >
        {value !== undefined ? (
          <CountUp value={value} prefix={prefix} suffix={suffix} />
        ) : (
          <>
            {prefix}
            {display}
            {suffix}
          </>
        )}
      </p>
      <p
        className={twMerge(
          'mt-2 text-[11px] font-semibold uppercase tracking-wider',
          dark ? 'text-white/60' : 'text-gray-500'
        )}
      >
        {label}
      </p>
    </div>
  )
}

/** Zebra spec table (label / value rows). */
export function SpecTable({
  rows,
  className,
  caption,
}: {
  rows: { label: string; value: React.ReactNode }[]
  className?: string
  caption?: string
}) {
  return (
    <div className={twMerge('overflow-hidden rounded-2xl ring-1 ring-primary/[0.08] bg-white', className)}>
      <table className="w-full text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="even:bg-slate-50/80 border-b last:border-b-0 border-primary/[0.06]">
              <th
                scope="row"
                className="w-[38%] px-4 py-3 align-top text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70"
              >
                {row.label}
              </th>
              <td className="px-4 py-3 align-top font-medium text-gray-700 leading-relaxed">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────── Shop blocks ─────────────────────────── */

/**
 * Two-column navy hero for product + kit pages: copy and shop CTAs on the
 * left, a video (or other media) with an optional floating packshot right.
 */
export function ShopHero({
  title,
  lead,
  shopHref,
  shopLabel,
  shopExternal = true,
  secondary = { href: '/kit-builder', label: 'Build My Kit' },
  media,
  packshot,
  badge,
  chips,
}: {
  eyebrow: string
  eyebrowIcon?: LucideIcon
  title: React.ReactNode
  lead: React.ReactNode
  shopHref: string
  shopLabel: string
  shopExternal?: boolean
  secondary?: { href: string; label: string }
  media: React.ReactNode
  packshot?: { src: string; alt: string; className?: string }
  badge?: { icon: LucideIcon; label: string }
  chips?: { icon: LucideIcon; label: string }[]
}) {
  const BadgeIcon = badge?.icon
  return (
    <HeroShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left">
          <h1 className={HERO_H1} style={fadeDelay(80)}>
            {title}
          </h1>
          <div
            className="animate-fade-up text-base sm:text-lg text-white/70 leading-relaxed mb-7 max-w-xl mx-auto lg:mx-0 text-pretty"
            style={fadeDelay(160)}
          >
            {lead}
          </div>
          <div
            className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-3"
            style={fadeDelay(240)}
          >
            <LinkButton href={shopHref} variant="accent" size="lg" external={shopExternal}>
              <ShoppingCart className="w-5 h-5" />
              {shopLabel}
            </LinkButton>
            <LinkButton href={secondary.href} variant="white" size="lg">
              {secondary.label}
            </LinkButton>
          </div>
          {chips && <HeroChips items={chips} delay={320} className="mt-8 justify-center lg:justify-start" />}
        </div>
        <HeroMedia>
          {media}
          {packshot && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={packshot.src}
              alt={packshot.alt}
              className={twMerge(
                'pointer-events-none absolute -left-6 -bottom-10 hidden h-36 w-auto animate-float drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)] md:block',
                packshot.className
              )}
            />
          )}
          {badge && BadgeIcon && (
            <div
              className="hidden md:flex absolute -right-4 -top-5 items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-bold text-primary shadow-glow-highlight animate-float"
              style={{ animationDelay: '-3.5s' }}
            >
              <BadgeIcon className="h-4 w-4" />
              {badge.label}
            </div>
          )}
        </HeroMedia>
      </div>
    </HeroShell>
  )
}

/**
 * Product detail section: floating packshot on a lit stage, short intro,
 * count-up stats and a zebra spec table.
 */
export function ProductDetail({
  name,
  image,
  imageAlt,
  intro,
  stats,
  specs,
  shopHref,
  shopLabel,
  footer,
  after,
}: {
  name: string
  image?: string
  imageAlt?: string
  intro: React.ReactNode
  stats?: { value?: number; display?: string; prefix?: string; suffix?: string; label: string }[]
  specs: { label: string; value: React.ReactNode }[]
  shopHref: string
  shopLabel: string
  footer?: React.ReactNode
  /** Full-width content under the two columns (e.g. a SystemTrail). */
  after?: React.ReactNode
}) {
  return (
    <div className={SECTION_WHITE}>
      <div
        className={twMerge(
          'grid grid-cols-1 gap-8 lg:gap-14 items-center',
          image ? 'md:grid-cols-[0.85fr_1.15fr]' : 'max-w-3xl mx-auto'
        )}
      >
        {image && (
          <div className="group relative mx-auto grid w-full max-w-sm place-items-center py-6">
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-full bg-gradient-to-br from-secondary/20 via-accent/15 to-highlight/25 blur-2xl"
            />
            {/* Clip wrapper: a rotating box's bounds would otherwise widen the page on phones. */}
            <div aria-hidden="true" className="absolute inset-0 grid place-items-center overflow-hidden">
              <div className="aspect-square w-[85%] rounded-full border border-dashed border-primary/15 animate-spin-slow" />
            </div>
            <div aria-hidden="true" className="absolute bottom-6 h-6 w-1/2 rounded-full bg-primary/15 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={imageAlt ?? name}
              className="relative max-h-80 w-auto object-contain animate-float-slow transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}
        <div className="text-center md:text-left">
          <SectionHeading
            eyebrow="Product Details"
            heading={name}
            align="left"
            className="mb-4 text-center md:text-left"
          />
          <div className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 text-pretty">{intro}</div>
          {stats && stats.length > 0 && (
            <div className={twMerge('grid gap-3 mb-6', stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
              {stats.map((s) => (
                <StatTile key={s.label} {...s} />
              ))}
            </div>
          )}
          <SpecTable rows={specs} caption={`${name} specifications`} className="mb-7" />
          {footer}
          <LinkButton href={shopHref} variant="accent" size="md" external>
            {shopLabel}
            <ArrowRight className="w-4 h-4" />
          </LinkButton>
        </div>
      </div>
      {after}
    </div>
  )
}

const SYSTEM_TRAIL = [
  { name: 'Crazy Clean', role: 'Prep & clean', href: '/products/crazy-clean' },
  { name: 'Crazy Caulk', role: 'Seal the seams', href: '/products/crazy-caulk' },
  { name: 'Crazy Patch', role: 'Seal penetrations', href: '/products/crazy-patch' },
  { name: 'Crazy Seal', role: 'Roof membrane', href: '/products/crazy-seal-roof-membrane' },
]

/** Where a product sits in the application order (current one highlighted). */
export function SystemTrail({ current }: { current: string }) {
  return (
    <div className="mt-10 md:mt-12 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-4 sm:p-5 ring-1 ring-primary/[0.06]">
      <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-primary/60">
        Where it fits in the Crazy Seal system
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SYSTEM_TRAIL.map((item, i) => {
          const active = item.name === current
          return (
            <a
              key={item.name}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={twMerge(
                'group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300',
                active
                  ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-glow-primary'
                  : 'bg-white text-primary ring-1 ring-primary/[0.08] shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40'
              )}
            >
              <span
                className={twMerge(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold',
                  active ? 'bg-highlight text-primary' : 'bg-accent/15 text-accent-dark'
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold leading-tight">{item.name}</span>
                <span className={twMerge('block text-xs', active ? 'text-white/70' : 'text-gray-500')}>
                  {item.role}
                </span>
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

/** "Ready to ship / pay in 4 / free shipping" strip under kit + product heroes. */
export function OrderPerks({ freeShippingOver }: { freeShippingOver: '$500' | '$700' }) {
  const perks = [
    { icon: PackageCheck, title: 'In-Stock & Ready to Ship', desc: 'Ships straight from the manufacturer.' },
    {
      icon: CreditCard,
      title: 'Pay in 4 Installments',
      desc: 'Orders between $100 - $1,000 can be broken into 4 installments during checkout.',
    },
    { icon: Truck, title: 'Free Shipping', desc: `On orders over ${freeShippingOver}.` },
  ]
  return (
    <div className="section-bleed bg-white border-y sm:border border-gray-200/80 p-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {perks.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="group flex items-center gap-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white px-4 py-4 ring-1 ring-primary/[0.06] transition-all duration-300 hover:shadow-md"
          >
            <IconTile icon={icon} />
            <div>
              <p className="font-bold text-primary leading-snug">{title}</p>
              <p className="text-sm text-gray-500 leading-snug">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Free swag pack promo (navy). */
export function SwagPack() {
  return (
    <div className={SECTION_NAVY}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="relative px-2 pt-6 sm:px-6">
          <div aria-hidden="true" className="absolute inset-8 rounded-full bg-highlight/20 blur-3xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2022/01/Swag-Pack-Image-1024x474.png`}
            alt="Free Crazy Seal swag pack: shirt, hat, and tote bag"
            className="relative w-full h-auto animate-float-slow drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]"
          />
          <span className="absolute right-2 top-0 rotate-6 rounded-full bg-highlight px-4 py-2 text-sm font-extrabold text-primary shadow-glow-highlight sm:right-6">
            A $50 value!
          </span>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 text-balance">
            Free Swag Pack on Orders Over $700!
          </h2>
          <p className="text-white/70 leading-relaxed mb-5">
            Order totals over $700? Click &ldquo;Add to Cart&rdquo; below with your other items already in
            the cart. We&apos;ll add a Swag Pack and automatically apply a coupon to include it free.
          </p>
          <ul className="flex flex-wrap justify-center md:justify-start gap-2 mb-7">
            {['One XL shirt (super soft & comfy)', 'One hat', 'One tote bag'].map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/15"
              >
                <Check className="h-4 w-4 text-highlight" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
          <LinkButton href="/store/free-crazy-seal-swag-pack" variant="white" size="lg">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </LinkButton>
        </div>
      </div>
    </div>
  )
}

const COLOR_SWATCHES = [
  {
    name: 'White',
    swatch: 'bg-gradient-to-br from-white via-slate-50 to-slate-200 ring-1 ring-inset ring-gray-200',
    note: 'Ultimate reflectivity',
  },
  { name: 'Gray', swatch: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500', note: 'Match your style' },
  { name: 'Tan', swatch: 'bg-gradient-to-br from-[#e2cba8] via-[#d2b48c] to-[#b9996c]', note: 'Match your style' },
]

/** "Available in 3 Colors" swatch section (white). */
export function ColorSwatches({ className }: { className?: string }) {
  return (
    <div className={twMerge(SECTION_WHITE, className)}>
      <SectionHeading
        eyebrow="You Asked, We Delivered"
        heading="Available in 3 Colors"
        subheading="White provides ultimate reflectivity, while tan and gray help you match your style. All the Crazy Caulk, Crazy Patch, and Crazy Seal in your kit will be color matching."
      />
      <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
        {COLOR_SWATCHES.map((color) => (
          <div key={color.name} className="group text-center">
            <div
              className={`relative aspect-square overflow-hidden rounded-3xl shadow-md transition-all duration-500 group-hover:-translate-y-1.5 group-hover:-rotate-2 group-hover:shadow-xl ${color.swatch}`}
            >
              <div
                aria-hidden="true"
                className="absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[300%]"
              />
            </div>
            <p className="mt-4 text-base sm:text-lg font-extrabold text-primary uppercase tracking-wide">
              {color.name}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">{color.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface KitCardItem {
  title: string
  desc: string
  href: string
  image: string
  tag?: string
}

const LG_COLS: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
}

/** White kit cards on a navy section (homepage kit-card language). */
export function KitCardGrid({
  kits,
  cta = 'Shop This Kit',
  className,
}: {
  kits: KitCardItem[]
  cta?: string
  className?: string
}) {
  return (
    <div
      className={twMerge(
        'grid grid-cols-1 sm:grid-cols-2 gap-4',
        LG_COLS[Math.min(kits.length, 5)] ?? 'lg:grid-cols-4',
        className
      )}
    >
      {kits.map((kit) => (
        <a
          key={kit.title}
          href={kit.href}
          className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-2 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]"
        >
          <div className="relative grid h-36 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10">
            <div aria-hidden="true" className="absolute inset-x-8 bottom-4 h-6 rounded-full bg-primary/10 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kit.image}
              alt={kit.title}
              className="relative max-h-28 w-auto max-w-[85%] object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-1"
            />
            {kit.tag && (
              <span className="absolute left-3 top-3 rounded-full bg-highlight px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-sm">
                {kit.tag}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col px-4 pb-4 pt-4 text-left">
            <h3 className="font-extrabold text-primary text-lg leading-snug">{kit.title}</h3>
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">{kit.desc}</p>
            <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-bold text-accent-dark">
              {cta}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}

/** "Other Kit Options" navy section. */
export function OtherKits({ kits, heading = 'Other Kit Options' }: { kits: KitCardItem[]; heading?: string }) {
  return (
    <div className={SECTION_NAVY}>
      <SectionHeading eyebrow="Keep Exploring" heading={heading} variant="dark" />
      <KitCardGrid kits={kits} />
    </div>
  )
}

export interface KitSize {
  label: string
  image: string
  contents: string[]
}

/** Kit contents by size: image tray, size chip and a quantity checklist. */
export function KitSizeGrid({
  sizes,
  altPrefix = '',
  className,
}: {
  sizes: KitSize[]
  altPrefix?: string
  className?: string
}) {
  return (
    <div
      className={twMerge(
        'grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6',
        sizes.length > 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
        className
      )}
    >
      {sizes.map((kit) => (
        <article key={kit.label} className={twMerge('group flex flex-col overflow-hidden', LIGHT_CARD)}>
          <div className="relative grid h-48 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-accent/10 px-5 pt-8 pb-4">
            <div aria-hidden="true" className="absolute inset-x-10 bottom-5 h-6 rounded-full bg-primary/10 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kit.image}
              alt={`${altPrefix}${kit.label} contents`}
              className="relative max-h-36 w-auto max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-extrabold tracking-wide text-white shadow-glow-primary">
              <Ruler className="h-3.5 w-3.5 text-highlight" />
              {kit.label}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">This kit includes</p>
            <ul className="space-y-2">
              {kit.contents.map((item) => {
                const match = item.match(/^\((\d+)\)\s*(.+)$/)
                return (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="grid h-7 min-w-7 shrink-0 place-items-center rounded-lg bg-accent/15 px-1.5 text-xs font-extrabold tabular-nums text-accent-dark">
                      {match ? match[1] : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="leading-snug">{match ? match[2] : item}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}

/** Gradient banner: "Need to cover more than 500 square feet?" */
export function BiggerRoofBanner({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        'group relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-5 sm:p-6 md:p-8 shadow-xl',
        className
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-highlight/20 blur-3xl" />
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
        <IconTile icon={Ruler} />
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Need to cover more than 500 square feet?
          </h3>
          <p className="mt-1 text-white/70">Click the button to start building your own kit!</p>
        </div>
        <LinkButton href="/build-your-own-kit" variant="accent" size="lg">
          Build Your Own Kit
          <ArrowRight className="w-5 h-5" />
        </LinkButton>
      </div>
    </div>
  )
}

/** Highlighted note card. */
export function Callout({
  icon: Icon,
  title,
  children,
  tone = 'accent',
  className,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  tone?: 'accent' | 'navy' | 'highlight'
  className?: string
}) {
  const tones = {
    accent: 'bg-gradient-to-br from-accent/10 via-white to-white ring-accent/25',
    navy: 'bg-gradient-to-br from-primary/[0.06] via-white to-white ring-primary/15',
    highlight: 'bg-gradient-to-br from-highlight/25 via-white to-white ring-highlight-dark/30',
  }
  return (
    <div className={twMerge('group relative rounded-2xl p-5 ring-1 text-left', tones[tone], className)}>
      <div className="flex items-start gap-4">
        <IconTile icon={Icon} className="h-10 w-10 rounded-lg" iconClassName="h-4 w-4" />
        <div>
          <p className="font-extrabold text-primary leading-snug">{title}</p>
          <div className="mt-1 text-sm text-gray-600 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}

/** "About this kit" two-column block: copy + checklist left, aside right. */
export function KitAbout({
  eyebrow = 'About This Kit',
  heading,
  lead,
  checklist,
  aside,
  shopHref,
  shopLabel,
}: {
  eyebrow?: string
  heading: string
  lead: React.ReactNode
  checklist: React.ReactNode[]
  aside: React.ReactNode
  shopHref: string
  shopLabel: string
}) {
  return (
    <div className={SECTION_WHITE}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-14 items-start">
        <div className="text-center md:text-left">
          <SectionHeading eyebrow={eyebrow} heading={heading} align="left" className="mb-4 text-center md:text-left" />
          <div className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 text-pretty">{lead}</div>
          <Checklist items={checklist} className="mb-8 max-w-xl mx-auto md:mx-0" />
          <LinkButton href={shopHref} variant="accent" size="md" external>
            <ShoppingCart className="w-4 h-4" />
            {shopLabel}
          </LinkButton>
        </div>
        <div className="space-y-4">{aside}</div>
      </div>
    </div>
  )
}

export interface BeforeAfterItem {
  label: string
  before: string
  after: string
  aspect?: string
}

const BA_COLS: Record<number, string> = {
  2: 'md:grid-cols-2',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/** Before/after sliders in framed cards with a label chip. */
export function BeforeAfterGrid({ items, cols = 2 }: { items: BeforeAfterItem[]; cols?: 2 | 4 }) {
  return (
    <div className={twMerge('grid grid-cols-1 gap-4 lg:gap-6', BA_COLS[cols])}>
      {items.map((item, i) => (
        <figure
          key={`${item.label}-${i}`}
          className="rounded-3xl bg-gradient-to-b from-slate-50 to-white p-2 ring-1 ring-primary/[0.08] shadow-sm transition-shadow duration-500 hover:shadow-xl"
        >
          <BeforeAfterSlider beforeSrc={item.before} afterSrc={item.after} aspectRatio={item.aspect ?? '3/2'} />
          <figcaption className="flex items-center justify-center gap-2 px-3 pb-2 pt-3 text-sm font-bold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {item.label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/* ─────────────────────── Installation / warranty ─────────────────────── */

export interface PdfItem {
  title: string
  desc: string
  href: string
  image: string
}

export function PdfCards({ pdfs }: { pdfs: PdfItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      {pdfs.map((pdf) => (
        <a
          key={pdf.title}
          href={pdf.href}
          target="_blank"
          rel="noopener noreferrer"
          className={twMerge('group flex flex-col overflow-hidden', LIGHT_CARD)}
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pdf.image}
              alt={pdf.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-sm backdrop-blur">
              PDF
            </span>
          </div>
          <div className="flex flex-1 items-center justify-between gap-3 p-5">
            <div>
              <h3 className="text-lg font-extrabold text-primary">{pdf.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{pdf.desc}</p>
            </div>
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:translate-y-0.5"
            >
              <Download className="h-5 w-5" />
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}

/** "Finished with your installation? Submit your warranty" (navy). */
export function WarrantySubmitBand() {
  return (
    <div className={SECTION_NAVY}>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-14 items-center">
        <div className="relative shrink-0">
          <div aria-hidden="true" className="absolute inset-4 rounded-full bg-highlight/25 blur-3xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2019/06/50-Year-Warranty-Space-600x600.png`}
            alt="Crazy Seal 50 year warranty badge"
            className="relative w-full max-w-[200px] lg:max-w-[240px] h-auto animate-float-slow drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4 text-balance">
            Finished With Your Installation? Now It&apos;s Time to Submit Your Warranty!
          </h2>
          <p className="text-white/70 leading-relaxed mb-6 max-w-2xl">
            We stand behind our products with a 50 year product warranty. Once you&apos;ve purchased a kit,
            you have 90 days to apply your new Crazy Seal system to your application. Within 90 days of
            purchase, simply fill out our warranty form with before and after pictures of your project and
            you will be covered!
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto md:mx-0 mb-7">
            <StatTile value={50} suffix=" yr" label="Product warranty" variant="dark" />
            <StatTile value={90} suffix=" days" label="To apply & register" variant="dark" />
          </div>
          <LinkButton href="/warranty" variant="accent" size="lg">
            <ShieldCheck className="w-5 h-5" />
            Submit Warranty Form
          </LinkButton>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────── CTA ───────────────────────────── */

/**
 * "Let's get in touch" closer used across these pages. Keeps the original
 * Contact Us / Build My Kit / phone actions.
 */
export function ContactCta({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const dark = variant === 'dark'
  return (
    <section
      className={twMerge(
        'relative section-bleed overflow-hidden py-12 sm:py-16 md:py-20 px-5 sm:px-8 md:px-12',
        dark ? 'bg-primary' : 'bg-white border-y sm:border border-gray-200/80'
      )}
    >
      {dark ? (
        <>
          <GlowOrb className="-left-24 -top-24 h-72 w-72" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-20 -bottom-28 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
        </>
      ) : (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        </>
      )}
      <div
        aria-hidden="true"
        className={twMerge(
          'pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border',
          dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'
        )}
      />
      <div
        aria-hidden="true"
        className={twMerge(
          'pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border',
          dark ? 'border-white/[0.06]' : 'border-primary/[0.06]'
        )}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2
          className={twMerge(
            'text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-balance',
            dark ? 'text-white' : 'text-primary'
          )}
        >
          Have Any Questions?{' '}
          <span
            className={
              dark
                ? 'text-shimmer-highlight'
                : 'bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent'
            }
          >
            Our Specialists Can Help!
          </span>
        </h2>
        <p className={twMerge('text-base sm:text-lg mb-7 md:mb-9 leading-relaxed', dark ? 'text-white/70' : 'text-gray-500')}>
          A Crazy Seal specialist will help you build the right kit for your roof.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/contact" variant="accent" size="lg">
            Contact Us
          </LinkButton>
          <LinkButton href="/kit-builder" variant={dark ? 'white' : 'primary'} size="lg">
            Build My Kit
          </LinkButton>
          <a
            href="tel:8009630131"
            className={twMerge(
              'group inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition-colors',
              dark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-primary'
            )}
          >
            <span
              className={twMerge(
                'grid h-9 w-9 place-items-center rounded-full transition-transform duration-300 group-hover:-rotate-12',
                dark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-accent/10 ring-1 ring-accent/20'
              )}
            >
              <Phone className={twMerge('h-4 w-4', dark ? 'text-accent-light' : 'text-accent-dark')} />
            </span>
            (800) 963-0131
          </a>
        </div>
      </div>
    </section>
  )
}
