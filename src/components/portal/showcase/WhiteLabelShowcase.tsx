'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { PORTAL_ACCOUNTS } from '@/lib/portal/accounts'
import { EASE_OUT_EXPO } from '@/components/motion'
import { BrandPreview } from '../BrandPreview'

const BRANDS = PORTAL_ACCOUNTS.map((a) => a.brand)

/** Cycles the demo partner brands through a co-branded page + brochure stack. */
export function WhiteLabelShowcase() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const brand = BRANDS[i]

  useEffect(() => {
    if (reduce) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % BRANDS.length), 4200)
    return () => window.clearTimeout(t)
  }, [i, reduce])

  return (
    <div className="relative">
      <div className="relative mx-auto h-[25rem] max-w-xl sm:h-[27rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`brochure-${i}`}
            initial={{ opacity: 0, x: 40, rotate: 8 }}
            animate={{ opacity: 1, x: 0, rotate: 5 }}
            exit={{ opacity: 0, x: -30, rotate: 2 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="absolute right-0 top-4 w-[46%] origin-bottom-left sm:w-[42%]"
          >
            <BrandPreview brand={brand} kind="brochure" className="max-w-none" />
          </motion.div>
          <motion.div
            key={`page-${i}`}
            initial={{ opacity: 0, y: 30, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE_OUT_EXPO }}
            className="absolute bottom-0 left-0 w-[78%]"
          >
            <BrandPreview brand={brand} kind="presentation" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {BRANDS.map((b, n) => (
          <button
            key={b.companyName}
            onClick={() => setI(n)}
            className={twMerge(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition',
              n === i ? 'bg-white text-primary ring-white' : 'text-white/70 ring-white/20 hover:text-white'
            )}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: b.primary }} />
            <span className="hidden sm:inline">{b.companyName}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
