import type { Metadata } from 'next'
import { Phone } from 'lucide-react'
import { Container, Stack, Heading, Text, LinkButton } from '@/lib/design-system'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Crazy Seal Products, Inc. privacy policy. How we collect, use, share, store and protect information that you provide to us.',
}

export default function PrivacyPolicyPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-12 md:p-14 lg:p-16 text-center">
          <Heading level={1}>Privacy Policy</Heading>
        </div>

        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 prose prose-gray max-w-none space-y-8">
          <Text>
            Crazy Seal Products, Inc. (&ldquo;Crazy Seal&rdquo;) is committed to providing you with
            quality goods and excellent customer service. This privacy policy explains how we collect,
            use, share, store and protect information that you provide to us. You agree to the terms
            of our privacy policy by using Crazy Seal&rsquo;s website. You also agree to the terms of
            our privacy policy by using any page or feature in any other website that Crazy Seal has
            linked to this privacy policy.
          </Text>

          <Text>
            Sometimes, Crazy Seal teams up with other companies to better serve you. Crazy Seal&rsquo;s
            website may have a link to another company&rsquo;s website or another company&rsquo;s
            website may have a link to Crazy Seal&rsquo;s website. Those other companies may have
            privacy policies that are different from Crazy Seal&rsquo;s privacy policy. You should read
            those other companies&rsquo; privacy policies to understand their terms. To the extent any
            linked websites you visit are not a website owned by Crazy Seal, we are not responsible for
            their content, any use of the sites, or the privacy practices of those sites.
          </Text>

          <div>
            <Heading level={2}>Information We Collect</Heading>
            <Text>
              We collect information from you that you voluntarily provide to us and by automated means
              when you register on our site, place an order, subscribe to our newsletter, respond to a
              survey, participate in our forums, fill out a form, or otherwise interact with a page on
              our website or a page on another website that is expressly linked to our website.
            </Text>
            <Text>
              Personal identifiable information we collect and save that you provide voluntarily to us
              may include, but is not limited to, your: name, e-mail address, mailing address, billing
              address, phone number and/or credit card information.
            </Text>
            <Text>
              Additionally, we, and our third-party service providers, automatically collect information
              about your use of our Website through cookies, web beacons, and other tracking
              technologies, including, but not limited to: your IP address, browser type, domain names,
              access times, purchase history, referring website addresses, and similar information. We
              use this information primarily to maintain quality of the service, and to understand how
              you and other visitors use our Website. We also may use this information to provide
              general statistics regarding use of this Website. We may combine this information with
              other information that we collect about you.
            </Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Cookies</strong> &mdash; Like many companies, we use cookies on our website.
                Cookies are bits of text that are placed on your computer&rsquo;s hard drive when you
                visit certain websites. We use cookies to tell us, for example, whether you have visited
                us before or if you are a new visitor and to help us identify site features in which you
                may have the greatest interest. Cookies may enhance your online experience by saving
                your preferences while you are visiting a particular site. Most browsers will tell you
                how to stop accepting new cookies, how to be notified when you receive a new cookie, and
                how to disable existing cookies. Please note, however, that without cookies you may not
                be able to take full advantage of all our website features.
              </li>
              <li>
                <strong>Web Beacons</strong> &mdash; Certain pages on our website contain web beacons
                (also known as Internet tags, pixel tags and clear GIFs). These web beacons allow third
                parties to obtain information such as the IP address of the computer that downloaded the
                page on which the beacon appears, the URL of the page on which the beacon appears, the
                time the page containing the beacon was viewed, the type of browser used to view the
                page, and the information in cookies set by the third party. We use this information to
                analyze trends, to track users&rsquo; movements around the sites and to gather
                demographic information as a whole. We do not provide personal information through these
                cookies or web beacons to any third party nor do any third parties collect any personal
                information by these means. Our website does not respond to do not track (DNT) signals.
              </li>
              <li>
                <strong>IP Addresses</strong> &mdash; An IP address is personally identifiable
                information that is a unique identifier that certain electronic devices use to identify
                and communicate with each other on the Internet. When you visit our website, we may view
                and collect the IP address of the device you use to connect to the Internet. We use this
                information to determine the general physical location of the device. We also may use
                this information to enhance our website.
              </li>
            </ul>
            <Text>
              If you choose to log into our services through Facebook Connect or interact with us on any
              other social networking platform, we may collect the following information about you
              including, but not limited to: your e-mail address, name, profile picture, cover photo,
              friends, gender, networks (e.g., school), age range, language, country, and other
              information that you have chosen to make public. We may append this information to other
              information that we collect about you.
            </Text>
            <Text>
              You may choose to submit a product review. Any personally identifiable information that
              you submit as part of the review can be read or used by other visitors to the Site. We are
              not responsible for any personally identifiable information that you choose to submit as
              part of your review. We believe you can post a helpful review without disclosing any
              personal information.
            </Text>
          </div>

          <div>
            <Heading level={2}>Use of Information</Heading>
            <Text>
              We use the information that we collect from and about you, including your personal
              information, for the following purposes:
            </Text>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Providing Our Services.</strong> To provide our services to you; for order
                fulfillment purposes; to communicate with you, including via email, about your use of
                our services; to respond to your inquiries; and for other customer service purposes.
              </li>
              <li>
                <strong>Marketing/Advertising.</strong> To provide you with news and newsletters,
                special offers, and promotions, including via email; to contact you about products or
                information we think may interest you; and for other marketing, advertising, and
                promotional purposes.
              </li>
              <li>
                <strong>Analyzing Use of Our Services.</strong> To better understand how users access
                and use our Website and services, both on an aggregated and individualized basis; to
                respond to user desires and preferences; and for other research and analytical purposes.
              </li>
              <li>
                <strong>Posting to your Wall.</strong> If you log in through Facebook Connect or
                &ldquo;like&rdquo; us, we may post to your wall. We may also interact with you on other
                social media platforms.
              </li>
              <li>
                <strong>Complying with the Law.</strong> To comply with applicable legal obligations.
              </li>
              <li>
                <strong>Protecting Our Rights and Interests.</strong> We may use your information to
                protect our rights and interests and the rights and interests of other users of our
                Website, as well as to enforce this Policy.
              </li>
            </ul>
            <Text>
              Note: If at any time you would like to unsubscribe from receiving future emails, we
              include the option to do so at the bottom of each email.
            </Text>
          </div>

          <div>
            <Heading level={2}>Information Protection</Heading>
            <Text>
              We implement a variety of security measures to maintain the safety of your personal
              information when you place an order or enter, submit, or access your personal information.
            </Text>
            <Text>
              Our website incorporates physical, electronic, and administrative procedures to safeguard
              the confidentiality of your personal information, including Secure Sockets Layer
              (&ldquo;SSL&rdquo;) for all financial transactions through the Site. We use SSL encryption
              to protect your personal information online, and we also take several steps to protect
              your personal information in our facilities. Access to your personal information is
              restricted. Only employees who need access to your personal information to perform a
              specific job are granted access to your personal information. Finally, we rely on
              third-party service providers for the physical security of some of our computer hardware.
              We believe that their security procedures are adequate.
            </Text>
            <Text>
              While we use industry-standard precautions to safeguard your personal information, we
              cannot guarantee complete security. 100% complete security does not presently exist
              anywhere online or offline.
            </Text>
            <Text>
              After a transaction, your private information (credit cards, social security numbers,
              financials, etc.) will not be stored on our servers.
            </Text>
          </div>

          <div>
            <Heading level={2}>Information Sharing</Heading>
            <Text>
              We do not sell or otherwise disclose information about our website visitors, except as
              described here.
            </Text>
            <Text>
              We may share the information you provide among our subsidiaries and affiliates and with
              our joint marketing partners.
            </Text>
            <Text>
              We may also share the information with service providers we have retained to perform
              services on our behalf. These service providers are not authorized by us to use or
              disclose the information except as necessary to perform services on our behalf or comply
              with legal requirements.
            </Text>
            <Text>
              In addition, we may disclose information about you (i) if we are required to do so by law
              or legal process, (ii) to law enforcement authorities or other government officials, or
              (iii) when we believe disclosure is necessary or appropriate to prevent physical harm or
              financial loss or in connection with an investigation of suspected or actual illegal
              activity.
            </Text>
            <Text>
              We may share non-personal information, such as aggregate user statistics, demographic
              information, and web site usage information with third parties.
            </Text>
            <Text>
              We may offer sweepstakes, contests, and other promotions through the Web Sites that may
              require registration. If you choose to enter a sweepstakes, contest or other promotion,
              your personal information may be disclosed to third parties in connection with the
              administration of such promotion, including, without limitation, in connection with winner
              selection, prize fulfillment, and as required by law, such as on a winners list. Also, by
              entering a promotion, you are agreeing to the official rules that govern that promotion,
              which may contain specific requirements of you, including, except where prohibited by law,
              allowing the sponsor(s) of the promotion to use your name, voice and/or likeness in
              advertising or marketing associated with the promotion.
            </Text>
            <Text>
              We reserve the right to transfer any information we have about you in the event we sell or
              transfer all or a portion of our business or assets. Should such a sale or transfer occur,
              we will use reasonable efforts to direct the transferee to use information you have
              provided through our website in a manner that is consistent with this Privacy Policy.
            </Text>
          </div>

          <div>
            <Heading level={2}>California Online Privacy Protection Act Compliance</Heading>
            <Text>
              Because we value your privacy we have taken the necessary precautions to be in compliance
              with the California Online Privacy Protection Act. If you are a California resident, you
              may ask us to refrain from sharing your information with third parties for their marketing
              purposes. Please tell us your preference by contacting us as indicated in the
              &ldquo;Contacting Us&rdquo; section of this Privacy Policy.
            </Text>
          </div>

          <div>
            <Heading level={2}>Children&rsquo;s Online Privacy Protection Act Compliance</Heading>
            <Text>
              We are in compliance with the requirements of COPPA (Childrens Online Privacy Protection
              Act). We do not collect any information from anyone under 13 years of age. Our website,
              products and services are all directed to people who are at least 13 years old or older.
              If we discover that a child under thirteen (13) has provided us with personal information,
              we will promptly delete such information from our systems.
            </Text>
          </div>

          <div>
            <Heading level={2}>Online Privacy Policy Only</Heading>
            <Text>
              This online privacy policy applies only to information collected through our website and
              not to information collected offline.
            </Text>
          </div>

          <div>
            <Heading level={2}>User Generated Content</Heading>
            <Text>
              We invite you to participate in our Forums. If you choose to post a comment, your user
              name, city, and any other information that you choose to post will be visible to all
              visitors to the Website. We are not responsible for the privacy of any information that
              you choose to post to our Website, including in our blogs and forums, or for the accuracy
              of any information contained in those postings. Any information that you disclose becomes
              public information. We cannot prevent such information from being used in a manner that
              may violate this Policy, the law or your personal privacy.
            </Text>
          </div>

          <div>
            <Heading level={2}>Third Party Links</Heading>
            <Text>
              Occasionally, at our discretion, we may include or offer third party products or services
              on our website. These third party sites have separate and independent privacy policies. We
              therefore have no responsibility or liability for the content and activities of these
              linked sites.
            </Text>
          </div>

          <div>
            <Heading level={2}>Mobile Information</Heading>
            <Text>
              No mobile information will be shared with third parties/affiliates for
              marketing/promotional purposes. All the above categories exclude text messaging originator
              opt-in data and consent; this information will not be shared with any third parties.
            </Text>
            <Text>
              Message frequency varies per user. Message and data rates may apply. Text HELP for help.
              Text STOP to unsubscribe. Carriers are not liable for delayed or undelivered messages.
            </Text>
          </div>

          <div>
            <Heading level={2}>Your Consent</Heading>
            <Text>By using our site, you consent to our privacy policy.</Text>
          </div>

          <div>
            <Heading level={2}>Changes to Our Privacy Policy</Heading>
            <Text>
              If we decide to change our privacy policy, we will update the Privacy Policy modification
              date below. Any change will be effective as of the date posted to our website, and we have
              no obligation to notify you of such changes.
            </Text>
            <Text>This policy was last modified on December 2nd, 2024.</Text>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Heading level={2}>Contacting Us</Heading>
            <Text>
              If you have any questions regarding this Privacy Policy, you may contact us using the
              information below.
            </Text>
            <div className="flex flex-wrap items-center gap-4 not-prose mt-4">
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 text-gray-700 hover:text-primary font-semibold transition-colors"
              >
                <Phone className="w-5 h-5 text-accent" />
                (800) 963-0131
              </a>
              <LinkButton href="/contact" variant="primary" size="md">
                Visit Our Contact Page
              </LinkButton>
            </div>
          </div>
          </div>
        </section>
      </Stack>
    </Container>
  )
}
