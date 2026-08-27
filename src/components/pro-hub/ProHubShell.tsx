'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid,
  Package,
  ShieldCheck,
  FileCheck,
  Wrench,
  BadgeDollarSign,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Phone,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRO_HUB_NAME, SUPPORT_PHONE, SUPPORT_PHONE_TEL, type ProStatus } from '@/lib/pro/config'
import { StatusPills } from './StatusPills'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { name: 'Home', href: '/pro', icon: LayoutGrid },
  { name: 'Orders', href: '/pro/orders', icon: Package },
  { name: 'Jobs', href: '/pro/jobs', icon: ShieldCheck },
  { name: 'File warranty', href: '/pro/warranty', icon: FileCheck },
  { name: 'Tools', href: '/pro/tools', icon: Wrench },
  { name: 'Perks', href: '/pro/perks', icon: BadgeDollarSign },
]

export interface ProMe {
  id: string
  email: string
  displayName: string | null
  businessName: string | null
  phone: string | null
  statuses: ProStatus[]
  hasPassword?: boolean
}

function isActive(href: string, pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const target = href.replace(/\/+$/, '') || '/'
  if (target === '/pro') return normalized === '/pro'
  return normalized.startsWith(target)
}

export function ProHubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [me, setMe] = useState<ProMe | null>(null)

  const normalized = pathname.replace(/\/+$/, '') || '/'
  const isPublicAuth = ['/pro/login', '/pro/signup', '/pro/forgot', '/pro/reset'].includes(normalized)

  useEffect(() => {
    if (isPublicAuth) {
      setAuthChecked(true)
      return
    }

    fetch('/api/pro/me/')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/pro/login/')
          return
        }
        const data = await res.json()
        if (!data.user) {
          router.replace('/pro/login/')
          return
        }
        setMe(data.user)
        setAuthChecked(true)
      })
      .catch(() => router.replace('/pro/login/'))
  }, [isPublicAuth, router])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  if (isPublicAuth) return <>{children}</>

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#003365] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F9EA1C] flex items-center justify-center animate-pulse">
            <span className="text-[#003365] text-sm font-bold">CS</span>
          </div>
          <p className="text-sm text-white/60">Loading Pro Hub…</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await fetch('/api/pro/auth/logout/', { method: 'POST' })
    router.replace('/pro/login/')
  }

  const label = me?.businessName || me?.displayName || me?.email || 'Pro Hub'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 w-56 bg-[#003365] text-white">
        <div className="flex items-center h-14 px-4 border-b border-white/10 shrink-0">
          <Link href="/pro" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#F9EA1C] flex items-center justify-center shrink-0">
              <span className="text-[#003365] text-[11px] font-bold">CS</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#F9EA1C] font-bold leading-none">Crazy Seal</p>
              <p className="text-sm font-bold leading-tight mt-0.5">Pro Hub</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-white/10 shrink-0 space-y-2">
          {me && (
            <div>
              <p className="text-xs font-semibold truncate" title={label}>{label}</p>
              <p className="text-[10px] text-white/50 truncate mb-1.5">{me.email}</p>
              <StatusPills statuses={me.statuses} variant="dark" />
            </div>
          )}
          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white"
          >
            <Phone className="w-3 h-3" />
            {SUPPORT_PHONE}
          </a>
          <Link href="/" className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white">
            <ExternalLink className="w-3 h-3" />
            crazyseal.com
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-red-300 w-full"
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[#003365] text-white flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-white/10">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/pro" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#F9EA1C] flex items-center justify-center">
            <span className="text-[#003365] text-[10px] font-bold">CS</span>
          </div>
          <span className="text-sm font-bold">Pro Hub</span>
        </Link>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#003365] text-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
              <span className="text-sm font-bold">{PRO_HUB_NAME}</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
              {NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-white/10 space-y-2">
              {me && <StatusPills statuses={me.statuses} variant="dark" />}
              <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white/60">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 min-h-screen md:ml-56 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon
  const active = isActive(item.href, pathname)
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-white/15 text-[#F9EA1C]' : 'text-white/75 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {item.name}
    </Link>
  )
}
