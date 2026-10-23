'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Bot, Check, Code, Copy, Mail, Megaphone } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

const ICONS = { code: Code, bot: Bot, mail: Mail, megaphone: Megaphone } as const

interface CopyCodeBlockProps {
  /** Label in the window-style title bar. */
  label: string
  /** Text placed on the clipboard. Also rendered when `children` is omitted. */
  text: string
  /** Optional custom body (e.g. a formatted email); `text` is still what gets copied. */
  children?: ReactNode
  icon?: keyof typeof ICONS
  /** `code` renders monospace snippet styling; `prose` renders readable paragraphs. */
  variant?: 'code' | 'prose'
  /** Extra line under the title bar (e.g. an email subject). */
  meta?: ReactNode
  className?: string
}

/**
 * Window-style panel for copy-and-paste assets (embed codes, AI prompts,
 * email templates) with a one-click copy button.
 */
export function CopyCodeBlock({
  label,
  text,
  children,
  icon = 'code',
  variant = 'code',
  meta,
  className,
}: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const Icon = ICONS[icon]

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked (insecure context / permissions); the text stays selectable.
    }
  }

  return (
    <div
      className={twMerge(
        'overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-primary/[0.08] transition-shadow duration-500 hover:shadow-xl',
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-primary/[0.07] bg-gradient-to-b from-slate-50 to-white px-4 py-2.5 sm:px-5">
        <span aria-hidden="true" className="hidden gap-1.5 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/15" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-accent-light to-accent-dark text-white">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-xs font-bold uppercase tracking-wide text-primary">{label}</span>
        </span>
        <button
          type="button"
          onClick={copy}
          className={twMerge(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300',
            copied
              ? 'bg-accent text-white shadow-glow-accent'
              : 'bg-primary/[0.06] text-primary hover:bg-primary hover:text-white'
          )}
          aria-live="polite"
        >
          {copied ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {meta && <div className="border-b border-primary/[0.07] bg-white px-4 py-3 text-sm text-gray-700 sm:px-5">{meta}</div>}
      {children ? (
        <div className="bg-slate-50/60 p-4 text-sm leading-relaxed text-gray-700 sm:p-6">{children}</div>
      ) : variant === 'code' ? (
        <pre className="max-h-72 overflow-auto bg-primary-dark p-4 text-xs leading-relaxed text-white/80 whitespace-pre-wrap break-all sm:p-5">
          {text}
        </pre>
      ) : (
        <div className="bg-slate-50/60 p-4 text-sm leading-relaxed text-gray-700 whitespace-pre-line sm:p-6">{text}</div>
      )}
    </div>
  )
}
