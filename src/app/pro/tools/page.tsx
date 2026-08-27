import Link from 'next/link'
import { ArrowRight, FileText, MonitorPlay, ShoppingCart, Wrench } from 'lucide-react'

const TOOLS = [
  {
    title: 'Customer presentation',
    desc: 'Press play and hand them the phone. Video, reviews, and the system in one page.',
    href: '/rv-roofing/',
    icon: MonitorPlay,
  },
  {
    title: 'Professional tools',
    desc: 'Brochures, savings PDF, warranty sheet, and install videos.',
    href: '/professional-tools/',
    icon: Wrench,
  },
  {
    title: 'Business Accelerator',
    desc: 'Sales and install training modules.',
    href: '/business-accelerator-program/',
    icon: FileText,
  },
  {
    title: 'Kit builder',
    desc: 'Build the next job from scratch or grab a pre-built kit.',
    href: '/kit-builder/',
    icon: ShoppingCart,
  },
]

export default function ProToolsPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#003365]">Tools &amp; training</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">Same resources as the public site — sitting next to your jobs so it feels like a shop desk.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#003365] transition-colors group"
            >
              <Icon className="w-6 h-6 text-[#5BA411] mb-3" />
              <h2 className="font-bold text-[#003365] group-hover:underline">{tool.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#003365] mt-3">
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
