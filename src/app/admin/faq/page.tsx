'use client'

import React, { useState } from 'react'
import { Container, Heading, Text, Card, Stack } from '@/lib/design-system'
import {
  GripVertical, ChevronDown, ChevronUp, Eye,
  ExternalLink, Pencil, Check, X,
} from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const INITIAL_FAQ: FAQItem[] = [
  { id: 'diy', question: 'Can I do this myself?', answer: 'Yes! That is the beauty of our simple DIY roofing system. You can do it yourself! To see videos and PDFs that show you step by step how to get the job done, visit our installation page.' },
  { id: 'savings', question: 'How much can I really save by doing it myself?', answer: 'In roofing, labor is often times one of the biggest expenses there is to a job! By doing it yourself, you get an incredible seamless roof at a fraction of the cost because there is no labor involved. With our DIY application, you can save thousands or more. Check out our pricing page to learn more.' },
  { id: 'contractors', question: 'Do contractors use Crazy Seal?', answer: 'Absolutely! Contractors love our system because it is simple to install and solves thousands of different roofing problems for people. In fact, many contractors actually prefer our system to others because it is quick and efficient to apply, comes with a 50 year warranty, and offers a real, lasting solution to the challenges they face for their clients.' },
  { id: 'cost', question: 'What will my roofing system cost?', answer: 'Our system is very affordable, especially considering all of the alternatives out there that include labor! Visit our pricing page for more information on the cost to complete your specific project.' },
  { id: 'roof-types', question: 'What kinds of roofs can Crazy Seal be applied to?', answer: 'Crazy Seal can be applied to fiberglass, rubber / EPDM, TPO, metal, wood, or virtually any other type of roof. To see videos and PDFs of how it is applied to these kinds of roofs, check out the installation page.' },
  { id: 'all-rvs', question: "Does your roof system work on all RV's?", answer: 'Yes, the Crazy Seal system is compatible with all types of RVs, motorhomes, 5th wheels, travel trailers, pop-ups, park models, and semi-trailers.' },
  { id: 'install-time', question: 'How long does it take to install a Crazy Seal System?', answer: 'It depends on the size of the job you are completing. Most people can get the first coat of Crazy Seal onto their application within a few hours of receiving their kit. This is expedited if you have watched our installation tutorials and done some of the prep work in advance!' },
  { id: 'rubber-in-a-can', question: 'Is this like the "rubber in a can" products I can buy at the store?', answer: 'No. Crazy Seal (patented) is a high performance, commercial grade, fiber-infused silicone membrane roofing system. Junk products in a can that you buy at big box stores are usually temporary solutions. We give you the ability to custom manufacture your new roof on site, rather than in sheets at a factory, thus eliminating seams and exposed sealants. Do it right and do it once!' },
  { id: 'warranty-cost', question: 'How much does the warranty cost?', answer: "Nothing! It's included. Details on our 50 year, fully transferable warranty can be found on our warranty page." },
  { id: 'shipping-damage', question: 'What happens if I receive product damaged during shipping?', answer: 'Any package(s) that are damaged during shipment need to be reported to Crazy Seal support within 24 hours of delivery. Crazy Seal is not responsible for shipping damage reported outside of that time frame. We ship with FedEx and have protocols in place to get you fresh product quickly, but they are only valid with our shipping company if notified of damage in a certain time window. Please email us with photos of the damaged shipment at support@crazyseal.com within 24 hours of delivery.' },
  { id: 'returns', question: 'What is your return policy?', answer: 'Products must be returned within 90 days of purchase. The customer is responsible for all shipping costs incurred with returns. Please return your products with your order information to: Crazy Seal Products, Inc. Shipping Facility | 301 Walnut Springs Rd. | Lindale, TX 75771. There is a 20% restocking fee on all returned orders. Once your return is received to the facility, we will process a refund after subtracting 20% for the restocking fee.' },
]

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQ)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')

  const startEdit = (faq: FAQItem) => {
    setEditingId(faq.id)
    setEditQuestion(faq.question)
    setEditAnswer(faq.answer)
    setExpandedId(faq.id)
  }

  const saveEdit = () => {
    if (!editingId) return
    setFaqs((prev) =>
      prev.map((f) =>
        f.id === editingId ? { ...f, question: editQuestion, answer: editAnswer } : f
      )
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuestion('')
    setEditAnswer('')
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Stack gap="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Heading level={1} className="text-2xl font-bold text-gray-900 mb-1">FAQ Manager</Heading>
              <Text className="text-gray-500 !mb-0">{faqs.length} questions</Text>
            </div>
            <Link
              href="/faq"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Live Page
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <Card className="!p-4 bg-amber-50 border-amber-200">
            <Text className="!mb-0 text-amber-800 text-sm">
              FAQ content is currently stored in code. Edits here preview changes but are not persisted.
              To update the live FAQ page, coordinate with your developer to update the CrazySealFAQ component.
            </Text>
          </Card>

          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const isExpanded = expandedId === faq.id
              const isEditing = editingId === faq.id

              return (
                <Card key={faq.id} className="!p-0 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab" />
                    <span className="text-xs font-mono text-gray-400 w-5 shrink-0">{index + 1}</span>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <span className="font-medium text-sm text-gray-900 line-clamp-1">{faq.question}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(faq)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#003365] hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-4 sm:px-5 bg-gray-50/50">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Question</label>
                            <input
                              type="text"
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Answer</label>
                            <textarea
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none resize-y"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#003365] rounded-lg hover:bg-[#002244] transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Answer</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                          <p className="mt-2 text-[10px] text-gray-400">Anchor: <code className="bg-gray-200 px-1 rounded">#{faq.id}</code></p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </Stack>
      </Container>
    </div>
  )
}
