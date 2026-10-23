import type { Metadata } from 'next'
import { Bot, ExternalLink } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'
import { PromptLibrary } from '@/components/pro/SalesAssetBlocks'

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
      <ModuleHero
        module={3}
        kicker="AI Prompts for Sales"
        icon={Bot}
        title={
          <>
            AI <span className="text-shimmer-highlight">Prompts</span>
          </>
        }
        intro="Use these prompts with any Artificial Intelligence platform to teach it what you are doing as a professional with Crazy Seal and create custom assets!"
        chips={['Sales scripts', 'Website content', 'Contracts', 'Labor warranties']}
        actions={
          <LinkButton href="https://chat.openai.com/" variant="accent" size="lg" external>
            Go To Chat GPT
            <ExternalLink className="h-4 w-4" />
          </LinkButton>
        }
        media={
          <ProVimeoEmbed
            videoId="937522660"
            thumbnail={`${MEDIA}/2024/04/9.jpg`}
            title="AI Prompts for Sales"
          />
        }
      />

      <ModuleNav current={3} />

      {/* ─── PROMPTS ─── */}
      <PromptLibrary prompts={PROMPTS} />

      {/* ─── FOOTER ─── */}
      <AssetPageFooter module={3} sourcePage="resources-sales-ai-prompts" />
    </>
  )
}
