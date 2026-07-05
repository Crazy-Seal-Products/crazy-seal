import type { Metadata } from 'next'
import { ArrowRight, Phone } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { VimeoEmbed } from './VimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'About Crazy Seal',
  description:
    'Born into roofing, innovative in spirit. Meet Lee and Carol Thaxton, the 3rd generation roofers behind the Crazy Seal DIY seamless roofing system.',
}

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
    text: "I loved the product. I'd recommend it to anybody!",
  },
  {
    name: 'Philip Posey, Tuscumbia, AL',
    photo: `${MEDIA}/2021/11/Philip-Posey-400x400-1.jpg`,
    text: 'We could not be more pleased with the Crazy Seal product.',
  },
  {
    name: 'Douglas Evans, Overton, NV',
    photo: `${MEDIA}/2020/05/Doug-Evans-400x400.jpg`,
    text: 'After viewing the videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              A Letter From the Owners
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              About Us
            </h1>
            <p className="text-lg sm:text-xl text-highlight font-semibold uppercase tracking-wide">
              Born Into Roofing. Innovative in Spirit!
            </p>
          </div>
        </div>
      </Container>

      {/* ─── BORN INTO ROOFING ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <SectionHeading
                heading="I Was Born Into the Roofing Business. It's in My Blood."
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                I am a 3rd generation roofer. My Grandfather (also Lee
                Thaxton), started Thaxton Roofers, Inc. in Northfield, Ohio
                back in 1946. My Uncle and Cousin still run that business
                today.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                My father was a roofing contractor. My brother and uncles and
                cousins are in the business. I guess you can say that our name
                says all you need to know. Our name is a derivative of
                Thatcher or Thatch for short. Thatching literally means
                roofing. Here&apos;s the definition: a material, as straw,
                rushes, leaves, or the like, used to cover roofs. Eventually,
                our name evolved and became Thaxton.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                With over 70 years of experience behind us, we know a thing or
                two about roofing.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Although I love my family, I&apos;ve always leaned towards
                innovation and creating new paths. While I can appreciate
                traditional roofing, as it&apos;s been a mainstay in our
                family for decades, I ventured out.
              </p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/09/Lee-Pointed-Out.jpg`}
                alt="Lee Thaxton with the Thaxton Roofers crew in 1982"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
              <p className="text-sm text-gray-500 text-center mt-3">
                Lee Thaxton, 3rd from left, 1982
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── NO RV'ER LEFT BEHIND ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="order-2 md:order-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/070-Far-Off-Roll-1.jpg`}
                alt="Applying the Crazy Seal roofing system to an RV roof"
                className="rounded-2xl shadow-2xl ring-1 ring-white/10 w-full h-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <SectionHeading
                heading="No RV'er Left Behind"
                align="left"
                variant="dark"
                className="mb-4"
              />
              <p className="text-white/70 leading-relaxed mb-4">
                Carol and I are fellow RV&apos;ers and travel most of the year
                in our motorhome and work from the road. It&apos;s a great way
                to see this great country, and with the ability to have
                internet virtually anywhere, it makes it easy to stay on top
                of our businesses.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                Carol and I are not new to RV roofing. We created the first
                nationwide, mobile service company that would offer a
                seamless, maintenance free roofing system. We also created the
                first true Lifetime Material and Labor Warranty for roofing
                RV&apos;s.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                Even though our company has done thousands of RV roofs and
                dealt with thousands of people, it always troubled us that not
                every RV or RV&apos;er was a good fit for that system. We
                would, and still get hundreds of requests each year for DIY
                kits. The problem with that is just how difficult it is to
                work with our roofing system. It&apos;s not easily installed
                by the average person. It&apos;s a solvent based system, needs
                primer, and truly needs to be installed by trained certified
                techs.
              </p>
              <p className="text-white/70 leading-relaxed">
                We had to look at making something different, something
                special, that would benefit the average DIY&apos;er. We
                recognize people need and want a good roofing solution. Not
                the inferior products you find at most retailers. We spent
                years working with chemical specialists, until we found and
                tested a formula that would stand the test of time.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── THE CRAZY SEAL ROOFING SOLUTION ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <SectionHeading
                heading="The Crazy Seal Roofing Solution"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                Crazy Seal is the most advanced fluid applied roofing membrane
                ever developed. It&apos;s a patented, superior grade
                fiber-infused silicone. It&apos;s designed with 3 products
                (Crazy Caulk, Crazy Patch, and Crazy Seal), that when used
                together create an incredibly tough, seamless, maintenance
                free, roof membrane.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Crazy Seal is designed to go over multiple surfaces without
                the need for a primer. That means you can go over wood
                decking, rubber, fiberglass, and more. Crazy Seal bonds
                directly to just about any roof surface. Our guided,
                do-it-yourself roofing system comes with step by step
                application instructions to help you create a professional
                finish.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Crazy Seal offers a different, more straightforward twist on a
                liquid-type roof product, which makes it installable by any
                capable person but stout enough to be covered by a 50-year
                product warranty.
              </p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/10/09_Double-300-500-White-1024x485.png`}
                alt="Crazy Seal Double Layer roofing kit"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── 70+ YEARS OF ROOFING KNOWLEDGE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 lg:gap-10 items-center">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/50-Year-Warranty-Space-600x600.png`}
                alt="Crazy Seal 50 year warranty badge"
                className="w-full max-w-xs h-auto"
              />
            </div>
            <div>
              <SectionHeading
                heading="70+ Years of Roofing Knowledge"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                You get our 70 plus years of roofing knowledge, plus all the
                experience of installing thousands of RV roofs. We give you
                both a PDF installation guide, and a suite of installation
                videos to help you succeed with your project.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                You won&apos;t find Crazy Seal at any stores. We manufacture
                and ship directly to you. We make it easy to figure out how
                much product you will need for your project.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We back it up with a 50 year warranty. We even make it easy to
                register your warranty right here on our website.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Not just for RV&apos;s &mdash; Crazy Seal was designed for
                small projects. We designed Crazy Seal to be good on virtually
                any flat surface. If you have a small project, there&apos;s
                pretty good chance Crazy Seal will work.
              </p>
              <div className="flex flex-wrap gap-3">
                <LinkButton href="/installation" variant="primary" size="md">
                  See Installation Guides
                  <ArrowRight className="w-4 h-4" />
                </LinkButton>
                <LinkButton
                  href="/warranty"
                  variant="outline"
                  size="md"
                  className="border-primary text-primary"
                >
                  Learn About Our Warranty
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── KNOWING WHO YOU ARE DEALING WITH ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 lg:gap-10 items-center">
            <div>
              <SectionHeading
                heading="It's All About Knowing Who You Are Dealing With"
                align="left"
                variant="dark"
                className="mb-4"
              />
              <p className="text-white/70 leading-relaxed mb-4">
                Crazy Seal is the most advanced seamless roof system ever
                developed.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                You can buy with confidence, because we have a long track
                record in traditional roofing, own a successful RV roofing
                business, and genuinely care about delivering the best
                products available.
              </p>
              <p className="text-white/70 leading-relaxed mb-6">
                I wish all of you great success on your roof project.
              </p>
              <p className="text-white font-bold text-lg leading-snug">
                Lee Thaxton
              </p>
              <p className="text-white/60 text-sm uppercase tracking-wide">
                President, Crazy Seal Products, Inc.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/09/Lee-and-Carol.jpg`}
                alt="Lee and Carol Thaxton"
                className="rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-xs h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WANT TO INTERVIEW LEE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Hear From the Founder"
            heading="Want to Interview Lee?"
          />
          <div className="max-w-3xl mx-auto">
            <VimeoEmbed
              videoId="1060563463"
              thumbnail={`${MEDIA}/2025/03/Lee-Thaxton-Episode.jpg`}
              title="Lee Thaxton interview episode"
            />
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                photo={t.photo}
                text={t.text}
              />
            ))}
          </Grid>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Let&apos;s Get in Touch
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            Have any questions? Our Crazy Seal specialists can help!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
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
