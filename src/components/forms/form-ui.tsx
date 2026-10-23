'use client'

import React, { createContext, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { EASE_OUT_EXPO } from '@/components/motion'

/**
 * Shared, purely visual building blocks for the site's forms. Nothing here
 * touches field names, validation, Turnstile, uploads or submit logic — the
 * forms pass these classes to the design-system Input / Select / Textarea
 * (which merge `className` with tailwind-merge) and wrap groups for layout.
 */

/** Modern field skin: rounded-xl, soft inset fill, accent focus ring with a glow. */
export const fieldClass =
  'text-base sm:text-sm rounded-lg border-gray-200 bg-slate-50/80 shadow-[inset_0_1px_2px_rgb(0_32_67/0.06)] transition-all duration-200 hover:border-gray-300 hover:bg-white focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15'

/** Field skin for inputs sitting on a navy panel. */
export const fieldClassOnDark =
  'text-base sm:text-sm rounded-lg border-white/10 bg-white shadow-[inset_0_1px_2px_rgb(0_32_67/0.08)] transition-all duration-200 focus:border-accent focus:ring-4 focus:ring-accent/30'

/** Native checkbox with the brand accent. */
export const checkboxClass =
  'mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 accent-accent'

/** Card-style row that wraps a checkbox + its copy. */
export const checkRowClass =
  'flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50/70 px-3 py-2.5 text-xs leading-snug ring-1 ring-gray-200/80 transition-all duration-200 hover:ring-accent/40 has-[:checked]:bg-accent/[0.06] has-[:checked]:ring-accent/40'

/** Small caption under a field (e.g. "First" / "Last"). */
export const captionClass = 'mt-1 ml-1 block text-[11px] text-gray-400'

export function FieldLabel({
  children,
  required,
  className = '',
}: {
  children: React.ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <label className={`mb-1 block text-xs font-semibold text-gray-700 ${className}`}>
      {children}
      {required && (
        <>
          {' '}
          <span className="text-red-500">*</span>
        </>
      )}
    </label>
  )
}

/** Numbered group header that visually chunks a long form. Inside a
 *  `FormStepper`, only the section whose `step` is active is shown. */
export function FormSection({
  step,
  title,
  children,
  className = '',
}: {
  step?: number
  title: string
  children: React.ReactNode
  className?: string
}) {
  const stepper = useContext(StepperCtx)
  const inStepper = stepper !== null && step !== undefined
  return (
    <div
      role="group"
      aria-label={title}
      className={className}
      data-form-step={inStepper ? step : undefined}
      hidden={inStepper ? step !== stepper.active : undefined}
    >
      {!inStepper && (
        <div className="mb-2 flex items-center gap-2.5">
          {step !== undefined && (
            <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-light to-primary text-[10px] font-bold text-white">
              {step}
            </span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{title}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-primary/15 to-transparent" />
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  )
}

// -- Stepper: one section at a time for long forms --

const StepperCtx = createContext<{ active: number; total: number } | null>(null)

/**
 * Splits a long form into steps without touching its fields or submit logic:
 * every section stays mounted (so FormData still has every value) and only
 * the active one is visible. "Next" runs native validation on the active
 * section's fields, plus an optional custom check (e.g. required uploads).
 */
export function FormStepper({
  titles,
  children,
  validateStep,
}: {
  titles: string[]
  children: React.ReactNode
  /** Return an error message to block leaving `step`, or null to continue. */
  validateStep?: (step: number) => string | null
}) {
  const [active, setActive] = useState(1)
  const [stepError, setStepError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const total = titles.length

  const next = () => {
    const section = ref.current?.querySelector<HTMLElement>(`[data-form-step="${active}"]`)
    const fields = section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input, select, textarea'
    )
    for (const field of Array.from(fields ?? [])) {
      if (!field.checkValidity()) {
        field.reportValidity()
        return
      }
    }
    const custom = validateStep?.(active) ?? null
    setStepError(custom)
    if (custom) return
    setActive((a) => Math.min(total, a + 1))
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  const back = () => {
    setStepError(null)
    setActive((a) => Math.max(1, a - 1))
  }

  return (
    <StepperCtx.Provider value={{ active, total }}>
      <div
        ref={ref}
        className="space-y-4"
        onKeyDown={(e) => {
          const tag = (e.target as HTMLElement).tagName
          if (e.key === 'Enter' && active < total && tag !== 'TEXTAREA' && tag !== 'BUTTON') {
            e.preventDefault()
            next()
          }
        }}
      >
        <ol className="flex items-start gap-1.5" aria-label="Form progress">
          {titles.map((title, i) => {
            const n = i + 1
            const done = n < active
            const current = n === active
            return (
              <li key={title} className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="h-1 overflow-hidden rounded-full bg-gray-200">
                  <motion.span
                    className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
                    initial={false}
                    animate={{ width: done || current ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  />
                </span>
                <button
                  type="button"
                  disabled={n >= active}
                  onClick={() => setActive(n)}
                  className={`flex min-w-0 items-center gap-1 text-left text-[11px] font-semibold ${
                    current
                      ? 'text-primary'
                      : done
                        ? 'cursor-pointer text-accent-dark hover:underline'
                        : 'text-gray-400'
                  }`}
                  aria-current={current ? 'step' : undefined}
                >
                  {done ? (
                    <Check className="h-3 w-3 flex-shrink-0" strokeWidth={3} />
                  ) : (
                    <span className="flex-shrink-0">{n}.</span>
                  )}
                  <span className="truncate">{title}</span>
                </button>
              </li>
            )
          })}
        </ol>

        {children}

        <AnimatePresence>{stepError && <FormError key="step-error">{stepError}</FormError>}</AnimatePresence>

        {active < total && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={back}
              disabled={active === 1}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={next}
              className="btn-sheen inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-b from-primary-light to-primary px-6 text-sm font-bold text-white shadow-[0_8px_22px_-10px_rgb(0_51_101/0.6)] transition-all hover:-translate-y-0.5"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </StepperCtx.Provider>
  )
}

/** Content shown only on the stepper's last step (Turnstile, errors, submit).
 *  Stays mounted on earlier steps so Turnstile can verify in the background. */
export function FormStepperFinal({ children }: { children: React.ReactNode }) {
  const stepper = useContext(StepperCtx)
  const isLast = !stepper || stepper.active === stepper.total
  return (
    <div className="space-y-3" hidden={!isLast}>
      {children}
    </div>
  )
}

/** Gradient pill submit button with a hover sheen. Always type="submit". */
export function SubmitButton({
  submitting,
  icon,
  children,
  submittingLabel = 'Submitting...',
}: {
  submitting: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  submittingLabel?: string
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="btn-sheen inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-light to-primary px-7 text-sm font-bold text-white shadow-[0_8px_22px_-8px_rgb(0_51_101/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgb(0_51_101/0.6)] focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto sm:px-9 cursor-pointer"
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {submittingLabel}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}

/** Inline error banner that slides in. */
export function FormError({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.p
      role="alert"
      initial={reduce ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-100"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </motion.p>
  )
}

/** Animated check mark that draws itself in. */
export function SuccessCheck({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const reduce = useReducedMotion()
  const outer = size === 'lg' ? 'h-20 w-20' : 'h-11 w-11'
  const inner = size === 'lg' ? 'h-16 w-16' : 'h-9 w-9'
  const icon = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'
  return (
    <span className={`relative grid flex-shrink-0 place-items-center ${outer}`}>
      <span aria-hidden="true" className="absolute inset-0 rounded-full bg-accent/25 animate-pulse-ring" />
      <motion.span
        initial={reduce ? false : { scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className={`relative grid place-items-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent ${inner}`}
      >
        <svg
          viewBox="0 0 24 24"
          className={icon}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
      </motion.span>
    </span>
  )
}

/** Celebratory success state shown in place of a submitted form. */
export function FormSuccess({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  const reduce = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE_OUT_EXPO },
  })
  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-accent/[0.08] via-white to-white px-5 py-8 text-center ring-1 ring-accent/20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
      />
      <div className="relative mx-auto mb-4 flex justify-center">
        <SuccessCheck />
      </div>
      <motion.h3 {...rise(0.35)} className="relative mb-1.5 text-xl font-extrabold text-primary">
        {title}
      </motion.h3>
      <motion.div {...rise(0.45)} className="relative mx-auto max-w-md text-sm text-gray-600">
        {children}
      </motion.div>
      {action && (
        <motion.div {...rise(0.55)} className="relative mt-5">
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
