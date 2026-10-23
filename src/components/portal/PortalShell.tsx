'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  Bell,
  Check,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  X,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { initials, TIER_LABELS, type PortalAccount } from '@/lib/portal/accounts'
import { PORTAL_MODULES, TOTAL_LESSONS, currentModule, moduleProgress } from '@/lib/portal/modules'
import { demoLeads } from '@/lib/portal/demo-data'
import { portalSignOut, portalSwitchAccount } from '@/lib/portal/actions'
import { EASE_OUT_EXPO } from '@/components/motion'
import { PortalProvider, usePortal } from './PortalContext'

const LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png'
const BIG_LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}

function normalize(path: string | null) {
  if (!path) return '/portal'
  return path.replace(/\/+$/, '') || '/'
}

function isActive(pathname: string, href: string) {
  const h = normalize(href)
  if (h === '/portal') return pathname === '/portal'
  return pathname === h || pathname.startsWith(h + '/')
}

export interface AccountSummary {
  id: string
  company: string
  contactName: string
  blurb: string
}

export function PortalShell({
  account,
  accounts,
  children,
}: {
  account: PortalAccount
  accounts: AccountSummary[]
  children: React.ReactNode
}) {
  return (
    <PortalProvider account={account}>
      <ShellFrame accounts={accounts}>{children}</ShellFrame>
    </PortalProvider>
  )
}

function ShellFrame({ accounts, children }: { accounts: AccountSummary[]; children: React.ReactNode }) {
  const pathname = normalize(usePathname())
  const router = useRouter()
  const welcome = useSearchParams().get('welcome') === '1'
  const { account } = usePortal()
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const drawerOpen = drawerPath === pathname
  const setDrawerOpen = (open: boolean) => setDrawerPath(open ? pathname : null)
  const [introDone, setIntroDone] = useState(false)
  const intro = welcome && !introDone

  // Play the welcome intro once after sign-in (?welcome=1), then clean the URL.
  useEffect(() => {
    if (!welcome) return
    const t = window.setTimeout(() => {
      setIntroDone(true)
      router.replace(window.location.pathname, { scroll: false })
    }, 2600)
    return () => window.clearTimeout(t)
  }, [welcome, router])

  return (
    <div className="relative min-h-screen bg-[#00152b] text-white">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-secondary/25 blur-[120px]" />
        <div className="absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[120px]" />
        <div className="hairline-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/[0.06] bg-gradient-to-b from-primary-dark/90 to-[#001326]/95 backdrop-blur-xl lg:flex">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                aria-label="Close menu"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[85vw] bg-gradient-to-b from-primary-dark to-[#001326] shadow-2xl"
              >
                <SidebarContent pathname={pathname} />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar accounts={accounts} onMenu={() => setDrawerOpen(true)} pathname={pathname} />
          <main className="flex-1 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                className="mx-auto w-full max-w-[1400px]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          <footer className="px-4 pb-6 text-center text-[11px] text-blue-100/35 sm:px-6 lg:px-10">
            Pro Portal preview · demo data only · {account.company}
          </footer>
        </div>
      </div>

      <AnimatePresence>{intro && <WelcomeIntro />}</AnimatePresence>
    </div>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  const { account, completed, brand } = usePortal()
  const current = currentModule(completed)
  const overall = Math.round((completed.size / TOTAL_LESSONS) * 100)
  const newLeads = demoLeads(account.id).filter((l) => l.stage === 'new').length

  const business: NavItem[] = [
    { href: '/portal/leads/', label: 'Leads', icon: Inbox, badge: newLeads || undefined },
    { href: '/portal/orders/', label: 'Orders & Rewards', icon: ShoppingBag },
    { href: '/portal/warranty/', label: 'Warranties', icon: ShieldCheck },
  ]
  const brandItems: NavItem[] = [
    { href: '/portal/white-label/', label: 'White Label Studio', icon: Palette },
    { href: '/portal/resources/', label: 'Resource Library', icon: FolderOpen },
  ]

  let i = 0
  const stagger = () => ({ initial: { opacity: 0, x: -14 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 + i++ * 0.035, duration: 0.4 } })

  return (
    <div className="flex h-full w-full flex-col">
      {/* Brand */}
      <div className="px-5 pb-4 pt-5">
        <Link href="/portal/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white p-1.5 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Crazy Seal" className="h-full w-full object-contain" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight font-[family-name:var(--font-display)]">Crazy Seal</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-highlight">Pro Portal</span>
          </span>
        </Link>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-2.5">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl text-xs font-black"
            style={{ background: brand.primary, color: brand.accent }}
          >
            {brand.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoDataUrl} alt="" className="h-full w-full object-contain bg-white p-0.5" />
            ) : (
              initials(brand.companyName)
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{account.company}</span>
            <span className="block text-[11px] text-blue-100/55">
              {TIER_LABELS[account.tier]} partner · {account.region}
            </span>
          </span>
        </div>
      </div>

      <LayoutGroup id="portal-nav">
        <nav className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            <motion.div {...stagger()}>
              <NavLink item={{ href: '/portal/', label: 'Dashboard', icon: LayoutDashboard }} active={isActive(pathname, '/portal/')} />
            </motion.div>
          </div>

          {/* Program flow */}
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-100/40">Accelerator Program</p>
            <motion.div {...stagger()}>
              <Link
                href="/portal/modules/"
                className={twMerge(
                  'relative mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  pathname === '/portal/modules' ? 'text-white' : 'text-blue-100/70 hover:bg-white/[0.05] hover:text-white'
                )}
              >
                {pathname === '/portal/modules' && <ActivePill />}
                <GraduationCap className="relative h-4 w-4" />
                <span className="relative flex-1">All modules</span>
                <span className="relative rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tabular-nums">{overall}%</span>
              </Link>
            </motion.div>

            <ol className="relative ml-3 space-y-0.5 border-l border-white/[0.08] pl-0">
              {PORTAL_MODULES.map((m) => {
                const p = moduleProgress(m, completed)
                const href = `/portal/modules/${m.slug}/`
                const active = isActive(pathname, href)
                const isDone = p.done === p.total
                const isCurrent = !isDone && m.slug === current.slug
                return (
                  <motion.li key={m.slug} {...stagger()} className="relative">
                    <Link
                      href={href}
                      className={twMerge(
                        'relative ml-3 flex items-center gap-3 rounded-xl py-2 pl-2 pr-3 text-[13px] transition-colors',
                        active ? 'text-white' : 'text-blue-100/65 hover:bg-white/[0.05] hover:text-white'
                      )}
                    >
                      {active && <ActivePill />}
                      {/* node on the rail */}
                      <span className="absolute -left-[1.15rem] top-1/2 -translate-y-1/2">
                        <span
                          className={twMerge(
                            'relative grid h-5 w-5 place-items-center rounded-full text-[10px] font-black ring-4 ring-[#001a33]',
                            isDone
                              ? 'bg-accent text-white'
                              : isCurrent
                                ? 'bg-highlight text-primary'
                                : 'bg-white/10 text-blue-100/70'
                          )}
                        >
                          {isCurrent && <span className="absolute inset-0 rounded-full bg-highlight/60 animate-pulse-ring" />}
                          {isDone ? <Check className="h-3 w-3" strokeWidth={3.5} /> : m.number}
                        </span>
                      </span>
                      <span className="relative min-w-0 flex-1 truncate font-medium">{m.title}</span>
                      <span className="relative text-[10px] tabular-nums text-blue-100/45">
                        {p.done}/{p.total}
                      </span>
                    </Link>
                  </motion.li>
                )
              })}
            </ol>
          </div>

          <NavGroup title="Business" items={business} pathname={pathname} stagger={stagger} />
          <NavGroup title="Brand" items={brandItems} pathname={pathname} stagger={stagger} />
        </nav>
      </LayoutGroup>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/[0.06] p-4">
        <a
          href="tel:8009630131"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-accent/20 to-transparent p-3 ring-1 ring-accent/25 transition hover:ring-accent/50"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-white">
            <Phone className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] text-blue-100/60">Partner support</span>
            <span className="block text-sm font-bold">(800) 963-0131</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-blue-100/60 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            crazyseal.com
          </Link>
          <form action={portalSignOut}>
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-blue-100/60 transition hover:bg-white/[0.05] hover:text-white">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ActivePill() {
  return (
    <motion.span
      layoutId="portal-nav-active"
      className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.12] to-white/[0.04] ring-1 ring-white/10"
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
    >
      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
    </motion.span>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={twMerge(
        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
        active ? 'text-white' : 'text-blue-100/70 hover:bg-white/[0.05] hover:text-white'
      )}
    >
      {active && <ActivePill />}
      <Icon className="relative h-4 w-4" />
      <span className="relative flex-1">{item.label}</span>
      {item.badge ? (
        <span className="relative rounded-full bg-highlight px-2 py-0.5 text-[10px] font-black text-primary">{item.badge}</span>
      ) : null}
    </Link>
  )
}

function NavGroup({
  title,
  items,
  pathname,
  stagger,
}: {
  title: string
  items: NavItem[]
  pathname: string
  stagger: () => object
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-100/40">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <motion.div key={item.href} {...stagger()}>
            <NavLink item={item} active={isActive(pathname, item.href)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const SECTION_TITLES: [string, string][] = [
  ['/portal/modules/', 'Accelerator Program'],
  ['/portal/leads', 'Leads'],
  ['/portal/orders', 'Orders & Rewards'],
  ['/portal/warranty', 'Warranties'],
  ['/portal/white-label', 'White Label Studio'],
  ['/portal/resources', 'Resource Library'],
  ['/portal/modules', 'Accelerator Program'],
]

function TopBar({
  accounts,
  onMenu,
  pathname,
}: {
  accounts: AccountSummary[]
  onMenu: () => void
  pathname: string
}) {
  const { account, resetProgress, resetBrand } = usePortal()
  const [open, setOpen] = useState(false)
  const section = useMemo(
    () => SECTION_TITLES.find(([p]) => pathname.startsWith(p.replace(/\/$/, '')))?.[1] ?? 'Dashboard',
    [pathname]
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-[#00152b]/75 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          <span className="hidden text-blue-100/45 sm:inline">Pro Portal / </span>
          {section}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-highlight sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-highlight animate-pulse" />
          Demo
        </span>
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] transition hover:bg-white/[0.1]" aria-label="Notifications">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-[#00152b]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full bg-white/[0.06] py-1 pl-1 pr-3 transition hover:bg-white/[0.1]"
            aria-expanded={open}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-xs font-black">
              {initials(account.contactName)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-xs font-semibold">{account.contactName}</span>
              <span className="block text-[10px] text-blue-100/50">{account.role}</span>
            </span>
            <ChevronDown className={twMerge('h-4 w-4 text-blue-100/50 transition-transform', open && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {open && (
              <>
                <button aria-label="Close" className="fixed inset-0 z-0 cursor-default" onClick={() => setOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                  className="absolute right-0 top-full z-10 mt-2 w-72 origin-top-right rounded-2xl border border-white/10 bg-[#03224a]/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100/45">
                    Switch demo account
                  </p>
                  {accounts.map((a) => (
                    <form key={a.id} action={portalSwitchAccount.bind(null, a.id)}>
                      <button
                        className={twMerge(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]',
                          a.id === account.id && 'bg-white/[0.06]'
                        )}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[11px] font-black">
                          {initials(a.company)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{a.company}</span>
                          <span className="block truncate text-[11px] text-blue-100/50">{a.blurb}</span>
                        </span>
                        {a.id === account.id && <Check className="h-4 w-4 text-accent-light" />}
                      </button>
                    </form>
                  ))}
                  <div className="my-1 h-px bg-white/10" />
                  <button
                    onClick={() => {
                      resetProgress()
                      resetBrand()
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-blue-100/75 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset this demo
                  </button>
                  <form action={portalSignOut}>
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-blue-100/75 transition hover:bg-white/[0.06] hover:text-white">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function WelcomeIntro() {
  const { account, completed } = usePortal()
  const isNew = completed.size === 0
  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-[#00152b]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute h-[70vmin] w-[70vmin] rounded-full bg-secondary/50 blur-[110px]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE_OUT_EXPO }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute h-[42vmin] w-[42vmin] rounded-full border-2 border-accent/40"
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 2.2, ease: 'easeOut', repeat: 1 }}
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={BIG_LOGO}
          alt="Crazy Seal"
          className="h-28 w-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] sm:h-36"
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
        />
        <motion.p
          className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl font-[family-name:var(--font-display)]"
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, letterSpacing: '-0.01em' }}
          transition={{ duration: 1.1, delay: 0.45, ease: EASE_OUT_EXPO }}
        >
          {isNew ? 'Welcome' : 'Welcome back'}, {account.firstName}
        </motion.p>
        <motion.p
          className="mt-3 text-xs font-bold uppercase tracking-[0.32em] text-highlight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {account.company} · Pro Portal
        </motion.p>
        <motion.div
          className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-highlight"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.4, delay: 1, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
