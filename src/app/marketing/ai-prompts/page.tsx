import type { Metadata } from 'next'
import { ArrowRight, Bot, ExternalLink } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'AI Prompts',
  description:
    'AI prompts for marketing your Crazy Seal business. Use these prompts with any Artificial Intelligence platform to teach it what you are doing as a professional with Crazy Seal and create custom assets.',
}

const AD_COPY_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to my customers that own [Product Type | RV's, Commercial Buildings, etc.].

My business Name is [Business Name], and our phone number is [Phone Number].

Generate custom ad copy for social media stating that we now offer the Crazy Seal Roofing System to potential customers.

Highlight the unique and revolutionary features of this fluid-applied seamless roofing system that make it stand out in the market. Focus on the system's key benefits, such as its ability to eliminate water intrusion, provide long-term protection, and its versatility in being applied to various types of roofs, including RVs, tractor trailers, residential flat roofs, and commercial flat roofs.

Discuss the three-part sealing system\u2014Crazy Caulk, Crazy Patch, and Crazy Seal\u2014that work together to create a single, chemically bonded membrane. Describe how the advanced materials, such as high-grade silicone infused with fibers, result in a waterproof, reflective, scratch-resistant, flexible, and durable membrane. Explain how the fiber infusion acts like embedding rebar in concrete, strengthening the roofing membrane.

Highlight the system's superior resistance to UV radiation, chalking, and fading over time, as well as its ability to stay clean easily due to its stain-resistant properties. Describe how Crazy Seal uses pharmaceutical-grade components for strict purity and quality.

Emphasize the environmental friendliness of the product, which uses VOC-exempt silicon-based solvents and avoids cheap fillers like talc and calcium carbonate. This ensures higher quality and longer-lasting performance against tough UV rays and other weather conditions.

Mention Crazy Seal's exceptional energy efficiency, which helps reduce roof temperature, lower internal temperatures, and decrease energy consumption. Explain how the system's reflectivity can result in immediate reductions in air conditioning usage.

Describe how the Crazy Seal system is composed of 94.2% by weight silicon-containing raw materials, offering superior longevity and performance compared to competitors. Explain how the system's base formulation bonds seamlessly to form a single, custom-fit roofing membrane that provides scratch resistance, flexibility, and toughness.

Stress the extensive support provided by the company and the peace of mind offered by the 50-year product warranty, which is transferable to a new owner. This long-term protection makes Crazy Seal an excellent investment for property owners looking to safeguard their assets.

Incorporate these points into your ad copy and marketing materials to showcase the quality, durability, and long-lasting protection that the Crazy Seal roofing system provides to property owners.`

const EMAIL_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to customers who own [Product Type | RVs, Commercial Buildings, etc.].

My business name is [Business Name], and our phone number is [Phone Number].

Create a string of emails I can use to inform potential customers that I now offer the Crazy Seal Roofing System. The emails should highlight the unique and revolutionary features of this fluid-applied seamless roofing system that set it apart in the market. Focus on the system's key benefits, such as its ability to eliminate water intrusion, provide long-term protection, and its versatility in being applied to various types of roofs, including RVs, tractor trailers, residential flat roofs, and commercial flat roofs.

Discuss the three-part sealing system\u2014Crazy Caulk, Crazy Patch, and Crazy Seal\u2014that work together to create a single, chemically bonded membrane. Describe how the advanced materials, such as high-grade silicone infused with fibers, create a waterproof, reflective, scratch-resistant, flexible, and durable membrane. Explain how the fiber infusion acts like embedding rebar in concrete, strengthening the roofing membrane.

Highlight the system's superior resistance to UV radiation, chalking, and fading over time, as well as its ability to stay clean easily due to its stain-resistant properties. Describe how Crazy Seal uses pharmaceutical-grade components for strict purity and quality.

Emphasize the environmental friendliness of the product, which uses VOC-exempt silicon-based solvents and avoids cheap fillers like talc and calcium carbonate, ensuring higher quality and longer-lasting performance against tough UV rays and other weather conditions.

Mention Crazy Seal's exceptional energy efficiency, which helps reduce roof temperature, lower internal temperatures, and decrease energy consumption. Explain how the system's reflectivity can result in immediate reductions in air conditioning usage.

Describe how the Crazy Seal system is composed of high-grade silicon-containing raw materials, offering superior longevity and performance compared to competitors. Explain how the system's base formulation bonds seamlessly to form a single, custom-fit roofing membrane that provides scratch resistance, flexibility, and toughness.

Include information about the extensive support provided by the company and the peace of mind offered by the 50-year product warranty on materials, which is transferable to a new owner. This long-term protection makes Crazy Seal an excellent investment for property owners looking to safeguard their assets.

Incorporate these points into the string of emails to effectively showcase the quality, durability, and long-lasting protection that the Crazy Seal roofing system provides to property owners.`

const ANY_CONTENT_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to my customers that own [Product Type | RV's, Commercial Buildings, etc.].

My business Name is [Business Name], and our phone number is [Phone Number].

Generate [custom content requirement].

Highlight the unique and revolutionary features of this fluid-applied seamless roofing system that make it stand out in the market. Focus on the system's key benefits, such as its ability to eliminate water intrusion, provide long-term protection, and its versatility in being applied to various types of roofs, including RVs, tractor trailers, residential flat roofs, and commercial flat roofs.

Discuss the three-part sealing system\u2014Crazy Caulk, Crazy Patch, and Crazy Seal\u2014that work together to create a single, chemically bonded membrane. Describe how the advanced materials, such as high-grade silicone infused with fibers, result in a waterproof, reflective, scratch-resistant, flexible, and durable membrane. Explain how the fiber infusion acts like embedding rebar in concrete, strengthening the roofing membrane.

Highlight the system's superior resistance to UV radiation, chalking, and fading over time, as well as its ability to stay clean easily due to its stain-resistant properties. Describe how Crazy Seal uses pharmaceutical-grade components for strict purity and quality.

Emphasize the environmental friendliness of the product, which uses VOC-exempt silicon-based solvents and avoids cheap fillers like talc and calcium carbonate. This ensures higher quality and longer-lasting performance against tough UV rays and other weather conditions.

Mention Crazy Seal's exceptional energy efficiency, which helps reduce roof temperature, lower internal temperatures, and decrease energy consumption. Explain how the system's reflectivity can result in immediate reductions in air conditioning usage.

Describe how the Crazy Seal system is composed of 94.2% by weight silicon-containing raw materials, offering superior longevity and performance compared to competitors. Explain how the system's base formulation bonds seamlessly to form a single, custom-fit roofing membrane that provides scratch resistance, flexibility, and toughness.

Stress the extensive support provided by the company and the peace of mind offered by the 50-year product warranty, which is transferable to a new owner. This long-term protection makes Crazy Seal an excellent investment for property owners looking to safeguard their assets.

Incorporate these points into your ad copy and marketing materials to showcase the quality, durability, and long-lasting protection that the Crazy Seal roofing system provides to property owners.`

const PROMPTS = [
  { heading: 'AI Prompt for Ad Copy', text: AD_COPY_PROMPT },
  { heading: 'AI Prompt for Email Templates', text: EMAIL_PROMPT },
  { heading: 'AI Prompt for Any Content', text: ANY_CONTENT_PROMPT },
]

const MODULE_LINKS = [
  { number: 1, label: 'Welcome', href: '/resources/welcome-to-crazy-seal' },
  { number: 2, label: 'Marketing', href: '/resources/marketing' },
  { number: 3, label: 'Sales', href: '/resources/sales' },
  { number: 4, label: 'Build a Kit', href: '/resources/building-a-kit' },
  { number: 5, label: 'Installation', href: '/resources/installation' },
  { number: 6, label: 'Warranty', href: '/resources/warranty' },
]

export default function AiPromptsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <Bot className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    AI Prompts for Marketing Your Business
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  AI Prompts
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
                  Use these prompts with any Artificial Intelligence platform
                  to teach it what you are doing as a professional with Crazy
                  Seal and create custom assets!
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton
                    href="https://chat.openai.com/"
                    variant="accent"
                    size="lg"
                    external
                  >
                    Go To Chat GPT
                    <ExternalLink className="w-4 h-4" />
                  </LinkButton>
                </div>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937522726"
                  thumbnail={`${MEDIA}/2024/04/9.jpg`}
                  title="AI Prompts for Marketing Your Business"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PROMPTS ─── */}
      {PROMPTS.map((prompt) => (
        <Container key={prompt.heading} size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight text-center mb-6">
              {prompt.heading}
            </h2>
            <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  {prompt.heading}
                </span>
              </div>
              <div className="p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {prompt.text}
              </div>
            </div>
          </div>
        </Container>
      ))}

      {/* ─── BACK / CONTINUE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Back to Main Marketing Page
              </h2>
              <LinkButton href="/resources/marketing" variant="white" size="md">
                Marketing
              </LinkButton>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Continue On to Sales
              </h2>
              <LinkButton href="/resources/sales" variant="accent" size="md">
                Sales
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── MODULE QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Business Accelerator Program"
            heading="Module Quick Links"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {MODULE_LINKS.map((mod) => (
              <a
                key={mod.number}
                href={mod.href}
                className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {mod.number}
                </span>
                <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                  {mod.label}
                </span>
              </a>
            ))}
          </div>
          <div className="flex justify-center pt-6">
            <LinkButton href="/business-accelerator-program" variant="primary" size="md">
              Business Accelerator Home
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Content | Feature Request"
            heading="Request Content or a Feature"
            subheading="Have a request for marketing materials, sales resources, or something else that would support you in your business? Drop it in this form and the request will go directly to our asset creation team!"
          />
          <div className="max-w-2xl mx-auto">
            <ContentRequestForm sourcePage="marketing-ai-prompts" />
          </div>
        </div>
      </Container>
    </>
  )
}
