/**
 * Crazy Seal Pro Hub — product naming and status labels.
 * Public URL is /pro (open to anyone; status pills are how dealers feel special).
 */

export const PRO_HUB_NAME = 'Crazy Seal Pro Hub'
export const PRO_HUB_PATH = '/pro'
export const SESSION_COOKIE = 'cs_pro_session'
export const SESSION_DAYS = 30
export const MAGIC_LINK_MINUTES = 20
export const MAGIC_LINK_COOLDOWN_SECONDS = 60
export const MIN_PASSWORD_LENGTH = 8

/** Shopify order count at or above this earns the High Volume pill. */
export const HIGH_VOLUME_ORDER_THRESHOLD = 5

/** Shown on the home meter until rebates are automated. */
export const REBATE_MILESTONES = [5, 10, 25, 50] as const

export const SUPPORT_PHONE = '(800) 963-0131'
export const SUPPORT_PHONE_TEL = '8009630131'
export const SUPPORT_EMAIL = 'info@crazyseal.com'

export const PRO_STATUSES = ['member', 'pro', 'commercial', 'high_volume'] as const
export type ProStatus = (typeof PRO_STATUSES)[number]

export const PRO_STATUS_LABEL: Record<ProStatus, string> = {
  member: 'Member',
  pro: 'Pro',
  commercial: 'Commercial',
  high_volume: 'High Volume',
}
