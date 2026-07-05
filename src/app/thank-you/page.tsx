import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone, ArrowRight } from 'lucide-react'
import { Container, Stack, Heading, Text, Card } from '@/lib/design-system'
import { ThankYouConversion } from './ThankYouConversion'

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Thank you for contacting Crazy Seal. We will be in touch within 24 hours.',
}

export default function ThankYouPage() {
  return (
    <Container size="md">
      <ThankYouConversion />
      <Stack gap="lg">
        <Card className="text-center !p-8 md:!p-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <Heading level={1}>Thank You!</Heading>
            <Text className="max-w-lg mx-auto !text-lg">
              We&apos;ve received your request and will be in touch within 24 hours
              to help with your project.
            </Text>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-sm mx-auto">
              <p className="text-sm text-gray-600 mb-2">Need to talk sooner?</p>
              <a
                href="tel:8009630131"
                className="flex items-center justify-center gap-2 text-[#003365] font-semibold hover:underline"
              >
                <Phone className="w-4 h-4" />
                (800) 963-0131
              </a>
            </div>

            <div className="flex justify-center pt-8">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#003365] transition-colors"
              >
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>
      </Stack>
    </Container>
  )
}
