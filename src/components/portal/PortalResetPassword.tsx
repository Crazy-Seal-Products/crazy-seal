'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getAuthCallbackError, hasAuthHash } from '@/lib/auth/recovery'
import { checkStaffSession } from '@/lib/portal/actions'
import { portalInput } from './ui'

const LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'

// Supabase only sends links to allowed redirect URLs; this one was already
// allowed for the old site admin and now forwards to /portal/reset-password/.
const RESET_REDIRECT_PATH = '/admin/reset-password/'

type Mode = 'request' | 'checking' | 'ready' | 'missing'

/** Reads the reset link in the URL and reports what the page should show. Returns a cleanup. */
function readResetLink(setMode: (m: Mode) => void, setError: (e: string) => void): (() => void) | undefined {
  const { hash, search } = window.location
  const params = new URLSearchParams(search)
  const callbackError = getAuthCallbackError(hash, search)
  if (callbackError) {
    setError(callbackError.message)
    setMode('missing')
    return
  }

  const tokenHash = params.get('token_hash')
  const hasToken = Boolean(tokenHash || params.get('code') || hasAuthHash(hash))
  if (!hasToken) {
    setMode('request')
    return
  }

  const supabase = createClient()
  let settled = false
  const settle = (next: Mode) => {
    if (settled) return
    settled = true
    setMode(next)
  }

  // Three link shapes: a PKCE `?code=` (the browser client exchanges it on
  // its own), `?token_hash=` from custom email templates, and implicit
  // `#access_token=` links from server-sent emails, which the PKCE browser
  // client refuses, so the session is set from them directly.
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  if (accessToken && refreshToken) {
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error: sessionError }) => {
      window.history.replaceState(null, '', window.location.pathname)
      if (sessionError) {
        setError(sessionError.message)
        settle('missing')
      } else settle('ready')
    })
  } else if (tokenHash) {
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: (params.get('type') ?? 'recovery') as EmailOtpType })
      .then(({ error: otpError }) => {
        if (otpError) {
          setError(otpError.message)
          settle('missing')
        } else settle('ready')
      })
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) settle('ready')
  })
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) settle('ready')
  })
  const timeout = window.setTimeout(() => {
    supabase.auth.getSession().then(({ data: { session } }) => settle(session ? 'ready' : 'missing'))
  }, 4000)

  return () => {
    subscription.unsubscribe()
    window.clearTimeout(timeout)
  }
}

/**
 * Staff password reset for the Crazy Seal Admin (Supabase staff accounts).
 * Without a reset token in the URL it asks for an email and sends a link;
 * opened from that link it sets the new password and signs the person in.
 */
export function PortalResetPassword() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    // Read the link on the next frame (the URL only exists in the browser).
    let cleanup: (() => void) | undefined
    const frame = requestAnimationFrame(() => {
      cleanup = readResetLink(setMode, setError)
    })
    return () => {
      cancelAnimationFrame(frame)
      cleanup?.()
    }
  }, [])

  async function sendLink(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setNotice(null)
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${RESET_REDIRECT_PATH}`,
    })
    setPending(false)
    if (resetError) setError(resetError.message)
    else setNotice('If that email belongs to a staff account, a reset link is on its way. Open it in this browser.')
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirm) return setError('The passwords don’t match.')

    setPending(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setPending(false)
      return setError(updateError.message)
    }
    if (await checkStaffSession()) {
      router.replace('/portal/admin/')
      router.refresh()
      return
    }
    await supabase.auth.signOut()
    setPending(false)
    setError('Your password was saved, but this email isn’t on the staff list. Ask an admin to add you.')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#00152b] px-5 py-10 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className="relative w-full max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Crazy Seal" className="mx-auto mb-6 h-20 w-auto" />
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">Crazy Seal Admin</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          {mode === 'request' ? 'Reset your password' : mode === 'missing' ? 'That link didn’t work' : 'Set a new password'}
        </h1>

        {mode === 'checking' && (
          <p className="mt-6 flex items-center gap-2 text-sm text-blue-100/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking your reset link…
          </p>
        )}

        {mode === 'request' && (
          <form onSubmit={sendLink} className="mt-7 space-y-4">
            <p className="text-sm text-blue-100/60">Enter your staff email and we’ll send you a link to set a new password.</p>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={twMerge(portalInput, 'pl-10')}
                />
              </span>
            </label>
            <Feedback error={error} notice={notice} />
            <SubmitButton pending={pending} label="Send reset link" pendingLabel="Sending…" />
          </form>
        )}

        {mode === 'ready' && (
          <form onSubmit={savePassword} className="mt-7 space-y-4">
            <PasswordField label="New password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoFocus />
            <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} placeholder="Re-enter it" />
            <Feedback error={error} notice={null} />
            <SubmitButton pending={pending} label="Save and sign in" pendingLabel="Saving…" />
          </form>
        )}

        {mode === 'missing' && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-blue-100/70">
              {error ?? 'This reset link is missing, invalid or expired. Request a new one and open it right away.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setMode('request')
                window.history.replaceState(null, '', window.location.pathname)
              }}
              className="w-full rounded-full bg-white/10 px-5 py-3 text-sm font-bold ring-1 ring-white/15 transition hover:bg-white/15"
            >
              Send a new link
            </button>
          </div>
        )}

        <p className="mt-8 border-t border-white/10 pt-6 text-sm text-blue-100/60">
          <Link href="/portal/login/" className="font-semibold text-white underline decoration-accent/50 underline-offset-4 hover:text-accent-light">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoFocus?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">{label}</span>
      <span className="relative block">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={twMerge(portalInput, 'pl-10')}
        />
      </span>
    </label>
  )
}

function Feedback({ error, notice }: { error: string | null; notice: string | null }) {
  if (error) return <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-400/30">{error}</p>
  if (notice) return <p role="status" className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent-light ring-1 ring-accent/30">{notice}</p>
  return null
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-sheen flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-sm font-bold text-white shadow-[0_10px_26px_-10px_rgba(91,164,17,0.8)] transition-all hover:-translate-y-0.5 disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel : label}
      {!pending && <ArrowRight className="h-4 w-4" />}
    </button>
  )
}
