'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, Mail, Truck } from 'lucide-react'

const FOOTER_LINKS = {
  system: [
    { href: '/crazy-seal', label: 'Our System' },
    { href: '/advantages', label: 'Advantages' },
    { href: '/products', label: 'Products' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/installation', label: 'Installation' },
    { href: '/technical-data', label: 'Technical Data' },
  ],
  applications: [
    { href: '/rv-roofs', label: 'RV Roofs' },
    { href: '/commercial-roofing', label: 'Commercial Flat Roofs' },
    { href: '/residential', label: 'Residential Flat Roofs' },
    { href: '/transportation', label: 'Transportation' },
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
    { href: '/store/double-layer-kit', label: 'Double Layer Kits' },
    { href: '/store/direct-to-deck-kit', label: 'Direct to Deck Kits' },
    { href: '/store#products', label: 'Build Your Own Kit' },
    { href: '/store', label: 'Shop All Products' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#003365] text-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block bg-white rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png"
                alt="Crazy Seal"
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-blue-200 leading-relaxed">
              The patented, fluid-applied, seamless roofing system backed by a 50 year warranty. You can buy cheaper. You can&apos;t buy better.
            </p>
            <div className="mt-6 space-y-3">
              <a href="tel:8009630131" className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                (800) 963-0131
              </a>
              <a href="mailto:info@crazyseal.com" className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@crazyseal.com
              </a>
              <div className="flex items-start gap-2 text-sm text-blue-200">
                <Truck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Made in the USA. Free shipping on orders over $500.
              </div>
            </div>
          </div>

          {/* The System */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-4">The System</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.system.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Applications */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-4">Applications</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.applications.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-4">Support</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-4">Shop</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-blue-400/20 flex flex-row flex-wrap justify-between items-center gap-4">
          <p className="text-xs text-blue-300">
            &copy; {new Date().getFullYear()} Crazy Seal Products, Inc. All rights reserved. U.S. Patent #12,146,061.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-xs text-blue-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-xs text-blue-300 hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
