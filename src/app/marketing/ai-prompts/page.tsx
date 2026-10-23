import type { Metadata } from 'next'
import { Bot, ExternalLink } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'
import { PromptLibrary } from '@/components/pro/SalesAssetBlocks'

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

export default function AiPromptsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <ModuleHero
        module={2}
        kicker="AI Prompts for Marketing"
        icon={Bot}
        title={
          <>
            AI <span className="text-shimmer-highlight">Prompts</span>
          </>
        }
        intro="Use these prompts with any Artificial Intelligence platform to teach it what you are doing as a professional with Crazy Seal and create custom assets!"
        chips={['Ad copy', 'Email templates', 'Any content']}
        actions={
          <LinkButton href="https://chat.openai.com/" variant="accent" size="lg" external>
            Go To Chat GPT
            <ExternalLink className="h-4 w-4" />
          </LinkButton>
        }
        media={
          <ProVimeoEmbed
            videoId="937522726"
            thumbnail={`${MEDIA}/2024/04/9.jpg`}
            title="AI Prompts for Marketing Your Business"
          />
        }
      />

      <ModuleNav current={2} />

      {/* ─── PROMPTS ─── */}
      <PromptLibrary prompts={PROMPTS} />

      {/* ─── BACK / CONTINUE + QUICK LINKS + CONTENT REQUEST ─── */}
      <AssetPageFooter
        module={2}
        sourcePage="marketing-ai-prompts"
        back={{
          heading: 'Back to Main Marketing Page',
          label: 'Marketing',
          href: '/resources/marketing',
        }}
        next={{
          heading: 'Continue On to Sales',
          label: 'Sales',
          href: '/resources/sales',
        }}
      />
    </>
  )
}
