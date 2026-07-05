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
  { id: 'costs', question: 'What kind of costs am I looking at?', answer: 'Our system is very affordable. In general, RV Armor can protect your investment for the next 20 to 30 years or longer, for pennies a day. Pricing starts at approximately $190 per linear foot with a $4,560 minimum. Contact us to tell us about your RV and get a detailed quote.' },
  { id: 'roof-types', question: 'What kinds of RV roofs can RV Armor be applied to?', answer: 'RV Armor can be applied to fiberglass, rubber/EPDM, TPO, metal, wood, or virtually any other type of RV roof. Our certified technicians assess your specific roof during the quote process.' },
  { id: 'all-rvs', question: 'Does your roof system work on all RVs?', answer: 'Yes! RV Armor works on all types of RVs including motorhomes, 5th wheels, travel trailers, pop-ups, park models, and even semi-trailers.' },
  { id: 'application-time', question: 'How long does the RV Armor application process take to complete?', answer: 'RV Armor is a multi-layer system that is custom-manufactured directly on your RV. The process generally takes about 2 days, though occasionally it may take up to 3 days depending on the condition of your roof.' },
  { id: 'drive-to-you', question: 'Do I need to drive to you?', answer: 'No! We come to you anywhere in the USA. Your driveway, your campground, wherever you are. Our certified technicians provide mobile service nationwide.' },
  { id: 'diy-coatings', question: 'Is this like the "do it yourself" RV roof coatings I can buy?', answer: 'Absolutely not. RV Armor is a high performance, commercial grade, membrane roofing system that is custom manufactured on site. It is backed by a Lifetime Guarantee and is nothing like the temporary DIY coatings that require reapplication every few years.' },
  { id: 'diy', question: 'Can I do this myself?', answer: 'No. RV Armor must be installed by trained, certified technicians. Our technicians go through a week-long training program to learn the proprietary application process. This ensures proper adhesion and warranty coverage.' },
  { id: 'warranty-cost', question: 'How much does the "Lifetime Warranty" cost?', answer: 'Nothing! The lifetime warranty is included with every RV Armor installation at no additional cost. It is fully transferable, tracked by your VIN number, and backed by our nationwide technician network.' },
  { id: 'transferable-warranty', question: "What's the main advantage of a transferable warranty?", answer: 'A transferable warranty gives you a competitive selling advantage when it comes time to sell or trade in your RV. It may increase the trade-in or resale value of your RV since the new owner inherits lifetime roof protection.' },
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
              To update the live FAQ page, coordinate with your developer to update the FAQAccordion component.
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
