'use client'

import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { Panel, PanelTitle } from '@/components/portal/ui'
import { PORTAL_THEME_KEYS, PORTAL_THEMES, type PortalThemeKey } from '@/lib/contractor/theme'
import { setPortalTheme } from '@/lib/contractor/theme-actions'

/** Account → Look: the portal's colors for this person (Crazy Seal by default, or charcoal). */
export function ThemePicker({ current }: { current: PortalThemeKey }) {
  const [pending, start] = useTransition()
  return (
    <Panel>
      <PanelTitle>Look</PanelTitle>
      <p className="mb-4 text-sm text-[var(--p-muted)]">How the portal looks for you. Only changes it on this device.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {PORTAL_THEME_KEYS.map((key) => {
          const { label, description, theme } = PORTAL_THEMES[key]
          const active = key === current
          return (
            <button
              key={key}
              type="button"
              disabled={pending}
              aria-pressed={active}
              onClick={() => start(async () => void (await setPortalTheme(key)))}
              className="rounded-2xl border p-3 text-left transition hover:brightness-110 disabled:opacity-60"
              style={{ borderColor: active ? theme.primary : 'rgba(255,255,255,0.1)' }}
            >
              <span className="flex h-16 overflow-hidden rounded-xl" style={{ background: theme.surface }}>
                <span className="w-1/3 p-2" style={{ background: theme.raised }}>
                  <span className="block h-2 rounded-full" style={{ background: theme.primary }} />
                  <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-white/20" />
                  <span className="mt-1 block h-1.5 w-2/3 rounded-full bg-white/20" />
                </span>
                <span className="flex-1 p-2">
                  <span className="block h-1.5 w-1/3 rounded-full" style={{ background: theme.kicker }} />
                  <span className="mt-1.5 block h-6 rounded-lg" style={{ background: theme.raised }} />
                </span>
              </span>
              <span className="mt-2 flex items-center justify-between text-sm font-semibold text-[var(--p-ink)]">
                {label}
                {active && <Check className="h-4 w-4" style={{ color: theme.primary }} />}
              </span>
              <span className="block text-xs text-[var(--p-muted)]">{description}</span>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
