'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { ActionButton, type ActionResult } from '../controls'

/**
 * Sends the warranty registration confirmation for a legacy Gravity Forms
 * warranty entry through POST /api/admin/warranty/notify, with the same body
 * the old Legacy Forms page sent. The route maps the entry to a warranty
 * registration first if it isn't one yet.
 */
export function ResendConfirmation({ legacyId, gfEntryId, email }: { legacyId: string; gfEntryId: number; email: string }) {
  const router = useRouter()

  async function send(): Promise<ActionResult> {
    try {
      const res = await fetch('/api/admin/warranty/notify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legacy_id: legacyId, gf_entry_id: gfEntryId }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; sent?: { installer?: boolean } }
      if (!res.ok) return { ok: false, error: data.error || 'Failed to send emails.' }
      const recipients = ['customer']
      if (data.sent?.installer) recipients.push('installer')
      // A first send creates the warranty registration; show its link.
      router.refresh()
      return { ok: true, message: `Sent to ${recipients.join(' and ')}.` }
    } catch {
      return { ok: false, error: 'Failed to send emails.' }
    }
  }

  return (
    <ActionButton action={send} confirm={`Send the warranty registration confirmation to ${email}?`}>
      <Send className="h-3.5 w-3.5" />
      Resend confirmation emails
    </ActionButton>
  )
}
