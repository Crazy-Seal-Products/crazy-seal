'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown, ShoppingCart, MessageSquare, ArrowUpRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import { CartButton } from '@/components/store/CartButton'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

const SYSTEM_DROPDOWN = [
  { href: '/crazy-seal', label: 'Our System' },
  { href: '/advantages', label: 'Advantages' },
  { href: '/products', label: 'Products' },
  { href: '/installation', label: 'Installation' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/technical-data', label: 'Technical Data' },
  { href: '/about', label: 'About Us' },
  { href: '/faq', label: 'FAQ' },
]

const APPLICATIONS_DROPDOWN = [
  { href: '/rv-roofs', label: 'RV Roofs' },
  { href: '/commercial-roofing', label: 'Commercial Flat Roofs' },
  { href: '/residential', label: 'Residential Flat Roofs' },
  { href: '/transportation', label: 'Transportation' },
  { href: '/applications', label: 'All Applications' },
  { href: '/projects', label: 'Customer Projects' },
]

const PROFESSIONALS_DROPDOWN = [
  { href: '/professionals', label: 'Become a Dealer' },
  { href: '/portal/login', label: 'Pro Portal' },
  { href: '/pro', label: 'Pro Hub' },
  { href: '/ways-to-earn', label: 'Ways to Earn' },
  { href: '/business-accelerator-program', label: 'Business Accelerator' },
  { href: '/professional-tools', label: 'Pro Tools' },
  { href: '/affiliates', label: 'Affiliates' },
]

// Keep top-level links to the highest-intent pages only; everything else
// lives in the dropdowns (Contact is covered by the Talk to a Specialist CTA).
// Kit Builder + Pricing share the main shop; Shop CTA also lands there.
const TOP_NAV = [
  { href: '/kit-builder', label: 'Kit Builder' },
  { href: '/kit-builder#pricing', label: 'Pricing' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/reviews', label: 'Reviews' },
]

const SYSTEM_PATHS = SYSTEM_DROPDOWN.map(l => l.href)
const APPLICATION_PATHS = APPLICATIONS_DROPDOWN.map(l => l.href)
const PROFESSIONAL_PATHS = PROFESSIONALS_DROPDOWN.map(l => l.href)

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  // Hash deep-links (e.g. Pricing → /kit-builder#pricing) are not path-active
  if (href.includes('#')) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

interface DropdownProps {
  label: string
  links: { href: string; label: string }[]
  active: boolean
  pathname: string | null
}

function DesktopDropdown({ label, links, active, pathname }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'relative flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer',
          active || open
            ? 'text-primary bg-primary/[0.06]'
            : 'text-gray-700 hover:text-primary hover:bg-primary/[0.04]'
        )}
      >
        {label}
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-300', open && 'rotate-180')} />
        {active && (
          <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-64 z-50 pt-2 origin-top-left"
          >
            <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-primary/[0.08] shadow-xl p-2">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * i, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive(pathname, link.href)
                        ? 'text-primary bg-primary/[0.06]'
                        : 'text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent'
                    )}
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 text-accent" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MobileAccordionProps {
  label: string
  links: { href: string; label: string }[]
  active: boolean
  pathname: string | null
  onNavigate: () => void
}

function MobileAccordion({ label, links, active, pathname, onNavigate }: MobileAccordionProps) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors cursor-pointer',
          active
            ? 'text-primary bg-primary/[0.06]'
            : 'text-gray-700 hover:text-primary hover:bg-gray-50'
        )}
      >
        {label}
        <ChevronDown className={clsx('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-accent/30 pl-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={clsx(
                    'block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive(pathname, link.href)
                      ? 'text-primary bg-primary/[0.06]'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openQuoteModal } = useQuoteModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isSystemActive = SYSTEM_PATHS.some(p => isActive(pathname, p))
  const isApplicationsActive = APPLICATION_PATHS.some(p => isActive(pathname, p))
  const isProfessionalsActive = PROFESSIONAL_PATHS.some(p => isActive(pathname, p))

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled || mobileMenuOpen
          ? 'bg-white/85 backdrop-blur-xl border-primary/[0.08] shadow-[0_10px_30px_-18px_rgba(0,32,67,0.35)]'
          : 'bg-white border-transparent'
      )}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png"
              alt="Crazy Seal"
              className={clsx('w-auto transition-all duration-300', scrolled ? 'h-10' : 'h-11')}
            />
          </Link>

          {/* Desktop Nav — the logo covers Home */}
          <nav className="hidden lg:flex items-center gap-1">
            <DesktopDropdown label="Crazy Seal" links={SYSTEM_DROPDOWN} active={isSystemActive} pathname={pathname} />
            <DesktopDropdown label="Applications" links={APPLICATIONS_DROPDOWN} active={isApplicationsActive} pathname={pathname} />
            <DesktopDropdown label="Professionals" links={PROFESSIONALS_DROPDOWN} active={isProfessionalsActive} pathname={pathname} />

            {TOP_NAV.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={clsx(
                  'relative px-3 py-2 text-sm font-semibold rounded-full transition-all duration-200',
                  isActive(pathname, link.href)
                    ? 'text-primary bg-primary/[0.06]'
                    : 'text-gray-700 hover:text-primary hover:bg-primary/[0.04]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Phone */}
          <div className="hidden md:flex items-center gap-3">
            {/* Full number only on wide screens; icon still tappable below xl */}
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#003365] transition-colors"
              aria-label="Call (800) 963-0131"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">(800) 963-0131</span>
            </a>
            <Link
              href="/kit-builder"
              className="flex items-center gap-2 rounded-full border border-accent/60 bg-white px-4 py-2 text-sm font-semibold text-accent-dark hover:bg-accent/10 hover:border-accent transition-all hover:-translate-y-0.5"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop
            </Link>
            <button
              type="button"
              onClick={() => openQuoteModal({ sourcePage: 'header' })}
              className="btn-sheen flex items-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-2 text-sm font-semibold text-white transition-all shadow-[0_6px_16px_-6px_rgba(91,164,17,0.7)] hover:shadow-[0_12px_24px_-10px_rgba(91,164,17,0.75)] hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Talk to a Specialist
            </button>
            <CartButton />
          </div>

          {/* Mobile cart + menu button */}
          <div className="lg:hidden flex items-center gap-1 md:hidden">
            <CartButton />
          </div>
          <button
            type="button"
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full text-gray-700 hover:bg-primary/[0.05] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileMenuOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="lg:hidden overflow-hidden border-t border-primary/[0.08] bg-white"
        >
          <div className="px-4 py-4 space-y-1 max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                isActive(pathname, '/')
                  ? 'text-primary bg-primary/[0.06]'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              )}
            >
              Home
            </Link>

            <MobileAccordion
              label="Crazy Seal"
              links={SYSTEM_DROPDOWN}
              active={isSystemActive}
              pathname={pathname}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <MobileAccordion
              label="Applications"
              links={APPLICATIONS_DROPDOWN}
              active={isApplicationsActive}
              pathname={pathname}
              onNavigate={() => setMobileMenuOpen(false)}
            />
            <MobileAccordion
              label="Professionals"
              links={PROFESSIONALS_DROPDOWN}
              active={isProfessionalsActive}
              pathname={pathname}
              onNavigate={() => setMobileMenuOpen(false)}
            />

            {TOP_NAV.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                  isActive(pathname, link.href)
                    ? 'text-primary bg-primary/[0.06]'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 px-4 py-3 text-base font-medium text-gray-700"
              >
                <Phone className="w-5 h-5" />
                (800) 963-0131
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  openQuoteModal({ sourcePage: 'header-mobile' })
                }}
                className="btn-sheen flex items-center justify-center gap-2 w-full text-center rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-base font-semibold text-white shadow-[0_8px_20px_-8px_rgba(91,164,17,0.7)] cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                Talk to a Specialist
              </button>
              <Link
                href="/kit-builder"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-center rounded-full border border-[#5BA411] px-5 py-3 text-base font-semibold text-[#5BA411]"
              >
                <ShoppingCart className="w-5 h-5" />
                Shop Kits
              </Link>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  )
}
