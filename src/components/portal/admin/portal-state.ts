import type { PortalState } from '@/lib/portal/admin/dealers'

export const PORTAL_BADGE: Record<PortalState, { tone: 'good' | 'info' | 'warn' | 'neutral'; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  idle: { tone: 'info', label: 'Idle 30d+' },
  invited: { tone: 'warn', label: 'Never signed in' },
  none: { tone: 'neutral', label: 'No account' },
}
