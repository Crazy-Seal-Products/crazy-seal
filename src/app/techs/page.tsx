import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, DollarSign, MapPin, ArrowRight, CheckCircle, MessageCircle, GraduationCap, Banknote } from 'lucide-react'
import { Container, Stack, Heading, Text, Card, Grid } from '@/lib/design-system'
import { VideoHero } from '@/components/VideoHero'
import { CtaSection } from '@/components/CtaSection'
import { TechContactForm } from '@/components/forms/TechContactForm'

export const metadata: Metadata = {
  title: 'Become a Certified RV Armor Technician | RV ARMOR',
  description: 'Join the RV Armor team. Become a certified technician with nationwide opportunities, great pay, and travel.',
}

const SKILLS = [
  'Be a team player.',
  'Customer service oriented.',
  'Good carpentry skills.',
  'Be physically fit and familiar with the rigors of outdoor work.',
  'Be willing to travel a minimum of a 300 mile radius.',
  'Be capable of using PDF files and Google Drive.',
  'Have your own basic construction tools.',
  'Have a friendly personality.',
  'Have working capital to cover travel expenses from job to job.',
  'Be detail oriented. (This job requires attention to small finish detail.)',
  'Construction experience or professional RV maintenance experience.',
  'Have a vehicle appropriate for construction work, like a pickup truck or van.',
]

export default function TechsPage() {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <VideoHero
          heading="Apply for an"
          highlight="RV Armor Tech Opportunity"
          subheading="Want to work while traveling this beautiful country of ours? We are looking for like minded people to join our ever growing team. Full-time RV'ers are a great fit for us!"
          youtubeId="zv_pc1D0snI"
          imageAlt="RV Armor technician opportunities"
          badge="Now Hiring"
          variant="dark"
        />

        {/* Contact Form */}
        <section id="apply">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">
                Once received, you will be given details and an opportunity to apply for a position as an RV Armor technician.
              </Heading>
            </div>
            <div className="max-w-2xl mx-auto">
              <TechContactForm />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Why Work with RV Armor?</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
              {[
                { icon: DollarSign, title: 'Great Pay', desc: 'Our minimum payout to a technician is $1,150 per roof and goes up from there!' },
                { icon: MapPin, title: 'Travel the Country', desc: 'Work across the continental United States. See new places while building your career in a growing industry.' },
                { icon: Wrench, title: 'Professional Training', desc: 'Receive comprehensive training in our proprietary roofing process. We invest in our technicians to ensure quality.' },
              ].map((item) => (
                <Card key={item.title} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#5BA411]/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-[#5BA411]" />
                  </div>
                  <Heading level={4}>{item.title}</Heading>
                  <Text size="sm" className="!mb-0">{item.desc}</Text>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        {/* How to Get Started */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">How to Get Started</Heading>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
              {[
                { step: 1, icon: MessageCircle, title: 'Have a Chat', desc: 'The head of our team of technicians will reach out to you.' },
                { step: 2, icon: GraduationCap, title: 'Attend a Training', desc: 'Attend one of our trainings to learn how to install The RV Armor System.' },
                { step: 3, icon: Banknote, title: 'Start Earning', desc: 'Our minimum payout to a technician is $1,150 per roof and goes up from there!' },
              ].map((item) => (
                <Card key={item.step} className="text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#003365] text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <div className="pt-4">
                    <div className="w-14 h-14 rounded-full bg-[#003365]/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-[#003365]" />
                    </div>
                    <Heading level={4}>{item.title}</Heading>
                    <Text size="sm" className="!mb-0">{item.desc}</Text>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>
        </section>

        {/* 2026 Spring Training Callout */}
        <section className="section-bleed bg-gradient-to-r from-[#5BA411] to-[#4A870E] px-5 py-6 sm:p-6 md:p-10 text-center text-white">
          <Heading level={2} className="!text-white">
            Currently accepting applications for the 2026 Spring training classes.
          </Heading>
          <Text className="max-w-2xl mx-auto !text-white/90 !mb-6">
            Our company is growing, creating opportunity for people with handyman skills!
            Apply now and one of our team leaders will be in touch.
          </Text>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-[#5BA411] hover:bg-gray-100 transition-all shadow-md"
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </a>
        </section>

        {/* Skills Required */}
        <section>
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="text-center mb-8">
              <Heading level={2} className="!text-[#003365]">Skills RV Armor Techs Must Have</Heading>
            </div>
            <Card className="!p-6 md:!p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKILLS.map((skill) => (
                  <div key={skill} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#5BA411] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <CtaSection />
      </Stack>
    </Container>
  )
}
