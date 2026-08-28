'use client'

import { useEffect, useState } from 'react'
import { ProWarrantyForm } from '@/components/pro-hub/ProWarrantyForm'
import type { ProMe } from '@/components/pro-hub/ProHubShell'

export default function ProWarrantyPage() {
  const [me, setMe] = useState<ProMe | null>(null)

  useEffect(() => {
    fetch('/api/pro/me/')
      .then((r) => r.json())
      .then((json) => setMe(json.user || null))
      .catch(() => {})
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#003365]">File a warranty</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Pick an order, add the owner&apos;s details and photos, done. Public /warranty stays for DIY.
      </p>
      <ProWarrantyForm
        key={me?.email || 'loading'}
        installerName={me?.displayName || me?.businessName || ''}
        installerPhone={me?.phone || ''}
        installerEmail={me?.email || ''}
      />
    </div>
  )
}
