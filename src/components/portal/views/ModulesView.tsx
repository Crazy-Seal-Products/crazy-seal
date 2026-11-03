'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, Layers, PlayCircle, Trophy } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  PORTAL_MODULES,
  TOTAL_LESSONS,
  currentModule,
  moduleMinutes,
  moduleProgress,
} from '@/lib/portal/modules'
import { EASE_OUT_EXPO } from '@/components/motion'
import { usePortal } from '../PortalContext'
import { MODULE_ICONS, Panel, ProgressBar, ProgressRing, ViewHeader, portalButton } from '../ui'

export function ModulesView() {
  const { completed } = usePortal()
  const overall = Math.round((completed.size / TOTAL_LESSONS) * 100)
  const current = currentModule(completed)
  const modulesDone = PORTAL_MODULES.filter((m) => moduleProgress(m, completed).pct === 100).length
  const totalMinutes = PORTAL_MODULES.reduce((n, m) => n + moduleMinutes(m), 0)

  return (
    <>
      <ViewHeader
        kicker="Business Accelerator Program"
        title="Launch your business like a boss"
        description="Six short modules — videos, ready-made assets, checklists and quick checks. Your progress saves as you go."
      />

      <Panel className="overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <ProgressRing pct={overall} size={168} stroke={14}>
            <div>
              <p className="text-4xl font-extrabold tabular-nums font-[family-name:var(--font-display)]">{overall}%</p>
              <p className="text-xs text-blue-100/55">complete</p>
            </div>
          </ProgressRing>
          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent-light">
              {overall === 100 ? 'Program complete' : `Up next · Module ${current.number}`}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">{overall === 100 ? 'You did it — every module finished.' : current.title}</h2>
            <p className="mt-2 text-sm text-blue-100/60">{overall === 100 ? 'Revisit any lesson anytime.' : current.outcome}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {[
                { icon: Trophy, label: `${modulesDone}/6 modules` },
                { icon: Layers, label: `${completed.size}/${TOTAL_LESSONS} lessons` },
                { icon: Clock, label: `~${Math.round(totalMinutes / 60)} hrs total` },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold ring-1 ring-white/10">
                  <Icon className="h-3.5 w-3.5 text-highlight" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          {overall < 100 && (
            <Link href={`/portal/modules/${current.slug}/`} className={portalButton}>
              <PlayCircle className="h-4 w-4" />
              Resume
            </Link>
          )}
        </div>
      </Panel>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PORTAL_MODULES.map((m, i) => {
          const p = moduleProgress(m, completed)
          const Icon = MODULE_ICONS[m.icon]
          const isDone = p.pct === 100
          const isCurrent = !isDone && m.slug === current.slug
          return (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: EASE_OUT_EXPO }}
            >
              <Link
                href={`/portal/modules/${m.slug}/`}
                className={twMerge(
                  'group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/[0.035] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]',
                  isCurrent ? 'border-highlight/40' : 'border-white/[0.07] hover:border-white/20'
                )}
              >
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.thumbnail}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00152b]/80 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-primary shadow-lg">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={twMerge(
                      'absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider',
                      isDone ? 'bg-accent text-white' : isCurrent ? 'bg-highlight text-primary' : 'bg-black/40 text-white backdrop-blur'
                    )}
                  >
                    {isDone ? 'Complete' : isCurrent ? 'In progress' : `Module ${m.number}`}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light">
                    {m.number} · {m.eyebrow}
                  </p>
                  <h3 className="mt-1.5 text-lg font-extrabold">{m.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-blue-100/60">{m.summary}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-blue-100/55">
                    <span>
                      {m.lessons.length} lessons · {moduleMinutes(m)} min
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-white">
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-accent-light" />}
                      {p.done}/{p.total}
                    </span>
                  </div>
                  <ProgressBar pct={p.pct} className="mt-2" delay={0.3 + i * 0.06} />
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-light">
                    {isDone ? 'Review module' : p.done > 0 ? 'Continue' : 'Start module'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
