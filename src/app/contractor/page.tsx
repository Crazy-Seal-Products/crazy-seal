import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Container } from '@/lib/design-system'
import { ContractorFinder } from '@/components/contractor/ContractorFinder'
import { listPublicContractors } from '@/lib/contractors/data'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Find a Contractor',
  description: 'Find a certified Crazy Seal installer near you. Enter your ZIP code to see the closest contractors for RV and commercial roofs.',
}

export default async function ContractorFinderPage() {
  const contractors = await listPublicContractors()
  return (
    <Container size="xl">
      <Suspense>
        <ContractorFinder contractors={contractors} />
      </Suspense>
    </Container>
  )
}
