'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  BookOpen,
  CalendarRange,
  ClipboardCheck,
  FileCheck2,
  HardHat,
  Layers,
  SlidersHorizontal,
  Warehouse,
  Calculator,
  CircleUserRound,
  ExternalLink,
  Eye,
  FolderKanban,
  FolderOpen,
  Gift,
  GraduationCap,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Palette,
  Phone,
  Play,
  ShieldCheck,
  ShoppingBag,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { NavGroup, NavIcon } from '@/lib/contractor/nav'
import { PORTAL_INTRO_COOKIE, themeStyle, type PortalTheme } from '@/lib/contractor/theme'
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from '@/lib/pro/config'
import { PortalFeedbackButton } from './PortalFeedbackButton'

const CS_LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'
const EASE = [0.16, 1, 0.3, 1] as const
const INTRO_MS = 2900
const SETTLE_MS = 900

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  customers: Users,
  quotes: Calculator,
  catalog: BookOpen,
  portfolio: Layers,
  roofs: Warehouse,
  inspections: ClipboardCheck,
  estimates: FileCheck2,
  planning: CalendarRange,
  documents: FolderOpen,
  jobs: HardHat,
  systems: SlidersHorizontal,
  customerview: Eye,
  orders: ShoppingBag,
  warranties: ShieldCheck,
  training: GraduationCap,
  resources: FolderOpen,
  brand: Palette,
  team: UsersRound,
  activity: History,
  rewards: Gift,
  support: LifeBuoy,
  account: CircleUserRound,
}

export interface FrameViewer {
  name: string
  firstName: string
  roleLabel: string
  /** The company, or for an account on no team its business name or own name. */
  contractorName: string
  /** Null for an account on no contractor's team (the personal portal). */
  contractorId: string | null
  /** The contractor's public page address (crazyseal.com/contractor/<slug>), shown in the top bar. */
  slug: string | null
  /** "Crazy Seal contractor since 2023", or "Pro account since 2025". */
  since: string
  theme: PortalTheme
  readOnly: boolean
  viewAs: { adminName: string } | null
  /** Whose portal this is, for the once-per-session intro. */
  introKey: string
}

type Phase = 'intro' | 'settling' | 'ready'

function normalize(path: string | null): string {
  if (!path) return '/portal/'
  return path.endsWith('/') ? path : `${path}/`
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/portal/') return pathname === '/portal/'
  return pathname === href || pathname.startsWith(href)
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '•'
  )
}

/** The contractor's name as their brand: a monogram and wordmark, shared between the intro and the sidebar corner. */
function BrandMark({ name, theme, size }: { name: string; theme: PortalTheme; size: 'hero' | 'corner' }) {
  const hero = size === 'hero'
  return (
    <motion.div layoutId="portal-brand" className={hero ? 'flex flex-col items-center gap-5 text-center' : 'flex items-center gap-3'} transition={{ type: 'spring', stiffness: 70, damping: 16, mass: 0.9 }}>
      <motion.span
        layoutId="portal-brand-mark"
        className={`grid shrink-0 place-items-center font-black ${hero ? 'h-24 w-24 rounded-[1.75rem] text-3xl' : 'h-11 w-11 rounded-2xl text-sm'}`}
        style={{
          background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDeep})`,
          color: theme.primaryInk,
          boxShadow: `0 18px 40px -16px ${theme.primary}, 0 0 0 1px rgba(255,255,255,0.12) inset`,
        }}
      >
        {initials(name)}
      </motion.span>
      <motion.span layoutId="portal-brand-name" className="min-w-0">
        <span
          className={`block font-extrabold leading-tight ${hero ? 'text-[clamp(2.2rem,6vw,4.5rem)] tracking-tight' : 'text-[15px]'}`}
          style={{
            backgroundImage: `linear-gradient(180deg, #FFFFFF 30%, ${theme.accent})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {name}
        </span>
      </motion.span>
    </motion.div>
  )
}

function IntroOverlay({ viewer, fadeIn }: { viewer: FrameViewer; fadeIn: boolean }) {
  const t = viewer.theme
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: t.surface, backgroundImage: t.backdrop }}
      initial={{ opacity: fadeIn ? 0 : 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE, delay: 0.15 } }}
    >
      <motion.div
        aria-hidden
        className="absolute h-[70vmin] w-[70vmin] rounded-full blur-[110px]"
        style={{ background: `radial-gradient(circle, ${t.primary}, ${t.accent}55 60%, transparent 70%)` }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.15, 1], opacity: [0, 0.6, 0.38] }}
        transition={{ duration: 2.2, ease: EASE }}
      />
      {[0, 0.8].map((delay) => (
        <motion.div
          key={delay}
          aria-hidden
          className="absolute h-[44vmin] w-[44vmin] rounded-full border"
          style={{ borderColor: `${t.accent}66` }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.7], opacity: [0.8, 0] }}
          transition={{ duration: 2.4, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.2, delay }}
        />
      ))}
      <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }} className="relative px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(18px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.3, ease: EASE }}
          className="drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        >
          <BrandMark name={viewer.contractorName} theme={t} size="hero" />
        </motion.div>
      </motion.div>
      <motion.p
        className="relative mt-10 text-center text-sm font-medium uppercase"
        style={{ color: t.muted }}
        initial={{ opacity: 0, y: 12, letterSpacing: '0.8em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '0.4em' }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.6 }}
      >
        Welcome back, {viewer.firstName}
      </motion.p>
      <motion.p
        className="absolute bottom-10 flex items-center gap-2 text-[11px] tracking-[0.25em]"
        style={{ color: t.muted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 1.1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CS_LOGO} alt="" className="h-5 w-auto" /> POWERED BY CRAZY SEAL
      </motion.p>
    </motion.div>
  )
}

/**
 * The contractor portal's frame, rebuilt from Thermo's partner portal in
 * Crazy Seal's colors: a branded intro on the first visit of a session (the
 * contractor's name glows in, then floats into the sidebar corner), a sidebar
 * whose menu items slide in with a highlight that springs to the active page,
 * a slim top bar with the company's page address, the View as banner for
 * Crazy Seal staff, and the feedback button on every page.
 */
export function PortalFrame({
  nav,
  viewer,
  playIntro,
  children,
}: {
  nav: NavGroup[]
  viewer: FrameViewer
  playIntro: boolean
  children: React.ReactNode
}) {
  const pathname = normalize(usePathname())
  const t = viewer.theme
  const [phase, setPhase] = useState<Phase>(playIntro ? 'intro' : 'ready')
  const [run, setRun] = useState(playIntro ? 1 : 0)
  const timers = useRef<number[]>([])

  const startTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = [window.setTimeout(() => setPhase('settling'), INTRO_MS), window.setTimeout(() => setPhase('ready'), INTRO_MS + SETTLE_MS)]
  }, [])

  const replay = useCallback(() => {
    setPhase('intro')
    setRun((r) => r + 1)
    startTimers()
  }, [startTimers])

  useEffect(() => {
    if (playIntro) {
      // Mark it played for this browser session, so it shows once per sign-in (and once per View as).
      document.cookie = `${PORTAL_INTRO_COOKIE}=${encodeURIComponent(viewer.introKey)}; path=/portal; samesite=lax`
      startTimers()
    }
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [playIntro, startTimers, viewer.introKey])

  const showContent = phase !== 'intro'
  const flatNav = nav.flatMap((g) => g.items)

  return (
    <div className="min-h-screen font-sans antialiased" style={themeStyle(t)}>
      <LayoutGroup id={`portal-${run}`}>
        <AnimatePresence>{phase === 'intro' && <IntroOverlay key={`intro-${run}`} viewer={viewer} fadeIn={run > 1} />}</AnimatePresence>

        <div className="flex min-h-screen">
          <aside
            className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r p-5 md:flex"
            style={{
              borderColor: t.line,
              background: `linear-gradient(180deg, ${t.raised}f2 0%, ${t.surface}f2 100%)`,
              boxShadow: '20px 0 60px -40px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex h-20 items-center">{showContent ? <BrandMark name={viewer.contractorName} theme={t} size="corner" /> : <div className="h-11" />}</div>
            <p className="mb-2 mt-1 text-[11px]" style={{ color: t.muted, opacity: showContent ? 1 : 0 }}>
              {viewer.contractorId ? 'Contractor portal' : 'Pro portal'}
            </p>

            <nav aria-label="Portal" className="-mx-1 mt-3 flex-1 space-y-1 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {nav.map((group) => (
                <div key={group.label ?? 'home'} className="pb-2">
                  {group.label && (
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.25em] transition-opacity duration-500" style={{ color: t.muted, opacity: showContent ? 0.75 : 0 }}>
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const Icon = ICONS[item.icon]
                    const active = isActive(pathname, item.href)
                    const order = flatNav.indexOf(item)
                    return (
                      <motion.div
                        key={item.href}
                        initial={false}
                        animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : -16 }}
                        transition={{ delay: phase === 'settling' ? 0.35 + order * 0.045 : 0, duration: 0.5, ease: EASE }}
                      >
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-white/[0.05]"
                          style={{ color: active ? t.primaryInk : t.muted }}
                        >
                          {active && (
                            <motion.span
                              layoutId="portal-nav-active"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(180deg, ${t.primary}, ${t.primaryDeep})`,
                                boxShadow: `0 10px 24px -12px ${t.primary}, 0 0 0 1px rgba(255,255,255,0.14) inset`,
                              }}
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            />
                          )}
                          <Icon className="relative h-4 w-4" />
                          <span className="relative">{item.label}</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-3 transition-opacity duration-700" style={{ opacity: showContent ? 1 : 0 }}>
              <div className="rounded-2xl border p-3 text-[11px]" style={{ borderColor: t.line, background: 'rgba(255,255,255,0.03)', color: t.muted }}>
                <p className="flex items-center gap-1.5 font-semibold" style={{ color: t.ink }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={CS_LOGO} alt="" className="h-4 w-auto" /> Powered by Crazy Seal
                </p>
                <p className="mt-1">{viewer.since}</p>
                <p className="mt-2 truncate" style={{ color: t.ink }}>
                  {viewer.name}
                </p>
                <p className="truncate">{viewer.roleLabel}</p>
              </div>
              {!viewer.viewAs && <SignOutButton color={t.muted} />}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {viewer.viewAs && <ViewAsBanner viewer={viewer} />}
            <header
              className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-5 backdrop-blur-xl md:px-8"
              style={{ borderColor: t.line, background: `${t.surface}b3` }}
            >
              <span className="md:hidden">
                <BrandMarkSmall name={viewer.contractorName} theme={t} />
              </span>
              <p className="hidden truncate font-mono text-sm md:block" style={{ color: t.muted }}>
                {viewer.slug ? `crazyseal.com/contractor/${viewer.slug}` : 'crazyseal.com · Pro portal'}
              </p>
              <div className="ml-auto flex items-center gap-2">
                {viewer.slug && (
                  <a
                    href={`/contractor/${viewer.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-white/5 sm:inline-flex"
                    style={{ borderColor: t.line, color: t.ink }}
                  >
                    Your page <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={replay}
                  className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-white/5 sm:inline-flex"
                  style={{ borderColor: t.line, color: t.muted }}
                >
                  <Play className="h-3.5 w-3.5" /> Replay intro
                </button>
                <a
                  href={`tel:${SUPPORT_PHONE_TEL}`}
                  className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-white/5 lg:inline-flex"
                  style={{ borderColor: t.line, color: t.muted }}
                >
                  <Phone className="h-3.5 w-3.5" /> {SUPPORT_PHONE}
                </a>
                <Link
                  href="/portal/account/"
                  title={`${viewer.name} · ${viewer.roleLabel}`}
                  className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold shadow-[0_8px_20px_-8px_rgba(249,234,28,0.7)]"
                  style={{ background: t.accent, color: t.surface }}
                >
                  {initials(viewer.name)}
                </Link>
              </div>
            </header>

            {/* Mobile: Thermo's pill menu */}
            <nav aria-label="Portal sections" className="flex gap-1 overflow-x-auto border-b px-4 py-2 md:hidden" style={{ borderColor: t.line }}>
              {flatNav.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={active ? { background: `linear-gradient(180deg, ${t.primary}, ${t.primaryDeep})`, color: t.primaryInk } : { color: t.muted }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <main className="px-5 py-8 md:px-8">
              <motion.div
                className="mx-auto w-full max-w-7xl"
                initial={false}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 24 }}
                transition={{ duration: 0.55, ease: EASE, delay: phase === 'settling' ? 0.45 : 0 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </LayoutGroup>
      <PortalFeedbackButton firstName={viewer.firstName} readOnly={viewer.readOnly} />
    </div>
  )
}

function BrandMarkSmall({ name, theme }: { name: string; theme: PortalTheme }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="grid h-8 w-8 place-items-center rounded-xl text-[11px] font-black"
        style={{ background: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDeep})`, color: theme.primaryInk }}
      >
        {initials(name)}
      </span>
      <span className="max-w-[40vw] truncate text-sm font-bold">{name}</span>
    </span>
  )
}

function SignOutButton({ color }: { color: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await fetch('/api/pro/auth/logout/', { method: 'POST' }).catch(() => null)
        router.replace('/pro/login/?next=/portal/')
      }}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white/5 disabled:opacity-50"
      style={{ color }}
    >
      <LogOut className="h-4 w-4" /> Sign out
    </button>
  )
}

function ViewAsBanner({ viewer }: { viewer: FrameViewer }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-amber-300 to-amber-400 px-5 py-2 text-xs font-semibold text-[#1d1300] md:px-8">
      <span className="inline-flex items-center gap-2">
        <Eye className="h-4 w-4" />
        {viewer.viewAs?.adminName} is viewing{' '}
        {viewer.contractorId ? `${viewer.contractorName}’s portal as ${viewer.name} (${viewer.roleLabel})` : `${viewer.name}’s portal`}. Read-only:
        nothing can be changed here.
      </span>
      <form action="/api/admin/view-as/exit/" method="post">
        <input
          type="hidden"
          name="back"
          value={viewer.contractorId ? `/portal/admin/dealers/contractors/${viewer.contractorId}/` : '/portal/admin/dealers/view-as/'}
        />
        <button type="submit" className="rounded-full bg-[#1d1300] px-3 py-1 text-amber-300 hover:bg-black">
          Back to admin
        </button>
      </form>
    </div>
  )
}
