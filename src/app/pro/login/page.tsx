'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProAuthLayout, authInputClass, authPrimaryButtonClass } from '@/components/pro-hub/ProAuthLayout'
import { useProTurnstile } from '@/components/pro-hub/useProTurnstile'
import { nextQuery, pageAfterSignIn, safePortalNext } from '@/lib/contractor/next-path'

export default function ProLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#00152b]" />}>
      <ProLoginForm />
    </Suspense>
  )
}

function ProLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const expired = params.get('error') === 'expired'
  // A contractor portal page to open after signing in (only /portal/ pages; see safePortalNext).
  const next = safePortalNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(expired ? 'That sign-in link expired. Request a new one.' : null)
  const [loading, setLoading] = useState(false)
  const turnstile = useProTurnstile('pro-login-turnstile')
  const honeypotRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/pro/me/').then((res) => {
      if (res.ok) router.replace(pageAfterSignIn(next))
    }).catch(() => {})
  }, [router, next])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const human = await turnstile.check()
      if (!human.ok) {
        setError(human.error)
        return
      }
      const res = await fetch('/api/pro/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken: human.token }),
      })
      turnstile.reset()
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not sign in.')
        return
      }
      router.replace(pageAfterSignIn(next))
      router.refresh()
    } catch {
      turnstile.reset()
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const human = await turnstile.check()
      if (!human.ok) {
        setError(human.error)
        return
      }
      const res = await fetch('/api/pro/auth/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: human.token, website: honeypotRef.current?.value ?? '', next }),
      })
      turnstile.reset()
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not send the link.')
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
    <ProAuthLayout>
      {sent ? (
        <div className="text-center py-4">
          <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-white/70">
            We sent a sign-in link to <strong>{email}</strong>. It expires in 20 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 text-sm text-highlight font-medium hover:underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/75 mb-1">
              Email
            </label>
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
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-white/75">
                Password
              </label>
              <Link href={`/pro/forgot/${nextQuery(next)}`} className="text-xs font-medium text-highlight hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={authInputClass}
            />
          </div>
          {/* Honeypot: hidden from people, filled in by bots (lib/pro/signup-guard). */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input ref={honeypotRef} name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {turnstile.widget}
          {error && (
            <div className="text-sm text-red-200 bg-red-500/10 ring-1 ring-red-400/30 px-3 py-2 rounded-lg">
              <p>{error}</p>
              {/* Staff accounts are separate: a staff email and password never work here. */}
              <p className="mt-1 text-xs text-red-100/80">
                Crazy Seal staff?{' '}
                <Link href="/portal/login/" className="font-semibold text-highlight underline underline-offset-2">
                  Sign in to the admin instead
                </Link>
                .
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className={authPrimaryButtonClass}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full text-sm font-medium text-highlight hover:underline"
          >
            Email me a sign-in link instead
          </button>
          <p className="text-center text-sm text-white/55">
            New here?{' '}
            <Link href="/pro/signup/" className="font-semibold text-highlight hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      )}
      <p className="text-center text-xs text-white/40 mt-6">
        DIY customer? This still works — you&apos;ll see your orders and certificates.{' '}
        <Link href="/professionals/" className="text-highlight hover:underline">Become a Pro</Link>
        {' · '}
        <Link href="/" className="hover:underline">crazyseal.com</Link>
      </p>
      <p className="text-center text-xs text-white/40 mt-2">
        Crazy Seal staff sign in to the{' '}
        <Link href="/portal/login/" className="text-highlight hover:underline">
          admin
        </Link>
        , not here.
      </p>
    </ProAuthLayout>
  )
}
