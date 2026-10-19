/**
 * Mirrors the Zoho Contacts picklist `Reviews_for_Marketing`.
 * Stored as the exact Zoho display value so a round-trip sync stays lossless.
 */
export const MARKETING_REVIEW_VALUES = [
  'Reviewed',
  'Good Photos',
  'Good Review',
  'Good Photos & Review',
  'Use For Marketing/Website',
  'Repairs/Non Warranty',
] as const

export type MarketingReview = (typeof MARKETING_REVIEW_VALUES)[number]

export const MARKETING_REVIEW_STYLES: Record<MarketingReview, string> = {
  'Reviewed': 'bg-gray-100 text-gray-700',
  'Good Photos': 'bg-sky-100 text-sky-800',
  'Good Review': 'bg-indigo-100 text-indigo-800',
  'Good Photos & Review': 'bg-emerald-100 text-emerald-800',
  'Use For Marketing/Website': 'bg-green-100 text-green-800',
  'Repairs/Non Warranty': 'bg-red-100 text-red-700',
}

export function isMarketingReview(value: string | null | undefined): value is MarketingReview {
  return !!value && (MARKETING_REVIEW_VALUES as readonly string[]).includes(value)
}
