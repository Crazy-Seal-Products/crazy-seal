import { cache } from 'react'
import type { Metadata, Viewport } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ContractorLanding } from '@/components/contractor/ContractorLanding'
import { SEGMENT_COPY } from '@/lib/contractors/content'
import { currentAddressFor, getPublicContractor } from '@/lib/contractors/data'
import { brandColors } from '@/lib/contractors/theme'

// Built on first visit, then cached; the admin refreshes a page when it saves.
export const revalidate = 300
export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

const load = cache(getPublicContractor)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await load((await params).slug)
  if (!c) return { title: 'Contractor not found', robots: { index: false } }
  return {
    title: { absolute: `${c.name} | Certified Crazy Seal installer` },
    description: SEGMENT_COPY[c.segment].lead(c.name),
    // Every contractor page shares the same copy, so they stay out of search
    // results; visitors reach them from the finder at /contractor.
    robots: { index: false, follow: true },
  }
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const c = await load((await params).slug)
  return c ? { themeColor: brandColors(c.brand).primary } : {}
}

export default async function ContractorPage({ params }: Props) {
  const { slug } = await params
  const c = await load(slug)
  if (!c) {
    // An address the contractor used to have (an admin renamed their page) still leads to them.
    const current = await currentAddressFor(slug)
    if (current) permanentRedirect(`/contractor/${current}/`)
    notFound()
  }
  return <ContractorLanding contractor={c} />
}
