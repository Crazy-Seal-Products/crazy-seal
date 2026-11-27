'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ImageIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { isHeic, type MediaPick } from '@/lib/contractor/media-shared'
import { EASE_OUT_EXPO } from '@/components/motion'

/**
 * Photos already in the project's gallery, for a warranty form: all picked to
 * start with; tap one to leave it out. They go with the form as their links
 * (no second upload), and the register and claim routes tie them to the
 * warranty (linkWarrantyMedia).
 */
export function ProjectPhotoPicker({
  label,
  photos,
  selected,
  onChange,
}: {
  label: React.ReactNode
  photos: MediaPick[]
  selected: string[]
  onChange: (urls: string[]) => void
}) {
  const picked = new Set(selected)
  const all = photos.every((p) => picked.has(p.url))
  const toggle = (url: string) => onChange(picked.has(url) ? selected.filter((u) => u !== url) : [...selected, url])

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        {label}
        <button
          type="button"
          onClick={() => onChange(all ? [] : photos.map((p) => p.url))}
          className="text-[11px] font-semibold text-[var(--p-primary,#6DC015)] transition hover:brightness-125"
        >
          {all ? 'Leave all out' : 'Use all'}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {photos.map((p, i) => {
          const on = picked.has(p.url)
          return (
            <motion.button
              key={p.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              aria-label={`${on ? 'Leave out' : 'Use'} ${p.caption || p.fileName || `photo ${i + 1}`}`}
              title={p.caption || p.fileName || undefined}
              onClick={() => toggle(p.url)}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: on ? 1 : 0.45, scale: on ? 1 : 0.96 }}
              whileHover={{ opacity: 1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO, delay: Math.min(i * 0.03, 0.3) }}
              className={twMerge(
                'relative aspect-square overflow-hidden rounded-lg bg-white/[0.04] ring-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-primary)]',
                on ? 'shadow-[0_0_0_2px_var(--p-primary)] ring-transparent' : 'ring-[var(--p-line,rgba(255,255,255,0.1))]',
              )}
            >
              <PickThumb pick={p} />
              <AnimatePresence>
                {on && (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--p-muted,#9DA3AB)]">
        {selected.length} of {photos.length} from the project’s photos
      </p>
    </div>
  )
}

function PickThumb({ pick }: { pick: MediaPick }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-[var(--p-muted,#9DA3AB)]">
        <ImageIcon className="h-4 w-4" />
        <span className="text-[9px] font-semibold uppercase tracking-wider">{isHeic({ url: pick.url }) ? 'HEIC' : 'Photo'}</span>
      </span>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={pick.url} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setBroken(true)} className="h-full w-full object-cover" />
}
