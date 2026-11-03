'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  ChartColumn,
  ClipboardList,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorPlay,
  Moon,
  Package,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Search,
  ShoppingBag,
  ShieldCheck,
  ShoppingCart,
  Store,
  Sun,
  Truck,
  UserRoundPlus,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { adminSignOut } from '@/lib/portal/actions'
import { syncShopifyNow } from '@/lib/portal/admin/actions'
import type { Activity } from '@/lib/portal/admin/activity'
import { ago } from '@/lib/portal/admin/format'
import { initials } from '@/lib/portal/accounts'
import { RAIL_COOKIE, THEME_COOKIE, type AdminTheme } from './prefs'

const LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png'

type Tone = 'sales' | 'dealers' | 'site' | 'tools'

interface Item {
  href: string
  label: string
  icon: LucideIcon
  badge?: 'openOrders' | 'newApplications'
  external?: boolean
}

interface Group {
  id: Tone
  label: string
  items: Item[]
}

const GROUPS: Group[] = [
  {
    id: 'sales',
    label: 'Sales',
    items: [
      { href: '/portal/admin/orders/', label: 'Orders', icon: ShoppingBag, badge: 'openOrders' },
      { href: '/portal/admin/customers/', label: 'Customers', icon: Users },
      { href: '/portal/admin/leads/', label: 'Leads', icon: Inbox },
      { href: '/portal/admin/products/', label: 'Products', icon: Package },
      { href: '/portal/admin/history/', label: 'Sales history', icon: ChartColumn },
      { href: '/portal/admin/discounts/', label: 'Discounts', icon: BadgePercent },
      { href: '/portal/admin/abandoned/', label: 'Abandoned carts', icon: ShoppingCart },
    ],
  },
  {
    id: 'dealers',
    label: 'Dealers',
    items: [
      { href: '/portal/admin/dealers/', label: 'Dealer roster', icon: Store },
      { href: '/portal/admin/dealers/portal/', label: 'Portal accounts', icon: KeyRound },
      { href: '/portal/admin/dealers/applications/', label: 'Applications', icon: UserRoundPlus, badge: 'newApplications' },
    ],
  },
  {
    id: 'site',
    label: 'Site',
    items: [
      { href: '/portal/admin/warranties/', label: 'Warranties', icon: ShieldCheck },
      { href: '/portal/admin/projects/', label: 'Projects', icon: Images },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { href: '/portal/demo/summit/', label: 'Dealer portal demo', icon: MonitorPlay, external: true },
      { href: '/admin/leads/', label: 'Site admin', icon: Wrench, external: true },
      { href: 'https://admin.shopify.com/store/crazy-seal', label: 'Shopify admin', icon: ClipboardList, external: true },
    ],
  },
]

/** Sidebar surfaces sit on the blue glass, so they use their own blue-white tints. */
const SIDE_LINE = 'border-[rgb(120_175_240/0.18)]'

function norm(path: string | null) {
  return (path ?? '').replace(/\/+$/, '') || '/'
}

function activeHref(pathname: string): string | null {
  // Longest matching nav href wins (so /dealers/portal beats /dealers).
  let best: string | null = null
  for (const g of GROUPS) {
    for (const item of g.items) {
      if (item.external) continue
      const h = norm(item.href)
      if ((pathname === h || pathname.startsWith(h + '/')) && (!best || h.length > best.length)) best = h
    }
  }
  return best
}

function crumbs(pathname: string): [string, string] {
  const active = activeHref(pathname)
  for (const g of GROUPS) {
    const item = g.items.find((i) => norm(i.href) === active)
    if (item) return [g.label, item.label]
  }
  if (pathname.startsWith('/portal/admin/search')) return ['Admin', 'Search']
  return ['Admin', 'Overview']
}

export interface AdminShellProps {
  admin: { name: string; email: string }
  badges: { openOrders: number; newApplications: number }
  sync: { lastSyncedAt: string | null; error: string | null }
  activity: Activity
  /** Activity rail shown on wide screens (remembered in a cookie). */
  railOpen: boolean
  /** Colour theme for everything except the sidebar (remembered in a cookie). */
  theme: AdminTheme
  children: React.ReactNode
}

function remember(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/portal/admin; max-age=31536000; samesite=lax`
}

export function AdminShell({ admin, badges, sync, activity, railOpen, theme: initialTheme, children }: AdminShellProps) {
  const pathname = norm(usePathname())
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const [activityPath, setActivityPath] = useState<string | null>(null)
  const [rail, setRail] = useState(railOpen)
  const [theme, setTheme] = useState(initialTheme)
  const drawerOpen = drawerPath === pathname
  const activityOpen = activityPath === pathname

  const toggleRail = () => {
    const next = !rail
    setRail(next)
    remember(RAIL_COOKIE, next ? '1' : '0')
  }
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    remember(THEME_COOKIE, next)
  }

  return (
    <div data-theme={theme} className="cs-admin min-h-screen bg-adm-bg text-adm-ink">
      <div aria-hidden="true" className="adm-aurora pointer-events-none fixed inset-0" />

      <div className="relative flex min-h-screen">
        <aside className="adm-sidebar sticky top-0 hidden h-screen w-[240px] shrink-0 border-r lg:flex">
          <Sidebar pathname={pathname} admin={admin} badges={badges} />
        </aside>

        <AnimatePresence>
          {drawerOpen && (
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button aria-label="Close menu" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerPath(null)} />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 36 }}
                className="adm-sidebar absolute inset-y-0 left-0 flex w-[260px] max-w-[85vw] border-r shadow-2xl"
              >
                <Sidebar pathname={pathname} admin={admin} badges={badges} />
                <button
                  onClick={() => setDrawerPath(null)}
                  className="absolute right-3 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            pathname={pathname}
            sync={sync}
            rail={rail}
            theme={theme}
            onMenu={() => setDrawerPath(pathname)}
            onToggleRail={toggleRail}
            onToggleTheme={toggleTheme}
            onOpenActivity={() => setActivityPath(pathname)}
          />
          <main className="flex-1 px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
            <div className="mx-auto w-full max-w-[1500px]">{children}</div>
          </main>
          <footer className="px-5 pb-3 text-[11px] text-adm-faint">
            Crazy Seal Admin · Shopify data via Supabase copy · {admin.email}
          </footer>
        </div>

        {rail && (
          <aside
            aria-label="Activity"
            className="sticky top-0 hidden h-screen w-[264px] shrink-0 border-l border-adm-line bg-adm-bg/55 backdrop-blur-xl min-[1440px]:block"
          >
            <ActivityRail activity={activity} />
          </aside>
        )}

        <AnimatePresence>
          {activityOpen && (
            <motion.div className="fixed inset-0 z-50 min-[1440px]:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button aria-label="Close activity" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActivityPath(null)} />
              <motion.aside
                aria-label="Activity"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 36 }}
                className="absolute inset-y-0 right-0 w-[290px] max-w-[88vw] border-l border-adm-line bg-adm-bg shadow-2xl"
              >
                <ActivityRail activity={activity} onClose={() => setActivityPath(null)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Sidebar({ pathname, admin, badges }: { pathname: string; admin: AdminShellProps['admin']; badges: AdminShellProps['badges'] }) {
  const active = activeHref(pathname)
  const overview = pathname === '/portal/admin'

  return (
    <div className="flex h-full w-full flex-col">
      {/* Short screens (e.g. 1366×768 laptops) get tighter spacing so every nav item fits without scrolling. */}
      <Link href="/portal/admin/" className="flex h-[72px] shrink-0 items-center gap-3 px-4 [@media(max-height:820px)]:h-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="" className="h-12 w-auto shrink-0 drop-shadow-[0_2px_12px_rgb(108_182_255/0.35)]" />
        <span className="leading-none">
          <span className="block text-[19px] font-bold tracking-[-0.02em] text-white font-[family-name:var(--font-display)]">Crazy Seal</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.34em] text-[#9fb6d3]">Admin</span>
        </span>
      </Link>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="group mx-3 mb-3 flex shrink-0 items-center gap-2.5 rounded-xl bg-white/[0.06] px-2.5 py-2 shadow-[inset_0_0_0_1px_rgb(120_175_240/0.22)] transition hover:bg-white/[0.1] [@media(max-height:760px)]:hidden"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#6cc04a] to-[#3f8f22] text-white shadow-[0_2px_8px_-2px_rgb(91_164_17/0.7)]">
          <ShoppingBag className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-white">Crazy Seal</span>
          <span className="block truncate text-[11px] text-[#9db8d8]">View live store</span>
        </span>
        <ArrowUpRight className="h-4 w-4 text-[#9db8d8] transition group-hover:text-white" />
      </a>

      <nav
        className="scrollbar-none flex-1 overflow-y-auto px-3 pb-3 [@media(max-height:760px)]:pb-7 [@media(max-height:760px)]:[mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]"
        aria-label="Admin"
      >
        <NavLink href="/portal/admin/" on={overview} icon={LayoutDashboard} label="Overview" />

        {GROUPS.map((g) => (
          <div key={g.id} className={twMerge('mt-3 border-t pt-3 [@media(max-height:820px)]:mt-2 [@media(max-height:820px)]:pt-2', SIDE_LINE)}>
            <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9db8d8]">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    on={!item.external && norm(item.href) === active}
                    icon={item.icon}
                    label={item.label}
                    external={item.external}
                    count={item.badge ? badges[item.badge] : 0}
                    countTone={item.badge === 'newApplications' ? 'gold' : 'blue'}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={twMerge('flex shrink-0 items-center gap-3 border-t px-4 py-3', SIDE_LINE)}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-adm-gold-bright to-adm-gold text-[12px] font-bold text-adm-gold-ink ring-2 ring-[rgb(245_197_66/0.25)]">
          {initials(admin.name)}
        </span>
        <span className="min-w-0 flex-1 leading-tight" title={admin.email}>
          <span className="block truncate text-[13.5px] font-semibold text-white">{admin.name}</span>
          <span className="block truncate text-[11.5px] text-[#9fb6d3]">Owner</span>
        </span>
        <form action={adminSignOut}>
          <button
            className="grid h-8 w-8 place-items-center rounded-full text-[#9fb6d3] transition hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

function NavLink({
  href,
  on,
  icon: Icon,
  label,
  external,
  count = 0,
  countTone = 'blue',
}: {
  href: string
  on: boolean
  icon: LucideIcon
  label: string
  external?: boolean
  count?: number
  countTone?: 'blue' | 'gold'
}) {
  const cls = twMerge(
    'group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13.5px] transition [@media(max-height:820px)]:h-8',
    on
      ? 'bg-gradient-to-r from-[rgb(56_140_230/0.45)] to-[rgb(56_140_230/0.14)] font-semibold text-white shadow-[inset_0_0_0_1px_rgb(120_175_240/0.3)]'
      : 'text-[#dbe6f3] hover:bg-white/[0.07] hover:text-white',
  )
  const body = (
    <>
      {on && <span aria-hidden="true" className="absolute -left-3 inset-y-1.5 w-[3px] rounded-r-full bg-adm-gold shadow-[0_0_12px_rgb(245_197_66/0.85)]" />}
      <Icon strokeWidth={1.9} className={twMerge('h-[18px] w-[18px] shrink-0 transition', on ? 'text-adm-gold-bright' : 'text-[#b9cde6] group-hover:text-white')} />
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && (
        <span
          className={twMerge(
            'grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10.5px] font-bold tabular-nums',
            countTone === 'gold' ? 'bg-adm-gold text-adm-gold-ink' : 'bg-[#2f80d8] text-white',
          )}
        >
          {count}
        </span>
      )}
      {external && <ArrowUpRight className="h-3.5 w-3.5 text-[#8fa9c8] opacity-60 transition group-hover:opacity-100" />}
    </>
  )
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} aria-current={on ? 'page' : undefined} className={cls}>
      {body}
    </Link>
  )
}

function TopBar({
  pathname,
  sync,
  rail,
  theme,
  onMenu,
  onToggleRail,
  onToggleTheme,
  onOpenActivity,
}: {
  pathname: string
  sync: AdminShellProps['sync']
  rail: boolean
  theme: AdminTheme
  onMenu: () => void
  onToggleRail: () => void
  onToggleTheme: () => void
  onOpenActivity: () => void
}) {
  const [section, page] = crumbs(pathname)
  const iconBtn = 'grid h-8 w-8 shrink-0 place-items-center rounded-md border border-adm-line text-adm-soft transition hover:border-adm-blue-bright/50 hover:text-adm-ink'
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-adm-line bg-adm-bg/70 px-3 backdrop-blur-xl sm:px-4 lg:px-5">
      <button onClick={onMenu} className={twMerge(iconBtn, 'lg:hidden')} aria-label="Open menu">
        <Menu className="h-4 w-4" />
      </button>
      <p className="min-w-0 truncate text-[13px] font-semibold">
        <span className="hidden text-adm-muted sm:inline">{section} / </span>
        {page}
      </p>

      <form action="/portal/admin/search/" method="get" role="search" className="relative ml-auto hidden w-64 md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-adm-faint" />
        <input
          type="search"
          name="q"
          placeholder="Search orders, customers…"
          aria-label="Search orders and customers"
          className="h-8 w-full rounded-md border border-adm-line bg-adm-input pl-8 pr-2.5 text-[12.5px] text-adm-ink placeholder:text-adm-faint focus:border-adm-blue-bright focus:outline-none focus:ring-2 focus:ring-adm-blue-bright/25"
        />
      </form>
      <SyncButton sync={sync} />
      <button
        onClick={onToggleTheme}
        className={iconBtn}
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        title={theme === 'light' ? 'Dark theme' : 'Light theme'}
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
      <button
        onClick={onToggleRail}
        className={twMerge(iconBtn, 'hidden min-[1440px]:grid')}
        aria-label={rail ? 'Hide activity' : 'Show activity'}
        aria-pressed={rail}
        title={rail ? 'Hide activity' : 'Show activity'}
      >
        {rail ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      </button>
      <button onClick={onOpenActivity} className={twMerge(iconBtn, 'min-[1440px]:hidden')} aria-label="Show activity" title="Activity">
        <PanelRightOpen className="h-4 w-4" />
      </button>
    </header>
  )
}

function SyncButton({ sync }: { sync: AdminShellProps['sync'] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [note, setNote] = useState<string | null>(null)
  const label = pending ? 'Syncing…' : sync.lastSyncedAt ? `Synced ${ago(sync.lastSyncedAt)}` : 'Not synced'

  return (
    <div className="ml-auto flex items-center gap-2 md:ml-0">
      {note && <span className="hidden text-[11px] text-adm-muted xl:inline">{note}</span>}
      <button
        onClick={() =>
          start(async () => {
            const r = await syncShopifyNow()
            setNote(r.error ? 'Sync failed — showing saved data' : `+${r.orders} orders · +${r.customers} customers${r.hasMore ? ' · more on next sync' : ''}`)
            router.refresh()
          })
        }
        disabled={pending}
        title={sync.error ? `Last sync error: ${sync.error}` : 'Pull the latest orders and customers from Shopify'}
        className={twMerge(
          'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition disabled:opacity-70',
          sync.error ? 'border-red-400/40 text-adm-red' : 'border-adm-line text-adm-soft hover:border-adm-blue-bright/50 hover:text-adm-ink',
        )}
      >
        <span aria-hidden="true" className={twMerge('h-1.5 w-1.5 rounded-full', sync.error ? 'bg-red-400' : 'bg-adm-green')} />
        <RefreshCw className={twMerge('h-3.5 w-3.5', pending && 'animate-spin')} />
        <span className="whitespace-nowrap" suppressHydrationWarning>{label}</span>
      </button>
    </div>
  )
}

function RailSection({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-adm-line px-3 py-2.5">
      <h3 className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-adm-muted">
        {title}
        {aside}
      </h3>
      {children}
    </section>
  )
}

function ActivityRail({ activity, onClose }: { activity: Activity; onClose?: () => void }) {
  const { toShip, latest, applications, sync } = activity
  return (
    <div className="scrollbar-none flex h-full flex-col overflow-y-auto">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-adm-line px-3">
        <h2 className="text-[13px] font-semibold">Activity</h2>
        <span className="inline-flex items-center gap-1 text-[11px] text-adm-green">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-adm-green" />
          Live
        </span>
        {onClose && (
          <button onClick={onClose} className="ml-auto grid h-7 w-7 place-items-center rounded-md border border-adm-line text-adm-soft" aria-label="Close activity">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="px-3 py-2.5">
        <Link
          href="/portal/admin/orders/?tab=open"
          onClick={onClose}
          className="group flex items-center gap-2.5 rounded-lg border border-adm-gold/45 bg-gradient-to-br from-adm-gold/15 to-adm-gold/[0.04] px-2.5 py-2 transition hover:border-adm-gold/70"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-adm-gold/15 text-adm-gold-text">
            <Truck className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[12.5px] font-semibold text-adm-gold-text">
              {toShip.count} {toShip.count === 1 ? 'order' : 'orders'} waiting to ship
            </span>
            <span className="block text-[11px] text-adm-soft">{toShip.oldest ? `Oldest is ${toShip.oldest}` : 'Everything has shipped'}</span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-adm-gold-text transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <RailSection
        title="Latest orders"
        aside={
          <Link href="/portal/admin/orders/" onClick={onClose} className="normal-case tracking-normal text-adm-blue-bright hover:underline">
            All
          </Link>
        }
      >
        <ul className="space-y-0.5">
          {latest.map((o) => (
            <li key={o.key}>
              <Link
                href={o.legacyId ? `/portal/admin/orders/${o.legacyId}/` : '/portal/admin/orders/'}
                onClick={onClose}
                className="flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-adm-ink/[0.05]"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-adm-blue/20 text-adm-blue-bright">
                  <ShoppingCart className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[12px] font-medium">
                    {o.name} <span className="font-normal text-adm-soft">· {o.customer}</span>
                  </span>
                  <span className="block text-[10.5px] text-adm-muted">
                    {o.total} · {o.when}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </RailSection>

      <RailSection
        title="Dealer applications"
        aside={
          applications.count > 0 ? (
            <span className="rounded bg-adm-gold px-1.5 text-[10px] font-bold leading-4 tracking-normal text-adm-gold-ink">{applications.count}</span>
          ) : undefined
        }
      >
        <ul className="mb-2 space-y-1">
          {applications.latest.map((a) => (
            <li key={a.id} className="flex items-baseline justify-between gap-2 text-[12px]">
              <span className="truncate">{a.label}</span>
              <span className="shrink-0 text-[10.5px] text-adm-muted">{a.when}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/portal/admin/dealers/applications/"
          onClick={onClose}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-gradient-to-b from-adm-gold-bright to-adm-gold text-[12px] font-semibold text-adm-gold-ink shadow-[0_4px_14px_-6px_rgb(245_197_66/0.8)] transition hover:brightness-105"
        >
          Review applications <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </RailSection>

      <RailSection title="Sync status">
        <dl className="space-y-1 text-[12px]">
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5">
              <span aria-hidden="true" className={twMerge('h-1.5 w-1.5 rounded-full', sync.error ? 'bg-red-400' : 'bg-adm-green')} />
              Shopify
            </dt>
            <dd className={sync.error ? 'text-adm-red' : 'text-adm-green'}>{sync.error ? 'Sync error' : 'Connected'}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-adm-muted">Last sync</dt>
            <dd>{sync.lastSyncedAt ? sync.when : 'Never'}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-adm-muted">Orders in history</dt>
            <dd className="tabular-nums">{sync.ordersInHistory.toLocaleString()}</dd>
          </div>
        </dl>
      </RailSection>
    </div>
  )
}
