'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid,
  ChevronLeft,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Users,
  ShieldCheck,
  HelpCircle,
  ImageIcon,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavSection {
  label: string
  items: NavItem[]
}

const adminNavSections: NavSection[] = [
  {
    label: 'Content',
    items: [
      { name: 'Leads', href: '/admin/leads', icon: Users },
      { name: 'Warranty', href: '/admin/warranty', icon: ShieldCheck },
      { name: 'FAQ Manager', href: '/admin/faq', icon: HelpCircle },
      { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    ],
  },
  {
    label: 'Media',
    items: [
      { name: 'Site Assets', href: '/admin/assets', icon: FolderOpen },
    ],
  },
]

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.href === '/admin') return pathname === '/admin'
  return pathname.startsWith(item.href)
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [staffName, setStaffName] = useState<string | null>(null)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true)
      return
    }

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/admin/login')
        return
      }

      const verifyRes = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_user_id: user.id }),
      })
      const { staff: staffRecord } = await verifyRes.json()

      if (!staffRecord) {
        await supabase.auth.signOut()
        router.replace('/admin/login')
        return
      }

      setStaffName(staffRecord.full_name)
      setAuthChecked(true)
    })
  }, [isLoginPage, router])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  if (isLoginPage) return <>{children}</>

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#003365] flex items-center justify-center animate-pulse">
            <span className="text-white text-sm font-bold">CS</span>
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed inset-y-0 left-0 z-30',
          'bg-white border-r border-gray-200',
          'transition-[width] duration-300 ease-in-out',
          collapsed ? 'w-[52px]' : 'w-48',
        )}
      >
        <div className="flex items-center justify-between h-12 px-2.5 border-b border-gray-100 shrink-0">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-md bg-[#003365] flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-bold">CS</span>
              </div>
              <span className="text-xs font-bold text-gray-900 group-hover:text-[#003365] transition-colors">Admin</span>
            </Link>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="mx-auto p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Expand sidebar">
              <div className="w-7 h-7 rounded-md bg-[#003365] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">CS</span>
              </div>
            </button>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Collapse sidebar">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="px-2 pt-2 pb-0.5 shrink-0">
          <NavLink item={{ name: 'Dashboard', href: '/admin', icon: LayoutGrid }} pathname={pathname} collapsed={collapsed} />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-1.5 space-y-3">
          {adminNavSections.map((section) => (
            <div key={section.label}>
              {!collapsed && <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-widest text-gray-400">{section.label}</p>}
              {collapsed && <div className="mx-auto w-5 border-t border-gray-200 mb-1.5" />}
              <div className="space-y-px">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-2 py-2 border-t border-gray-100 shrink-0 space-y-0.5">
          {!collapsed && staffName && (
            <div className="px-2 py-1 text-[10px] text-gray-400 truncate" title={staffName}>{staffName}</div>
          )}
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-3 h-3" />View site
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors w-full">
                <LogOut className="w-3 h-3" />Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="flex items-center justify-center py-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors" title="View live site">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button onClick={handleLogout} className="flex items-center justify-center py-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors w-full" title="Logout">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#003365] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">CS</span>
          </div>
          <span className="text-sm font-bold text-gray-900">Admin</span>
        </Link>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 shrink-0">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#003365] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CS</span>
                </div>
                <span className="text-sm font-bold text-gray-900">Admin</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-3 pt-3 pb-1 shrink-0">
              <NavLink item={{ name: 'Dashboard', href: '/admin', icon: LayoutGrid }} pathname={pathname} collapsed={false} />
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
              {adminNavSections.map((section) => (
                <div key={section.label}>
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{section.label}</p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink key={item.href} item={item} pathname={pathname} collapsed={false} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="px-3 py-3 border-t border-gray-100 shrink-0 space-y-0.5">
              {staffName && <div className="px-3 py-1 text-[10px] text-gray-400 truncate">{staffName}</div>}
              <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />View live site
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full">
                <LogOut className="w-3.5 h-3.5" />Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 min-h-screen transition-[margin] duration-300 ease-in-out',
          collapsed ? 'md:ml-[52px]' : 'md:ml-48',
          'pt-14 md:pt-0',
        )}
      >
        {children}
      </main>
    </div>
  )
}

function NavLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const Icon = item.icon
  const isActive = isNavItemActive(item, pathname)

  return (
    <Link
      href={item.href}
      title={collapsed ? item.name : undefined}
      className={cn(
        'flex items-center gap-2 rounded-md text-xs font-medium transition-all duration-150',
        collapsed ? 'justify-center px-1.5 py-2' : 'px-2 py-1.5',
        isActive
          ? 'bg-[#003365]/10 text-[#003365]'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <Icon className={cn('shrink-0 w-4 h-4', isActive ? 'text-[#003365]' : 'text-gray-400')} />
      {!collapsed && <span className="truncate">{item.name}</span>}
    </Link>
  )
}
