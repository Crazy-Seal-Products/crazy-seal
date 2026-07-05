import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Star, Quote } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { FAQAccordion } from '@/components/FAQAccordion'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | RV ARMOR',
  description: 'Common questions about RV Armor pricing, roof types, application time, warranty, DIY options, and coverage.',
}

const FAQ_VIDEOS = [
  { id: 'H0ugkwN_9gQ', title: 'What happens if I need to replace a vent, AC, or antenna?' },
  { id: 'xk4rYIK05Po', title: 'What do you do with air conditioners?' },
  { id: 'InAahyPWiB8', title: 'How do you handle solar panels?' },
  { id: 'noySxhi2qpI', title: 'Time-lapse of an RV Armor application' },
]

const TESTIMONIAL_VIDEOS = [
  { id: 'sOHaDWI7cCk', name: 'Jim & Cathy McBride' },
  { id: 'xPhvy0XRPxk', name: 'Tom Liberty' },
  { id: 'LF6IPFXeZzM', name: 'Bill & Kelly Bonner' },
]

const TESTIMONIALS = [
  {
    name: 'Robert Vancura',
    photo: '0003_Robert-Vancura-300x300.jpg',
    text: 'Very professional and well worth the money! Thank you RV Armor!',
  },
  {
    name: 'Erik Fowler',
    photo: '0009_Erik-Fowler-300x300.jpg',
    text: '5 stars for sure. Very professional service and they come to you to do the work. Luis was great and really knew what he was doing!!!',
  },
  {
    name: 'Michael & Charlene Outlaw',
    photo: '0010_Michael-Charlene-Outlaw-300x300.jpg',
    text: 'We love our new RV Armor roof! Professional installation and great customer service.',
  },
]

export default function FAQPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Hero with Lee Thaxton FAQ video */}
        <VideoHero
          heading="Ask &"
          highlight="We Answer"
          subheading="Watch our founder Lee Thaxton answer common questions about RV Armor, then browse the full FAQ below."
          youtubeId="GUQiARMKyUU"
          imageAlt="Lee Thaxton answering FAQ"
          badge="FAQ"
          variant="dark"
        />

        {/* FAQ Accordion */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Frequently Asked Questions</Heading>
              <Text className="max-w-2xl mx-auto">
                Find answers to common questions about RV Armor pricing, installation, warranty, and more.
              </Text>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* FAQ Answer Videos */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Watch Our Answers</Heading>
              <Text className="max-w-2xl mx-auto">
                Video answers to specific questions about the RV Armor process.
              </Text>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 2 }} gap="md">
              {FAQ_VIDEOS.map((video) => (
                <Card key={video.id} className="!p-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-gray-900">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{video.title}</p>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        {/* Tough Skin Brochure */}
        <section>
          <div className="section-bleed bg-primary overflow-hidden px-5 pt-6 pb-4 sm:px-6 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
              <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure-b.jpg`}
                  alt="Trailer Life Magazine - RV Armor Tough Skin article"
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
                  Read what Trailer Life Magazine has to say about RV Armor. Our proprietary roofing
                  system has been featured for its durability and value.
                </p>
                <Link
                  href={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure.jpg`}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-gray-100 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Read the Article
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Videos */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Happy Customers</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              {TESTIMONIAL_VIDEOS.map((video) => (
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
            </Grid>
          </div>
        </section>

        {/* Written Testimonials */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Testimonials</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              {TESTIMONIALS.map((t) => (
                <Card key={t.name} className="text-center">
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${MEDIA}/2018/12/${t.photo}`} alt={t.name} className="w-20 h-20 rounded-full object-cover mb-4" />
                    <Quote className="w-6 h-6 text-[#003365]/30 mb-2" />
                    <Text size="sm" className="italic !mb-3">&ldquo;{t.text}&rdquo;</Text>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#F9EA1C] fill-[#F9EA1C]" />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
