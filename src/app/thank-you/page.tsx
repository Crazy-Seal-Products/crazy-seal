import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone, ArrowRight, Calculator, PlayCircle, BadgeDollarSign, Wrench } from 'lucide-react'
import { Container, Stack, Heading, Text, Card } from '@/lib/design-system'
import { ThankYouConversion } from './ThankYouConversion'

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Thank you for contacting Crazy Seal. We will be in touch within 24 hours.',
}

const NEXT_STEPS = {
  quote: [
    {
      href: '/pricing',
      icon: Calculator,
      title: 'See Kit Pricing',
      desc: 'Get a feel for kit sizes and cost while you wait.',
    },
    {
      href: '/installation',
      icon: PlayCircle,
      title: 'Preview the Install',
      desc: 'Watch how easy it is to put down a seamless roof.',
    },
  ],
  business: [
    {
      href: '/ways-to-earn',
      icon: BadgeDollarSign,
      title: 'Ways to Earn',
      desc: 'See how dealers make money installing Crazy Seal.',
    },
    {
      href: '/business-accelerator-program',
      icon: Wrench,
      title: 'Business Accelerator',
      desc: 'Browse the resources we give our partners.',
    },
  ],
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const isBusiness = type === 'business'
  const steps = isBusiness ? NEXT_STEPS.business : NEXT_STEPS.quote

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
              {isBusiness
                ? "We've received your inquiry! A member of our team will reach out within 24 hours to talk about the dealer program and how we can grow your business together."
                : "We've received your request! A Crazy Seal specialist will reach out within 24 hours to help build the perfect kit for your roof."}
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

            {/* Next steps while you wait */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-lg">
              {steps.map((step) => (
                <Link
                  key={step.href}
                  href={step.href}
                  className="group rounded-xl border border-gray-200 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[#003365]/30"
                >
                  <step.icon className="w-6 h-6 text-[#5BA411] mb-2" />
                  <p className="font-semibold text-[#003365] mb-1">{step.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </Link>
              ))}
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
