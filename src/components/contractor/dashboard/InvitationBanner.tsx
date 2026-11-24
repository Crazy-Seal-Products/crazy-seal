'use client'

import { useState, useTransition } from 'react'
import { Users } from 'lucide-react'
import { acceptInvitation, declineInvitation } from '@/lib/contractor/invitation-actions'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'

/** "You're invited to join …": joining a team always takes the person's own yes. */
export function InvitationBanner({ contractorName, roleLabel, readOnly }: { contractorName: string; roleLabel: string; readOnly: boolean }) {
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  if (message === 'declined') return null
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-[var(--p-raised)] p-5 md:flex-row md:items-center">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--p-primary)] text-[var(--p-primary-ink)]">
        <Users className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">You’re invited to join {contractorName}</p>
        <p className="mt-0.5 text-sm text-[var(--p-muted)]">
          As {roleLabel}. Accept to work their projects, quotes and orders in this portal. Your own orders and warranties stay yours.
        </p>
        {message && message !== 'declined' && <p className="mt-2 text-sm text-red-300">{message}</p>}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            className={portalButton}
            onClick={() =>
              start(async () => {
                const r = await acceptInvitation()
                if (r && !r.ok) setMessage(r.error)
              })
            }
          >
            Accept
          </button>
          <button
            type="button"
            disabled={pending}
            className={portalGhostButton}
            onClick={() =>
              start(async () => {
                const r = await declineInvitation()
                setMessage(r.ok ? 'declined' : r.error)
              })
            }
          >
            Decline
          </button>
        </div>
      )}
    </div>
  )
}
