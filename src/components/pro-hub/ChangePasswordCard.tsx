'use client'

import { useEffect, useState } from 'react'
import { MIN_PASSWORD_LENGTH } from '@/lib/pro/config'

export function ChangePasswordGate() {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  useEffect(() => {
    fetch('/api/pro/me/')
      .then((r) => r.json())
      .then((d) => setHasPassword(Boolean(d.user?.hasPassword)))
      .catch(() => setHasPassword(false))
  }, [])
  if (hasPassword === null) return null
  return <ChangePasswordCard hasPassword={hasPassword} />
}

export function ChangePasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/pro/auth/password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, password, confirm }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Could not update the password.')
        return
      }
      setCurrent('')
      setPassword('')
      setConfirm('')
      setSaved(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
      <h2 className="font-bold text-[#003365]">{hasPassword ? 'Change password' : 'Set a password'}</h2>
      <p className="text-sm text-gray-500">
        {hasPassword
          ? 'Use this when you want a new password without emailing a reset link.'
          : 'This account was opened with a sign-in link. Add a password so you can sign in without email next time.'}
      </p>
      {hasPassword && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Current password</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" className={inputClass} />
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">New password ({MIN_PASSWORD_LENGTH}+ characters)</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm new password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={inputClass} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-[#5BA411] font-medium">Password saved.</p>}
      <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[#003365] text-white text-sm font-semibold disabled:opacity-50">
        {loading ? 'Saving…' : hasPassword ? 'Update password' : 'Save password'}
      </button>
    </form>
  )
}
