'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

const FOOTER_LINKS = {
  services: [
    { href: '/services', label: 'Our Services' },
    { href: '/advantages', label: 'Advantages' },
    { href: '/warranty', label: 'Warranty' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/financing', label: 'Financing' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/techs', label: 'Technicians' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/photos', label: 'Photos' },
    { href: '/our-work', label: 'Our Work' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
    { href: '/insurance', label: 'Insurance Claims' },
    { href: '/tech-application', label: 'Tech Application' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#003365] text-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://media.rv-armor.com/site-assets/wp-media/2018/12/RVARMOR_logo_75.png"
                alt="RV Armor"
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-blue-200 leading-relaxed">
              The last roof your RV will ever need. Lifetime warranty, nationwide service.
            </p>
            <div className="mt-6 space-y-3">
              <a href="tel:8557827667" className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                (855) 782-7667
              </a>
              <a href="mailto:info@rv-armor.com" className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@rv-armor.com
              </a>
              <div className="flex items-start gap-2 text-sm text-blue-200">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Nationwide Mobile Service
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-4">Services</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-4">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
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
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-blue-400/20 flex flex-row flex-wrap justify-between items-center gap-4">
          <p className="text-xs text-blue-300">
            &copy; {new Date().getFullYear()} RV Armor. All rights reserved.
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
