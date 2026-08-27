import {
  HIGH_VOLUME_ORDER_THRESHOLD,
  type ProStatus,
} from './config'

export const DEALER_TAGS = ['dealer', 'pro', 'professional']
export const COMMERCIAL_TAGS = ['commercial', 'fleet', 'facility', 'facilities', 'shop']

export function deriveStatuses(opts: {
  tags: string[]
  orderCount: number
  statusOverride?: string | null
}): ProStatus[] {
  const statuses = new Set<ProStatus>()
  const tags = opts.tags.map((t) => t.toLowerCase().trim())

  if (opts.statusOverride && isProStatus(opts.statusOverride)) {
    statuses.add(opts.statusOverride)
  }

  if (tags.some((t) => DEALER_TAGS.includes(t))) statuses.add('pro')
  if (tags.some((t) => COMMERCIAL_TAGS.some((c) => t.includes(c)))) statuses.add('commercial')
  if (opts.orderCount >= HIGH_VOLUME_ORDER_THRESHOLD) statuses.add('high_volume')

  if (statuses.size === 0) statuses.add('member')
  if (statuses.size > 1) statuses.delete('member')

  return [...statuses]
}

function isProStatus(value: string): value is ProStatus {
  return value === 'member' || value === 'pro' || value === 'commercial' || value === 'high_volume'
}

export function firstNameFrom(displayName: string | null, email: string): string {
  const fromName = displayName?.trim().split(/\s+/)[0]
  if (fromName) return fromName
  const local = email.split('@')[0] || 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export function normalizeOrderNumber(value: string): string {
  return value.trim().replace(/^#/, '')
}

export function orderNumberVariants(value: string): string[] {
  const stripped = normalizeOrderNumber(value)
  if (!stripped) return []
  return [...new Set([value.trim(), stripped, `#${stripped}`])]
}
