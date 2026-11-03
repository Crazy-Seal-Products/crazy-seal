import type { Metadata } from 'next'
import { Container, Stack, Heading, Text } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Crazy Seal Products, Inc. terms and conditions. Terms of use for our website and services.',
}

export default function TermsAndConditionsPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-0 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <h1
              className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3"
              style={{ animationDelay: '80ms' }}
            >
              Terms and Conditions
            </h1>
            <p
              className="animate-fade-up mx-auto max-w-xl text-base sm:text-lg text-white/70"
              style={{ animationDelay: '160ms' }}
            >
              Terms of use for the Crazy Seal website and services.
            </p>
          </div>
        </div>

        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-10 lg:p-14 space-y-10 [&>*]:mx-auto [&>*]:max-w-3xl [&_h2]:mb-4 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-3 [&_h2]:font-extrabold [&_h2]:before:block [&_h2]:before:h-6 [&_h2]:before:w-1.5 [&_h2]:before:flex-shrink-0 [&_h2]:before:rounded-full [&_h2]:before:bg-gradient-to-b [&_h2]:before:from-accent-light [&_h2]:before:to-accent [&_h2]:before:content-[''] [&_p]:leading-[1.75] [&_li]:leading-[1.75] [&_ul]:marker:text-accent [&_strong]:text-primary">
          <div>
            <Heading level={2}>1. Acceptance of Terms</Heading>
            <Text>
              By accessing and using the Crazy Seal website (https://crazyseal.com), you accept and
              agree to be bound by these Terms and Conditions. If you do not agree to these terms,
              please do not use our website or services.
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
              property of Crazy Seal Products, Inc. and is protected by United States and international
              copyright, trademark, and other intellectual property laws. You may not reproduce,
              distribute, modify, or create derivative works from any content without our express
              written permission.
            </Text>
          </div>

          <div>
            <Heading level={2}>4. Product and Service Terms</Heading>
            <Text>
              Crazy Seal Products, Inc. manufactures and sells the Crazy Seal Roofing System, a
              fluid-applied, seamless roofing system shipped directly to customers. Specific terms of
              sale, pricing, and warranty details are provided in writing with each individual quote
              and order.
            </Text>
          </div>

          <div>
            <Heading level={2}>5. Quotes and Pricing</Heading>
            <Text>
              Quotes provided through our website or by our specialists are estimates based on the
              information provided. Final pricing may vary based on the actual size and condition of
              your roof and the products required for your application. All quotes are valid for 30
              days unless otherwise stated.
            </Text>
          </div>

          <div>
            <Heading level={2}>6. Warranty</Heading>
            <Text>
              The Crazy Seal Roofing System is backed by our 50 year warranty. Full warranty terms are
              provided with each purchase. The warranty is subject to the conditions outlined in the
              warranty documentation provided at the time of sale.
            </Text>
          </div>

          <div>
            <Heading level={2}>7. Limitation of Liability</Heading>
            <Text>
              Crazy Seal Products, Inc. shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising out of your use of or inability to use the
              website or services. Our total liability shall not exceed the amount paid for the specific
              product or service giving rise to the claim.
            </Text>
          </div>

          <div>
            <Heading level={2}>8. Disclaimer of Warranties</Heading>
            <Text>
              The website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
              Crazy Seal makes no warranties, expressed or implied, regarding the operation of the
              website or the information, content, or materials included on the website.
            </Text>
          </div>

          <div>
            <Heading level={2}>9. Privacy</Heading>
            <Text>
              Your use of the website is also governed by our{' '}
              <a href="/privacy-policy" className="text-primary font-semibold hover:underline">
                Privacy Policy
              </a>
              , which is incorporated into these Terms and Conditions by reference.
            </Text>
          </div>

          <div>
            <Heading level={2}>10. Changes to Terms</Heading>
            <Text>
              Crazy Seal reserves the right to modify these Terms and Conditions at any time. Changes
              will be posted on this page. Your continued use of the website after any modifications
              constitutes acceptance of the updated terms.
            </Text>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Text className="font-semibold">Contact Us</Text>
            <Text>
              If you have questions about these Terms and Conditions, contact us at:<br />
              Phone: (800) 963-0131<br />
              Email: info@crazyseal.com
            </Text>
          </div>
          </div>
        </section>
      </Stack>
    </Container>
  )
}
