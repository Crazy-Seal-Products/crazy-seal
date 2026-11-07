'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProAuthLayout, authInputClass, authPrimaryButtonClass } from '@/components/pro-hub/ProAuthLayout'

// Sign-up emails a link; the password is chosen on /pro/reset/ once the link is opened.
export default function ProSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/pro/me/').then((res) => {
      if (res.ok) router.replace('/pro/')
    }).catch(() => {})
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pro/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not create the account.')
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
    <ProAuthLayout subtitle="Create an account with the email on your Crazy Seal orders.">
      {sent ? (
        <div className="text-center py-4" role="status">
          <h2 className="text-lg font-bold text-[#003365] mb-2">Check your email</h2>
          <p className="text-sm text-gray-600">
            We sent a link to <strong>{email}</strong>. Open it to choose your password. It expires in 20 minutes.
          </p>
          <Link href="/pro/login/" className="inline-block mt-4 text-sm font-medium text-[#003365] hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading || !email} className={authPrimaryButtonClass}>
            {loading ? 'Sending…' : 'Email me a link'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Already have one?{' '}
            <Link href="/pro/login/" className="font-semibold text-[#003365] hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </ProAuthLayout>
  )
}
