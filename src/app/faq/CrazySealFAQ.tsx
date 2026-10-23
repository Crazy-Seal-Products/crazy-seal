'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown, Hammer, HelpCircle, Layers, ShieldCheck, Truck } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: ReactNode
}

const linkClass = 'text-accent font-semibold hover:underline'

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'diy',
    question: 'Can I do this myself?',
    answer: (
      <>
        Yes! That&apos;s the beauty of our simple DIY roofing system. Step-by-step
        videos and PDF&apos;s are on our{' '}
        <Link href="/installation" className={linkClass}>
          installation page
        </Link>
        .
      </>
    ),
  },
  {
    id: 'savings',
    question: 'How much can I really save by doing it myself?',
    answer: (
      <>
        Labor is often one of the biggest costs in roofing. Do it yourself and
        you get a seamless roof at a fraction of the cost — saving thousands or
        more. Check out our{' '}
        <Link href="/kit-builder" className={linkClass}>
          Kit Builder
        </Link>{' '}
        to learn more.
      </>
    ),
  },
  {
    id: 'contractors',
    question: 'Do contractors use Crazy Seal?',
    answer:
      'Absolutely! Contractors love that it is quick and simple to install, solves thousands of different roofing problems, and comes with a 50 year warranty — a real, lasting solution for their clients.',
  },
  {
    id: 'cost',
    question: 'What will my roofing system cost?',
    answer: (
      <>
        Very affordable — especially compared to alternatives that include
        labor. Visit our{' '}
        <Link href="/kit-builder" className={linkClass}>
          Kit Builder
        </Link>{' '}
        for the cost of your specific project.
      </>
    ),
  },
  {
    id: 'roof-types',
    question: 'What kinds of roofs can Crazy Seal be applied to?',
    answer: (
      <>
        Fiberglass, rubber / EPDM, TPO, metal, wood, or virtually any other
        type of roof. Videos and PDF&apos;s for each are on{' '}
        <Link href="/installation" className={linkClass}>
          Installation
        </Link>
        .
      </>
    ),
  },
  {
    id: 'all-rvs',
    question: "Does your roof system work on all RV's?",
    answer:
      'Yes, the Crazy Seal system is compatible with all types of RVs, motorhomes, 5th wheels, travel trailers, pop-ups, park models, and semi-trailers.',
  },
  {
    id: 'install-time',
    question: 'How long does it take to install a Crazy Seal System?',
    answer:
      'It depends on the size of the job. Most people get the first coat of Crazy Seal on within a few hours of receiving their kit — faster if you have watched our installation tutorials and done some prep work in advance. Watch the time-lapse video below to see the entire system applied to an RV roof.',
  },
  {
    id: 'rubber-in-a-can',
    question: 'Is this like the "rubber in a can" products I can buy at the store?',
    answer:
      'No. Crazy Seal (patented) is a high performance, commercial grade, fiber-infused silicone membrane roofing system. Big box store products in a can are usually temporary solutions. Crazy Seal lets you custom manufacture your new roof on site, rather than in sheets at a factory, eliminating seams and exposed sealants. Do it right and do it once!',
  },
  {
    id: 'warranty-cost',
    question: 'How much does the warranty cost?',
    answer: (
      <>
        Nothing! It&apos;s included. Details on our 50 year, fully
        transferable warranty can be found on our{' '}
        <Link href="/warranty" className={linkClass}>
          warranty page
        </Link>
        .
      </>
    ),
  },
  {
    id: 'shipping-damage',
    question: 'What happens if I receive product damaged during shipping?',
    answer: (
      <>
        Any package(s) that are damaged during shipment need to be reported to
        Crazy Seal support within 24 hours of delivery. Crazy Seal is not
        responsible for shipping damage reported outside of that time frame.
        We ship with FedEx and have protocols in place to get you fresh
        product quickly, but they are only valid with our shipping company if
        notified of damage in a certain time window. Please email us with
        photos of the damaged shipment at{' '}
        <a href="mailto:support@crazyseal.com" className={linkClass}>
          support@crazyseal.com
        </a>{' '}
        within 24 hours of delivery.
      </>
    ),
  },
  {
    id: 'returns',
    question: 'What is your return policy?',
    answer:
      'Products must be returned within 90 days of purchase. The customer is responsible for all shipping costs incurred with returns. Please return your products with your order information to: Crazy Seal Products, Inc. Shipping Facility | 301 Walnut Springs Rd. | Lindale, TX 75771. There is a 20% restocking fee on all returned orders. Once your return is received to the facility, we will process a refund after subtracting 20% for the restocking fee.',
  },
]

type CategoryId = 'getting-started' | 'cost-warranty' | 'compatibility' | 'shipping-returns'

const CATEGORIES: { id: CategoryId; label: string; icon: typeof Hammer }[] = [
  { id: 'getting-started', label: 'Getting Started', icon: Hammer },
  { id: 'cost-warranty', label: 'Cost & Warranty', icon: ShieldCheck },
  { id: 'compatibility', label: 'Roofs & Install', icon: Layers },
  { id: 'shipping-returns', label: 'Shipping & Returns', icon: Truck },
]

const ITEM_CATEGORY: Record<string, CategoryId> = {
  diy: 'getting-started',
  savings: 'cost-warranty',
  contractors: 'getting-started',
  cost: 'cost-warranty',
  'roof-types': 'compatibility',
  'all-rvs': 'compatibility',
  'install-time': 'compatibility',
  'rubber-in-a-can': 'getting-started',
  'warranty-cost': 'cost-warranty',
  'shipping-damage': 'shipping-returns',
  returns: 'shipping-returns',
}

export function CrazySealFAQ() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    if (hash && FAQ_ITEMS.some((item) => item.id === hash)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open the deep-linked answer once on load
      setOpenId(hash)
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const visible =
    filter === 'all' ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => ITEM_CATEGORY[item.id] === filter)

  const chips: { id: CategoryId | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All questions', count: FAQ_ITEMS.length },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: FAQ_ITEMS.filter((item) => ITEM_CATEGORY[item.id] === c.id).length,
    })),
  ]

  return (
    <div>
      {/* Category chips */}
      <div
        role="toolbar"
        aria-label="Filter questions by topic"
        className="scrollbar-none -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
      >
        {chips.map((chip) => {
          const active = filter === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(chip.id)}
              className={`inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                active
                  ? 'bg-gradient-to-b from-primary-light to-primary text-white shadow-[0_6px_16px_-6px_rgb(0_51_101/0.55)]'
                  : 'bg-white text-primary shadow-sm ring-1 ring-primary/[0.08] hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40'
              }`}
            >
              {chip.label}
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-primary/[0.06] text-primary/70'
                }`}
              >
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {visible.map((item, index) => {
          const isOpen = openId === item.id
          const category = CATEGORIES.find((c) => c.id === ITEM_CATEGORY[item.id])
          const Icon = category?.icon ?? HelpCircle
          return (
            <div
              key={item.id}
              id={item.id}
              className={`animate-fade-up scroll-mt-28 overflow-hidden rounded-2xl transition-all duration-300 ${
                isOpen
                  ? 'bg-white shadow-lg ring-1 ring-accent/30'
                  : 'bg-gradient-to-b from-slate-50/80 to-white ring-1 ring-primary/[0.08] hover:shadow-md hover:ring-primary/15'
              }`}
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="group flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5 cursor-pointer"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                id={`faq-question-${item.id}`}
              >
                <span
                  className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl transition-all duration-300 ${
                    isOpen
                      ? 'bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent'
                      : 'bg-primary/[0.06] text-primary group-hover:-rotate-6'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`flex-1 font-semibold transition-colors ${isOpen ? 'text-primary' : 'text-gray-900'}`}>
                  {item.question}
                </span>
                <span
                  className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full transition-all duration-300 ${
                    isOpen ? 'rotate-180 bg-accent text-white' : 'bg-primary/[0.06] text-primary/60 group-hover:text-primary'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              {/* grid-rows 0fr → 1fr animates to the answer's natural height; content stays in the DOM */}
              <div
                id={`faq-answer-${item.id}`}
                role="region"
                aria-labelledby={`faq-question-${item.id}`}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-5 sm:px-5 sm:pl-[4.25rem]">
                    <p className="border-l-2 border-accent/40 pl-4 text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
