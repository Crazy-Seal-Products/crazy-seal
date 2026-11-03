import type { Metadata } from 'next'
import { PageHeader } from '@/components/portal/admin/ui'
import { SitemapManager } from '@/components/portal/admin/sitemap/SitemapManager'

export const metadata: Metadata = { title: 'Sitemap' }

export default function AdminSitemapPage() {
  return (
    <>
      <PageHeader title="Sitemap" description="Every route on the new site plus every legacy WordPress URL and where it goes." />
      <SitemapManager />
    </>
  )
}
