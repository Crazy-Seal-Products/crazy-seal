import type { Metadata } from 'next'
import { Container, Stack, Heading, Text } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'

export const metadata: Metadata = {
  title: 'Privacy Policy - RV Armor',
  description: 'RV Armor privacy policy. How we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-12 md:p-14 lg:p-16 text-center">
          <Heading level={1}>RV Armor Privacy Policy</Heading>
        </div>

        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 prose prose-gray max-w-none space-y-8">
          <Text>
            RV Armor, Inc. (&ldquo;RV Armor&rdquo;) is committed to providing you with quality goods
            and excellent customer service. This privacy policy explains how we collect, use, share,
            store and protect information that you provide to us. You agree to the terms of our
            privacy policy by using RV Armor&rsquo;s website. You also agree that your use of
            RV Armor&rsquo;s website is subject to our Terms and Conditions.
          </Text>

          <Text>
            Sometimes, RV Armor teams up with other companies to better serve you. RV Armor&rsquo;s
            website may have a link to another company&rsquo;s website or another company&rsquo;s
            website may have a link to RV Armor&rsquo;s website. Those other companies may have
            privacy policies that are different from RV Armor&rsquo;s privacy policy. When you
            visit those websites, their privacy policies apply to any information you provide to them.
          </Text>

          <Text>
            RV Armor, Inc. (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) values your
            privacy and is committed to protecting your personal information. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you visit our
            website (https://rv-armor.com) and interact with our services, including SMS communications.
          </Text>

          <div>
            <Heading level={2}>1. Information We Collect</Heading>

            <Heading level={3}>A. Information You Provide Directly</Heading>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Personal Identifiers:</strong> Name, email address, phone number, mailing address, and billing address.</li>
              <li><strong>Payment Information:</strong> Credit/debit card details and billing information (processed securely through a third-party payment processor).</li>
              <li><strong>Communication Details:</strong> Any information you provide when contacting us, filling out forms, or subscribing to services.</li>
              <li><strong>SMS and Marketing Preferences:</strong> Your preferences for receiving communications, including SMS messages.</li>
            </ul>

            <Heading level={3} className="mt-6">B. Information Collected Automatically</Heading>
            <Text>When you visit our website, we may automatically collect:</Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and referral URLs.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and interactions with content.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, pixels, and web beacons to analyze trends, administer the website, and enhance your experience.</li>
            </ul>
          </div>

          <div>
            <Heading level={2}>2. How We Use Your Information</Heading>
            <Text>We use the personal information collected for the following purposes:</Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To provide and improve our services, including processing transactions and fulfilling orders.</li>
              <li>To send updates, promotional offers, and marketing communications (only with your consent).</li>
              <li>To send transactional and service-related SMS notifications, such as appointment reminders and order confirmations.</li>
              <li>To respond to inquiries, customer service requests, and provide technical support.</li>
              <li>To personalize your user experience and enhance website performance.</li>
              <li>To detect, prevent, and address fraud, security breaches, and other harmful activities.</li>
            </ul>
          </div>

          <div>
            <Heading level={2}>3. Who We Share Your Information With</Heading>
            <Text>We do not sell or rent your personal information. We may share your information in the following cases:</Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Service Providers &amp; Partners:</strong> With trusted third-party service providers who assist us in operating our website, conducting business, or providing services to you (e.g., payment processors, email/SMS communication providers).</li>
              <li><strong>Legal Requirements &amp; Safety:</strong> If required by law, regulation, or legal process, or to protect the rights, safety, or property of our company, customers, or others.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of our business assets, your personal information may be transferred to the acquiring entity.</li>
            </ul>
          </div>

          <div>
            <Heading level={2}>SMS Consent Protection</Heading>
            <Text>
              We do not share SMS consent with third parties for marketing purposes. Any SMS
              communications you receive from us are strictly for service-related purposes, including
              transactional updates, appointment confirmations, and other necessary notifications.
            </Text>
          </div>

          <div>
            <Heading level={2}>4. Your Privacy Choices &amp; Rights</Heading>
            <Text>You have the following choices regarding your personal information:</Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Opt-Out of Marketing Communications:</strong> You may unsubscribe from marketing emails and SMS messages at any time by clicking the unsubscribe link in the email or replying &ldquo;STOP&rdquo; to our SMS messages.</li>
              <li><strong>Manage Cookies &amp; Tracking:</strong> Most web browsers allow you to control cookies through settings. You can disable cookies, but this may affect website functionality.</li>
              <li><strong>Access, Update, or Delete Your Information:</strong> You may request access to, updates to, or deletion of your personal information by contacting us at info@rv-armor.com.</li>
            </ul>
          </div>

          <div>
            <Heading level={2}>5. Data Security &amp; Retention</Heading>
            <Text>
              We implement industry-standard security measures to protect your information from
              unauthorized access, alteration, or disclosure. We retain your information only as
              long as necessary to fulfill the purposes outlined in this policy or as required by law.
            </Text>
          </div>

          <div>
            <Heading level={2}>6. Third-Party Links</Heading>
            <Text>
              Our website may contain links to third-party websites. We are not responsible for the
              privacy practices of these external sites. We encourage you to review their privacy
              policies before providing personal information.
            </Text>
          </div>

          <div>
            <Heading level={2}>7. Changes to This Privacy Policy</Heading>
            <Text>
              We may update this Privacy Policy periodically. Any changes will be posted on this
              page with a revised effective date. Continued use of our services after any updates
              signifies your acceptance of the revised policy.
            </Text>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Text className="font-semibold">Contact Us</Text>
            <Text>
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
