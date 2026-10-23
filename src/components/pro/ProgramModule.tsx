import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { clsx } from 'clsx'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  FileCheck,
  Lightbulb,
  Megaphone,
  Package,
  PlayCircle,
  Presentation,
  Rocket,
  Trophy,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Container, LinkButton, SectionHeading } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'
import { FormModalButton } from '@/components/forms/FormModalButton'

/*
 * Shared chrome for the Business Accelerator Program ("Module 1..6") pages:
 * module hero with a program progress bar, a sticky module pill row, the
 * "continue to next module" block, and the content/feature request section.
 */

export const PROGRAM_HOME = '/business-accelerator-program'

export interface ProgramModuleInfo {
  number: number
  label: string
  title: string
  blurb: string
  href: string
  icon: LucideIcon
}

export const PROGRAM_MODULES: ProgramModuleInfo[] = [
  {
    number: 1,
    label: 'Welcome',
    title: 'Welcome to Crazy Seal',
    blurb: 'Get up to speed on the system and its benefits.',
    href: '/resources/welcome-to-crazy-seal',
    icon: PlayCircle,
  },
  {
    number: 2,
    label: 'Marketing',
    title: 'Marketing',
    blurb: 'Pre-built video, image and email campaigns.',
    href: '/resources/marketing',
    icon: Megaphone,
  },
  {
    number: 3,
    label: 'Sales',
    title: 'Sales',
    blurb: 'Presentation pages, PDFs and assets to close deals.',
    href: '/resources/sales',
    icon: Presentation,
  },
  {
    number: 4,
    label: 'Build a Kit',
    title: 'Building a Kit',
    blurb: 'Pre-built kits or a custom kit for any job.',
    href: '/resources/building-a-kit',
    icon: Package,
  },
  {
    number: 5,
    label: 'Installation',
    title: 'Installation',
    blurb: 'Step-by-step installation videos and PDFs.',
    href: '/resources/installation',
    icon: Wrench,
  },
  {
    number: 6,
    label: 'Warranty',
    title: 'Warranty',
    blurb: "File the 50 year warranty for your customers.",
    href: '/resources/warranty',
    icon: FileCheck,
  },
]

export const PROGRAM_TOTAL = PROGRAM_MODULES.length

export function getProgramModule(number?: number) {
  return PROGRAM_MODULES.find((m) => m.number === number)
}

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

/* ── Progress bar ── */

export function ModuleProgress({ current, centered = false }: { current: number; centered?: boolean }) {
  return (
    <div
      className={clsx('animate-fade-up mt-7 w-full max-w-md', centered ? 'mx-auto' : 'mx-auto lg:mx-0')}
      style={delay(320)}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.16em]">
        <span className="text-white/55">Program roadmap</span>
        <span className="tabular-nums text-highlight">
          {current} / {PROGRAM_TOTAL}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Business Accelerator Program position"
        aria-valuemin={1}
        aria-valuemax={PROGRAM_TOTAL}
        aria-valuenow={current}
        aria-valuetext={`Module ${current} of ${PROGRAM_TOTAL}`}
        className="flex gap-1.5"
      >
        {PROGRAM_MODULES.map((m, i) => (
          <span
            key={m.number}
            title={`Module ${m.number}: ${m.label}`}
            className={clsx(
              'animate-fade-up h-1.5 flex-1 rounded-full',
              m.number < current && 'bg-accent-light',
              m.number === current &&
                'bg-gradient-to-r from-accent-light to-highlight shadow-[0_0_14px_rgb(249_234_28/0.55)]',
              m.number > current && 'bg-white/15'
            )}
            style={delay(380 + i * 70)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Module hero ── */

interface ModuleHeroProps {
  module: number
  title: ReactNode
  /** Extra label after "Module N of 6" in the pill, e.g. "Sales Assets". */
  kicker?: string
  icon?: LucideIcon
  tagline?: ReactNode
  intro?: ReactNode
  /** Short checklist chips under the intro. */
  chips?: string[]
  actions?: ReactNode
  /** Right-hand media (usually a ProVimeoEmbed). Omit for a centered hero. */
  media?: ReactNode
  mediaCaption?: string
}

export function ModuleHero({
  module,
  title,
  tagline,
  intro,
  chips,
  actions,
  media,
  mediaCaption,
}: ModuleHeroProps) {
  const centered = !media
  const justify = centered ? 'justify-center' : 'justify-center lg:justify-start'

  return (
    <Container size="xl">
      <div className="relative section-bleed bg-primary overflow-hidden">
        <GlowOrb className="-left-32 top-6 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
        <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
        <div
          aria-hidden="true"
          className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />

        <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14 lg:px-12 lg:py-16">
          <div
            className={
              centered
                ? 'mx-auto max-w-3xl text-center'
                : 'grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12'
            }
          >
            <div className={centered ? '' : 'text-center lg:text-left'}>
              <h1
                className="animate-fade-up mb-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-white text-balance sm:text-4xl lg:text-5xl"
                style={delay(80)}
              >
                {title}
              </h1>
              {tagline && (
                <p
                  className="animate-fade-up mb-3 text-lg font-semibold text-white/90 text-balance sm:text-xl"
                  style={delay(160)}
                >
                  {tagline}
                </p>
              )}
              {intro && (
                <div
                  className="animate-fade-up text-base leading-relaxed text-white/70 text-pretty sm:text-lg"
                  style={delay(220)}
                >
                  {intro}
                </div>
              )}
              {chips && chips.length > 0 && (
                <ul className={clsx('animate-fade-up mt-6 flex flex-wrap gap-x-5 gap-y-2', justify)} style={delay(260)}>
                  {chips.map((chip) => (
                    <li key={chip} className="flex items-center gap-2 text-sm font-medium text-white/75">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                        <Check className="h-3.5 w-3.5 text-accent-light" strokeWidth={3} />
                      </span>
                      {chip}
                    </li>
                  ))}
                </ul>
              )}
              {actions && (
                <div className={clsx('animate-fade-up mt-7 flex flex-wrap items-center gap-3', justify)} style={delay(300)}>
                  {actions}
                </div>
              )}
              <ModuleProgress current={module} centered={centered} />
            </div>

            {media && (
              <div className="animate-fade-up relative" style={delay(200)}>
                {media}
                {mediaCaption && (
                  <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-white/60">
                    <PlayCircle className="h-4 w-4 text-highlight" />
                    {mediaCaption}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

/* ── Sticky module pill row ── */

export function ModuleNav({ current }: { current?: number }) {
  return (
    <Container size="xl" className="pointer-events-none relative z-30 pt-3 md:sticky md:top-[4.75rem] md:pt-4">
      <nav
        aria-label="Business Accelerator Program modules"
        className="pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/90 p-1.5 shadow-lg ring-1 ring-primary/[0.08] backdrop-blur-xl scrollbar-none"
      >
        <Link
          href={PROGRAM_HOME}
          className="flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold text-primary/70 transition-colors hover:bg-primary/[0.05] hover:text-primary"
          aria-label="Business Accelerator Program home"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-white">
            <Rocket className="h-3.5 w-3.5" />
          </span>
          <span className="hidden lg:inline">Program</span>
        </Link>
        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-primary/10" />
        {PROGRAM_MODULES.map((m) => {
          const active = m.number === current
          const done = current !== undefined && m.number < current
          return (
            <Link
              key={m.number}
              href={m.href}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-all duration-300',
                active
                  ? 'bg-gradient-to-b from-primary-light to-primary text-white shadow-glow-primary'
                  : 'text-primary/70 hover:bg-primary/[0.05] hover:text-primary'
              )}
            >
              <span
                className={clsx(
                  'grid h-6 w-6 place-items-center rounded-full text-xs font-extrabold',
                  active && 'bg-highlight text-primary',
                  done && 'bg-accent/15 text-accent-dark',
                  !active && !done && 'bg-primary/[0.07] text-primary'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : m.number}
              </span>
              {m.label}
            </Link>
          )
        })}
      </nav>
    </Container>
  )
}

/* ── Continue to next module + module map ── */

export interface ModuleFooterLink {
  heading: string
  label: string
  href: string
}

export function ModuleNext({
  current,
  back,
  next,
}: {
  current?: number
  back?: ModuleFooterLink
  next?: ModuleFooterLink
}) {
  const derived = current ? getProgramModule(current + 1) : undefined
  const nextInfo = next ? PROGRAM_MODULES.find((m) => next.href.replace(/\/$/, '') === m.href) : derived
  const nextLink: ModuleFooterLink | undefined =
    next ?? (derived ? { heading: 'Continue to Next Module', label: derived.title, href: derived.href } : undefined)
  const NextIcon = nextInfo?.icon ?? ArrowRight
  const isLast = !nextLink && current === PROGRAM_TOTAL
  const showStep = Boolean(nextLink || isLast || back)

  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
        <div
          className={clsx(
            'grid grid-cols-1 items-center gap-8 lg:gap-12',
            showStep ? 'lg:grid-cols-[1.15fr_1fr]' : 'mx-auto max-w-2xl'
          )}
        >
          {/* Next step */}
          {showStep && (
            <div className="flex flex-col gap-4">
              {nextLink ? (
                <Link
                  href={nextLink.href}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)] sm:p-8"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-highlight/50 to-accent/30 opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <h2 className="relative mt-4 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                    {nextLink.heading}
                  </h2>
                  <div className="relative mt-5 flex items-center gap-4 border-t border-primary/[0.07] pt-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                      <NextIcon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-extrabold text-primary">{nextLink.label}</span>
                      {nextInfo && <span className="block text-sm text-gray-500">{nextInfo.blurb}</span>}
                    </span>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-accent">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              ) : isLast ? (
                <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8 sm:text-left">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-highlight/60 to-accent/30 opacity-70 blur-3xl"
                  />
                  <span className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-highlight to-highlight-dark text-primary shadow-glow-highlight animate-float sm:mx-0">
                    <Trophy className="h-7 w-7" />
                  </span>
                  <h2 className="relative text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                    This is the last module!
                  </h2>
                  <p className="relative mt-2 text-gray-600">Contact us if you&apos;re ready to get started!</p>
                  <div className="relative mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                    <LinkButton href="/contact" variant="accent" size="lg">
                      Contact Us
                      <ArrowRight className="h-4 w-4" />
                    </LinkButton>
                  </div>
                </div>
              ) : null}
              {back && (
                <Link
                  href={back.href}
                  className="group inline-flex w-fit items-center gap-2 self-center rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/15 transition-all duration-300 hover:bg-white/[0.12] hover:text-white lg:self-start"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  {back.heading}
                  <span className="text-highlight">· {back.label}</span>
                </Link>
              )}
            </div>
          )}

          {/* Module map */}
          <div className={showStep ? 'text-center lg:text-left' : 'text-center'}>
            <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-white">Module Quick Links</h2>
            <ol className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {PROGRAM_MODULES.map((m) => {
                const active = m.number === current
                const done = current !== undefined && m.number < current
                return (
                  <li key={m.number}>
                    <Link
                      href={m.href}
                      aria-current={active ? 'page' : undefined}
                      className={clsx(
                        'group flex items-center gap-3 rounded-2xl px-3 py-2 transition-all duration-300',
                        active ? 'bg-white/[0.12] ring-1 ring-white/25' : 'hover:bg-white/[0.07]'
                      )}
                    >
                      <span
                        className={clsx(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold',
                          active && 'bg-highlight text-primary',
                          done && 'bg-accent/25 text-accent-light',
                          !active && !done && 'bg-white/10 text-white'
                        )}
                      >
                        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : m.number}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-white">{m.label}</span>
                      {active ? (
                        <span className="rounded-full bg-highlight px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                          You are here
                        </span>
                      ) : (
                        <ArrowRight className="h-4 w-4 text-white/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ol>
            <div className={clsx('mt-5 flex justify-center', showStep && 'lg:justify-start')}>
              <LinkButton href={PROGRAM_HOME} variant="white" size="md">
                <Rocket className="h-4 w-4" />
                Business Accelerator Home
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

/* ── AI prompts feature band (Marketing + Sales modules) ── */

const CHATGPT_LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2024/04/1690998192chatgpt-logo-png.png'

export function AiPromptsBand({
  href,
  label,
  variant = 'dark',
}: {
  href: string
  label: string
  variant?: 'light' | 'dark'
}) {
  const dark = variant === 'dark'
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        className={clsx(
          'section-bleed overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12',
          dark ? 'bg-primary' : 'bg-white border-y sm:border border-gray-200/80'
        )}
      >
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div className="text-center md:text-left">
            <SectionHeading
              eyebrow="AI Prompts"
              heading="AI Prompts for your Crazy Seal Business"
              variant={dark ? 'dark' : 'light'}
              align="left"
              className="mb-4 text-center md:text-left"
            />
            <p className={clsx('mb-7 leading-relaxed md:text-lg', dark ? 'text-white/70' : 'text-gray-600')}>
              Use these prompts with any AI platform to teach it what you do as a Crazy Seal professional
              &mdash; and create custom assets!
            </p>
            <LinkButton href={href} variant={dark ? 'white' : 'primary'} size="md">
              {label}
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
          <div className="relative mx-auto grid h-48 w-48 place-items-center">
            <div
              aria-hidden="true"
              className={clsx(
                'absolute inset-0 rounded-full bg-gradient-to-br blur-2xl',
                dark ? 'from-accent/40 to-secondary-light/40' : 'from-accent/25 to-secondary/20'
              )}
            />
            <div className="relative grid h-40 w-40 place-items-center rounded-[2rem] bg-white shadow-2xl ring-1 ring-primary/[0.08] animate-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CHATGPT_LOGO} alt="ChatGPT logo" className="h-28 w-28 object-contain" />
            </div>
            <span className="absolute -right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1.5 text-xs font-bold text-primary shadow-glow-highlight">
              <Bot className="h-3.5 w-3.5" />
              Copy &amp; paste
            </span>
          </div>
        </div>
      </div>
    </Container>
  )
}

/* ── Content / feature request ── */

const REQUEST_IDEAS = ['Marketing materials', 'Sales resources', 'New features']

export function ContentRequestSection({
  sourcePage,
  id,
  eyebrow = 'Content | Feature Request',
  heading = 'Request Content or a Feature',
}: {
  sourcePage: string
  id?: string
  eyebrow?: string
  heading?: string
}) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        id={id}
        className={clsx(
          'section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-7 sm:px-6 md:p-8 lg:px-12 lg:py-10',
          id && 'scroll-mt-24'
        )}
      >
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <SectionHeading
              eyebrow={eyebrow}
              heading={heading}
              align="left"
              className="mb-4 text-center lg:text-left"
            />
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base lg:mx-0">
              Need marketing materials, sales resources or anything else to support your business? Send
              it here &mdash; it goes straight to our asset creation team.
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {REQUEST_IDEAS.map((idea) => (
                <li
                  key={idea}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08]"
                >
                  <Lightbulb className="h-4 w-4 text-accent" />
                  {idea}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 text-center shadow-sm ring-1 ring-primary/[0.08] sm:p-6">
            <FormModalButton
              form="content-request"
              sourcePage={sourcePage}
              openOnHash={id}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <Lightbulb className="h-5 w-5" />
              Request Content
            </FormModalButton>
            <p className="text-xs text-gray-500">Takes about a minute · goes straight to our asset team</p>
          </div>
        </div>
      </div>
    </Container>
  )
}
