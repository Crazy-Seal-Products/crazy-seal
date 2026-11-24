'use client'

import { ActionButton } from '@/components/portal/admin/controls'
import { syncProAccountsAction } from '@/lib/portal/admin/portal-sync-actions'

/** Links every Pro Hub account to its matching contractor's portal (adds team rows only; nothing is deleted). */
export function SyncProAccountsButton() {
  return (
    <ActionButton
      action={syncProAccountsAction}
      confirm="Link each Pro Hub account that matches a contractor (same Shopify customer or email, contractor with no owner yet) as that contractor’s owner? Nothing is changed or deleted on any account."
    >
      Bring Pro Hub accounts over
    </ActionButton>
  )
}
