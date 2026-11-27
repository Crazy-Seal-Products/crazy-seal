'use client'

import { Suspense, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ProAuthLayout, authInputClass, authPrimaryButtonClass } from '@/components/pro-hub/ProAuthLayout'
import { useProTurnstile } from '@/components/pro-hub/useProTurnstile'
import { nextQuery, safePortalNext } from '@/lib/contractor/next-path'

export default function ProForgotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#00152b]" />}>
      <ProForgotForm />
    </Suspense>
  )
}

// Also how a contractor activates their portal: Forgot password with the email on their contractor
// record sends a link to set their password (see /api/pro/auth/forgot).
function ProForgotForm() {
  // A contractor portal page to open after the new password is set; carried in the emailed link.
  const next = safePortalNext(useSearchParams().get('next'))
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const turnstile = useProTurnstile('pro-forgot-turnstile')
  const honeypotRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const human = await turnstile.check()
      if (!human.ok) {
        setError(human.error)
        return
      }
      const res = await fetch('/api/pro/auth/forgot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: human.token, website: honeypotRef.current?.value ?? '', next }),
      })
      turnstile.reset()
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not send the email.')
        return
      }
      setSent(true)
    } catch {
      turnstile.reset()
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProAuthLayout subtitle="We’ll email a link so you can set a new password.">
      {sent ? (
        <div className="text-center py-4">
          <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-white/70">
            If <strong>{email}</strong> has a Pro Portal account, a reset link is on the way. It expires in 20 minutes.
          </p>
          <Link href={`/pro/login/${nextQuery(next)}`} className="inline-block mt-4 text-sm font-medium text-highlight hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/75 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              className={authInputClass}
              placeholder="you@shop.com"
            />
          </div>
          {/* Honeypot: hidden from people, filled in by bots (lib/pro/signup-guard). */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input ref={honeypotRef} name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {turnstile.widget}
          {error && <p className="text-sm text-red-200 bg-red-500/10 ring-1 ring-red-400/30 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading || !email} className={authPrimaryButtonClass}>
            {loading ? 'Sending…' : 'Email me a reset link'}
          </button>
          <p className="text-center text-sm text-white/55">
            <Link href={`/pro/login/${nextQuery(next)}`} className="font-semibold text-highlight hover:underline">Back to sign in</Link>
          </p>
        </form>
      )}
    </ProAuthLayout>
  )
}
