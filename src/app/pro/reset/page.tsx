'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProAuthLayout, authInputClass, authPrimaryButtonClass } from '@/components/pro-hub/ProAuthLayout'
import { MIN_PASSWORD_LENGTH } from '@/lib/pro/config'

export default function ProResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#003365]" />}>
      <ProResetForm />
    </Suspense>
  )
}

function ProResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(token ? null : 'That reset link is missing or expired.')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pro/auth/reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirm }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not reset the password.')
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

  return (
    <ProAuthLayout subtitle="Choose a new password for your Pro Hub account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New password <span className="font-normal text-gray-400">({MIN_PASSWORD_LENGTH}+ characters)</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            autoFocus
            disabled={!token}
            className={authInputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            disabled={!token}
            className={authInputClass}
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading || !token || !password} className={authPrimaryButtonClass}>
          {loading ? 'Saving…' : 'Save password and sign in'}
        </button>
        <p className="text-center text-sm text-gray-500">
          <Link href="/pro/forgot/" className="font-semibold text-[#003365] hover:underline">Request a new link</Link>
        </p>
      </form>
    </ProAuthLayout>
  )
}
