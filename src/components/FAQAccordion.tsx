'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Text } from '@/lib/design-system'

export interface FAQItem {
  id: string
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'costs',
    question: 'What kind of costs am I looking at?',
    answer: 'Our system is very affordable. In general, RV Armor can protect your investment for the next 20 to 30 years or longer, for pennies a day. Pricing starts at approximately $190 per linear foot with a $4,560 minimum. Contact us to tell us about your RV and get a detailed quote.',
  },
  {
    id: 'roof-types',
    question: 'What kinds of RV roofs can RV Armor be applied to?',
    answer: 'RV Armor can be applied to fiberglass, rubber/EPDM, TPO, metal, wood, or virtually any other type of RV roof. Our certified technicians assess your specific roof during the quote process.',
  },
  {
    id: 'all-rvs',
    question: 'Does your roof system work on all RVs?',
    answer: 'Yes! RV Armor works on all types of RVs including motorhomes, 5th wheels, travel trailers, pop-ups, park models, and even semi-trailers.',
  },
  {
    id: 'application-time',
    question: 'How long does the RV Armor application process take to complete?',
    answer: 'RV Armor is a multi-layer system that is custom-manufactured directly on your RV. The process generally takes about 2 days, though occasionally it may take up to 3 days depending on the condition of your roof.',
  },
  {
    id: 'drive-to-you',
    question: 'Do I need to drive to you?',
    answer: 'No! We come to you anywhere in the USA. Your driveway, your campground, wherever you are. Our certified technicians provide mobile service nationwide.',
  },
  {
    id: 'diy-coatings',
    question: 'Is this like the "do it yourself" RV roof coatings I can buy?',
    answer: 'Absolutely not. RV Armor is a high performance, commercial grade, membrane roofing system that is custom manufactured on site. It is backed by a Lifetime Guarantee and is nothing like the temporary DIY coatings that require reapplication every few years.',
  },
  {
    id: 'diy',
    question: 'Can I do this myself?',
    answer: 'No. RV Armor must be installed by trained, certified technicians. Our technicians go through a week-long training program to learn the proprietary application process. This ensures proper adhesion and warranty coverage.',
  },
  {
    id: 'warranty-cost',
    question: 'How much does the "Lifetime Warranty" cost?',
    answer: 'Nothing! The lifetime warranty is included with every RV Armor installation at no additional cost. It is fully transferable, tracked by your VIN number, and backed by our nationwide technician network.',
  },
  {
    id: 'transferable-warranty',
    question: "What's the main advantage of a transferable warranty?",
    answer: 'A transferable warranty gives you a competitive selling advantage when it comes time to sell or trade in your RV. It may increase the trade-in or resale value of your RV since the new owner inherits lifetime roof protection.',
  },
]

export function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    if (hash && FAQ_ITEMS.some((item) => item.id === hash)) {
      setOpenId(hash)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    if (hash && FAQ_ITEMS.some((item) => item.id === hash)) {
      setOpenId(hash)
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mounted])

  return (
    <div className="space-y-4">
      {FAQ_ITEMS.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            id={item.id}
            className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between gap-4 px-4 py-4 sm:px-6 text-left hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
              id={`faq-question-${item.id}`}
            >
              <span className="font-semibold text-gray-900">{item.question}</span>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0 text-[#003365]" />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400" />
              )}
            </button>
            <div
              id={`faq-answer-${item.id}`}
              role="region"
              aria-labelledby={`faq-question-${item.id}`}
              className={isOpen ? 'block' : 'hidden'}
            >
              <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 border-t border-gray-100">
                <Text className="!mb-0">{item.answer}</Text>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
