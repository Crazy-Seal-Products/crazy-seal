import type { Metadata } from 'next'
import { Container, Stack, Heading, Text } from '@/lib/design-system'
import { TechApplicationForm } from '@/components/forms/TechApplicationForm'

export const metadata: Metadata = {
  title: 'Technician Application - RV Armor',
  description: 'Watch the technician overview video and apply to join the RV Armor team as a certified technician.',
}

export default function TechApplicationPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <section className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:px-10 md:py-12">
          <div className="text-center mb-8">
            <Heading level={1} className="!text-[#003365]">
              RV Armor Technician Overview Video
            </Heading>
            <Text className="!text-gray-500 !text-lg mt-2">
              (Watch video below for details)
            </Text>
          </div>

          <div className="max-w-3xl mx-auto mb-10">
            <div className="relative w-full overflow-hidden rounded-2xl shadow-lg" style={{ paddingTop: '56.25%' }}>
              <iframe
                src="https://player.vimeo.com/video/1022992085?h=&title=0&byline=0&portrait=0"
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="RV Armor Technician Overview"
              />
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <Text className="!text-base md:!text-lg leading-relaxed">
              Thank you for considering RV Armor as a potential business partner! The next step of the process
              is this simple application form. Once submitted, we will review this information and follow up to
              schedule a phone interview if we feel you are a potential good fit. Please ensure you have watched
              the video above so you understand the program prior to our conversation.
            </Text>
          </div>
        </section>

        <section>
          <TechApplicationForm />
        </section>
      </Stack>
    </Container>
  )
}
