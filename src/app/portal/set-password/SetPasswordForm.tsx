'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { portalInput } from '@/components/portal/ui'
import { setPasswordFromLink, type SetPasswordState } from '@/lib/portal/admin/password-setup-actions'

const LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'

export function SetPasswordForm({ token, email, name }: { token: string | null; email: string | null; name: string | null }) {
  const [state, action, pending] = useActionState<SetPasswordState, FormData>(setPasswordFromLink, null)
  const [show, setShow] = useState(false)
  const done = state?.ok === true
  const dead = !token || (state && !state.ok && state.expired)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#00152b] px-5 py-10 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className="relative w-full max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Crazy Seal" className="mx-auto mb-6 h-20 w-auto" />
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">Crazy Seal Admin</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          {done ? 'You’re all set' : dead ? 'That link didn’t work' : `Welcome${name ? `, ${name.split(' ')[0]}` : ''}`}
        </h1>

        {done && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-blue-100/70">Your password is saved. Sign in with {state.email} and your new password.</p>
            <Link
              href="/portal/login/"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-sm font-bold text-white"
            >
              Sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!done && dead && (
          <p className="mt-6 text-sm text-blue-100/70">
            {state && !state.ok ? state.error : 'This link is invalid, expired or already used. Ask an admin to send you a new one, or use “Forgot your password?” on the sign-in page.'}
          </p>
        )}

        {!done && !dead && (
          <form action={action} className="mt-7 space-y-4">
            <p className="text-sm text-blue-100/60">
              Choose a password for <span className="font-semibold text-white">{email}</span>. You can change it any time from your account in the admin.
            </p>
            <input type="hidden" name="token" value={token ?? ''} />
            {/* Lets password managers save the new password under the right account. */}
            <input type="email" name="username" autoComplete="username" value={email ?? ''} readOnly hidden />
            <Field name="password" label="New password" show={show} placeholder="At least 8 characters" autoFocus />
            <Field name="confirm" label="Confirm password" show={show} placeholder="Re-enter it" />
            <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1 text-xs text-blue-100/60 hover:text-white">
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? 'Hide' : 'Show'} what I type
            </button>
            {state && !state.ok && (
              <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-400/30">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="btn-sheen flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-sm font-bold text-white shadow-[0_10px_26px_-10px_rgba(91,164,17,0.8)] transition-all hover:-translate-y-0.5 disabled:opacity-70"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {pending ? 'Saving…' : 'Save my password'}
            </button>
          </form>
        )}

        <p className="mt-8 border-t border-white/10 pt-6 text-sm text-blue-100/60">
          <Link href="/portal/login/" className="font-semibold text-white underline decoration-accent/50 underline-offset-4 hover:text-accent-light">
            Go to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({ name, label, show, placeholder, autoFocus }: { name: string; label: string; show: boolean; placeholder: string; autoFocus?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">{label}</span>
      <span className="relative block">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
        <input
          name={name}
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={twMerge(portalInput, 'pl-10')}
        />
      </span>
    </label>
  )
}
