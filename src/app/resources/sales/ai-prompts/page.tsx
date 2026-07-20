import type { Metadata } from 'next'
import { Bot, ExternalLink } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'AI Prompts for Sales',
  description:
    'AI prompts for selling with Crazy Seal. Use these prompts with any Artificial Intelligence platform to generate custom sales scripts, website content, contracts, and labor warranties for your Crazy Seal business.',
}

const SHARED_BODY = `Highlight the unique and revolutionary features of this fluid-applied seamless roofing system that make it stand out in the market. Focus on the system's key benefits, such as its ability to eliminate water intrusion, provide long-term protection, and its versatility in being applied to various types of roofs, including RVs, tractor trailers, residential flat roofs, and commercial flat roofs.

Discuss the three-part sealing system\u2014Crazy Caulk, Crazy Patch, and Crazy Seal\u2014that work together to create a single, chemically bonded membrane. Describe how the advanced materials, such as high-grade silicone infused with fibers, result in a waterproof, reflective, scratch-resistant, flexible, and durable membrane. Explain how the fiber infusion acts like embedding rebar in concrete, strengthening the roofing membrane.

Highlight the system's superior resistance to UV radiation, chalking, and fading over time, as well as its ability to stay clean easily due to its stain-resistant properties. Describe how Crazy Seal uses pharmaceutical-grade components for strict purity and quality.

Emphasize the environmental friendliness of the product, which uses VOC-exempt silicon-based solvents and avoids cheap fillers like talc and calcium carbonate. This ensures higher quality and longer-lasting performance against tough UV rays and other weather conditions.

Mention Crazy Seal's exceptional energy efficiency, which helps reduce roof temperature, lower internal temperatures, and decrease energy consumption. Explain how the system's reflectivity can result in immediate reductions in air conditioning usage.

Describe how the Crazy Seal system is composed of 94.2% by weight silicon-containing raw materials, offering superior longevity and performance compared to competitors. Explain how the system's base formulation bonds seamlessly to form a single, custom-fit roofing membrane that provides scratch resistance, flexibility, and toughness.

Stress the extensive support provided by the company and the peace of mind offered by the 50-year product warranty, which is transferable to a new owner. This long-term protection makes Crazy Seal an excellent investment for property owners looking to safeguard their assets.

Incorporate these points into your ad copy and marketing materials to showcase the quality, durability, and long-lasting protection that the Crazy Seal roofing system provides to property owners.`

const SALES_SCRIPT_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to my customers that own [Product Type | RV's, Commercial Buildings, etc.].

My business Name is [Business Name], and our phone number is [Phone Number].

Generate a custom sales script for my team highlighting the key benefits to my customers.

${SHARED_BODY}`

const WEBSITE_CONTENT_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to my customers that own [Product Type | RV's, Commercial Buildings, etc.].

My business Name is [Business Name], and our phone number is [Phone Number].

Generate custom content for my website stating that we now offer the Crazy Seal Roofing System to potential customers.

${SHARED_BODY}`

const CONTRACT_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to customers who own [Product Type | RVs, Commercial Buildings, etc.].

My business name is [Business Name], located at [Address], and our phone number is [Phone Number].

Create a comprehensive contract for my business that outlines the terms and conditions of installing the Crazy Seal Roofing System for customers. Include a clear description of the Crazy Seal roofing system, highlighting its unique and revolutionary features that make it stand out in the market. Focus on the system's key benefits, such as its ability to eliminate water intrusion, provide long-term protection, and its versatility in being applied to various types of roofs, including RVs, tractor trailers, residential flat roofs, and commercial flat roofs.

Include an overview of the three-part sealing system\u2014Crazy Caulk, Crazy Patch, and Crazy Seal\u2014that work together to create a single, chemically bonded membrane. Describe how the advanced materials, such as high-grade silicone infused with fibers, result in a waterproof, reflective, scratch-resistant, flexible, and durable membrane. Explain how the fiber infusion acts like embedding rebar in concrete, strengthening the roofing membrane.

Detail the system's superior resistance to UV radiation, chalking, and fading over time, as well as its ability to stay clean easily due to its stain-resistant properties. Describe how Crazy Seal uses pharmaceutical-grade components for strict purity and quality.

Emphasize the environmental friendliness of the product, which uses VOC-exempt silicon-based solvents and avoids cheap fillers like talc and calcium carbonate. This ensures higher quality and longer-lasting performance against tough UV rays and other weather conditions.

Discuss Crazy Seal's exceptional energy efficiency, which helps reduce roof temperature, lower internal temperatures, and decrease energy consumption. Explain how the system's reflectivity can result in immediate reductions in air conditioning usage.

Describe how the Crazy Seal system offers superior longevity and performance compared to competitors. Explain how the system's base formulation bonds seamlessly to form a single, custom-fit roofing membrane that provides scratch resistance, flexibility, and toughness.

Include a section on the extensive support provided by the company and the peace of mind offered by the 50-year product warranty on materials, which is transferable to a new owner. This long-term protection makes Crazy Seal an excellent investment for property owners looking to safeguard their assets.

Add a clause detailing the labor warranty offered, including the length of coverage and what it entails, such as installation defects, workmanship quality, and any other terms relevant to the labor warranty.

Incorporate these points into the contract to provide customers with a clear understanding of the quality, durability, and long-lasting protection that the Crazy Seal roofing system offers. Include the scope of work, timeline, cost, and payment terms for the installation.`

const LABOR_WARRANTY_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to customers who own [Product Type | RVs, Commercial Buildings, etc.].

My business name is [Business Name], located at [Address], and our phone number is [Phone Number].

Write me a labor warranty for installations of the Crazy Seal Roofing System. Include a clear explanation of the warranty coverage, such as the length of the coverage period, which should be [warranty length]. Specify what is covered under the warranty, and any exclusions or limitations. Define coverage for installation defects and workmanship quality. Mention the process for customers to make a claim and any steps they should follow if they encounter issues. Additionally, include information about customer responsibilities and maintenance requirements to keep the warranty valid.`

const ANY_CONTENT_PROMPT = `I am a professional offering installations of The Crazy Seal Seamless Roofing System to my customers that own [Product Type | RV's, Commercial Buildings, etc.].

My business Name is [Business Name], and our phone number is [Phone Number].

Generate [custom content requirement].

${SHARED_BODY}`

const PROMPTS = [
  { heading: 'AI Prompt for Sales Script', text: SALES_SCRIPT_PROMPT },
  { heading: 'AI Prompt for Website Content', text: WEBSITE_CONTENT_PROMPT },
  { heading: 'AI Prompt for Contracts', text: CONTRACT_PROMPT },
  { heading: 'AI Prompt for Labor Warranty', text: LABOR_WARRANTY_PROMPT },
  { heading: 'AI Prompt for Any Content', text: ANY_CONTENT_PROMPT },
]

export default function SalesAiPromptsPage() {
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
                    AI Prompts for Sales
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
                  videoId="937522660"
                  thumbnail={`${MEDIA}/2024/04/9.jpg`}
                  title="AI Prompts for Sales"
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

      {/* ─── FOOTER ─── */}
      <AssetPageFooter sourcePage="resources-sales-ai-prompts" />
    </>
  )
}
