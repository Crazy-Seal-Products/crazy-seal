import type { Metadata } from 'next'
import { Phone, FileCheck } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
  GoogleReviews,
  YouTubeEmbed,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

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

export default function ReviewsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              We Love Showing Off Your{' '}
              <span className="text-highlight">Crazy Seal Roofs!</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              We believe in the quality of our products, but the proof is in
              the pudding! Here&apos;s what our customers say.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── GOOGLE REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Crazy Reviews"
            heading="What Crazy Seal Customers Are Saying"
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                photo={t.photo}
                text={t.text}
              />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── SOUTHERN GINGER WORKSHOP ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Southern Ginger Workshop Tackles a Hybrid Wood / EPDM Rubber Installation"
            variant="dark"
          />
          <div className="max-w-3xl mx-auto mb-6">
            <YouTubeEmbed videoId="FhXV9ZaMFgA" variant="card" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2020/05/1920-For-Zach-1.jpg`}
              alt="Southern Ginger Workshop hybrid roof installation"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2020/05/1920-For-Zach-2.jpg`}
              alt="Southern Ginger Workshop finished Crazy Seal roof"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
          <blockquote className="max-w-3xl mx-auto text-center">
            <p className="text-white/80 text-base sm:text-lg leading-relaxed italic mb-3">
              &ldquo;All I can say is wow! This product is amazing, did you
              notice I was able to just coat right over bare wood? They call
              that a hybrid solution, when its all done, you cannot tell the
              difference between the varied materials. The main goal here is
              to make sure you have a solid clean surface to roll this
              solution onto. After that, you pretty much can&apos;t mess it
              up.&rdquo;
            </p>
            <footer className="text-highlight font-bold">
              &ndash; Zach Manring, Canton, GA
            </footer>
          </blockquote>
        </div>
      </Container>

      {/* ─── INDEPENDENT CONTRACTOR / DAN ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Independent Contractor Uses Crazy Seal Double Coat System to Seal Mobile Home Roof" />
          <div className="max-w-3xl mx-auto mb-6">
            <YouTubeEmbed videoId="iKBwav7coyc" variant="card" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/07/Side-To-Side-Metal.jpg`}
              alt="Mobile home metal roof sealed with Crazy Seal"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/07/Front-Metal-Before-After.jpg`}
              alt="Before and after of a metal mobile home roof with Crazy Seal"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
          <blockquote className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed italic mb-3">
              &ldquo;I&apos;m an independent contractor and I&apos;m always
              looking for good products to use. I came across Crazy Seal. I
              used it on a modular home that I was doing some work on and the
              people were having issues with the heat coming down on the roof
              and making it really hot. I used the Crazy Seal double coat
              application and sealed up different parts and cracks. It worked
              great. I loved the product. I&apos;d recommend it to
              anybody!&rdquo;
            </p>
            <footer className="text-primary font-bold">
              &ndash; Dan from Sarasota, FL
            </footer>
          </blockquote>
          <div className="max-w-3xl mx-auto mt-8">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Slide the Middle Bar Left & Right to See the Transformation
            </p>
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
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Failing EPDM Rubber RV Roof Replaced With Crazy Seal"
            variant="dark"
          />
          <div className="max-w-3xl mx-auto mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/09/Darrell-Cove-BDA-1.jpg`}
              alt="Darrell Cove's RV roof before, during, and after Crazy Seal"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
          <blockquote className="max-w-3xl mx-auto text-center mb-8">
            <p className="text-white/80 leading-relaxed italic mb-3">
              &ldquo;Every one of these EPDM roofs are a problem just waiting
              to happen. It&apos;s not if it&apos;s going to happen, it&apos;s
              when it&apos;s going to happen. And by the time you see the
              damage, it&apos;s too late. I had significant damage inside so I
              started looking for a product that I could use for my reroofing
              of my camper. The Crazy Seal website has videos and PDFs with
              perfectly clear instructions that anybody can follow. The Crazy
              Patch is like Crazy Caulk on steroids. It is just spectacular.
              Once I put that around the same seams over the Crazy Caulk, I
              was saying this is incredible because this will never, ever,
              ever leak. I will never have a problem with this again!
              There&apos;s a reason there&apos;s a 50-year warranty on this
              product. It&apos;ll be around a lot longer than I will and this
              camper will not have a leak in it. Support is over and above. I
              would behoove anybody that&apos;s going to be dealing with a
              roof, especially an RV roof, to use this product and you will
              not have to worry.&rdquo;
            </p>
            <footer className="text-highlight font-bold">
              &ndash; Darrell Cove from Pelham, NH
            </footer>
          </blockquote>
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Slide the Middle Bar Left & Right to See the Transformation
            </p>
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Carolinas Today Uses Crazy Seal Double Coat System to Seal Cargo Trailer Conversion" />
          <div className="max-w-3xl mx-auto mb-6">
            <YouTubeEmbed videoId="Sgh4MmtHioc" variant="card" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/09/Carolinas-2-Square.jpg`}
              alt="Cargo trailer conversion roof with Crazy Seal"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/09/Carolinas-Today-Wide.jpg`}
              alt="Carolinas Today stealth camper with Crazy Seal roof"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/09/Carolinas-Square-1.jpg`}
              alt="Finished Crazy Seal roof on cargo trailer"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
          <blockquote className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed italic mb-3">
              &ldquo;I applied the double coat system to my Cargo Trailer to
              Camper conversion (stealth camper with metal roof). I have
              noticed much cooler temps and can even put my hand on the roof
              in the middle of the day and not get burned. Crazy Seal really
              reflects the heat!&rdquo;
            </p>
            <footer className="text-primary font-bold">
              &ndash; Carolinas Today
            </footer>
          </blockquote>
        </div>
      </Container>

      {/* ─── DALLAS BEHRENS / DIRECT TO DECK ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Old Roof Made New With Crazy Tape & Direct to Deck System" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/09/Dallas-Behrens-BDA-2.jpg`}
              alt="Direct to deck installation before, during, and after"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2019/09/Dallas-Behrens-Full.jpg`}
              alt="Finished direct to deck Crazy Seal roof"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
          <blockquote className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 leading-relaxed italic mb-3">
              &ldquo;New wood installed! Seams caulked with Crazy Caulk and
              taped with your fabric tape!!! Next phase is install the Crazy
              Seal&hellip; Update: Installation of 3 coat kit went well!
              Installed 2 coats of gray then cut in vents and skylight and
              sealed. Applied white coat where AC units set. Installed
              AC&apos;s and then added last coat of white. Turned out great!
              Received a couple heavy rains and no leaks!! Pretty simple
              install!! Thanks Crazy Seal!! Your product worked great and made
              some of my concerns a simple, affordable and trouble free
              solution! Thank you guys.&rdquo;
            </p>
            <footer className="text-primary font-bold">
              &ndash; Dallas Behrens from Ohio
            </footer>
          </blockquote>
        </div>
      </Container>

      {/* ─── WARRANTY REMINDER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <FileCheck className="w-10 h-10 text-highlight mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3 max-w-3xl mx-auto">
            Remember to Submit Your Before & After Photos to Qualify for Our
            50 Year Crazy Seal Warranty!
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            If you have any videos or extra photos that you&apos;d like to
            share with us, please email us directly at{' '}
            <a
              href="mailto:support@crazyseal.com"
              className="text-highlight font-semibold hover:underline"
            >
              support@crazyseal.com
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/warranty" variant="accent" size="lg">
              Warranty Form
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
