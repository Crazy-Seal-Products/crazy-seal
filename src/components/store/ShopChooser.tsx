'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Clock, Hammer, Headset, Phone } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { KitBuilder } from '@/components/KitBuilder'
import { EASE_OUT_EXPO } from '@/components/motion'
import type { KitBuilderCatalog } from '@/lib/store/kit-builder'
import { REP_GOLD, REP_HOURS, REP_PHONE, REP_TEL, SpeakToRepButton } from './SpeakToRep'

type Mode = 'choose' | 'diy' | 'rep'

const REP_HELPS = ['Sizes your roof from photos or measurements', 'Picks the right products and amounts', 'Answers install questions before you order']

/**
 * Shop intro: the shopper picks "Build my own kit" (the Kit Builder) or
 * "Build it with a rep". Once picked, the two options shrink into a switch so
 * they can change their mind, and the rep option stays on screen either way.
 * /kit-builder#build and #rep open straight into a mode.
 */
export function ShopChooser({ catalog }: { catalog: KitBuilderCatalog }) {
  const [mode, setMode] = useState<Mode>('choose')
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const apply = () => {
      const h = window.location.hash
      if (h === '#rep') setMode('rep')
      else if (h === '#build') setMode('diy')
    }
    const frame = requestAnimationFrame(apply)
    window.addEventListener('hashchange', apply)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', apply)
    }
  }, [])

  const pick = (next: Mode) => {
    setMode(next)
    requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }))
  }

  const enter = {
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  } as const

  return (
    <div ref={ref} id="build" className="scroll-mt-20">
      <span id="rep" className="sr-only" />
      {mode === 'choose' ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <button
            type="button"
            onClick={() => pick('diy')}
            className="group relative flex cursor-pointer flex-col gap-3.5 overflow-hidden rounded-3xl bg-white/[0.08] p-5 text-left ring-2 ring-accent-light/45 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.12] hover:ring-accent-light sm:p-6"
          >
            <span className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent sm:h-16 sm:w-16">
                <Hammer className="h-7 w-7" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-[1.75rem]">Build my own kit</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-accent-light">
                  <Clock className="h-4 w-4" /> About 60 seconds · order online
                </span>
              </span>
            </span>
            <span className="block text-[15px] leading-snug text-white/75 sm:text-base">
              Answer a few quick questions and get a complete kit with live pricing.
            </span>
            <span className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent text-base font-extrabold text-white shadow-[0_8px_22px_-8px_rgb(91_164_17/0.65)] transition-shadow duration-300 group-hover:shadow-[0_14px_30px_-10px_rgb(91_164_17/0.8)] sm:h-[3.25rem] sm:text-lg">
              Start building <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => pick('rep')}
            className="group relative flex cursor-pointer flex-col gap-3.5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#f5c542]/[0.18] to-white/[0.05] p-5 text-left ring-2 ring-[#f5c542]/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:from-[#f5c542]/[0.26] hover:ring-[#ffd95a] sm:p-6"
          >
            <span className="flex items-center gap-4">
              <span className={twMerge('grid h-14 w-14 shrink-0 place-items-center rounded-2xl sm:h-16 sm:w-16', REP_GOLD)}>
                <Headset className="h-7 w-7" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-[1.75rem]">Build it with a rep</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#ffd95a]">
                  <Phone className="h-4 w-4" /> Call or get a call back
                </span>
              </span>
            </span>
            <span className="block text-[15px] leading-snug text-white/75 sm:text-base">
              Tell us about your roof and a Crazy Seal rep builds the kit with you. Free, no obligation.
            </span>
            <span className={twMerge('mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full text-base font-extrabold transition-shadow duration-300 sm:h-[3.25rem] sm:text-lg', REP_GOLD)}>
              Talk to a rep <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      ) : (
        <div role="tablist" aria-label="How do you want to build your kit?" className="mx-auto mb-4 flex w-fit max-w-full rounded-full bg-white/[0.08] p-1 ring-1 ring-white/15">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'diy'}
            onClick={() => setMode('diy')}
            className={twMerge(
              'inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-extrabold transition-all sm:px-5 sm:text-base',
              mode === 'diy' ? 'bg-white text-primary shadow' : 'text-white/80 hover:text-white',
            )}
          >
            <Hammer className="h-[18px] w-[18px]" />
            <span className="sm:hidden">My own kit</span>
            <span className="hidden sm:inline">Build my own kit</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'rep'}
            onClick={() => setMode('rep')}
            className={twMerge(
              'inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-extrabold transition-all sm:px-5 sm:text-base',
              mode === 'rep' ? REP_GOLD : 'text-[#ffd95a] hover:text-[#ffe68e]',
            )}
          >
            <Headset className="h-[18px] w-[18px]" />
            <span className="sm:hidden">With a rep</span>
            <span className="hidden sm:inline">Build it with a rep</span>
          </button>
        </div>
      )}

      {mode === 'diy' && (
        <motion.div key="diy" {...enter}>
          <KitBuilder catalog={catalog} />
        </motion.div>
      )}

      {mode === 'rep' && (
        <motion.div key="rep" {...enter} className="rounded-3xl bg-white p-4 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)] ring-1 ring-white/20 sm:p-6">
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-primary sm:text-2xl">Build your kit with a rep</h2>
              <p className="mt-1 text-sm text-gray-500">
                Free help from the Crazy Seal team · {REP_HOURS}
              </p>
              <ul className="mt-3 space-y-1.5">
                {REP_HELPS.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#f5c542]/25 text-[#8a5a00]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2.5">
              <SpeakToRepButton
                sourcePage="kit-builder:rep"
                message="I'd like a rep to help me build a Crazy Seal kit for my roof."
                label="Request a call back"
                size="lg"
                className="w-full"
              />
              <a
                href={REP_TEL}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-bold text-white shadow-[0_8px_22px_-8px_rgb(0_51_101/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-light"
              >
                <Phone className="h-[18px] w-[18px]" /> Call {REP_PHONE}
              </a>
              <button
                type="button"
                onClick={() => setMode('diy')}
                className="mt-0.5 inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-semibold text-accent-dark hover:text-primary"
              >
                Rather do it yourself? Build my own kit <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {mode === 'choose' && (
        <p className="mt-3 text-center text-sm text-white/60">
          Just need a product?{' '}
          <a href="#products" className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
            Shop individual products
          </a>
        </p>
      )}
    </div>
  )
}

/** Gold "Speak to a rep" that stays on screen while browsing the shop (desktop; phones have the sticky bar). */
export function FloatingRep() {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 hidden md:block">
      <SpeakToRepButton sourcePage="kit-builder:floating" size="lg" className="pointer-events-auto shadow-[0_14px_34px_-10px_rgb(0_0_0/0.45)]" />
    </div>
  )
}
