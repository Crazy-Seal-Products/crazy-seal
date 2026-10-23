'use client'

import { MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'
import { FormModal } from '@/components/forms/FormModal'

interface ContactModalProps {
  open: boolean
  onClose: () => void
  sourcePage?: string
  initialMessage?: string
  defaultProjectType?: string
}

export function ContactModal({
  open,
  onClose,
  sourcePage = 'contact',
  initialMessage,
  defaultProjectType,
}: ContactModalProps) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      eyebrow="Free kit consultation"
      title="Talk to a Specialist"
      subtitle="We'll build the right kit with you — no pressure."
      icon={MessageSquare}
    >
      <ContactForm sourcePage={sourcePage} initialMessage={initialMessage} defaultProjectType={defaultProjectType} />
    </FormModal>
  )
}
