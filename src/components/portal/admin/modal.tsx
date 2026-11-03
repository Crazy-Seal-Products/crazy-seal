'use client'

import React, { useEffect, useEffectEvent, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

// ─── Portal ───────────────────────────────────────────────────────────────

const SHELL = '.cs-admin:not([data-adm-portal])'

function subscribeTheme(onChange: () => void) {
  const shell = document.querySelector(SHELL)
  if (!shell) return () => {}
  const observer = new MutationObserver(onChange)
  observer.observe(shell, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const themeNow = () => (document.querySelector<HTMLElement>(SHELL)?.dataset.theme === 'light' ? 'light' : 'dark')

/**
 * Renders into <body> (glass panels use backdrop-filter, which would trap a
 * fixed overlay inside them) and re-applies the admin theme there, since the
 * adm-* colour tokens are scoped to .cs-admin.
 */
export function AdminPortal({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, themeNow, () => 'dark')
  return createPortal(
    <div data-adm-portal="" data-theme={theme} className="cs-admin text-adm-ink">
      {children}
    </div>,
    document.body,
  )
}

export function useEscape(onEscape: () => void) {
  const handle = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onEscape()
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => handle(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
}

// ─── Modal ────────────────────────────────────────────────────────────────

export function Modal({
  title,
  icon,
  onClose,
  children,
  className,
}: {
  title: string
  icon?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  className?: string
}) {
  useEscape(onClose)
  return (
    <AdminPortal>
      <div
        className="fixed inset-0 z-[60] grid grid-cols-1 place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-[2px]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div role="dialog" aria-modal="true" aria-label={title} className={twMerge('adm-glass w-full min-w-0 max-w-md rounded-xl', className)}>
          <header className="flex items-center gap-2 border-b border-adm-line px-4 py-2.5">
            {icon}
            <h2 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-adm-ink">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-ink">
              <X className="h-4 w-4" />
            </button>
          </header>
          {children}
        </div>
      </div>
    </AdminPortal>
  )
}
