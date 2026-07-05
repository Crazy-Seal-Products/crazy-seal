import type { Metadata } from 'next'
import { MapPin, Star } from 'lucide-react'
import {
  Container,
  Heading,
  Text,
  Grid,
  SectionHeading,
  ContentImageSection,
  TestimonialCard,
} from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'About Us | RV ARMOR',
  description: 'Three generations of roofing expertise. Meet Lee and Carol Thaxton and the team behind RV Armor.',
}

const TESTIMONIAL_VIDEOS = [
  { id: 'sOHaDWI7cCk', name: 'Jim & Cathy McBride' },
  { id: 'xPhvy0XRPxk', name: 'Tom Liberty' },
  { id: 'LF6IPFXeZzM', name: 'Bill & Kelly Bonner' },
]

const TESTIMONIALS = [
  {
    name: 'Robert Vancura',
    photo: `${MEDIA}/2018/12/0003_Robert-Vancura-300x300.jpg`,
    text: 'Very professional and well worth the money! Thank you RV Armor!',
  },
  {
    name: 'Erik Fowler',
    photo: `${MEDIA}/2018/12/0009_Erik-Fowler-300x300.jpg`,
    text: '5 stars for sure. Very professional service and they come to you to do the work. Luis was great and really knew what he was doing!!!',
  },
  {
    name: 'Michael & Charlene Outlaw',
    photo: `${MEDIA}/2018/12/0010_Michael-Charlene-Outlaw-300x300.jpg`,
    text: 'We love our new RV Armor roof! Professional installation and great customer service.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO (primary card) ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2018/12/RV-ARMOR-After-Roofs-Back-Wide.jpg`}
              alt="RV Armor completed roofs"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary" />
          </div>
          <div className="relative z-10 py-12 sm:py-16 lg:py-20 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Three Generations of Expertise
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              We Know Roofing
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
              Protect your RV with the best roof in the industry.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── CORPORATE STAFF ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ContentImageSection
            imageSrc={`${MEDIA}/2018/12/RV-ARMOR-TEAM.jpg`}
            imageAlt="RV Armor team"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">Our Team</p>
            <Heading level={2}>Meet Our Corporate Staff</Heading>
            <Text className="!text-gray-500 leading-relaxed">
              RV Armor was born from a family legacy of roofing excellence. What started as
              commercial and residential roofing evolved into a specialized focus on RVs when we
              saw the need for a permanent, maintenance-free solution.
            </Text>
            <Text className="!text-gray-500 leading-relaxed !mb-0">
              Our team brings decades of combined roofing experience to every installation,
              ensuring the highest quality and customer service.
            </Text>
          </ContentImageSection>
        </div>
      </Container>

      {/* ─── OUR COMMITMENT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ContentImageSection
            imageSrc={`${MEDIA}/2018/12/On-the-Road-RV-Armor.jpg`}
            imageAlt="RV on the road"
            imagePosition="left"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">Our Promise</p>
            <Heading level={2}>Our Commitment to You</Heading>
            <Text className="!text-gray-500 leading-relaxed">
              We are a professional, full-service solution. From the initial quote to the final
              inspection, our team handles every aspect of your roof installation.
            </Text>
            <Text className="!text-gray-500 leading-relaxed !mb-0">
              Your RV lifestyle matters to us. That&apos;s why we come to you &mdash; whether
              you&apos;re at a campground, in your driveway, or at a storage facility anywhere
              in the continental US.
            </Text>
          </ContentImageSection>
        </div>
      </Container>

      {/* ─── OWNERS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ContentImageSection
            imageSrc={`${MEDIA}/2018/12/RV-ARMOR-LEE-AND-CAROL.jpg`}
            imageAlt="Lee and Carol Thaxton - RV Armor owners"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">Leadership</p>
            <Heading level={2}>Meet the Owners</Heading>
            <p className="text-lg font-semibold text-primary mb-2">Lee and Carol Thaxton</p>
            <Text className="!text-gray-500 leading-relaxed !mb-0">
              Lee and Carol Thaxton are the heart and soul of RV Armor. With Lee&apos;s decades of
              roofing experience and Carol&apos;s business acumen, they&apos;ve built RV Armor into
              the leading permanent RV roofing solution in the country.
            </Text>
          </ContentImageSection>
        </div>
      </Container>

      {/* ─── WHERE ARE WE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ContentImageSection
            imageSrc={`${MEDIA}/2018/12/US-Map-RV-Armor-Convenience.jpg`}
            imageAlt="RV Armor nationwide service map"
            imagePosition="left"
            variant="dark"
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-accent flex-shrink-0" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Where Are We?</h2>
            </div>
            <p className="text-white/60 text-base sm:text-lg leading-relaxed">
              RV Armor is headquartered in Florida, but our certified technician network
              spans the entire continental United States. Wherever you are, we come to you.
            </p>
          </ContentImageSection>
        </div>
      </Container>

      {/* ─── FAMILY HISTORY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ContentImageSection
            imageSrc={`${MEDIA}/2018/12/Thaxton-Roofing.jpg`}
            imageAlt="Thaxton Roofing - family history"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">Our Legacy</p>
            <Heading level={2}>A Family History</Heading>
            <Text className="!text-gray-500 leading-relaxed">
              The Thaxton family has been in the roofing industry since the 1950s &mdash; three
              generations of expertise that we bring to every RV Armor installation.
            </Text>
            <p className="text-lg font-semibold text-primary mb-2">How RV Armor Was Born</p>
            <Text className="!text-gray-500 leading-relaxed !mb-0">
              After decades in commercial and residential roofing, Lee Thaxton saw a gap in
              the RV market: there was no permanent roofing solution. Traditional RV roofs fail
              after 10-15 years and require constant maintenance. RV Armor was created to solve
              this problem once and for all with a seamless, maintenance-free membrane backed
              by a lifetime guarantee.
            </Text>
          </ContentImageSection>
        </div>
      </Container>

      {/* ─── VIDEO TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Real Stories" heading="Happy Customers" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {TESTIMONIAL_VIDEOS.map((video) => (
              <div key={video.id} className="rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-video bg-gray-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                    title={`${video.name} testimonial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="font-semibold text-gray-900">{video.name}</p>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── WRITTEN TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Reviews" heading="What RV Owners Are Saying" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
