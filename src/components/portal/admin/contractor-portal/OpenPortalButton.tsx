import { ArrowUpRight } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BUTTON } from '../styles'

/**
 * Opens this contractor's portal in a new tab as their owner, read-only (View
 * as, src/lib/pro/view-as.ts). A base view when nobody on their team has an
 * account yet. A plain form post, so it needs no client JavaScript.
 */
export function OpenPortalButton({ contractorId, name, className }: { contractorId: string; name: string; className?: string }) {
  return (
    <form action="/api/admin/view-as/" method="post" target="_blank" className="inline-flex">
      <input type="hidden" name="contractor_id" value={contractorId} />
      <button type="submit" title={`Open ${name}’s contractor portal (read-only)`} className={twMerge(BUTTON.default, 'whitespace-nowrap', className)}>
        Open portal <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
      </button>
    </form>
  )
}
