'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { EASE_OUT_EXPO } from '@/components/motion'

const VIEWPORT = { once: true, margin: '0px 0px -15% 0px' } as const

/**
 * "Problem → fix" pair for the application template. The first paragraph is
 * framed as the problem, the rest as the Crazy Seal fix, joined by a
 * connector that draws itself in as the block scrolls into view.
 */
export function ProblemToFix({ paragraphs }: { paragraphs: string[] }) {
  const reduce = useReducedMotion()
  const [problem, ...fixes] = paragraphs
  if (!problem) return null

  return (
    <div className="relative">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-primary/[0.08]"
      >
        <h3 className="mb-1.5 text-base font-extrabold text-primary">The problem</h3>
        <p className="text-gray-600 leading-relaxed">{problem}</p>
      </motion.div>

      {fixes.length > 0 && (
        <>
          {/* Connector */}
          <div className="flex h-12 pl-5" aria-hidden="true">
            <div className="relative flex w-7 items-center justify-center">
              <motion.span
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE_OUT_EXPO }}
                className="absolute inset-y-0 left-1/2 -ml-px w-0.5 origin-top rounded-full bg-gradient-to-b from-primary/15 via-accent/60 to-accent"
              />
              <motion.span
                initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE_OUT_EXPO }}
                className="relative grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent"
              >
                <ArrowDown className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.span>
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE_OUT_EXPO }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/[0.09] via-white to-white px-5 py-4 ring-1 ring-accent/30 shadow-md"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-accent/15 blur-2xl"
            />
            <h3 className="relative mb-1.5 text-base font-extrabold text-accent-dark">The Crazy Seal fix</h3>
            {fixes.map((p) => (
              <p key={p.slice(0, 40)} className="relative text-gray-700 leading-relaxed mb-3 last:mb-0">
                {p}
              </p>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}
