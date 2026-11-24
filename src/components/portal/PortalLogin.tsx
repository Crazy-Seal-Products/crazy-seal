'use client'

import React, { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  FolderKanban,
  GraduationCap,
  HardHat,
  Loader2,
  Lock,
  Mail,
  Palette,
  ShieldCheck,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { portalSignIn, type SignInState } from '@/lib/portal/actions'
import { CONTRACTOR_SIGN_IN } from '@/lib/contractor/next-path'
import { EASE_OUT_EXPO, GlowOrb } from '@/components/motion'
import { portalInput } from './ui'

const BIG_LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'

const FEATURES = [
  { icon: FolderKanban, title: 'Projects, quotes & orders', desc: 'Every roof from the first request to the finished job.' },
  { icon: GraduationCap, title: 'Training', desc: 'Videos, checklists and quick checks, with progress saved.' },
  { icon: Palette, title: 'Your page', desc: 'Your colors and logo on your Crazy Seal contractor page.' },
  { icon: ShieldCheck, title: 'Warranty registration', desc: 'File the 50 year warranty for every job you finish.' },
]

const INVALID = 'border-red-400/60 ring-4 ring-red-500/15 focus:border-red-400/70 focus:ring-red-500/20'

function FieldError({ message }: { message?: string }) {
  return (
    <span id="signin-error" role="alert" className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-red-200">
      <AlertCircle className="mt-px h-4 w-4 shrink-0 text-red-400" />
      {message}
    </span>
  )
}

/**
 * /portal/login: Crazy Seal staff sign in to the admin here. Contractors sign
 * in to their contractor portal with their Pro Hub account instead
 * (CONTRACTOR_SIGN_IN), linked at the top.
 */
export function PortalLogin() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(portalSignIn, {})
  const [email, setEmail] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)

  // After a wrong password, put the cursor back in the (now empty) password box
  useEffect(() => {
    if (state.field === 'password') passwordRef.current?.focus()
  }, [state])

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
          { }
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
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">Crazy Seal Admin</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Staff sign-in</h2>
          <p className="mt-2 text-sm text-blue-100/60">For the Crazy Seal team. Contractors and dealers sign in to the Pro Portal below.</p>


          <form action={formAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
                {/* Controlled so it survives the form reset after a failed sign-in */}
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={state.field === 'email' || undefined}
                  aria-describedby={state.field === 'email' ? 'signin-error' : undefined}
                  className={twMerge(portalInput, 'pl-10', state.field === 'email' && INVALID)}
                />
              </span>
              {state.field === 'email' && <FieldError message={state.error} />}
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-baseline justify-between text-xs font-semibold text-blue-100/60">
                Password
                <Link href="/portal/reset-password/" className="font-semibold text-blue-100/60 hover:text-white">
                  Forgot your password?
                </Link>
              </span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
                <input
                  ref={passwordRef}
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  aria-invalid={state.field === 'password' || undefined}
                  aria-describedby={state.field === 'password' ? 'signin-error' : undefined}
                  className={twMerge(portalInput, 'pl-10', state.field === 'password' && INVALID)}
                />
              </span>
              {state.field === 'password' && <FieldError message={state.error} />}
            </label>

            {state.error && !state.field && <FieldError message={state.error} />}

            <button
              type="submit"
              disabled={pending}
              className="btn-sheen flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-sm font-bold text-white shadow-[0_10px_26px_-10px_rgba(91,164,17,0.8)] transition-all hover:-translate-y-0.5 disabled:opacity-70"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {pending ? 'Signing in…' : 'Sign in'}
              {!pending && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <Link
            href={CONTRACTOR_SIGN_IN}
            className="group mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-highlight/50"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-highlight/90 text-primary">
              <HardHat className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Contractor or dealer? Sign in to the Pro Portal</span>
              <span className="block text-xs text-blue-100/60">A different login from staff: the email you order with (your old Pro Hub login). New here? Use Forgot password.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-blue-100/60 transition group-hover:translate-x-0.5 group-hover:text-highlight" />
          </Link>

          <div className="mt-6 border-t border-white/10 pt-5 text-sm text-blue-100/60">
            <p>
              Not a partner yet?{' '}
              <Link href="/professionals/" className="font-semibold text-white underline decoration-accent/50 underline-offset-4 hover:text-accent-light">
                Become a dealer
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
