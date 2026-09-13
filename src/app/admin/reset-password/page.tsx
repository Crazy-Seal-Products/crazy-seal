'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAuthCallbackError } from '@/lib/auth/recovery'

type Status = 'checking' | 'ready' | 'missing'

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const callbackError = getAuthCallbackError(window.location.hash, window.location.search)
    if (callbackError) {
      setError(callbackError.message)
      setStatus('missing')
      return
    }

    const supabase = createClient()
    let settled = false

    const markReady = () => {
      if (settled) return
      settled = true
      setStatus('ready')
    }

    const markMissing = () => {
      if (settled) return
      settled = true
      setStatus('missing')
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return
      if (
        event === 'PASSWORD_RECOVERY' ||
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        markReady()
      }
    })

    const timeout = window.setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) markReady()
        else markMissing()
      })
    }, 4000)

    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Your password was saved, but we could not confirm your session. Try signing in.')
        return
      }

      const verifyRes = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_user_id: user.id }),
      })
      const { staff: staffRecord } = await verifyRes.json()

      if (!staffRecord) {
        await supabase.auth.signOut()
        setError('Your password was updated, but this email is not on the staff list. Ask an admin to add you.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#003365] flex items-center justify-center mb-3">
            <span className="text-white text-lg font-bold">CS</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Set a new password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a password for the admin panel</p>
        </div>

        {status === 'checking' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 text-center">Checking your reset link...</p>
          </div>
        )}

        {status === 'missing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <p className="text-sm text-gray-600">
              {error || 'This reset link is missing, invalid, or expired. Ask an admin to send a new password recovery email, or request one from the login page.'}
            </p>
            <Link
              href="/admin/login"
              className="block w-full py-2.5 px-4 bg-[#003365] hover:bg-[#002A54] text-white text-sm font-medium rounded-lg text-center transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                autoFocus
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#003365] focus:ring-1 focus:ring-[#003365]/20 transition-colors"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#003365] focus:ring-1 focus:ring-[#003365]/20 transition-colors"
                placeholder="Re-enter password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full py-2.5 px-4 bg-[#003365] hover:bg-[#002A54] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save password and continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
