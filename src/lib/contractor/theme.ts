// The contractor portal's look: Thermo's partner-portal layout and motion in
// Crazy Seal's colors, with depth (layered gradients, glass panels, glowing
// buttons). Two looks to pick from (a preference each person sets on Account,
// kept in a cookie): "crazy-seal" (the default: navy, green and yellow) and
// "charcoal" (Thermo's neutral charcoal). A contractor's own color scheme
// isn't applied yet; every portal starts from the contractor's name on
// Crazy Seal's colors.
// Plain module: used by the server layout and client components.

import type { CSSProperties } from 'react'

export interface PortalTheme {
  /** Active menu item, buttons, progress. */
  primary: string
  /** The second stop of the primary gradient. */
  primaryDeep: string
  primaryInk: string
  /** Icons, highlights and section labels. */
  accent: string
  /** Section labels above page titles. */
  kicker: string
  surface: string
  raised: string
  ink: string
  muted: string
  /** The page background: layered glows over the surface. */
  backdrop: string
  /** A panel's fill. */
  panel: string
  /** A panel's border. */
  line: string
}

export const PORTAL_THEME_KEYS = ['crazy-seal', 'charcoal'] as const
export type PortalThemeKey = (typeof PORTAL_THEME_KEYS)[number]

export const PORTAL_THEME_COOKIE = 'cs_portal_theme'

/** Session cookie naming whose branded intro already played in this browser (once per sign-in or View as). */
export const PORTAL_INTRO_COOKIE = 'cs_portal_intro'

export const PORTAL_THEMES: Record<PortalThemeKey, { label: string; description: string; theme: PortalTheme }> = {
  'crazy-seal': {
    label: 'Crazy Seal',
    description: 'Navy with Crazy Seal green and yellow.',
    theme: {
      primary: '#6DC015',
      primaryDeep: '#3F7F0C',
      primaryInk: '#FFFFFF',
      accent: '#F9EA1C',
      kicker: '#F9EA1C',
      surface: '#001428',
      raised: '#03284A',
      ink: '#F4F8FC',
      muted: '#93ABC4',
      backdrop: [
        'radial-gradient(900px 520px at 8% -10%, rgba(91,164,17,0.22), transparent 60%)',
        'radial-gradient(1000px 600px at 105% 0%, rgba(18,95,151,0.45), transparent 62%)',
        'radial-gradient(800px 600px at 50% 120%, rgba(249,234,28,0.07), transparent 60%)',
        'linear-gradient(180deg, #002244 0%, #001428 55%, #000F20 100%)',
      ].join(', '),
      panel: 'linear-gradient(160deg, rgba(18,95,151,0.32) 0%, rgba(3,40,74,0.78) 45%, rgba(0,26,51,0.86) 100%)',
      line: 'rgba(147,171,196,0.16)',
    },
  },
  charcoal: {
    label: 'Charcoal',
    description: 'Neutral charcoal, like the Thermo portal.',
    theme: {
      primary: '#6DC015',
      primaryDeep: '#3F7F0C',
      primaryInk: '#FFFFFF',
      accent: '#F9EA1C',
      kicker: '#8FD63A',
      surface: '#15181C',
      raised: '#1F2328',
      ink: '#F5F1EC',
      muted: '#9DA3AB',
      backdrop: [
        'radial-gradient(900px 520px at 8% -10%, rgba(91,164,17,0.12), transparent 60%)',
        'linear-gradient(180deg, #1A1E23 0%, #15181C 60%, #111316 100%)',
      ].join(', '),
      panel: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(31,35,40,0.92) 40%, rgba(27,30,35,0.95) 100%)',
      line: 'rgba(255,255,255,0.07)',
    },
  },
}

export function isPortalThemeKey(value: unknown): value is PortalThemeKey {
  return typeof value === 'string' && (PORTAL_THEME_KEYS as readonly string[]).includes(value)
}

export function portalThemeFor(key: unknown): PortalTheme {
  return PORTAL_THEMES[isPortalThemeKey(key) ? key : 'crazy-seal'].theme
}

/** The default look every portal starts on. */
export const CRAZY_SEAL_THEME = PORTAL_THEMES['crazy-seal'].theme

/**
 * CSS variables for a portal page (--p-*), used by the portal's building
 * blocks (src/components/portal/ui.tsx, portal-styles.ts). On the charcoal
 * look the site's own color tokens (navy, blue tints) are re-pointed at the
 * charcoal surfaces so screens built with the site's color names match it.
 */
export function themeStyle(t: PortalTheme): CSSProperties {
  const vars: Record<string, string> = {
    '--p-primary': t.primary,
    '--p-primary-deep': t.primaryDeep,
    '--p-primary-ink': t.primaryInk,
    '--p-primary-grad': `linear-gradient(180deg, ${t.primary} 0%, ${t.primaryDeep} 100%)`,
    '--p-glow': `0 10px 26px -10px ${t.primary}cc, 0 0 0 1px ${t.primary}40 inset`,
    '--p-accent': t.accent,
    '--p-kicker': t.kicker,
    '--p-surface': t.surface,
    '--p-raised': t.raised,
    '--p-ink': t.ink,
    '--p-muted': t.muted,
    '--p-panel': t.panel,
    '--p-line': t.line,
    '--p-shadow': '0 1px 0 rgba(255,255,255,0.06) inset, 0 28px 60px -34px rgba(0,0,0,0.85), 0 10px 24px -18px rgba(0,0,0,0.6)',
    backgroundColor: t.surface,
    backgroundImage: t.backdrop,
    backgroundAttachment: 'fixed',
    color: t.ink,
  }
  if (t.surface === PORTAL_THEMES.charcoal.theme.surface) {
    Object.assign(vars, {
      '--cs-primary': t.raised,
      '--cs-primary-light': '#2A2F36',
      '--cs-primary-dark': t.surface,
      '--color-blue-100': '#E4E2DE',
      '--color-blue-200': '#D2D0CB',
    })
  }
  return vars as CSSProperties
}
