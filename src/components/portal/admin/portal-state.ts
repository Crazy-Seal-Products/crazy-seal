import type { PortalState, TeamState } from '@/lib/portal/admin/dealers'

export const PORTAL_BADGE: Record<PortalState, { tone: 'good' | 'info' | 'warn' | 'neutral'; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  idle: { tone: 'info', label: 'Idle 30d+' },
  invited: { tone: 'warn', label: 'Never signed in' },
  none: { tone: 'neutral', label: 'No account' },
}

/** A contractor's portal team (contractor_members), for the Contractors list and a rep's contractors. */
export const TEAM_BADGE: Record<TeamState, { tone: 'good' | 'info' | 'warn' | 'neutral'; label: string; title: string }> = {
  owner: { tone: 'good', label: 'Owner linked', title: 'Their owner has a contractor portal login.' },
  team: { tone: 'info', label: 'No owner yet', title: 'People on their team have logins, but nobody is the owner.' },
  invited: { tone: 'warn', label: 'Invited', title: 'Invited to the contractor portal; nobody has set a password yet.' },
  none: { tone: 'neutral', label: 'No account', title: 'Nobody on the contractor portal yet. Add their owner on their page.' },
}
