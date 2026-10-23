'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  DollarSign,
  GraduationCap,
  HardHat,
  Inbox,
  Megaphone,
  Package,
  Palette,
  Ruler,
  ShieldCheck,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { MONTH_LABELS, nextTier, TIER_LABELS } from '@/lib/portal/accounts'
import {
  PORTAL_MODULES,
  TOTAL_LESSONS,
  currentModule,
  moduleProgress,
  nextLesson,
} from '@/lib/portal/modules'
import { ANNOUNCEMENTS, LEAD_STAGES, demoLeads } from '@/lib/portal/demo-data'
import { EASE_OUT_EXPO } from '@/components/motion'
import { usePortal } from '../PortalContext'
import {
  MODULE_ICONS,
  Panel,
  PanelTitle,
  ProgressBar,
  ProgressRing,
  StatTile,
  StatusPill,
  ViewHeader,
  money,
  portalButton,
  portalGhostButton,
} from '../ui'

export function DashboardView() {
  const { account, completed } = usePortal()
  const mod = currentModule(completed)
  const lesson = nextLesson(mod, completed)
  const overall = Math.round((completed.size / TOTAL_LESSONS) * 100)
  const leads = demoLeads(account.id)
  const isNew = completed.size === 0
  const upcomingTier = nextTier(account.tier)
  const maxGallons = Math.max(...account.monthlyGallons, 1)
  const ModIcon = MODULE_ICONS[mod.icon]

  return (
    <>
      <ViewHeader
        kicker={`${TIER_LABELS[account.tier]} partner since ${account.partnerSince}`}
        title={isNew ? `Welcome aboard, ${account.firstName}` : `Good to see you, ${account.firstName}`}
        description={
          isNew
            ? 'Start with Module 1 — it takes about 30 minutes and sets up everything else.'
            : `You're ${overall}% through the Accelerator Program. Next up: ${lesson.title}.`
        }
      >
        <Link href={`/portal/modules/${mod.slug}/`} className={portalButton}>
          {isNew ? 'Start Module 1' : `Continue Module ${mod.number}`}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/portal/white-label/" className={portalGhostButton}>
          <Palette className="h-4 w-4" />
          Brand my materials
        </Link>
      </ViewHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
        <StatTile label="Program progress" value={overall} suffix="%" icon={GraduationCap} hint={`${completed.size} of ${TOTAL_LESSONS} lessons`} delay={0.05} />
        <StatTile label="Open leads" value={account.metrics.openLeads} icon={Inbox} hint={`${leads.filter((l) => l.stage === 'new').length} new this week`} delay={0.1} />
        <StatTile label="Jobs this quarter" value={account.metrics.jobsThisQuarter} icon={HardHat} delay={0.15} />
        <StatTile label="Sq ft sealed" value={account.metrics.sqftSealed} icon={Ruler} hint="This year" delay={0.2} />
        <div className="col-span-2 lg:col-span-1">
          <StatTile label="Rewards balance" value={account.metrics.rewardsBalance} prefix="$" icon={DollarSign} delay={0.25} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:mt-5 md:gap-5 xl:grid-cols-[1.45fr_1fr]">
        {/* Continue learning */}
        <Panel className="overflow-hidden !p-0" delay={0.15}>
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            <Link
              href={`/portal/modules/${mod.slug}/`}
              className="group relative flex items-center overflow-hidden bg-gradient-to-br from-primary to-[#00152b] p-4 md:p-5"
            >
              <span className="relative block w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mod.thumbnail}
                  alt={`Module ${mod.number}: ${mod.title}`}
                  className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/25">
                  <span className="grid h-12 w-12 scale-75 place-items-center rounded-full bg-white text-primary opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </span>
              </span>
              <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1 text-[11px] font-black uppercase tracking-wider text-primary shadow-lg md:left-7 md:top-7">
                <ModIcon className="h-3.5 w-3.5" />
                Module {mod.number}
              </span>
            </Link>
            <div className="p-5 md:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent-light">
                {isNew ? 'Start here' : 'Continue learning'}
              </p>
              <h2 className="mt-2 text-xl font-extrabold md:text-2xl">{mod.title}</h2>
              <p className="mt-2 text-sm text-blue-100/60">{mod.outcome}</p>
              <div className="mt-5 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
                <p className="text-[11px] text-blue-100/50">Up next</p>
                <p className="text-sm font-semibold">{lesson.title}</p>
                <p className="text-xs text-blue-100/50">{lesson.minutes} min · {lesson.kind}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-blue-100/60">
                <span>Module progress</span>
                <span className="tabular-nums">{moduleProgress(mod, completed).pct}%</span>
              </div>
              <ProgressBar pct={moduleProgress(mod, completed).pct} className="mt-1.5" />
              <Link href={`/portal/modules/${mod.slug}/`} className={twMerge(portalButton, 'mt-5 w-full')}>
                Resume lesson
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Program track */}
          <ol className="grid grid-cols-6 gap-1.5 border-t border-white/[0.06] p-4 md:p-5">
            {PORTAL_MODULES.map((m) => {
              const p = moduleProgress(m, completed)
              const isDone = p.done === p.total
              return (
                <li key={m.slug}>
                  <Link href={`/portal/modules/${m.slug}/`} className="group block" title={m.title}>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div
                        className={twMerge('h-full rounded-full', isDone ? 'bg-accent' : 'bg-highlight')}
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ duration: 1, delay: 0.3 + m.number * 0.08, ease: EASE_OUT_EXPO }}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-100/55 group-hover:text-white">
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent-light" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="hidden truncate sm:inline">{m.eyebrow}</span>
                      <span className="sm:hidden">{m.number}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        </Panel>

        {/* Tier */}
        <Panel delay={0.2} className="flex flex-col">
          <PanelTitle>Partner tier</PanelTitle>
          <div className="flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
            <ProgressRing pct={account.metrics.tierProgress} size={148} stroke={12}>
              <div>
                <p className="text-3xl font-extrabold tabular-nums font-[family-name:var(--font-display)]">
                  {account.metrics.tierProgress}%
                </p>
                <p className="text-[11px] text-blue-100/55">to {upcomingTier ? TIER_LABELS[upcomingTier] : 'max tier'}</p>
              </div>
            </ProgressRing>
            <div className="w-full max-w-xs space-y-2">
              {(['member', 'pro', 'commercial', 'high_volume'] as const).map((t) => {
                const reached = ['member', 'pro', 'commercial', 'high_volume'].indexOf(t) <= ['member', 'pro', 'commercial', 'high_volume'].indexOf(account.tier)
                return (
                  <div
                    key={t}
                    className={twMerge(
                      'flex items-center justify-between rounded-xl px-3 py-2 text-sm ring-1',
                      t === account.tier
                        ? 'bg-accent/15 ring-accent/40 font-semibold'
                        : reached
                          ? 'bg-white/[0.04] ring-white/[0.06] text-blue-100/80'
                          : 'ring-white/[0.06] text-blue-100/45'
                    )}
                  >
                    {TIER_LABELS[t]}
                    {reached ? <CheckCircle2 className="h-4 w-4 text-accent-light" /> : <Circle className="h-4 w-4" />}
                  </div>
                )
              })}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:mt-5 md:gap-5 xl:grid-cols-[1.45fr_1fr]">
        {/* Chart */}
        <Panel delay={0.25}>
          <PanelTitle action={<span className="text-xs text-blue-100/50">Last 6 months</span>}>Gallons installed</PanelTitle>
          <div className="mt-2 flex h-52 items-end gap-2 sm:gap-3">
            {account.monthlyGallons.map((g, i) => (
              <div key={MONTH_LABELS[i]} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] font-semibold tabular-nums text-blue-100/0 transition group-hover:text-white">{g}</span>
                <motion.div
                  className="w-full rounded-t-xl bg-gradient-to-t from-secondary to-accent-light shadow-[0_0_24px_-6px_rgba(109,192,21,0.5)]"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(3, (g / maxGallons) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.35 + i * 0.07, ease: EASE_OUT_EXPO }}
                />
                <span className="text-[11px] text-blue-100/50">{MONTH_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Pipeline */}
        <Panel delay={0.3}>
          <PanelTitle
            action={
              <Link href="/portal/leads/" className="inline-flex items-center gap-1 text-xs font-semibold text-accent-light hover:text-white">
                All leads <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            Lead pipeline
          </PanelTitle>
          <div className="grid grid-cols-4 gap-2">
            {LEAD_STAGES.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white/[0.04] p-3 text-center ring-1 ring-white/[0.06]">
                <p className="text-xl font-extrabold tabular-nums">{leads.filter((l) => l.stage === s.id).length}</p>
                <p className="text-[11px] text-blue-100/55">{s.label}</p>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {leads.slice(0, 4).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.05] px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{l.name}</p>
                  <p className="truncate text-[11px] text-blue-100/50">
                    {l.application} · {l.city} · {money(l.value)}
                  </p>
                </div>
                <StatusPill status={l.stage} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:mt-5 md:gap-5 lg:grid-cols-2">
        <Panel delay={0.35}>
          <PanelTitle>From Crazy Seal</PanelTitle>
          <ul className="space-y-2">
            {ANNOUNCEMENTS.map((a) => (
              <li key={a.title}>
                <Link
                  href={a.href}
                  className="group flex items-start gap-3 rounded-2xl p-3 transition hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 rounded-full bg-highlight/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-highlight">
                    {a.tag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{a.title}</span>
                    <span className="block text-xs text-blue-100/55">{a.body}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-100/30 transition group-hover:translate-x-1 group-hover:text-accent-light" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel delay={0.4}>
          <PanelTitle>Quick actions</PanelTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/portal/warranty/', label: 'Register a warranty', icon: ShieldCheck },
              { href: '/kit-builder/', label: 'Build a kit', icon: Package },
              { href: '/portal/modules/marketing/', label: 'Launch a campaign', icon: Megaphone },
              { href: '/portal/white-label/', label: 'Co-brand materials', icon: Palette },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group relative overflow-hidden rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:ring-accent/30"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-3 block text-sm font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
