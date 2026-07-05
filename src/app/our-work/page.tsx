import type { Metadata } from 'next'
import { Container, Stack, Heading, Text } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { createClient } from '@/lib/supabase/server'
import { GalleryGrid } from '@/components/GalleryGrid'
import { PhotosCtaButtons } from '@/components/PhotosCtaButtons'

export const metadata: Metadata = {
  title: 'Our Work | RV ARMOR',
  description: 'See examples of RV Armor installations. Browse our gallery of completed projects from customers across the country.',
}

export default async function OurWorkPage() {
  const supabase = await createClient()
  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('id, filename, cdn_url, width, height, installation_type')
    .order('display_order', { ascending: true })

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Gallery */}
        {photos && photos.length > 0 && (
          <section>
            <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
              <div className="text-center mb-4">
                <Heading level={1} className="!text-[#003365]">Our Work</Heading>
                <Text className="mt-2">Browse completed RV Armor installations from customers across the country.</Text>
              </div>
              <PhotosCtaButtons />
              <GalleryGrid photos={photos} />
            </div>
          </section>
        )}

        <CtaSection />
      </Stack>
    </Container>
  )
}
