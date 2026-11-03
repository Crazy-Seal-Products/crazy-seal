'use client'

import { useEffect, useState } from 'react'
import { ProWarrantyForm } from '@/components/pro-hub/ProWarrantyForm'
import type { ProMe, ViewAsInfo } from '@/components/pro-hub/ProHubShell'

export default function ProWarrantyPage() {
  const [me, setMe] = useState<ProMe | null>(null)
  const [viewAs, setViewAs] = useState<ViewAsInfo | null>(null)

  useEffect(() => {
    fetch('/api/pro/me/')
      .then((r) => r.json())
      .then((json) => {
        setMe(json.user || null)
        setViewAs(json.viewAs || null)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#003365]">File a warranty</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Pick an order, add the owner&apos;s details and photos, done. Public /warranty stays for DIY.
      </p>
      {viewAs ? (
        // Admin view is read-only; the form would upload photos before the server refuses
        <div className="rounded-xl border border-[#e3b42a] bg-[#fff8dc] p-4 text-sm text-[#003365]">
          <p className="font-semibold">Filing a warranty is turned off in admin view.</p>
          <p className="mt-1 text-[#003365]/80">
            This is the page the dealer uses to file one. Their filed warranties are listed under Jobs.
          </p>
        </div>
      ) : (
        <ProWarrantyForm
          key={me?.email || 'loading'}
          installerName={me?.displayName || me?.businessName || ''}
          installerPhone={me?.phone || ''}
          installerEmail={me?.email || ''}
        />
      )}
    </div>
  )
}
