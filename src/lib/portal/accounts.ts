import { PORTAL_MODULES, lessonKey } from './modules'

/**
 * Pro Portal demo accounts.
 *
 * The portal currently runs on mock sign-ins only (see `session.ts`). These
 * accounts seed everything a partner sees — profile, tier, starting program
 * progress, pipeline numbers and white-label defaults — so each demo login
 * tells a different story (veteran dealer, RV specialist, brand-new partner).
 */

export type PartnerTier = 'member' | 'pro' | 'commercial' | 'high_volume'

export interface PartnerBrand {
  companyName: string
  tagline: string
  phone: string
  website: string
  primary: string
  accent: string
  logoDataUrl?: string
  template: 'bold' | 'clean' | 'split'
  coBrand: boolean
}

export interface PortalAccount {
  id: string
  company: string
  contactName: string
  firstName: string
  email: string
  role: string
  region: string
  tier: PartnerTier
  partnerSince: string
  /** Lesson ids (`module-slug/lesson-id`) already completed when the demo starts. */
  completedLessons: string[]
  metrics: {
    openLeads: number
    jobsThisQuarter: number
    sqftSealed: number
    rewardsBalance: number
    /** 0–100 progress toward the next tier */
    tierProgress: number
  }
  monthlyGallons: number[]
  brand: PartnerBrand
  whiteLabelStatus: 'not_started' | 'draft' | 'in_design' | 'live'
  /** Short description shown on the demo sign-in tile */
  blurb: string
}

export const TIER_LABELS: Record<PartnerTier, string> = {
  member: 'Member',
  pro: 'Pro',
  commercial: 'Commercial',
  high_volume: 'High Volume',
}

export const TIER_ORDER: PartnerTier[] = ['member', 'pro', 'commercial', 'high_volume']

export const MONTH_LABELS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

/** Every lesson in the first `count` modules — used to seed demo progress. */
function lessonsThrough(count: number): string[] {
  return PORTAL_MODULES.slice(0, count).flatMap((m) => m.lessons.map((l) => lessonKey(m.slug, l.id)))
}

export const PORTAL_ACCOUNTS: PortalAccount[] = [
  {
    id: 'summit',
    company: 'Summit Roofing Co.',
    contactName: 'Jordan Ellis',
    firstName: 'Jordan',
    email: 'jordan@summitroofing.example',
    role: 'Owner',
    region: 'Knoxville, TN',
    tier: 'commercial',
    partnerSince: '2023',
    completedLessons: [...lessonsThrough(3), 'building-a-kit/overview'],
    metrics: {
      openLeads: 14,
      jobsThisQuarter: 23,
      sqftSealed: 48600,
      rewardsBalance: 1840,
      tierProgress: 72,
    },
    monthlyGallons: [140, 185, 230, 210, 275, 320],
    brand: {
      companyName: 'Summit Roofing Co.',
      tagline: 'Flat roofs, sealed for good.',
      phone: '(865) 555-0142',
      website: 'summitroofing.example',
      primary: '#7A1F2B',
      accent: '#E0A23B',
      template: 'bold',
      coBrand: true,
    },
    whiteLabelStatus: 'live',
    blurb: 'Commercial dealer · on Module 4',
  },
  {
    id: 'coastal',
    company: 'Coastal RV Restoration',
    contactName: 'Maria Delgado',
    firstName: 'Maria',
    email: 'maria@coastalrv.example',
    role: 'RV Specialist',
    region: 'Tampa, FL',
    tier: 'pro',
    partnerSince: '2024',
    completedLessons: [...lessonsThrough(1), 'marketing/overview', 'marketing/video-ads'],
    metrics: {
      openLeads: 9,
      jobsThisQuarter: 17,
      sqftSealed: 6200,
      rewardsBalance: 620,
      tierProgress: 45,
    },
    monthlyGallons: [35, 42, 58, 66, 61, 80],
    brand: {
      companyName: 'Coastal RV Restoration',
      tagline: 'Your RV roof, done once and done right.',
      phone: '(813) 555-0187',
      website: 'coastalrv.example',
      primary: '#0F6E7A',
      accent: '#F2B441',
      template: 'split',
      coBrand: true,
    },
    whiteLabelStatus: 'in_design',
    blurb: 'RV specialist · on Module 2',
  },
  {
    id: 'newpartner',
    company: 'Ridgeline Exteriors',
    contactName: 'Sam Porter',
    firstName: 'Sam',
    email: 'sam@ridgeline.example',
    role: 'Owner',
    region: 'Boise, ID',
    tier: 'member',
    partnerSince: '2026',
    completedLessons: [],
    metrics: {
      openLeads: 2,
      jobsThisQuarter: 0,
      sqftSealed: 0,
      rewardsBalance: 0,
      tierProgress: 8,
    },
    monthlyGallons: [0, 0, 0, 0, 5, 15],
    brand: {
      companyName: 'Ridgeline Exteriors',
      tagline: 'Built for the long haul.',
      phone: '(208) 555-0119',
      website: 'ridgeline.example',
      primary: '#2F4A3A',
      accent: '#C9D84A',
      template: 'clean',
      coBrand: true,
    },
    whiteLabelStatus: 'not_started',
    blurb: 'Brand-new partner · first sign-in',
  },
]

export function getPortalAccount(id: string | undefined | null): PortalAccount | undefined {
  if (!id) return undefined
  return PORTAL_ACCOUNTS.find((a) => a.id === id)
}

export function nextTier(tier: PartnerTier): PartnerTier | null {
  const i = TIER_ORDER.indexOf(tier)
  return i >= 0 && i < TIER_ORDER.length - 1 ? TIER_ORDER[i + 1] : null
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
