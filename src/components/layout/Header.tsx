'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

const RV_ARMOR_DROPDOWN = [
  { href: '/rv-armor', label: 'Our System' },
  { href: '/advantages', label: 'Advantages' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About Us' },
  { href: '/faq', label: 'FAQ' },
]

const RV_ARMOR_PATHS = RV_ARMOR_DROPDOWN.map(l => l.href)

const TOP_NAV = [
  { href: '/', label: 'Home' },
  { href: '/our-work', label: 'Our Work | Gallery' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/techs', label: 'Tech Opportunities' },
  { href: '/contact', label: 'Contact' },
]

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { openQuoteModal } = useQuoteModal()

  const isRvArmorActive = RV_ARMOR_PATHS.some(p => isActive(pathname, p))

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.rv-armor.com/site-assets/wp-media/2018/12/RVARMOR_logo_75.png"
              alt="RV Armor"
              className="h-10 w-auto"
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

            {/* RV Armor Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={clsx(
                  'relative flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer',
                  'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-[#003365] after:rounded-full after:transition-all after:duration-200',
                  isRvArmorActive || dropdownOpen
                    ? 'text-[#003365] bg-blue-50 after:w-3/4'
                    : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50 after:w-0 hover:after:w-3/4'
                )}
              >
                RV Armor
                <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', dropdownOpen && 'rotate-180')} />
              </button>

              <div
                className={clsx(
                  'absolute top-full left-0 w-48 z-50 pt-1',
                  'transition-all duration-200 ease-out',
                  dropdownOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                )}
              >
                <div className="rounded-xl bg-white border border-gray-200 shadow-lg py-2">
                  {RV_ARMOR_DROPDOWN.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDropdownOpen(false)}
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

            {TOP_NAV.filter(l => l.href !== '/').map((link) => (
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
              href="tel:8557827667"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#003365] transition-colors"
            >
              <Phone className="w-4 h-4" />
              (855) 782-7667
            </a>
            <button
              onClick={openQuoteModal}
              className="rounded-full bg-[#003365] px-5 py-2 text-sm font-semibold text-white hover:bg-[#002A54] transition-colors shadow-sm hover:shadow-md cursor-pointer"
            >
              Get a Quote
            </button>
          </div>

          {/* Mobile menu button */}
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

            {/* Mobile RV Armor Accordion */}
            <div>
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className={clsx(
                  'flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors cursor-pointer',
                  isRvArmorActive
                    ? 'text-[#003365] bg-blue-50'
                    : 'text-gray-700 hover:text-[#003365] hover:bg-gray-50'
                )}
              >
                RV Armor
                <ChevronDown className={clsx('w-4 h-4 transition-transform', mobileDropdownOpen && 'rotate-180')} />
              </button>
              {mobileDropdownOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                  {RV_ARMOR_DROPDOWN.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
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

            {TOP_NAV.filter(l => l.href !== '/').map((link) => (
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
                href="tel:8557827667"
                className="flex items-center gap-2 px-4 py-3 text-base font-medium text-gray-700"
              >
                <Phone className="w-5 h-5" />
                (855) 782-7667
              </a>
              <button
                onClick={() => { setMobileMenuOpen(false); openQuoteModal() }}
                className="block w-full text-center rounded-full bg-[#003365] px-5 py-3 text-base font-semibold text-white cursor-pointer"
              >
                Get a Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
