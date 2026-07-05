import type { Metadata } from 'next'
import { ArrowRight, Download, Phone, ShieldCheck } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  LinkButton,
} from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Direct To Deck Installation',
  description:
    'Direct to deck installation instructions for the Crazy Seal roofing system, including downloadable PDFs and a full installation video for sealing directly over wood decking.',
}

const PDFS = [
  {
    title: 'Photo Guidelines',
    desc: 'How to photograph your project before and after for your 50 year warranty.',
    href: `${MEDIA}/2020/05/Photo-Guidelines.pdf`,
    image: `${MEDIA}/2020/05/Submit-Photos-for-Warranty.jpg`,
  },
  {
    title: 'Installation PDF',
    desc: 'The complete direct to deck installation instructions in PDF form.',
    href: `${MEDIA}/2023/06/Crazy-Seal-Direct-To-Deck-Installation.pdf`,
    image: `${MEDIA}/2019/06/Crazy-Seal-Installation-Cover-Small.jpg`,
  },
  {
    title: 'Tools PDF',
    desc: 'The full list of tools you will need to complete your installation.',
    href: `${MEDIA}/2020/03/Crazy-Seal-Tool-List.pdf`,
    image: `${MEDIA}/2020/03/Crazy-Seal-Tools-Full-scaled.jpg`,
  },
]

export default function DirectToDeckPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Installation Guide
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Direct to Deck Installation
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── DOWNLOADABLE PDFS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Downloadable PDF's" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {PDFS.map((pdf) => (
              <a
                key={pdf.title}
                href={pdf.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pdf.image}
                    alt={pdf.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-bold text-primary mb-1">{pdf.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{pdf.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </span>
                </div>
              </a>
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── FULL INSTALLATION VIDEO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Installation Videos"
            heading="Full Installation Video"
            subheading="Watch this full installation video that will take you through the entire installation process."
            variant="dark"
          />
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-gray-900">
              <iframe
                src="https://player.vimeo.com/video/379082202?title=0&portrait=0&byline=0"
                title="Crazy Seal direct to deck full installation video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── HYBRID INSTALLATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading
            heading={'"Hybrid" Installations'}
            subheading="If you are performing a hybrid installation with partial wood decking and partial in-tact rubber/EPDM/TPO membrane, please visit the membrane installation page for details on how to install directly to an existing membrane."
          />
          <LinkButton href="/installation/membrane-roof" variant="primary" size="lg">
            Membrane Installation
            <ArrowRight className="w-5 h-5" />
          </LinkButton>
        </div>
      </Container>

      {/* ─── WARRANTY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 items-center">
            <div className="flex justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/50-Year-Warranty-Space-600x600.png`}
                alt="Crazy Seal 50 year warranty badge"
                className="w-full max-w-[220px] h-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                Finished With Your Installation? Great Job! Now It&apos;s Time
                to Submit Your Warranty!
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                We stand behind our products with a 50 year product warranty.
                Once you&apos;ve purchased a kit, you have 90 days to apply
                your new Crazy Seal system to your application. Within 90 days
                of purchase, simply fill out our warranty form with before and
                after pictures of your project and you will be covered!
              </p>
              <LinkButton href="/warranty" variant="accent" size="lg">
                <ShieldCheck className="w-5 h-5" />
                Submit Warranty Form
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3">
            Let&apos;s Get in Touch
          </h2>
          <p className="text-gray-500 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            Have any questions? Our Crazy Seal specialists can help!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="primary" size="lg">
              Get an Instant Quote
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              (800) 963-0131
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
