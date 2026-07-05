/**
 * Layout Classification System — Single source of truth
 *
 * Defines which layout features apply to each route zone.
 * Used by GlobalLayout and any component that needs to know
 * about the current page's layout context.
 */

export type LayoutZone = 'marketing' | 'admin' | 'lms' | 'bare'

export interface LayoutConfig {
  zone: LayoutZone
  header: boolean
  footer: boolean
  pageWrapper: boolean
  sidebar: 'none' | 'admin' | 'lms'
  tracking: boolean
}

interface ZoneRule {
  match: (pathname: string) => boolean
  config: LayoutConfig
}

const ZONE_RULES: ZoneRule[] = [
  {
    match: (p) => p.startsWith('/admin'),
    config: {
      zone: 'admin',
      header: false,
      footer: false,
      pageWrapper: false,
      sidebar: 'admin',
      tracking: false,
    },
  },
  {
    match: (p) => p.startsWith('/lms'),
    config: {
      zone: 'lms',
      header: false,
      footer: false,
      pageWrapper: false,
      sidebar: 'lms',
      tracking: false,
    },
  },
  {
    match: (p) =>
      p.startsWith('/print') ||
      p.startsWith('/pdf') ||
      p.startsWith('/api'),
    config: {
      zone: 'bare',
      header: false,
      footer: false,
      pageWrapper: false,
      sidebar: 'none',
      tracking: false,
    },
  },
  {
    match: (p) => p === '/financing' || p === '/financing/',
    config: {
      zone: 'marketing',
      header: true,
      footer: true,
      pageWrapper: false,
      sidebar: 'none',
      tracking: true,
    },
  },
]

const MARKETING_DEFAULT: LayoutConfig = {
  zone: 'marketing',
  header: true,
  footer: true,
  pageWrapper: true,
  sidebar: 'none',
  tracking: true,
}

export function getLayoutConfig(pathname: string): LayoutConfig {
  for (const rule of ZONE_RULES) {
    if (rule.match(pathname)) return rule.config
  }
  return MARKETING_DEFAULT
}
