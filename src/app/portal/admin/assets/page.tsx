import type { Metadata } from 'next'
import { Suspense } from 'react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { PageHeader } from '@/components/portal/admin/ui'
import { AssetManager } from '@/components/portal/admin/assets/AssetManager'

export const metadata: Metadata = { title: 'Site assets' }

export default async function AdminAssetsPage() {
  await requirePortalAdmin('assets')
  return (
    <>
      <PageHeader
        title="Site assets"
        description="Images, video, audio and documents for the website, stored in S3 (site-assets/) and served from media.crazyseal.com. Upload, organize, and copy links to paste into pages."
      />
      {/* AssetManager reads ?path= with useSearchParams. */}
      <Suspense>
        <AssetManager />
      </Suspense>
    </>
  )
}
