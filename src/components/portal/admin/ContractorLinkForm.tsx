'use client'

import { useState, useTransition } from 'react'
import { Link2, Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { ActionResult } from './controls'
import { BUTTON } from './styles'

/** Link a Shopify customer to a contractor by the email on their customer record. */
export function ContractorLinkForm({ action }: { action: (email: string) => Promise<ActionResult> }) {
  const [email, setEmail] = useState('')
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  return (
    <form
      className="flex flex-wrap items-center gap-2 border-t border-adm-line-soft px-3 py-2"
      onSubmit={(e) => {
        e.preventDefault()
        setResult(null)
        start(async () => {
          const r = await action(email)
          setResult(r)
          if (r.ok) setEmail('')
        })
      }}
    >
      <label htmlFor="link-customer" className="text-[12px] text-adm-muted">
        Link a Shopify customer
      </label>
      <input
        id="link-customer"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email on their Shopify record"
        className="h-8 w-64 max-w-full rounded-md border border-adm-line bg-adm-input px-2.5 text-[12.5px] text-adm-ink placeholder:text-adm-faint focus:border-adm-blue-bright focus:outline-none focus:ring-2 focus:ring-adm-blue-bright/25"
      />
      <button type="submit" disabled={pending} className={twMerge(BUTTON.default)}>
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
        Link
      </button>
      {result && <span className={twMerge('text-[11.5px]', result.ok ? 'text-adm-green' : 'text-adm-red')}>{result.ok ? result.message ?? 'Linked' : result.error}</span>}
    </form>
  )
}
