'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown, ShoppingCart } from 'lucide-react'
import { clsx } from 'clsx'
import { CartButton } from '@/components/store/CartButton'

const SYSTEM_DROPDOWN = [
  { href: '/crazy-seal', label: 'Our System' },
  { href: '/advantages', label: 'Advantages' },
  { href: '/products', label: 'Products' },
  { href: '/technical-data', label: 'Technical Data' },
  { href: '/about', label: 'About Us' },
  { href: '/faq', label: 'FAQ' },
]

const APPLICATIONS_DROPDOWN = [
  { href: '/rv-roofs', label: 'RV Roofs' },
  { href: '/commercial-roofing', label: 'Commercial Flat Roofs' },
  { href: '/residential', label: 'Residential Flat Roofs' },
  { href: '/transportation', label: 'Transportation' },
]

const TOP_NAV = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/installation', label: 'Installation' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/professionals', label: 'Professionals' },
  { href: '/projects', label: 'Projects' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
]

const SYSTEM_PATHS = SYSTEM_DROPDOWN.map(l => l.href)
const APPLICATION_PATHS = APPLICATIONS_DROPDOWN.map(l => l.href)

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
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
          'relative flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer',
          'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-[#003365] after:rounded-full after:transition-all after:duration-200',
          active || open
            ? 'text-[#003365] bg-blue-50 after:w-3/4'
            : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50 after:w-0 hover:after:w-3/4'
        )}
      >
        {label}
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      <div
        className={clsx(
          'absolute top-full left-0 w-56 z-50 pt-1',
          'transition-all duration-200 ease-out',
          open
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-1 pointer-events-none'
        )}
      >
        <div className="rounded-xl bg-white border border-gray-200 shadow-lg py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'block px-4 py-2.5 text-sm font-medium transition-all duration-200 border-l-2',
                isActive(pathname, link.href)
                  ? 'text-[#003365] bg-blue-50 border-[#003365]'
                  : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50 border-transparent hover:border-[#5BA411]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
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
            ? 'text-[#003365] bg-blue-50'
            : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50'
        )}
      >
        {label}
        <ChevronDown className={clsx('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={clsx(
                'block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive(pathname, link.href)
                  ? 'text-[#003365] bg-blue-50'
                  : 'text-gray-600 hover:text-[#003365] hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isSystemActive = SYSTEM_PATHS.some(p => isActive(pathname, p))
  const isApplicationsActive = APPLICATION_PATHS.some(p => isActive(pathname, p))

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png"
              alt="Crazy Seal"
              className="h-11 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={clsx(
                'relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-[#003365] after:rounded-full after:transition-all after:duration-200',
                isActive(pathname, '/')
                  ? 'text-[#003365] bg-blue-50 after:w-3/4'
                  : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50 after:w-0 hover:after:w-3/4'
              )}
            >
              Home
            </Link>

            <DesktopDropdown label="Crazy Seal" links={SYSTEM_DROPDOWN} active={isSystemActive} pathname={pathname} />
            <DesktopDropdown label="Applications" links={APPLICATIONS_DROPDOWN} active={isApplicationsActive} pathname={pathname} />

            {TOP_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-[#003365] after:rounded-full after:transition-all after:duration-200',
                  isActive(pathname, link.href)
                    ? 'text-[#003365] bg-blue-50 after:w-3/4'
                    : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50 after:w-0 hover:after:w-3/4'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Phone */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#003365] transition-colors"
            >
              <Phone className="w-4 h-4" />
              (800) 963-0131
            </a>
            <Link
              href="/store"
              className="flex items-center gap-2 rounded-full bg-[#5BA411] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4A870E] transition-colors shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop Kits
            </Link>
            <CartButton />
          </div>

          {/* Mobile cart + menu button */}
          <div className="lg:hidden flex items-center gap-1 md:hidden">
            <CartButton />
          </div>
          <button
            type="button"
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                isActive(pathname, '/')
                  ? 'text-[#003365] bg-blue-50'
                  : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50'
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

            {TOP_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                  isActive(pathname, link.href)
                    ? 'text-[#003365] bg-blue-50'
                    : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50'
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
              <Link
                href="/store"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-center rounded-full bg-[#5BA411] px-5 py-3 text-base font-semibold text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                Shop Kits
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
