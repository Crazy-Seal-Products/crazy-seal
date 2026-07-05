'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
        Yes! That is the beauty of our simple DIY roofing system. You can do
        it yourself! To see videos and PDF&apos;s that show you step by step
        how to get the job done, visit our{' '}
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
        In roofing, labor is often times one of the biggest expenses there is
        to a job! By doing it yourself, you get an incredible seamless roof at
        a fraction of the cost because there is no labor involved. With our
        DIY application, you can save thousands or more. Check out our{' '}
        <Link href="/pricing" className={linkClass}>
          pricing page
        </Link>{' '}
        to learn more.
      </>
    ),
  },
  {
    id: 'contractors',
    question: 'Do contractors use Crazy Seal?',
    answer:
      'Absolutely! Contractors love our system because it is simple to install and solves thousands of different roofing problems for people. In fact, many contractors actually prefer our system to others because it is quick and efficient to apply, comes with a 50 year warranty, and offers a real, lasting solution to the challenges they face for their clients.',
  },
  {
    id: 'cost',
    question: 'What will my roofing system cost?',
    answer: (
      <>
        Our system is very affordable, especially considering all of the
        alternatives out there that include labor! Visit our{' '}
        <Link href="/pricing" className={linkClass}>
          pricing page
        </Link>{' '}
        for more information on the cost to complete your specific project.
      </>
    ),
  },
  {
    id: 'roof-types',
    question: 'What kinds of roofs can Crazy Seal be applied to?',
    answer: (
      <>
        Crazy Seal can be applied to fiberglass, rubber / EPDM, TPO, metal,
        wood, or virtually any other type of roof. To see videos and
        PDF&apos;s of how it is applied to these kinds of roofs, check out{' '}
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
      'It depends on the size of the job you are completing. Most people can get the first coat of Crazy Seal onto their application within a few hours of receiving their kit. This is expedited if you have watched our installation tutorials and done some of the prep work in advance! Watch the time-lapse video below to see the entire Crazy Seal System being applied to an RV roof.',
  },
  {
    id: 'rubber-in-a-can',
    question: 'Is this like the "rubber in a can" products I can buy at the store?',
    answer:
      'No. Crazy Seal (patented) is a high performance, commercial grade, fiber-infused silicone membrane roofing system. Junk products in a can that you buy at big box stores are usually temporary solutions. We give you the ability to custom manufacture your new roof on site, rather than in sheets at a factory, thus eliminating seams and exposed sealants. Do it right and do it once!',
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

export function CrazySealFAQ() {
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    if (hash && FAQ_ITEMS.some((item) => item.id === hash)) {
      setOpenId(hash)
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

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
                <ChevronUp className="w-5 h-5 flex-shrink-0 text-primary" />
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
              <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-4 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
