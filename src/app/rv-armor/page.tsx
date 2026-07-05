import type { Metadata } from 'next'
import { Shield, Download, Star, Quote } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { CtaSection } from '@/components/CtaSection'
import { ProcessGallery } from '@/components/ProcessGallery'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'The RV Armor Roofing System | RV ARMOR',
  description: 'Our proprietary system is the best in the industry. Certified technicians, lifetime guarantee, and seamless installation wherever you are.',
}

const PRODUCTS = [
  { name: 'Made in USA', image: 'MADE-IN-USA.png' },
  { name: 'Armor Base', image: 'Armor-Base.png' },
  { name: 'Armor Finish', image: 'Armor-Finish.png' },
  { name: 'Armor Seal', image: 'Armor-Seal.png' },
  { name: 'Flashing Armor', image: 'Flashing-Armor.png' },
  { name: 'Armor Clean', image: 'Armor-Clean.png' },
  { name: 'Armor Tape', image: 'Armor-Tape.png' },
  { name: 'Repair Armor', image: 'Repair-Armor.png' },
  { name: 'Primer Armor', image: 'Primer-Armor.png' },
  { name: 'Rust Armor', image: 'Rust-Armor.png' },
]

const INSTALLATION_STEPS = [
  { step: 1, label: 'Cleaning', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_02.jpg`, alt: 'Step 1: Cleaning', description: 'After a thorough roof inspection, the first step is to sweep to remove dust and accumulated dirt, followed by a wipe-down with denatured alcohol.' },
  { step: 2, label: 'Seal Inspection', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_03.jpg`, alt: 'Step 2: Seal Inspection', description: 'Inspect and clean the sealant around all vents and skylights. Cracked or peeling sealant would be scraped off and resealed.' },
  { step: 3, label: 'Underlayment', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_04.jpg`, alt: 'Step 3: Underlayment', description: 'The roof is inspected for underlayment starting to delaminate. If spots are found, first a small L shaped slit is cut in the membrane above.' },
  { step: 4, label: 'Underlayment', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_05.jpg`, alt: 'Step 4: Underlayment', description: 'The de-lamination is alleviated by driving a self-tapping screw.' },
  { step: 5, label: 'Underlayment', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_06.jpg`, alt: 'Step 5: Underlayment', description: 'The area is then covered with foil tape. This spot is now ready to be covered by the RV Armor System and less likely to continue the de-lamination.' },
  { step: 6, label: 'Vent Covers', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_07.jpg`, alt: 'Step 6: Vent Covers', description: 'The plumbing vent covers are removed, and the sealant around them is cleaned and inspected.' },
  { step: 7, label: 'Primer', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_08.jpg`, alt: 'Step 7: Primer', description: 'Primer is cut in with a brush along the edges, near the front and rear caps, and around the vents and skylights.' },
  { step: 8, label: 'Primer', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_09.jpg`, alt: 'Step 8: Primer', description: 'Primer cut-in is complete and ready for the main primer coat.' },
  { step: 9, label: 'Primer', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_10.jpg`, alt: 'Step 9: Primer', description: 'Entire roof is covered with primer in preparation for base coat.' },
  { step: 10, label: 'Primer', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_11.jpg`, alt: 'Step 10: Primer', description: 'Primer coat is ready to receive base coat.' },
  { step: 11, label: 'Caulking', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_12.jpg`, alt: 'Step 11: Caulking', description: 'Prior to application of the gray base coat, the roof is re-caulked along the edges.' },
  { step: 12, label: 'Sealant', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_13.jpg`, alt: 'Step 12: Sealant', description: 'Sealant is applied along the front and rear caps as needed.' },
  { step: 13, label: 'Sealant', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_14.jpg`, alt: 'Step 13: Sealant', description: 'Sealant is applied around the antenna, vents and skylights with self-leveling sealant.' },
  { step: 14, label: 'Fabric Mesh', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_15.jpg`, alt: 'Step 14: Fabric Mesh', description: 'After the self-leveling sealant is applied, fabric mesh is gently pushed into it while it is still wet, helping to strengthen the area and prevent cracking once cured.' },
  { step: 15, label: 'Gray Coat', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_16.jpg`, alt: 'Step 15: Gray Coat', description: 'Gray coating is first cut in around vents and skylights, etc., before it is rolled on. It will then cure overnight.' },
  { step: 16, label: 'Gray Coat', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_17.jpg`, alt: 'Step 16: Gray Coat', description: 'Remaining gray coat is rolled on after initial cut-in.' },
  { step: 17, label: 'Sealant & Tape', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_18.jpg`, alt: 'Step 17: Sealant & Tape', description: 'Another coat of sealant is applied on top of mesh tape in all areas, then masking tape is applied along the edges.' },
  { step: 18, label: 'Final Coat', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_19.jpg`, alt: 'Step 18: Final Coat', description: 'Finally, the white coat is laid on nice and thick. Then the masking tape is removed, leaving a nice, clean exterior edge.' },
  { step: 19, label: 'Final Product', src: `${MEDIA}/2018/12/RV-ARMOR-PROCESS_20.jpg`, alt: 'Step 19: Final Product', description: 'This is a completed roof! From here, the job is confirmed by the tech and the Lifetime Guarantee package is sent to the new roof owner!' },
]

const RUBBER_REPAIR = [
  { step: 1, src: `${MEDIA}/2018/12/REPAIRS_1-RV-ARMOR.jpg`, alt: 'Rubber repair step 1', description: 'Old rubber roof torn in several areas.' },
  { step: 2, src: `${MEDIA}/2018/12/REPAIRS_2-RV-ARMOR.jpg`, alt: 'Rubber repair step 2', description: 'Roof cut back and squared off.' },
  { step: 3, src: `${MEDIA}/2018/12/REPAIRS_3-RV-ARMOR.jpg`, alt: 'Rubber repair step 3', description: 'Install RV Armor Direct to Deck system in area.' },
  { step: 4, src: `${MEDIA}/2018/12/REPAIRS_4-RV-ARMOR.jpg`, alt: 'Rubber repair step 4', description: 'After pic of job completion.' },
]

const WOOD_REPAIR = [
  { step: 1, src: `${MEDIA}/2018/12/Damage-1.jpg`, alt: 'Wood repair step 1', description: 'Typical rotten wood area.' },
  { step: 2, src: `${MEDIA}/2018/12/Damage-2.jpg`, alt: 'Wood repair step 2', description: 'Old sheets of wood removed.' },
  { step: 3, src: `${MEDIA}/2018/12/Damage-3.jpg`, alt: 'Wood repair step 3', description: 'New wood installed and ready for the RV Armor system.' },
]

const DIRECT_TO_DECK = [
  { step: 1, src: `${MEDIA}/2018/12/DIRECT_1-RV-ARMOR.jpg`, alt: 'Direct to deck step 1', description: 'Old rubber roof torn off. Roof is now back to the original wood deck.' },
  { step: 2, src: `${MEDIA}/2018/12/DIRECT_2-RV-ARMOR.jpg`, alt: 'Direct to deck step 2', description: 'Armor Tape applied to all seams, perimeter, and penetrations. Roof now ready for Direct to Deck system.' },
  { step: 3, src: `${MEDIA}/2018/12/DIRECT_3-RV-ARMOR.jpg`, alt: 'Direct to deck step 3', description: 'RV Armor fabric installed over wood decking in preparation for the rest of the process.' },
  { step: 4, src: `${MEDIA}/2018/12/DIRECT_4-RV-ARMOR.jpg`, alt: 'Direct to deck step 4', description: 'After the fabric is applied, RV Armor is installed in 2 stages. In this stage the gray/base is being cut in and applied.' },
  { step: 5, src: `${MEDIA}/2018/12/DIRECT_5-RV-ARMOR.jpg`, alt: 'Direct to deck step 5', description: 'The RV Armor direct to deck roof is now complete. Another roof guaranteed for life!' },
]

const BEFORE_AFTER = [
  { before: '001-Before-1.jpg', after: '001-After-1.jpg' },
  { before: '022-Before.jpg', after: '022-After.jpg' },
  { before: '024-Before.jpg', after: '024-After.jpg' },
  { before: '008-Before.jpg', after: '008-After.jpg' },
  { before: '029-Before.jpg', after: '029-After.jpg' },
]

export default function RVArmorSystemPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero with Time-Lapse Video */}
        <VideoHero
          heading="The RV Armor Roofing System"
          subheading="Our proprietary system is the best in the industry! Watch this time-lapse video of one of our installations to see it in action."
          youtubeId="dE_egSY_6-w"
          ctaText="Get a Free Quote"
          badge="Our System"
          variant="dark"
        />

        {/* The RV Armor Experience */}
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 shadow-sm px-5 py-6 sm:p-6 md:p-10 text-center">
          <Heading level={2} className="!text-[#003365]">The RV Armor Experience</Heading>
          <Text className="max-w-3xl mx-auto text-lg">
            Our goal is to help you have a lifetime of fun with the last RV roof you will ever need.
            Guaranteed! That&rsquo;s why we&rsquo;ve made it easy to get a new roof exactly where you are.
          </Text>
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg" className="mt-8">
            <Card className="text-center">
              <span className="mx-auto mb-3 flex w-10 h-10 items-center justify-center rounded-full bg-green-600 text-white text-lg font-bold">1</span>
              <Heading level={4}>RV Armor Specialists</Heading>
              <Text size="sm">
                Give us a call <a href="tel:8557827667" className="text-[#003365] font-semibold hover:underline">855-782-7667</a>! One of our team members will get your questions answered and help you place your order for your new RV Armor roof. Once the order is confirmed, you will be assigned a service advisor to help you through the entire process!
              </Text>
            </Card>
            <Card className="text-center">
              <span className="mx-auto mb-3 flex w-10 h-10 items-center justify-center rounded-full bg-green-600 text-white text-lg font-bold">2</span>
              <Heading level={4}>Service Advisor</Heading>
              <Text size="sm">
                Your service advisor will help you with everything in the process! They will schedule a technician to come to you, handle paperwork, collect payment, and ensure you get your warranty and customer care package once the job is complete!
              </Text>
            </Card>
            <Card className="text-center">
              <span className="mx-auto mb-3 flex w-10 h-10 items-center justify-center rounded-full bg-green-600 text-white text-lg font-bold">3</span>
              <Heading level={4}>Certified Technician</Heading>
              <Text size="sm">
                Your certified technician will arrive on site with everything required to complete the job. Over 2-3 days, your tech will apply the RV Armor roofing system to your RV. Just relax and watch as your tech puts on the last roof you will ever need!
              </Text>
            </Card>
            <Card className="text-center">
              <span className="mx-auto mb-3 flex w-10 h-10 items-center justify-center rounded-full bg-green-600 text-white text-lg font-bold">4</span>
              <Heading level={4}>Lifetime Guarantee</Heading>
              <Text size="sm">
                Welcome to the family! Our warranty is a True Lifetime Material and Labor Warranty. It is Fully Transferable, Non-Prorated, and is tracked by the VIN # of your RV. Now have a lifetime of fun in your RV Armor protected RV!
              </Text>
            </Card>
          </Grid>
        </div>

        {/* Lifetime Guarantee Banner */}
        <section className="section-bleed bg-gradient-to-r from-[#003365] to-[#125F97] px-5 py-8 sm:p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-start gap-6">
            <Shield className="w-16 h-16 text-[#F9EA1C] flex-shrink-0" />
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold">Lifetime Guarantee</h2>
              <p className="text-white/80 mt-2 max-w-xl">
                Every RV Armor roof comes with a transferable lifetime guarantee covering materials and labor.
              </p>
            </div>
          </div>
        </section>

        {/* Proprietary Products */}
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 shadow-sm px-5 py-6 sm:p-6 md:p-10 text-center">
          <Heading level={2} className="!text-[#003365]">Proprietary Process &amp; Products</Heading>
          <Text className="max-w-3xl mx-auto">
            Our process involves different RV Armor Products that are applied in a unique sequence by
            certified technicians. The result is a custom fit seamless roof system for your RV!
          </Text>
          <Grid responsiveCols={{ mobile: 2, tablet: 3, desktop: 5 }} gap="md" className="mt-8">
            {PRODUCTS.map((product) => (
              <div key={product.name} className="flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/${product.image}`}
                  alt={product.name}
                  className="w-44 h-auto"
                />
              </div>
            ))}
          </Grid>
        </div>

        {/* Full Installation Example */}
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 shadow-sm px-5 py-6 sm:p-6 md:p-10">
          <div className="text-center mb-8">
            <Heading level={2} className="!text-[#003365]">Full Installation Example</Heading>
            <Text>
              In this example, the RV Armor System is applied to a rubber roof. Click any photo to view full size.
            </Text>
          </div>
          <ProcessGallery
            images={INSTALLATION_STEPS}
            aspect="1/1"
            cols={5}
            showStepBadge
            showDescription
          />
        </div>

        {/* Tough Skin Brochure */}
        <section>
          <div className="section-bleed bg-primary overflow-hidden px-5 pt-6 pb-4 sm:px-6 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
              <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure-b.jpg`}
                  alt="Tough Skin Brochure"
                  className="rounded-2xl shadow-2xl ring-1 ring-white/10 h-auto md:max-h-[400px] object-contain"
                />
              </div>
              <div className="order-1 md:order-2 text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                  Featured in Trailer Life Magazine
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Tough Skin
                </h2>
                <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                  Learn more about our proprietary Tough Skin coating in our detailed brochure.
                </p>
                <a
                  href={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-gray-100 transition-all"
                >
                  <Download className="w-5 h-5" />
                  View Brochure
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Repairs & Damage */}
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 shadow-sm px-5 py-6 sm:p-6 md:p-10">
          <div className="text-center mb-8">
            <Heading level={2} className="!text-[#003365]">Repairs &amp; Damage</Heading>
            <Text className="max-w-2xl mx-auto">
              Is your roof in bad shape? No problem! Our certified techs are trained to handle it. Click any photo to view full size.
            </Text>
          </div>

          {/* Rubber Damage */}
          <div className="mb-6 rounded-2xl border border-gray-200/80 bg-gray-50 p-4 md:p-6">
            <div className="bg-[#003365] rounded-xl px-4 py-3 mb-4">
              <Heading level={3} className="text-center !text-white !mb-0">Rubber Damage &amp; Repair Example</Heading>
            </div>
            <ProcessGallery
              images={RUBBER_REPAIR}
              aspect="1/1"
              cols={4}
              showStepBadge
              showDescription
            />
          </div>

          {/* Rotten Wood */}
          <div className="mb-6 rounded-2xl border border-gray-200/80 bg-gray-50 p-4 md:p-6">
            <div className="bg-[#003365] rounded-xl px-4 py-3 mb-4">
              <Heading level={3} className="text-center !text-white !mb-0">Rotten Wood Damage &amp; Repair Example</Heading>
            </div>
            <ProcessGallery
              images={WOOD_REPAIR}
              aspect="4/3"
              cols={3}
              showStepBadge
              showDescription
            />
          </div>

          {/* Direct to Deck */}
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50 p-4 md:p-6">
            <div className="bg-[#003365] rounded-xl px-4 py-3 mb-4">
              <Heading level={3} className="text-center !text-white !mb-0">Direct to Wood Decking</Heading>
            </div>
            <Text className="mb-4 text-center">Progress pictures of our direct-to-deck system.</Text>
            <ProcessGallery
              images={DIRECT_TO_DECK}
              aspect="9/16"
              cols={5}
              showStepBadge
              showDescription
            />
          </div>
        </div>

        {/* Before & After Sliders (hidden on mobile) */}
        <div className="hidden sm:block section-bleed bg-white sm:border border-gray-200/80 shadow-sm sm:p-6 md:p-10">
          <div className="text-center mb-8">
            <Heading level={2} className="!text-[#003365]">Before and After Image Sliders</Heading>
            <Text>Slide the center bar back and forth to see the transformations!</Text>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {BEFORE_AFTER.map((pair, i) => (
              <BeforeAfterSlider
                key={i}
                beforeSrc={`${MEDIA}/2018/12/${pair.before}`}
                afterSrc={`${MEDIA}/2018/12/${pair.after}`}
              />
            ))}
          </div>
        </div>

        {/* Video Testimonials */}
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 shadow-sm px-5 py-6 sm:p-6 md:p-10">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Happy Customers</p>
            <Heading level={2} className="!text-[#003365]">Testimonials</Heading>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { id: 'sOHaDWI7cCk', name: 'Jim & Cathy McBride' },
              { id: 'xPhvy0XRPxk', name: 'Tom Liberty' },
              { id: 'LF6IPFXeZzM', name: 'Bill & Kelly Bonner' },
            ].map((video) => (
              <Card key={video.id} className="!p-4">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-gray-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                    title={`${video.name} testimonial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900 text-center">{video.name}</p>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            {[
              { name: 'Robert Vancura', photo: '0003_Robert-Vancura-300x300.jpg', text: 'Very professional and well worth the money! Thank you RV Armor!' },
              { name: 'Erik Fowler', photo: '0009_Erik-Fowler-300x300.jpg', text: '5 stars for sure. Very professional service and they come to you to do the work.' },
              { name: 'Michael & Charlene Outlaw', photo: '0010_Michael-Charlene-Outlaw-300x300.jpg', text: 'We love our new RV Armor roof! Professional installation and great customer service.' },
            ].map((t) => (
              <Card key={t.name} className="text-center">
                <div className="flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${MEDIA}/2018/12/${t.photo}`} alt={t.name} className="w-16 h-16 rounded-full object-cover mb-3" />
                  <Quote className="w-5 h-5 text-[#003365]/30 mb-1" />
                  <Text size="sm" className="italic !mb-2">&ldquo;{t.text}&rdquo;</Text>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#F9EA1C] fill-[#F9EA1C]" />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <CtaSection />
      </Stack>
    </Container>
  )
}
