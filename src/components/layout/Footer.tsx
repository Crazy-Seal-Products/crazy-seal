'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, Mail, Truck, Handshake, ShieldCheck, Flag, Award } from 'lucide-react'
import { QuoteButton } from '@/components/QuoteButton'

const FOOTER_LINKS = {
  system: [
    { href: '/crazy-seal', label: 'Our System' },
    { href: '/advantages', label: 'Advantages' },
    { href: '/products', label: 'Products' },
    { href: '/kit-builder', label: 'Kit Builder' },
    { href: '/installation', label: 'Installation' },
    { href: '/technical-data', label: 'Technical Data' },
  ],
  applications: [
    { href: '/rv-roofs', label: 'RV Roofs' },
    { href: '/commercial-roofing', label: 'Commercial Flat Roofs' },
    { href: '/residential', label: 'Residential Flat Roofs' },
    { href: '/transportation', label: 'Transportation' },
    { href: '/applications', label: 'All Applications' },
    { href: '/projects', label: 'Customer Projects' },
    { href: '/professionals', label: 'Professionals' },
  ],
  support: [
    { href: '/warranty', label: 'Warranty' },
    { href: '/warranty-transfer', label: 'Warranty Transfer' },
    { href: '/faq', label: 'FAQ' },
    { href: '/ordering', label: 'How to Order' },
    { href: '/return-policy', label: 'Return Policy' },
    { href: '/contact', label: 'Contact' },
  ],
  shop: [
    { href: '/store/rv-roofing-kit', label: 'RV Roofing Kit' },
    { href: '/kit-builder#build', label: 'Build Your Own Kit' },
    { href: '/kit-builder#products', label: 'Individual Products' },
    { href: '/kit-builder', label: 'Shop All' },
  ],
  partners: [
    { href: '/professionals', label: 'Become a Dealer' },
    { href: '/portal/login', label: 'Pro Portal' },
    { href: '/pro', label: 'Pro Hub' },
    { href: '/ways-to-earn', label: 'Ways to Earn' },
    { href: '/business-accelerator-program', label: 'Business Accelerator' },
    { href: '/professional-tools', label: 'Pro Tools' },
    { href: '/affiliates', label: 'Affiliates' },
  ],
}

const TRUST = [
  { icon: ShieldCheck, label: '50 Year Warranty' },
  { icon: Award, label: 'U.S. Patent #12,146,061' },
  { icon: Flag, label: 'Made in the USA' },
  { icon: Truck, label: 'Free shipping over $500' },
]

function FooterColumn({
  title,
  links,
  native = false,
}: {
  title: string
  links: { href: string; label: string }[]
  native?: boolean
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-highlight/90">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => {
          const cls =
            'group inline-flex items-center gap-1.5 text-sm text-blue-100/75 transition-colors hover:text-white'
          const inner = (
            <>
              <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-3" />
              {link.label}
            </>
          )
          return (
            <li key={link.href}>
              {native ? (
                <a href={link.href} className={cls}>
                  {inner}
                </a>
              ) : (
                <Link href={link.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary-dark text-white">
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-secondary/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-0 h-[26rem] w-[26rem] rounded-full bg-accent/15 blur-3xl"
      />
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

      {/* Lead CTA band */}
      <div className="relative mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 md:pt-14 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-primary to-primary-dark p-6 ring-1 ring-white/10 shadow-2xl sm:p-8 md:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-highlight/20 blur-3xl animate-float-slow"
          />
          <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Got a roof to fix <span className="text-highlight">— or one to sell?</span>
              </h2>
              <p className="mt-2 text-sm text-blue-100/80 sm:text-base">
                A specialist builds your kit with you, or walks you through the dealer program.
              </p>
            </div>
            <div className="flex flex-row flex-wrap items-center justify-center gap-3">
              <QuoteButton sourcePage="footer" />
              <Link
                href="/professionals"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/15 sm:text-base"
              >
                <Handshake className="h-4 w-4 sm:h-5 sm:w-5" />
                Become a Dealer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-3 py-8 md:grid-cols-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-light">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-semibold text-blue-50 sm:text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block rounded-2xl bg-white p-2.5 shadow-lg transition-transform hover:-rotate-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png"
                alt="Crazy Seal"
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-blue-100/75">
              You can buy cheaper. You can&apos;t buy better.
            </p>
            <div className="mt-5 space-y-2.5">
              <a href="tel:8009630131" className="flex items-center gap-2 text-sm text-blue-100/80 transition-colors hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-accent-light" />
                (800) 963-0131
              </a>
              <a href="mailto:info@crazyseal.com" className="flex items-center gap-2 text-sm text-blue-100/80 transition-colors hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-accent-light" />
                info@crazyseal.com
              </a>
            </div>
          </div>

          <FooterColumn title="The System" links={FOOTER_LINKS.system} />
          <FooterColumn title="Applications" links={FOOTER_LINKS.applications} />
          <FooterColumn title="Support" links={FOOTER_LINKS.support} />
          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} native />
          <FooterColumn title="Partners" links={FOOTER_LINKS.partners} />
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-row flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-blue-200/70">
            &copy; {new Date().getFullYear()} Crazy Seal Products, Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-xs text-blue-200/70 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-xs text-blue-200/70 transition-colors hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
