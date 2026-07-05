'use client'

import { useState } from 'react'
import { Mail, Send, Loader2 } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Input, Button } from '@/lib/design-system'
import { QuoteButton } from '@/components/QuoteButton'

export default function NewsletterPage() {
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => setSubmitting(false), 1500)
  }

  return (
    <Container size="xl">
      <Stack gap="lg">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-12 md:p-14 lg:p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#003365]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#003365]" />
          </div>
          <Heading level={1}>Newsletter Signup</Heading>
          <Text className="max-w-xl mx-auto !mb-0">
            Stay updated with RV tips, installation stories, and exclusive offers from the RV Armor team.
          </Text>
        </div>

        <section>
          <Card className="!p-6 md:!p-8 max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Input
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
                <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </Stack>
            </form>
          </Card>
        </section>

        <section className="section-bleed bg-gradient-to-br from-[#003365] to-[#003365] px-5 py-8 sm:p-8 md:p-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Ready for a quote?</h2>
          <p className="text-white/80 text-sm md:text-base mb-6 max-w-xl mx-auto">
            Get a free, no-obligation quote for your RV roof.
          </p>
          <QuoteButton />
        </section>
      </Stack>
    </Container>
  )
}
