import type { Metadata } from 'next'
import { Star, Quote } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid, GoogleReviews } from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Customer Reviews & Testimonials | RV ARMOR',
  description: 'Read what RV owners say about their RV Armor experience. Real reviews from real customers.',
}

const FEATURED_VIDEO = { id: 'sOHaDWI7cCk', name: 'Jim & Cathy McBride' }

const VIDEO_TESTIMONIALS = [
  { id: 'xPhvy0XRPxk', name: 'Tom Liberty' },
  { id: 'LF6IPFXeZzM', name: 'Bill & Kelly Bonner' },
  { id: 'yBzjH8iGbq0', name: 'Bill & Marilyn Woodside' },
  { id: '2IV42RhueO0', name: 'Dave & Linda Spindle' },
  { id: 'G65BYGzwxBc', name: 'Richard & Karen Strait' },
  { id: 'Qdd7_Eoe8SI', name: 'Bob & Linda Neish' },
]

const WRITTEN_TESTIMONIALS = [
  {
    name: 'Greg Stanford',
    photo: '0003_Robert-Vancura-300x300.jpg',
    text: 'We are on day two of the install! I could not be more impressed with the high level of customer service and the level of expertise by the Technician! Everything has gone just perfect! Multiple people have commented on how the value is well worth it rather than purchasing a new RV! Our 5th wheel is 10 y/o and in perfect condition and now a lifetime roof! Priceless! WELL DONE RV Armor, Inc.',
    rating: 5,
  },
  {
    name: 'Robert Vancura',
    photo: '0003_Robert-Vancura-300x300.jpg',
    text: 'Very professional and well worth the money! Thank you RV Armor!',
    rating: 5,
  },
  {
    name: 'Erik Fowler',
    photo: '0009_Erik-Fowler-300x300.jpg',
    text: '5 stars for sure. Very professional service and they come to you to do the work. Luis was great and really knew what he was doing!!!',
    rating: 5,
  },
  {
    name: 'Michael & Charlene Outlaw',
    photo: '0010_Michael-Charlene-Outlaw-300x300.jpg',
    text: 'A job well done. I love my new lifetime warranty roof. RV Armor did an excellent job. 5 stars!',
    rating: 5,
  },
  {
    name: 'JD Kimbrough',
    photo: '0002_JD-Kimbrough-300x300.jpg',
    text: "Just had my roof repaired and coated by RV Armor and let me say I am very impressed! Finished product looks amazing and you can't beat the lifetime warranty. The process from beginning to end was absolutely perfect.",
    rating: 5,
  },
  {
    name: 'Traci Lynn Bradshaw',
    photo: '0005_Layer-1-300x300.jpg',
    text: 'My roof was just completed last week. They are very professional, work very hard, job was done in promised amount of time and my worries about a leaking roof are history! Thank you! 5+ stars!',
    rating: 5,
  },
  {
    name: 'John Bellis',
    photo: '0007_John-Bellis-300x300.jpg',
    text: 'I had my RV roof completed a couple of weeks ago and the tech who did it was very informative of the product and did an excellent job. Would recommend doing it this way rather than replacing the whole roof.',
    rating: 5,
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < count ? 'text-[#F9EA1C] fill-[#F9EA1C]' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Featured Hero - Jim & Cathy McBride */}
        <VideoHero
          heading="What Our Customers"
          highlight="Say"
          subheading="Real reviews from RV owners who chose RV Armor for permanent roof protection. Hear directly from Jim & Cathy McBride about their experience."
          youtubeId={FEATURED_VIDEO.id}
          imageAlt={`${FEATURED_VIDEO.name} testimonial`}
          badge="Featured Testimonial"
          variant="dark"
        />

        {/* Google Reviews */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-6">
              <Heading level={2} className="!text-[#003365]">Google Reviews</Heading>
            </div>
            <GoogleReviews
              featurableId={process.env.NEXT_PUBLIC_FEATURABLE_WIDGET_ID}
              minRating={5}
              maxReviews={9}
              carouselSpeed={8000}
              accentColor="#003365"
            />
          </div>
        </section>

        {/* More Video Testimonials */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">More Video Testimonials</Heading>
              <Text className="max-w-2xl mx-auto">Our extremely happy customers share their RV Armor experience.</Text>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              {VIDEO_TESTIMONIALS.map((video) => (
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

        {/* Written Testimonials with Photos */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Customer Reviews</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
              {WRITTEN_TESTIMONIALS.slice(0, 6).map((review) => (
                <Card key={review.name} className="text-center">
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${MEDIA}/2018/12/${review.photo}`}
                      alt={review.name}
                      className="w-20 h-20 rounded-full object-cover mb-4"
                    />
                    <Quote className="w-6 h-6 text-[#003365]/30 mb-2" />
                    <StarRating count={review.rating} />
                    <Text size="sm" className="!mb-4 mt-2 italic">&ldquo;{review.text}&rdquo;</Text>
                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                  </div>
                </Card>
              ))}
            </Grid>
            {/* Desktop: 7th review centered */}
            {WRITTEN_TESTIMONIALS.length > 6 && (
              <div className="flex justify-center mt-6">
                <div className="w-full max-w-sm">
                  <Card className="text-center">
                    <div className="flex flex-col items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${MEDIA}/2018/12/${WRITTEN_TESTIMONIALS[6].photo}`}
                        alt={WRITTEN_TESTIMONIALS[6].name}
                        className="w-20 h-20 rounded-full object-cover mb-4"
                      />
                      <Quote className="w-6 h-6 text-[#003365]/30 mb-2" />
                      <StarRating count={WRITTEN_TESTIMONIALS[6].rating} />
                      <Text size="sm" className="!mb-4 mt-2 italic">&ldquo;{WRITTEN_TESTIMONIALS[6].text}&rdquo;</Text>
                      <p className="text-sm font-semibold text-gray-900">{WRITTEN_TESTIMONIALS[6].name}</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
