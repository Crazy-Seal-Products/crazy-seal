import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { BrandEditor } from '@/components/contractor/brand/BrandEditor'

export const metadata: Metadata = { title: 'Your page' }

/** Your page: the contractor's public Crazy Seal page, in their brand. */
export default async function BrandPage() {
  const viewer = await requirePortal('brand.manage')
  const c = viewer.contractor
  const initial = {
    theme: c.theme || 'seal',
    primary: c.color_primary ?? '',
    accent: c.color_accent ?? '',
    logoUrl: c.logo_url ?? '',
    tagline: c.tagline ?? '',
    phone: c.phone ?? '',
  }
  return (
    <BrandEditor
      initial={initial}
      name={viewer.contractorName}
      slug={c.slug}
      listed={c.is_listed}
      segment={c.segment}
      canEdit={!viewer.readOnly}
    />
  )
}
