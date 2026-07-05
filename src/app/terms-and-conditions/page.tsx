import type { Metadata } from 'next'
import { Container, Stack, Heading, Text } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'

export const metadata: Metadata = {
  title: 'Terms and Conditions - RV Armor',
  description: 'RV Armor terms and conditions. Terms of use for our website and services.',
}

export default function TermsAndConditionsPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-12 md:p-14 lg:p-16 text-center">
          <Heading level={1}>Terms and Conditions</Heading>
        </div>

        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 prose prose-gray max-w-none space-y-8">
          <div>
            <Heading level={2}>1. Acceptance of Terms</Heading>
            <Text>
              By accessing and using the RV Armor website (https://rv-armor.com), you accept and agree to
              be bound by these Terms and Conditions. If you do not agree to these terms, please do not
              use our website or services.
            </Text>
          </div>

          <div>
            <Heading level={2}>2. Use of Website</Heading>
            <Text>
              You may use our website for lawful purposes only. You agree not to use the website in any
              way that could damage, disable, overburden, or impair the website or interfere with any
              other party&rsquo;s use of the website.
            </Text>
          </div>

          <div>
            <Heading level={2}>3. Intellectual Property</Heading>
            <Text>
              All content on this website, including text, graphics, logos, images, and software, is the
              property of RV Armor, Inc. and is protected by United States and international copyright,
              trademark, and other intellectual property laws. You may not reproduce, distribute, modify,
              or create derivative works from any content without our express written permission.
            </Text>
          </div>

          <div>
            <Heading level={2}>4. Service Terms</Heading>
            <Text>
              RV Armor provides mobile RV roofing services across the continental United States. All
              installations are performed by certified technicians and are covered by our transferable
              lifetime warranty. Specific terms of service, pricing, and warranty details are provided
              in writing with each individual quote and service agreement.
            </Text>
          </div>

          <div>
            <Heading level={2}>5. Quotes and Pricing</Heading>
            <Text>
              Quotes provided through our website or by our service advisors are estimates based on the
              information provided. Final pricing may vary based on the actual condition of the RV roof
              as assessed by our certified technician. All quotes are valid for 30 days unless otherwise
              stated.
            </Text>
          </div>

          <div>
            <Heading level={2}>6. Warranty</Heading>
            <Text>
              RV Armor installations include a transferable lifetime warranty covering materials and labor.
              Full warranty terms are provided with each installation. The warranty is subject to the
              conditions outlined in the warranty documentation provided at the time of service.
            </Text>
          </div>

          <div>
            <Heading level={2}>7. Limitation of Liability</Heading>
            <Text>
              RV Armor, Inc. shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages arising out of your use of or inability to use the website or services.
              Our total liability shall not exceed the amount paid for the specific service giving rise
              to the claim.
            </Text>
          </div>

          <div>
            <Heading level={2}>8. Disclaimer of Warranties</Heading>
            <Text>
              The website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
              RV Armor makes no warranties, expressed or implied, regarding the operation of the website
              or the information, content, or materials included on the website.
            </Text>
          </div>

          <div>
            <Heading level={2}>9. Privacy</Heading>
            <Text>
              Your use of the website is also governed by our{' '}
              <a href="/privacy-policy" className="text-[#003365] font-semibold hover:underline">
                Privacy Policy
              </a>
              , which is incorporated into these Terms and Conditions by reference.
            </Text>
          </div>

          <div>
            <Heading level={2}>10. Changes to Terms</Heading>
            <Text>
              RV Armor reserves the right to modify these Terms and Conditions at any time. Changes
              will be posted on this page. Your continued use of the website after any modifications
              constitutes acceptance of the updated terms.
            </Text>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Text className="font-semibold">Contact Us</Text>
            <Text>
              If you have questions about these Terms and Conditions, contact us at:<br />
              Phone: (855) 782-7667<br />
              Email: info@rv-armor.com
            </Text>
          </div>
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
