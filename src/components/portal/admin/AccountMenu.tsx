'use client'

import React, { useActionState, useEffect, useState } from 'react'
import { Check, ChevronDown, Copy, Eye, EyeOff, KeyRound, Loader2, LogIn, LogOut, UserRound } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { initials } from '@/lib/portal/accounts'
import { adminSignOut } from '@/lib/portal/actions'
import { changeMyPassword, getMyAccount, type MyAccount } from '@/lib/portal/admin/account-actions'
import { ago, dateShort } from '@/lib/portal/admin/format'
import { roleLabel } from '@/lib/portal/admin/sections'
import type { ActionResult } from './controls'
import { Modal } from './modal'
import { BUTTON, inputCls, labelCls } from './styles'

interface Who {
  name: string
  email: string
  role: string
}

const SIGN_IN_URL = 'https://www.crazyseal.com/portal/login/'

/** The name in the sidebar footer (just the avatar when the sidebar is collapsed). Click it for the account pop-up. */
export function AccountMenu({ admin, compact = false }: { admin: Who; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={compact ? `${admin.name}: your account and sign out` : undefined}
        title={compact ? `${admin.name} · your account` : 'Your account'}
        className={twMerge(
          'flex min-w-0 items-center gap-2.5 rounded-lg text-left transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
          compact ? 'p-0.5' : '-my-1 -ml-1.5 flex-1 px-1.5 py-1',
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-adm-gold-bright to-adm-gold text-[11.5px] font-bold text-adm-gold-ink ring-2 ring-[rgb(245_197_66/0.25)]">
          {initials(admin.name)}
        </span>
        {!compact && (
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-semibold text-white">{admin.name}</span>
            <span className="block truncate text-[11px] text-[#9fb6d3]">{roleLabel(admin.role)} · your account</span>
          </span>
        )}
      </button>
      {open && <AccountModal admin={admin} onClose={() => setOpen(false)} />}
    </>
  )
}

function AccountModal({ admin, onClose }: { admin: Who; onClose: () => void }) {
  const [account, setAccount] = useState<MyAccount | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let alive = true
    getMyAccount()
      .then((a) => alive && setAccount(a))
      .catch(() => alive && setLoadError(true))
    return () => {
      alive = false
    }
  }, [])

  return (
    <Modal title="Your account" icon={<UserRound className="h-4 w-4 text-adm-blue-bright" />} onClose={onClose}>
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-adm-gold-bright to-adm-gold text-[15px] font-bold text-adm-gold-ink">
          {initials(admin.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold text-adm-ink">{admin.name}</span>
          <span className="block truncate text-[12.5px] text-adm-muted">{admin.email}</span>
        </span>
      </div>

      <dl className="mx-4 mt-3 divide-y divide-adm-line-soft rounded-lg border border-adm-line text-[12.5px]">
        <Row label="Email">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate">{admin.email}</span>
            <CopyButton text={admin.email} label="Copy email" />
          </span>
        </Row>
        <Row label="Role">{roleLabel(admin.role)}</Row>
        <Row label="Signed in with">
          {account ? (account.via === 'staff' ? 'Staff account' : 'Backup login (Vercel)') : <Loading failed={loadError} />}
        </Row>
        <Row label="Last sign-in">{account ? (account.lastSignInAt ? ago(account.lastSignInAt) : '—') : <Loading failed={loadError} />}</Row>
        <Row label="Staff since">{account ? dateShort(account.staffSince) : <Loading failed={loadError} />}</Row>
      </dl>

      <div className="mx-4 mt-3 space-y-2">
        <Section icon={KeyRound} title="Password" defaultOpen>
          <p className="text-[12px] leading-relaxed text-adm-muted">
            Passwords are stored encrypted, so nobody can see them, admins included. If you’ve forgotten yours, sign out and use
            “Forgot your password?”. Otherwise change it here.
          </p>
          {account && !account.hasStaffLogin ? (
            <p className="mt-2 text-[12px] leading-relaxed text-adm-text">
              You signed in with the backup login, whose password is set in Vercel. Ask an admin to add you on the Staff page for a password you can change.
            </p>
          ) : (
            <ChangePasswordForm />
          )}
        </Section>

        <Section icon={LogIn} title="Signing in">
          <div className="space-y-1.5 text-[12px] leading-relaxed text-adm-muted">
            <p className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0">Sign in at</span>
              <a href={SIGN_IN_URL} className="truncate font-medium text-adm-blue-bright hover:underline">
                crazyseal.com/portal/login
              </a>
              <CopyButton text={SIGN_IN_URL} label="Copy sign-in link" />
            </p>
            <p>
              Forgot it?{' '}
              <a href="/portal/reset-password/" className="font-medium text-adm-blue-bright hover:underline">
                Reset your password
              </a>{' '}
              and we’ll email you a link.
            </p>
            <p>After 8 wrong passwords in a row, sign-in pauses for 15 minutes.</p>
          </div>
        </Section>
      </div>

      <div className="mt-3 flex justify-end border-t border-adm-line px-4 py-3">
        <form action={adminSignOut}>
          <button type="submit" className={BUTTON.default}>
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </Modal>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <dt className="shrink-0 text-adm-muted">{label}</dt>
      <dd className="min-w-0 text-right text-adm-ink">{children}</dd>
    </div>
  )
}

function Loading({ failed }: { failed: boolean }) {
  return failed ? <span className="text-adm-red">Couldn’t load</span> : <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-adm-muted" />
}

/** One accordion item; items share a name so only one is open at a time. */
function Section({
  icon: Icon,
  title,
  defaultOpen,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details name="account-section" open={defaultOpen} className="group rounded-lg border border-adm-line">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-[13px] font-semibold text-adm-ink [&::-webkit-details-marker]:hidden">
        <Icon className="h-4 w-4 text-adm-blue-bright" />
        <span className="flex-1">{title}</span>
        <ChevronDown className="h-4 w-4 text-adm-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-adm-line-soft px-3 py-2.5">{children}</div>
    </details>
  )
}

function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(changeMyPassword, null)
  const [show, setShow] = useState(false)
  const type = show ? 'text' : 'password'
  return (
    <form action={action} className="mt-2.5 grid gap-2">
      <label className={labelCls}>
        <span>Current password</span>
        <input name="current" type={type} required autoComplete="current-password" className={inputCls} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className={labelCls}>
          <span>New password</span>
          <input name="next" type={type} required minLength={8} autoComplete="new-password" placeholder="8+ characters" className={inputCls} />
        </label>
        <label className={labelCls}>
          <span>Confirm new password</span>
          <input name="confirm" type={type} required minLength={8} autoComplete="new-password" className={inputCls} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Change password
        </button>
        <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1 text-[12px] text-adm-muted hover:text-adm-ink">
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {show ? 'Hide' : 'Show'} what I type
        </button>
      </div>
      {state && (
        <p role={state.ok ? 'status' : 'alert'} className={twMerge('text-[12px]', state.ok ? 'text-adm-green' : 'text-adm-red')}>
          {state.ok ? state.message : state.error}
        </p>
      )}
    </form>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        })
      }
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-ink"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-adm-green" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}
