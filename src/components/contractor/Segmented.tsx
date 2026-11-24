'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export interface SegmentOption<K extends string> {
  key: K
  label: string
  icon?: LucideIcon
  /** A small count after the label. */
  count?: number
}

/**
 * Thermo's pill of choices: a gradient highlight slides to the picked one.
 * Buttons, for filters and tabs that change the screen in place (the
 * Projects page's link version navigates instead). `id` keeps each control's
 * highlight to itself.
 */
export function Segmented<K extends string>({
  id,
  label,
  options,
  value,
  onChange,
  role = 'radiogroup',
  className,
}: {
  id: string
  label: string
  options: readonly SegmentOption<K>[]
  value: K
  onChange: (key: K) => void
  /** 'tablist' when it switches panels (with aria-controls on each panel's side). */
  role?: 'radiogroup' | 'tablist'
  className?: string
}) {
  const itemRole = role === 'tablist' ? 'tab' : 'radio'
  return (
    <div
      role={role}
      aria-label={label}
      className={twMerge(
        'relative inline-flex max-w-full overflow-x-auto rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [scrollbar-width:none]',
        className,
      )}
    >
      {options.map(({ key, label: text, icon: Icon, count }) => {
        const on = key === value
        return (
          <button
            key={key}
            type="button"
            role={itemRole}
            aria-checked={itemRole === 'radio' ? on : undefined}
            aria-selected={itemRole === 'tab' ? on : undefined}
            onClick={() => onChange(key)}
            className={twMerge(
              'relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--p-primary,#6DC015)]',
              on ? 'text-[var(--p-primary-ink,#fff)]' : 'text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]',
            )}
          >
            {on && (
              <motion.span
                layoutId={`segmented-${id}`}
                className="absolute inset-0 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] shadow-[var(--p-glow)]"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {text}
              {count !== undefined && <span className={twMerge('tabular-nums', on ? 'opacity-80' : 'opacity-60')}>{count}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
