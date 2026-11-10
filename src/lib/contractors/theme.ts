/**
 * White-label themes for contractor pages (/contractor/<slug>).
 *
 * Every page shares one layout and one set of copy; only the brand changes.
 * A contractor picks a preset palette and can override its two colors. The
 * page reads them as CSS variables, so a new palette or a custom color needs
 * no change to the page itself:
 *
 *   --cb-primary / --cb-on-primary   hero, header, dark sections
 *   --cb-accent  / --cb-on-accent    buttons, highlights, map pins
 *
 * Text colors on each are picked for contrast, so any color works.
 * Plain module: used by the admin editor (client) and the pages (server).
 */

import type { CSSProperties } from 'react'

export const THEMES = {
  seal: { label: 'Crazy Seal', primary: '#003365', accent: '#f9ea1c' },
  ember: { label: 'Ember', primary: '#7a1f2b', accent: '#e0a23b' },
  forest: { label: 'Forest', primary: '#1d4433', accent: '#9bd15b' },
  slate: { label: 'Slate', primary: '#1e293b', accent: '#f97316' },
  ocean: { label: 'Ocean', primary: '#0b4f6c', accent: '#5ed3f3' },
  canyon: { label: 'Canyon', primary: '#4a2418', accent: '#f4a259' },
  violet: { label: 'Violet', primary: '#33195a', accent: '#f472b6' },
  steel: { label: 'Steel', primary: '#232c36', accent: '#7ac143' },
} as const

export type ThemeKey = keyof typeof THEMES

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[]

export function isThemeKey(v: string | null | undefined): v is ThemeKey {
  return Boolean(v && v in THEMES)
}

export interface ContractorBrand {
  theme: string
  primary: string | null
  accent: string | null
  logoUrl: string | null
  tagline: string | null
}

const HEX = /^#[0-9a-f]{6}$/i

export function isHex(v: string | null | undefined): v is string {
  return Boolean(v && HEX.test(v))
}

/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Near-black or white, whichever reads better on `hex`. */
export function readableOn(hex: string): string {
  const l = luminance(hex)
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05) ? '#0b1220' : '#ffffff'
}

export function brandColors(brand: Pick<ContractorBrand, 'theme' | 'primary' | 'accent'>) {
  const preset = THEMES[isThemeKey(brand.theme) ? brand.theme : 'seal']
  const primary = isHex(brand.primary) ? brand.primary.toLowerCase() : preset.primary
  const accent = isHex(brand.accent) ? brand.accent.toLowerCase() : preset.accent
  return { primary, accent, onPrimary: readableOn(primary), onAccent: readableOn(accent) }
}

/** The CSS variables a contractor page sets on its root element. */
export function brandStyle(brand: Pick<ContractorBrand, 'theme' | 'primary' | 'accent'>): CSSProperties {
  const c = brandColors(brand)
  return {
    '--cb-primary': c.primary,
    '--cb-on-primary': c.onPrimary,
    '--cb-accent': c.accent,
    '--cb-on-accent': c.onAccent,
  } as CSSProperties
}

export function initialsOf(name: string): string {
  return name
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^(llc|inc|co|the|and|of)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
