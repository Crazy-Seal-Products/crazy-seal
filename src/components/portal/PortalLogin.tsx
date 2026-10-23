'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  GraduationCap,
  Inbox,
  Loader2,
  Lock,
  Mail,
  Palette,
  ShieldCheck,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { initials, TIER_LABELS, type PartnerTier } from '@/lib/portal/accounts'
import { portalSignIn, type SignInState } from '@/lib/portal/actions'
import { EASE_OUT_EXPO, GlowOrb } from '@/components/motion'
import { portalInput } from './ui'

const BIG_LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'

interface LoginAccount {
  id: string
  company: string
  contactName: string
  email: string
  blurb: string
  tier: PartnerTier
}

const FEATURES = [
  { icon: GraduationCap, title: '6-module Accelerator Program', desc: 'Videos, checklists and quick checks — with progress saved.' },
  { icon: Palette, title: 'White Label Studio', desc: 'Put your brand on presentations, brochures and emails.' },
  { icon: Inbox, title: 'Leads & orders in one place', desc: 'Referrals from Crazy Seal, your pipeline, rewards tier.' },
  { icon: ShieldCheck, title: 'Warranty registration', desc: 'File the 50 year warranty for every job you finish.' },
]

export function PortalLogin({ accounts, demoEnabled }: { accounts: LoginAccount[]; demoEnabled: boolean }) {
  const [selected, setSelected] = useState(accounts[0]?.id ?? '')
  const account = accounts.find((a) => a.id === selected)
  const [email, setEmail] = useState(account?.email ?? '')
  const [state, formAction, pending] = useActionState<SignInState, FormData>(portalSignIn, {})

  const pick = (a: LoginAccount) => {
    setSelected(a.id)
    setEmail(a.email)
  }

  return (
    <div className="min-h-screen bg-[#00152b] text-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#00152b]" />
        <GlowOrb className="-left-20 top-10 h-[28rem] w-[28rem]" color="rgb(26 123 196 / 0.45)" />
        <GlowOrb className="-bottom-24 right-0 h-[24rem] w-[24rem]" color="rgb(91 164 17 / 0.3)" />
        <div aria-hidden="true" className="hairline-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <Link href="/" className="relative inline-flex w-fit items-center gap-2 text-sm font-semibold text-blue-100/70 hover:text-white">
          ← crazyseal.com
        </Link>

        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={BIG_LOGO}
            alt="Crazy Seal"
            className="h-28 w-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 110, damping: 14 }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
            className="mt-8 max-w-lg text-4xl font-extrabold leading-[1.08] tracking-tight xl:text-5xl"
          >
            Your Crazy Seal business, <span className="text-shimmer-highlight">accelerated.</span>
          </motion.h1>
          <ul className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: EASE_OUT_EXPO }}
                className="rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10 backdrop-blur-sm"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark shadow-glow-accent">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-3 text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-100/60">{desc}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-blue-100/40">U.S. Patent #12,146,061 · Made in the USA</p>
      </div>

      {/* Form side */}
      <div className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="relative w-full max-w-md"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BIG_LOGO} alt="Crazy Seal" className="mx-auto mb-6 h-20 w-auto lg:hidden" />
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">Pro Portal</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-blue-100/60">
            Training, leads, white-label materials and warranties for Crazy Seal partners.
          </p>

          {!demoEnabled ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-blue-100/75">
              The Pro Portal preview isn&apos;t open yet. Partners can keep using the{' '}
              <Link href="/pro/login/" className="font-semibold text-accent-light underline underline-offset-4">
                Pro Hub
              </Link>{' '}
              for orders, jobs and warranties.
            </div>
          ) : (
            <form action={formAction} className="mt-8 space-y-5">
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-blue-100/60">Choose a demo account</legend>
                <div className="space-y-2">
                  {accounts.map((a) => {
                    const active = a.id === selected
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => pick(a)}
                        className={twMerge(
                          'relative flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors',
                          active ? 'border-accent/50' : 'border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                        )}
                        aria-pressed={active}
                      >
                        {active && (
                          <motion.span
                            layoutId="login-active"
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/15 to-white/[0.03]"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-black">
                          {initials(a.company)}
                        </span>
                        <span className="relative min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{a.company}</span>
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-blue-100/80">
                              {TIER_LABELS[a.tier]}
                            </span>
                          </span>
                          <span className="block truncate text-xs text-blue-100/55">
                            {a.contactName} · {a.blurb}
                          </span>
                        </span>
                        <span
                          className={twMerge(
                            'relative grid h-5 w-5 place-items-center rounded-full border transition',
                            active ? 'border-accent bg-accent' : 'border-white/25'
                          )}
                        >
                          {active && <Check className="h-3 w-3" strokeWidth={3.5} />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <input type="hidden" name="account" value={selected} />

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={twMerge(portalInput, 'pl-10')}
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-blue-100/60">
                  Password
                  <span className="font-normal text-blue-100/40">Demo: any password works</span>
                </span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    defaultValue="demo-preview"
                    className={twMerge(portalInput, 'pl-10')}
                  />
                </span>
              </label>

              {state.error && (
                <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-400/30">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="btn-sheen flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-sm font-bold text-white shadow-[0_10px_26px_-10px_rgba(91,164,17,0.8)] transition-all hover:-translate-y-0.5 disabled:opacity-70"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {pending ? 'Signing in…' : `Sign in as ${account?.contactName.split(' ')[0] ?? 'partner'}`}
                {!pending && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          <div className="mt-8 space-y-2 border-t border-white/10 pt-6 text-sm text-blue-100/60">
            <p>
              Not a partner yet?{' '}
              <Link href="/professionals/" className="font-semibold text-white underline decoration-accent/50 underline-offset-4 hover:text-accent-light">
                Become a dealer
              </Link>
            </p>
            <p>
              Need orders or rebates today?{' '}
              <Link href="/pro/login/" className="font-semibold text-white underline decoration-accent/50 underline-offset-4 hover:text-accent-light">
                Open the Pro Hub
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
