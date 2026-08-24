export const IMAGE_TYPES = [
  'RV',
  'Commercial',
  'Residential',
  'Manufacturing',
  'Non-RV',
] as const

export const REVIEWS_FOR_MARKETING = [
  'Use For Marketing/Website',
  'Good Photos & Review',
  'Good Photos',
  'Good Review',
  'Reviewed',
  'Repairs/Non Warranty',
] as const

export const REVIEW_CLASSIFICATIONS = [
  {
    value: 'Use For Marketing/Website',
    label: 'Use for marketing',
    hint: 'Website, ads, social',
    shortcut: '1',
    tone: 'marketing',
  },
  {
    value: 'Good Photos & Review',
    label: 'Good photos & review',
    hint: 'Keep both',
    shortcut: '2',
    tone: 'strong',
  },
  {
    value: 'Good Photos',
    label: 'Good photos',
    hint: 'Photos only',
    shortcut: '3',
    tone: 'good',
  },
  {
    value: 'Good Review',
    label: 'Good review',
    hint: 'Review only',
    shortcut: '4',
    tone: 'good',
  },
  {
    value: 'Reviewed',
    label: 'Reviewed',
    hint: 'Logged, not using',
    shortcut: '5',
    tone: 'neutral',
  },
  {
    value: 'Repairs/Non Warranty',
    label: 'Repairs / non-warranty',
    hint: 'Does not qualify',
    shortcut: '6',
    tone: 'reject',
  },
] as const

export type ImageType = (typeof IMAGE_TYPES)[number]
export type ReviewsForMarketing = (typeof REVIEWS_FOR_MARKETING)[number]

export function normalizeZohoPicklist(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || trimmed === '-None-') return null
  return trimmed
}

export function needsClassification(row: {
  reviews_for_marketing?: string | null
  image_type?: string | null
}): boolean {
  return !row.reviews_for_marketing
}
