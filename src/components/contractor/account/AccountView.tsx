'use client'

import { useState } from 'react'
import { Panel, PanelTitle, ViewHeader, portalButton, portalInput } from '@/components/portal/ui'
import { MIN_PASSWORD_LENGTH } from '@/lib/pro/config'
import type { PortalThemeKey } from '@/lib/contractor/theme'
import { ThemePicker } from './ThemePicker'

/** The person's account details and password (Pro Hub's password card, in the portal's design). */
export function AccountView({
  name,
  email,
  phone,
  businessName,
  company,
  hasPassword,
  readOnly,
  theme,
}: {
  name: string
  email: string
  phone: string | null
  businessName: string | null
  company: { name: string; role: string; summary: string } | null
  hasPassword: boolean
  readOnly: boolean
  theme: PortalThemeKey
}) {
  return (
    <div>
      <ViewHeader kicker="Account" title={name} description={email} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Your details</PanelTitle>
          <dl className="space-y-3 text-sm">
            <Row label="Email" value={email} />
            <Row label="Phone" value={phone || '—'} />
            {businessName && <Row label="Business" value={businessName} />}
            <Row label="Company" value={company ? company.name : 'Not on a contractor team yet'} />
            {company && <Row label="Role" value={`${company.role}: ${company.summary}`} />}
          </dl>
          {!company && (
            <p className="mt-4 text-xs leading-relaxed text-white/50">
              Run a contracting company? Your company’s owner can add you from their Team page, or Crazy Seal can link your account to your company.
            </p>
          )}
        </Panel>
        {readOnly ? (
          <Panel>
            <PanelTitle>Password</PanelTitle>
            <p className="text-sm text-white/70">
              Hidden in admin view. {hasPassword ? 'This account has a password set.' : 'This account signs in with email links and has no password yet.'}
            </p>
          </Panel>
        ) : (
          <PasswordCard hasPassword={hasPassword} />
        )}
        <ThemePicker current={theme} />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3">
      <dt className="text-white/45">{label}</dt>
      <dd className="min-w-0 break-words text-white/85">{value}</dd>
    </div>
  )
}

function PasswordCard({ hasPassword: initial }: { hasPassword: boolean }) {
  const [hasPassword, setHasPassword] = useState(initial)
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
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
      setHasPassword(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel>
      <form onSubmit={submit} className="space-y-3">
        <PanelTitle>{hasPassword ? 'Change password' : 'Set a password'}</PanelTitle>
        <p className="text-sm text-white/60">
          {hasPassword
            ? 'Pick a new password without emailing yourself a reset link.'
            : 'This account was opened with a sign-in link. Add a password so you can sign in without email next time.'}
        </p>
        {hasPassword && (
          <label className="block text-xs font-semibold text-white/55">
            Current password
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" className={`${portalInput} mt-1`} />
          </label>
        )}
        <label className="block text-xs font-semibold text-white/55">
          New password ({MIN_PASSWORD_LENGTH}+ characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className={`${portalInput} mt-1`}
          />
        </label>
        <label className="block text-xs font-semibold text-white/55">
          Confirm new password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className={`${portalInput} mt-1`}
          />
        </label>
        {error && <p className="text-sm text-red-300">{error}</p>}
        {saved && <p className="text-sm font-medium text-secondary-light">Password saved.</p>}
        <button type="submit" disabled={loading} className={portalButton}>
          {loading ? 'Saving…' : hasPassword ? 'Update password' : 'Save password'}
        </button>
      </form>
    </Panel>
  )
}
