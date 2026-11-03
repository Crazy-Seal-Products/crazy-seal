'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import {
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Lock,
  Palette,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { EASE_OUT_EXPO } from '@/components/motion'

export interface PortalScreen {
  id: string
  label: string
  title: string
  desc: string
  src: string
  icon: LucideIcon
}

export const PORTAL_SCREENS: PortalScreen[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Your whole business at a glance',
    desc: 'Program progress, open leads, jobs, rewards and your partner tier — the moment you sign in.',
    src: '/portal/screens/dashboard.webp',
    icon: LayoutDashboard,
  },
  {
    id: 'modules',
    label: 'Modules',
    title: 'A six-module Accelerator Program',
    desc: 'Welcome, marketing, sales, kits, installation and warranty — with progress that saves as you go.',
    src: '/portal/screens/modules.webp',
    icon: GraduationCap,
  },
  {
    id: 'lesson',
    label: 'Lesson player',
    title: 'Bite-sized lessons with real assets',
    desc: 'Short videos, downloadable brochures, checklists and quick checks — follow the sidebar from start to finish.',
    src: '/portal/screens/lesson.webp',
    icon: PlayCircle,
  },
  {
    id: 'white-label',
    label: 'White Label',
    title: 'Your brand on every touchpoint',
    desc: 'Upload your logo, pick your colors and get a co-branded presentation page, brochure and quote email.',
    src: '/portal/screens/white-label.webp',
    icon: Palette,
  },
  {
    id: 'leads',
    label: 'Leads',
    title: 'Referrals land in your pipeline',
    desc: 'Customers who ask Crazy Seal for an installer show up here next to your own leads.',
    src: '/portal/screens/leads.webp',
    icon: Inbox,
  },
]

const CYCLE_MS = 6000

/** Browser-framed tour of the Pro Portal built from real screenshots. */
export function PortalShowcase() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const screen = PORTAL_SCREENS[index]

  useEffect(() => {
    if (paused || reduce) return
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % PORTAL_SCREENS.length), CYCLE_MS)
    return () => window.clearTimeout(t)
  }, [index, paused, reduce])

  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] lg:gap-10 lg:items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tabs */}
      <LayoutGroup id="portal-showcase">
        <ol className="order-2 grid gap-2 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
          {PORTAL_SCREENS.map((s, i) => {
            const active = i === index
            const Icon = s.icon
            return (
              <li key={s.id}>
                <button
                  onClick={() => setIndex(i)}
                  className={twMerge(
                    'relative w-full overflow-hidden rounded-2xl px-4 py-3.5 text-left transition-colors',
                    active ? 'text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                  )}
                  aria-pressed={active}
                >
                  {active && (
                    <motion.span
                      layoutId="showcase-active"
                      className="absolute inset-0 rounded-2xl bg-white/[0.09] ring-1 ring-white/15"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="relative flex items-start gap-3">
                    <span
                      className={twMerge(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors',
                        active ? 'bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent' : 'bg-white/10'
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{s.title}</span>
                      <AnimatePresence initial={false}>
                        {active && (
                          <motion.span
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                            className="block overflow-hidden text-xs leading-relaxed text-white/65"
                          >
                            <span className="block pt-1">{s.desc}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </span>
                  {active && !reduce && (
                    <motion.span
                      key={`bar-${index}-${paused}`}
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-highlight"
                      initial={{ width: '0%' }}
                      animate={{ width: paused ? '0%' : '100%' }}
                      transition={{ duration: paused ? 0 : CYCLE_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </LayoutGroup>

      {/* Frame */}
      <div className="relative order-1 lg:order-2">
        <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-highlight/25 via-secondary/30 to-accent/30 blur-2xl" />
        <div className="relative overflow-hidden rounded-2xl bg-[#00152b] shadow-2xl ring-1 ring-white/15">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            </span>
            <span className="mx-auto flex max-w-[70%] items-center gap-1.5 truncate rounded-md bg-white/[0.06] px-3 py-1 text-[11px] text-white/55">
              <Lock className="h-3 w-3" />
              crazyseal.com/portal
            </span>
          </div>
          <div className="relative aspect-[1440/900]">
            <AnimatePresence initial={false}>
              <motion.img
                key={screen.id}
                src={screen.src}
                alt={`Pro Portal — ${screen.label}`}
                className="absolute inset-0 h-full w-full object-cover object-top"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                loading="lazy"
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
