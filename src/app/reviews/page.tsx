import type { Metadata } from 'next'
import {
  Phone,
  FileCheck,
  Quote,
  Star,
  ShieldCheck,
  Camera,
  MoveHorizontal,
  Mail,
} from 'lucide-react'
import {
  Container,
  SectionHeading,
  TestimonialCard,
  LinkButton,
  GoogleReviews,
  YouTubeEmbed,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { GlowOrb, Marquee } from '@/components/motion'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Reviews',
  description:
    'We love showing off your Crazy Seal roofs! Real reviews, photos, and before & after transformations from Crazy Seal customers across the country.',
}

const TESTIMONIALS = [
  {
    name: 'David Vincent from Key Largo, FL',
    photo: `${MEDIA}/2020/05/David-Vincent.jpg`,
    text: "THANK YOU for a great and reassuring experience! I have already referred this system to 3 family and friends. I'm looking forward to a very long, assured feeling of protection from water intrusion. I also experienced exceptional customer support!",
  },
  {
    name: 'Philip Posey from Tuscumbia, AL',
    photo: `${MEDIA}/2021/11/Philip-Posey-400x400-1.jpg`,
    text: 'We could not be more pleased with the Crazy Seal product. We are expecting to have many years of enjoyment from our sunroom now that we do not have to worry about leaks.',
  },
  {
    name: 'Douglas Evans from Overton, NV',
    photo: `${MEDIA}/2020/05/Doug-Evans-400x400.jpg`,
    text: 'After viewing the DIY videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
  {
    name: 'Mark Milstead from Leroy, AL',
    photo: `${MEDIA}/2020/05/Mark-Milstead.jpg`,
    text: 'Installation was not bad with easy to follow videos on website. Seems to be a great product. I will put it to the test as I plan on using my RV a bunch this year, thanks!',
  },
  {
    name: 'Kirk Chrysler from Allendale, MI',
    photo: `${MEDIA}/2020/05/Kirk-Chrysler.jpg`,
    text: 'Great experience, took a little getting use to the product but no complaints. Great delivery, products and instructions!',
  },
  {
    name: 'Jason Willams from Bainbridge, GA',
    text: 'Incredibly simple install with outstanding finishing results.',
  },
  {
    name: 'Darren Lindsey from Roseville, CA',
    photo: `${MEDIA}/2020/05/Darren-Lindsey-Square.jpg`,
    text: 'Application was a breeze! I love how rubbery it feels.',
  },
  {
    name: 'William Lewis from Cheyenne, WY',
    photo: `${MEDIA}/2020/06/William-Lewis-Square-2.jpg`,
    text: 'Labor intensive, but rewarding!',
  },
  {
    name: 'Robert Davies',
    photo: `${MEDIA}/2021/04/Robert-Davies.jpg`,
    text: 'Very satisfied. Best product ever! Would recommend it to anyone looking to be "Once & Done"',
  },
  {
    name: 'David Swanson from Castro Valley, CA',
    photo: `${MEDIA}/2020/06/David-Swanson-Square.jpg`,
    text: 'The process was as easy as it appeared to be in the instructional videos.',
  },
  {
    name: 'Tom Kedzie',
    photo: `${MEDIA}/2021/04/Tom-Kedzie.jpg`,
    text: 'Lots of prep work but the install was easy. I love the final product! No more worry when it rains. Thanks',
  },
  {
    name: 'Dennis Van Dusseldorp',
    photo: `${MEDIA}/2021/04/Van-Dusseldorp.jpg`,
    text: 'Great product, went on like advertised and ended up with a great looking roof that will last a long time.',
  },
  {
    name: 'Steven Tuttle',
    photo: `${MEDIA}/2021/04/Steven-Tuttle.jpg`,
    text: "The support videos are outstanding. Product support and customer service is fantastic. And the product application was very easy. I've already recommended this to some of my camping friends.",
  },
  {
    name: 'Monty Leaird',
    photo: `${MEDIA}/2021/04/Monty-Leaird.jpg`,
    text: 'Applying Crazy Seal was easy and once it cured it felt very durable. I have a lot of confidence in the product now and am not worried about my roof leaking.',
  },
  {
    name: 'Melvin Nixon',
    photo: `${MEDIA}/2021/04/MELVIN-NIXON.jpg`,
    text: 'I could tell by how well it adhered that it is very strong and flexible. It applied easy. Make sure you use gloves! I am an independent contractor and this stuff is different (in a good way) than anything I have ever used. Very impressed so far.',
  },
  {
    name: 'John Mooney',
    photo: `${MEDIA}/2021/04/John-Mooney.jpg`,
    text: 'Awesome customer service! Product fairly easy to use, videos are tremendously helpful. Looking forward to years of maintenance free service.',
  },
  {
    name: 'Elin Mac Anbhaird',
    photo: `${MEDIA}/2021/04/Elin-Mac-anbhaird.jpg`,
    text: 'It was easier than I thought!!',
  },
  {
    name: 'Doug Pennington',
    photo: `${MEDIA}/2021/04/DOUG-PENNINGTON-1.jpg`,
    text: 'Unbelievable product!',
  },
  {
    name: 'David Hutchins',
    photo: `${MEDIA}/2021/04/David-Hutchins.jpg`,
    text: 'Very happy with the product and the customer service is second to none. All the work is in the prep. Take your time with that and everything will go well.',
  },
  {
    name: 'Brian Schwartztrauber',
    photo: `${MEDIA}/2021/04/Brian-Schwartztrauber.jpg`,
    text: 'Great product to work with. Look forward to enjoying my maintenance free roof!',
  },
  {
    name: 'Brian Mitchell',
    photo: `${MEDIA}/2021/04/Brian-Mitchell.jpg`,
    text: 'Pretty easy install. Followed the directions exactly as prescribed and looks great. Water beads up on the roof and just sheets off now. Very satisfied with how easy it was.',
  },
  {
    name: 'Asa Lawler',
    photo: `${MEDIA}/2021/04/Asa-Lawler.jpg`,
    text: 'Very easy installation great product and so far looks excellent',
  },
  {
    name: 'Aaron Ruslander',
    photo: `${MEDIA}/2021/04/Aaron-Ruslander.jpg`,
    text: 'Very pleased with the process, want to thank you for your immediate attention when part of the shipment was destroyed.',
  },
  {
    name: 'Vicky Henderson',
    photo: `${MEDIA}/2021/04/Vicky-Henderson.jpg`,
    text: "I followed instructions to a T and did more prep work than needed, but I wanted to make sure everything went on as smooth as can be. And it did! 2 coats later, I had a very tight seal. I was very impressed with the outcome and it didn't break the bank.",
  },
  {
    name: 'Stan Wilson',
    photo: `${MEDIA}/2021/04/Stan-Wilson.jpg`,
    text: "Amazing product! Easy to apply. I live close to the coast, and my aluminum roof had corroded. I'm glad I decided to remove the air conditioner, as the aluminum was completely dissolved in 2 spots! I slipped a new sheet of aluminum under the existing roof through the opening. Used crazy caulk between the layers. Used pop rivets to sandwich the layers together, then both crazy caulk and crazy seal over everything. I now have a truly one piece waterproof roof! Thank You again!",
  },
  {
    name: 'Terri Sessoms',
    photo: `${MEDIA}/2021/04/Teri-Sessoms.jpg`,
    text: 'The diy application was just as described. Excellent instructions and the videos were super helpful. Amber was very user friendly and answered all of our questions each time we called. This is a houseboat and several people on our marina dock are very interested in using this product. The strength of our rooftop has never been so strong. It has been thru 2 hurricanes and not one leak! Thank you!',
  },
]

// Short, punchy lines for the ticker under the hero (taken from the reviews above).
const TICKER = TESTIMONIALS.filter((t) => t.photo && t.text.length <= 80)

const HERO_TRUST = [
  { icon: Star, label: 'Real customer reviews' },
  { icon: Camera, label: 'Before & after photos' },
  { icon: ShieldCheck, label: '50 Year Warranty' },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

/** Pull-quote used by the case-study sections. */
function CaseQuote({
  children,
  author,
  dark = false,
}: {
  children: React.ReactNode
  author: string
  dark?: boolean
}) {
  return (
    <blockquote
      className={`relative overflow-hidden rounded-3xl px-6 py-7 sm:px-8 ${
        dark
          ? 'bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm'
          : 'bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm'
      }`}
    >
      <Quote
        aria-hidden="true"
        className={`absolute right-5 top-5 h-12 w-12 rotate-180 ${dark ? 'text-white/10' : 'text-accent/15'}`}
      />
      <div className="mb-3 flex gap-0.5" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-highlight text-highlight" />
        ))}
      </div>
      <p
        className={`relative text-base sm:text-lg leading-relaxed italic mb-4 ${
          dark ? 'text-white/85' : 'text-gray-600'
        }`}
      >
        {children}
      </p>
      <footer className={`relative font-bold ${dark ? 'text-highlight' : 'text-primary'}`}>
        &ndash; {author}
      </footer>
    </blockquote>
  )
}

/** Rounded photo tile with a hover zoom. */
function CasePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
    </div>
  )
}

/** "Drag the bar" label above a pair of before/after sliders. */
function SlideHint({ dark = false }: { dark?: boolean }) {
  return (
    <p
      className={`mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.18em] ${
        dark ? 'text-highlight' : 'text-accent-dark'
      }`}
    >
      <MoveHorizontal className="h-4 w-4" />
      Drag the bar to see the transformation
    </p>
  )
}

export default function ReviewsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 -top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-28 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-12 sm:px-6 sm:py-14 lg:px-12 lg:py-20 text-center">
            <h1
              {...enter(100)}
              className="animate-fade-up text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-5 text-balance max-w-4xl mx-auto"
            >
              We Love Showing Off Your{' '}
              <span className="text-shimmer-highlight">Crazy Seal Roofs!</span>
            </h1>
            <p
              {...enter(180)}
              className="animate-fade-up text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              We believe in our products — but the proof is in the pudding. Here&apos;s what our
              customers say.
            </p>
            <ul
              {...enter(260)}
              className="animate-fade-up mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3"
            >
              {HERO_TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3.5 w-3.5 text-accent-light" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── QUOTE TICKER ─── */}
      <Container size="xl" className="pt-4 md:pt-6">
        <Marquee duration={70}>
          {TICKER.map((t) => (
            <span
              key={t.name}
              className="mx-1.5 inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm text-gray-600 shadow-sm ring-1 ring-primary/[0.08]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.photo} alt="" aria-hidden="true" className="h-7 w-7 rounded-full object-cover" />
              <span className="font-semibold text-primary">&ldquo;{t.text}&rdquo;</span>
              <span className="text-gray-400">&ndash; {t.name.split(' from ')[0]}</span>
            </span>
          ))}
        </Marquee>
      </Container>

      {/* ─── GOOGLE REVIEWS ─── */}
      <Container size="xl" className="pt-4 md:pt-6">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <GoogleReviews
            featurableId={process.env.NEXT_PUBLIC_FEATURABLE_WIDGET_ID}
            minRating={5}
            maxReviews={9}
            carouselSpeed={8000}
            accentColor="#003365"
          />
        </div>
      </Container>

      {/* ─── WRITTEN TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Crazy Reviews"
            heading="What Crazy Seal Customers Are Saying"
          />
          <div
            data-reveal-stagger
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid"
          >
            {TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                photo={t.photo}
                text={t.text}
                className="p-5 md:p-6"
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── SOUTHERN GINGER WORKSHOP ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Hybrid Wood / EPDM"
            heading="Southern Ginger Workshop Tackles a Hybrid Wood / EPDM Rubber Installation"
            variant="dark"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
              />
              <div className="relative rounded-2xl shadow-2xl ring-1 ring-white/15">
                <YouTubeEmbed videoId="FhXV9ZaMFgA" variant="card" />
              </div>
            </div>
            <CaseQuote author="Zach Manring, Canton, GA" dark>
              &ldquo;All I can say is wow! This product is amazing, did you notice I was able to just
              coat right over bare wood? They call that a hybrid solution, when its all done, you
              cannot tell the difference between the varied materials. The main goal here is to
              make sure you have a solid clean surface to roll this solution onto. After that, you
              pretty much can&apos;t mess it up.&rdquo;
            </CaseQuote>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-6xl mx-auto mt-6">
            <CasePhoto
              src={`${MEDIA}/2020/05/1920-For-Zach-1.jpg`}
              alt="Southern Ginger Workshop hybrid roof installation"
            />
            <CasePhoto
              src={`${MEDIA}/2020/05/1920-For-Zach-2.jpg`}
              alt="Southern Ginger Workshop finished Crazy Seal roof"
            />
          </div>
        </div>
      </Container>

      {/* ─── INDEPENDENT CONTRACTOR / DAN ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Double Coat System"
            heading="Independent Contractor Uses Crazy Seal Double Coat System to Seal Mobile Home Roof"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              <div className="relative rounded-2xl shadow-xl ring-1 ring-primary/10">
                <YouTubeEmbed videoId="iKBwav7coyc" variant="card" />
              </div>
            </div>
            <CaseQuote author="Dan from Sarasota, FL">
              &ldquo;I&apos;m an independent contractor and I&apos;m always looking for good products
              to use. I came across Crazy Seal. I used it on a modular home that I was doing some
              work on and the people were having issues with the heat coming down on the roof and
              making it really hot. I used the Crazy Seal double coat application and sealed up
              different parts and cracks. It worked great. I loved the product. I&apos;d recommend
              it to anybody!&rdquo;
            </CaseQuote>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-6xl mx-auto mt-6">
            <CasePhoto
              src={`${MEDIA}/2019/07/Side-To-Side-Metal.jpg`}
              alt="Mobile home metal roof sealed with Crazy Seal"
            />
            <CasePhoto
              src={`${MEDIA}/2019/07/Front-Metal-Before-After.jpg`}
              alt="Before and after of a metal mobile home roof with Crazy Seal"
            />
          </div>
          <div className="max-w-6xl mx-auto mt-10">
            <SlideHint />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BeforeAfterSlider
                beforeSrc={`${MEDIA}/2019/07/Front-Sunroom-Mobile-Home-Before.jpg`}
                afterSrc={`${MEDIA}/2019/07/Front-Sunroom-Mobile-Home-After.jpg`}
              />
              <BeforeAfterSlider
                beforeSrc={`${MEDIA}/2019/07/Side-Sunroom-Mobile-Home-Before.jpg`}
                afterSrc={`${MEDIA}/2019/07/Side-Sunroom-Mobile-Home-After.jpg`}
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── DARRELL COVE / FAILING EPDM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="RV Roof Rescue"
            heading="Failing EPDM Rubber RV Roof Replaced With Crazy Seal"
            variant="dark"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
              />
              <div className="relative">
                <CasePhoto
                  src={`${MEDIA}/2019/09/Darrell-Cove-BDA-1.jpg`}
                  alt="Darrell Cove's RV roof before, during, and after Crazy Seal"
                />
              </div>
            </div>
            <CaseQuote author="Darrell Cove from Pelham, NH" dark>
              &ldquo;Every one of these EPDM roofs are a problem just waiting to happen. It&apos;s
              not if it&apos;s going to happen, it&apos;s when&hellip; The Crazy Seal website has
              videos and PDFs with perfectly clear instructions that anybody can follow. The Crazy
              Patch is like Crazy Caulk on steroids&hellip; this will never, ever, ever leak.
              There&apos;s a reason there&apos;s a 50-year warranty on this product. Support is
              over and above.&rdquo;
            </CaseQuote>
          </div>
          <div className="max-w-6xl mx-auto mt-10">
            <SlideHint dark />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BeforeAfterSlider
                beforeSrc={`${MEDIA}/2019/09/Darrell-Cove-Before-1.jpg`}
                afterSrc={`${MEDIA}/2019/09/Darrell-Cove-After-1.jpg`}
              />
              <BeforeAfterSlider
                beforeSrc={`${MEDIA}/2019/09/Darrell-Cove-Before-2.jpg`}
                afterSrc={`${MEDIA}/2019/09/Darrell-Cove-After-2.jpg`}
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CAROLINAS TODAY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Cargo Trailer Conversion"
            heading="Carolinas Today Uses Crazy Seal Double Coat System to Seal Cargo Trailer Conversion"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              <div className="relative rounded-2xl shadow-xl ring-1 ring-primary/10">
                <YouTubeEmbed videoId="Sgh4MmtHioc" variant="card" />
              </div>
            </div>
            <CaseQuote author="Carolinas Today">
              &ldquo;I applied the double coat system to my Cargo Trailer to Camper conversion
              (stealth camper with metal roof). I have noticed much cooler temps and can even put
              my hand on the roof in the middle of the day and not get burned. Crazy Seal really
              reflects the heat!&rdquo;
            </CaseQuote>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-6xl mx-auto mt-6">
            <CasePhoto
              src={`${MEDIA}/2019/09/Carolinas-2-Square.jpg`}
              alt="Cargo trailer conversion roof with Crazy Seal"
            />
            <CasePhoto
              src={`${MEDIA}/2019/09/Carolinas-Today-Wide.jpg`}
              alt="Carolinas Today stealth camper with Crazy Seal roof"
            />
            <CasePhoto
              src={`${MEDIA}/2019/09/Carolinas-Square-1.jpg`}
              alt="Finished Crazy Seal roof on cargo trailer"
            />
          </div>
        </div>
      </Container>

      {/* ─── DALLAS BEHRENS / DIRECT TO DECK ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Direct to Deck"
            heading="Old Roof Made New With Crazy Tape & Direct to Deck System"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-6xl mx-auto mb-6">
            <CasePhoto
              src={`${MEDIA}/2019/09/Dallas-Behrens-BDA-2.jpg`}
              alt="Direct to deck installation before, during, and after"
            />
            <CasePhoto
              src={`${MEDIA}/2019/09/Dallas-Behrens-Full.jpg`}
              alt="Finished direct to deck Crazy Seal roof"
            />
          </div>
          <div className="max-w-3xl mx-auto">
            <CaseQuote author="Dallas Behrens from Ohio">
              &ldquo;New wood installed! Seams caulked with Crazy Caulk and taped with your fabric
              tape!!! &hellip; Installation of 3 coat kit went well! Installed 2 coats of gray then
              cut in vents and skylight and sealed. Applied white coat where AC units set.
              Installed AC&apos;s and then added last coat of white. Turned out great! Received a
              couple heavy rains and no leaks!! Pretty simple install!! Thanks Crazy Seal!!&rdquo;
            </CaseQuote>
          </div>
        </div>
      </Container>

      {/* ─── WARRANTY REMINDER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 md:p-10 shadow-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-highlight/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
            />
            <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-10 text-center lg:text-left">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-highlight text-primary shadow-glow-highlight animate-float">
                <FileCheck className="h-8 w-8" />
              </span>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 text-balance">
                  Remember to Submit Your Before &amp; After Photos to Qualify for Our 50 Year
                  Crazy Seal Warranty!
                </h2>
                <p className="text-white/75 text-base sm:text-lg">
                  Extra videos or photos to share? Email us at{' '}
                  <a
                    href="mailto:support@crazyseal.com"
                    className="inline-flex items-center gap-1 text-highlight font-semibold hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    support@crazyseal.com
                  </a>
                  .
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:flex-col lg:items-stretch">
                <LinkButton href="/warranty" variant="accent" size="lg">
                  Warranty Form
                </LinkButton>
                <LinkButton href="/kit-builder" variant="white" size="lg">
                  See Kit Pricing
                </LinkButton>
                <a
                  href="tel:8009630131"
                  className="flex items-center justify-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
                >
                  <Phone className="w-5 h-5 text-accent-light" />
                  (800) 963-0131
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── LEAD CAPTURE ─── */}
      <LeadCaptureSection
        sourcePage="reviews"
        heading="Ready for a Roof Like These?"
        subheading="Tell us about your project and a specialist will build the perfect kit with you — just like the customers above."
      />
    </>
  )
}
