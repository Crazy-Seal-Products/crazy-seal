'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProAuthLayout, authInputClass, authPrimaryButtonClass } from '@/components/pro-hub/ProAuthLayout'

export default function ProLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#003365]" />}>
      <ProLoginForm />
    </Suspense>
  )
}

function ProLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const expired = params.get('error') === 'expired'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(expired ? 'That sign-in link expired. Request a new one.' : null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/pro/me/').then((res) => {
      if (res.ok) router.replace('/pro/')
    }).catch(() => {})
  }, [router])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pro/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not sign in.')
        return
      }
      router.replace('/pro/')
      router.refresh()
    } catch {
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
      const res = await fetch('/api/pro/auth/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not send the link.')
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProAuthLayout>
      {sent ? (
        <div className="text-center py-4">
          <h2 className="text-lg font-bold text-[#003365] mb-2">Check your email</h2>
          <p className="text-sm text-gray-600">
            We sent a sign-in link to <strong>{email}</strong>. It expires in 20 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 text-sm text-[#003365] font-medium hover:underline"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/pro/forgot/" className="text-xs font-medium text-[#003365] hover:underline">
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
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
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
            className="w-full text-sm font-medium text-[#003365] hover:underline"
          >
            Email me a sign-in link instead
          </button>
          <p className="text-center text-sm text-gray-500">
            New here?{' '}
            <Link href="/pro/signup/" className="font-semibold text-[#003365] hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      )}
      <p className="text-center text-xs text-gray-400 mt-6">
        DIY customer? This still works — you&apos;ll see your orders and certificates.{' '}
        <Link href="/professionals/" className="text-[#003365] hover:underline">Become a Pro</Link>
        {' · '}
        <Link href="/" className="hover:underline">crazyseal.com</Link>
      </p>
    </ProAuthLayout>
  )
}
