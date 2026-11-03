'use client'

import React, { useEffect, useId, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Phone, X, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { EASE_OUT_EXPO } from '@/components/motion'

const noopSubscribe = () => () => {}

const WIDTHS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
} as const

/**
 * Pop-up shell every site form lives in: a bottom sheet on phones and a
 * centered dialog from `sm` up. The header stays compact and the body
 * scrolls on its own, so the page behind never moves.
 */
export function FormModal({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  showPhone = true,
  width = 'md',
  children,
}: {
  open: boolean
  onClose: () => void
  eyebrow?: string
  title: string
  subtitle?: string
  icon?: LucideIcon
  showPhone?: boolean
  width?: keyof typeof WIDTHS
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  // Portals only exist on the client; render nothing until hydrated.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Focus the first field once the panel has animated in.
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('input:not([type=hidden]):not([tabindex="-1"]), select, textarea')?.focus({ preventScroll: true })
    }, 350)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      window.clearTimeout(t)
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm"
            onClick={onClose}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={twMerge(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-primary/10 sm:max-h-[min(92dvh,900px)] sm:rounded-3xl',
              WIDTHS[width]
            )}
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            {/* Header */}
            <div className="relative flex-shrink-0 overflow-hidden bg-primary px-5 py-3.5 sm:px-6">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(110%_90%_at_0%_0%,rgb(26_123_196/0.5),transparent_60%),radial-gradient(70%_80%_at_100%_100%,rgb(91_164_17/0.22),transparent_60%)]"
              />
              {/* drag handle hint on phones */}
              <span aria-hidden="true" className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/25 sm:hidden" />
              <div className="relative flex items-center gap-3">
                {Icon && (
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-white/10 text-highlight ring-1 ring-white/15">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {eyebrow && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-highlight">{eyebrow}</p>
                  )}
                  <h2 id={titleId} className="truncate text-base font-extrabold text-white sm:text-lg">
                    {title}
                  </h2>
                  {subtitle && <p className="truncate text-xs text-white/65">{subtitle}</p>}
                </div>
                {showPhone && (
                  <a
                    href="tel:8009630131"
                    className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/15 transition hover:bg-white/15 sm:inline-flex"
                  >
                    <Phone className="h-3.5 w-3.5 text-accent-light" />
                    (800) 963-0131
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-8 w-8 flex-shrink-0 cursor-pointer place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-all duration-300 hover:rotate-90 hover:bg-white/20"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
