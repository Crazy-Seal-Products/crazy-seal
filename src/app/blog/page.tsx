import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Blog - RV Armor',
  description: 'Tips, guides, and insights about RV roof care and the RV Armor permanent roofing solution.',
}

const BLOG_POSTS = [
  {
    title: 'How to Prep Your RV for Your New RV Armor Roof',
    slug: '/how-to-prep-your-rv-for-your-new-rv-armor-roof',
    image: `${MEDIA}/2018/12/rv-armor-rv-prep-01_orig.jpg`,
    excerpt: 'Getting your RV ready for a new RV Armor roof is simple. Here are the steps to prepare for your installation day.',
  },
  {
    title: 'The Permanent Roof Coating for Your Travel Trailer',
    slug: '/the-permanent-roof-coating-for-your-travel-trailer',
    image: `${MEDIA}/2018/12/rv-armor-permanentcoating-01_orig.jpg`,
    excerpt: 'Discover why RV Armor is the permanent roof coating solution that travel trailer owners trust for a lifetime of protection.',
  },
  {
    title: 'The Care and Cleaning of Your RV Armor Roof',
    slug: '/the-care-and-cleaning-of-your-rv-armor-roof',
    image: `${MEDIA}/2018/12/rv-armor-carecleaning-01_orig.jpg`,
    excerpt: 'Your RV Armor roof requires virtually no maintenance, but here are some tips to keep it looking its best.',
  },
]

export default function BlogPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-12 md:p-14 lg:p-16">
          <div className="text-center">
            <Heading level={1}>RV Armor Blog</Heading>
            <Text className="max-w-2xl mx-auto">
              Tips &amp; tricks for our fellow RV&rsquo;ers. Learn about RV roof care,
              installation stories, and insights from our team.
            </Text>
          </div>
        </div>

        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
        <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={post.slug} className="group">
              <Card className="!p-0 overflow-hidden h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#003365] transition-colors">
                    {post.title}
                  </h2>
                  <Text size="sm" className="!mb-3">{post.excerpt}</Text>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#003365] group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </Grid>
        </div>

        <CtaSection />
      </Stack>
    </Container>
  )
}
