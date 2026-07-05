import type { Metadata } from 'next'
import { Download, FileText, Phone, ShieldAlert } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Technical Data',
  description:
    'Technical data sheets and safety data sheets for every Crazy Seal product: Crazy Seal, Crazy Patch, Crazy Caulk, Crazy Clean, and Crazy Tape.',
}

const TECH_DATA_SHEETS = [
  {
    name: 'Crazy Seal Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Seal-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Patch Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Patch-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Caulk Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Caulk-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Clean Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Clean-Tech-Data-031720.pdf`,
  },
  {
    name: 'Crazy Tape Technical Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Tape-Tech-Data-031720.pdf`,
  },
]

const SAFETY_DATA_SHEETS = [
  {
    name: 'Crazy Caulk Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Caulk-SDS-03-20.pdf`,
  },
  {
    name: 'Crazy Patch Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Patch-SDS-03-20.pdf`,
  },
  {
    name: 'Crazy Seal Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Seal-SDS-03-20.pdf`,
  },
  {
    name: 'Crazy Clean Safety Data Sheet',
    href: `${MEDIA}/2020/05/Crazy-Clean-SDS-03-20.pdf`,
  },
]

function PdfLink({ name, href }: { name: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/8 group-hover:bg-primary/15 flex items-center justify-center flex-shrink-0 transition-colors">
        <FileText className="w-6 h-6 text-primary" />
      </div>
      <span className="font-semibold text-primary flex-1">{name}</span>
      <Download className="w-5 h-5 text-accent flex-shrink-0" />
    </a>
  )
}

export default function TechnicalDataPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Specs &amp; Documentation
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Technical Data
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Download the technical data sheets and safety data sheets for
              every product in the Crazy Seal Roofing System.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── TECHNICAL DATA SHEETS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Product Specifications"
            heading="Technical Data Sheets"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {TECH_DATA_SHEETS.map((sheet) => (
              <PdfLink key={sheet.name} name={sheet.name} href={sheet.href} />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── SAFETY DATA SHEETS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="text-center mb-6 md:mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary">
              Safety Data Sheets
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {SAFETY_DATA_SHEETS.map((sheet) => (
              <PdfLink key={sheet.name} name={sheet.name} href={sheet.href} />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden py-10 sm:py-16 px-5 sm:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Let&apos;s Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Have Any Questions? Our Crazy Seal Specialists Can Help!
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="white" size="lg">
              Get an Instant Quote
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
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
