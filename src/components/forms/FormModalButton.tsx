'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  ArrowRightLeft,
  ClipboardCheck,
  Handshake,
  LifeBuoy,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'
import { linkButtonClassName, type LinkButtonSize, type LinkButtonVariant } from '@/lib/design-system'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { ProfessionalContactForm } from '@/components/forms/ProfessionalContactForm'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { WarrantyRegistrationForm } from '@/components/forms/WarrantyRegistrationForm'
import { WarrantyTransferForm } from '@/components/forms/WarrantyTransferForm'
import { WarrantyClaimForm } from '@/components/forms/WarrantyClaimForm'
import { FormModal } from '@/components/forms/FormModal'

export type FormKind =
  | 'contact'
  | 'professional'
  | 'content-request'
  | 'warranty-registration'
  | 'warranty-transfer'
  | 'warranty-claim'

const META: Record<
  Exclude<FormKind, 'contact'>,
  { eyebrow: string; title: string; subtitle: string; icon: LucideIcon; width?: 'sm' | 'md' | 'lg' }
> = {
  professional: {
    eyebrow: 'Dealer program',
    title: 'Start a Conversation',
    subtitle: 'A specialist will reach out about partnership and next steps.',
    icon: Handshake,
  },
  'content-request': {
    eyebrow: 'Request content',
    title: 'What would support your business?',
    subtitle: 'Requests go straight to our asset creation team.',
    icon: Lightbulb,
  },
  'warranty-registration': {
    eyebrow: '50 year warranty',
    title: 'Register Your Warranty',
    subtitle: 'Four quick steps — have your order number and photos ready.',
    icon: ClipboardCheck,
  },
  'warranty-transfer': {
    eyebrow: '50 year warranty',
    title: 'Transfer a Warranty',
    subtitle: 'For new owners of a Crazy Seal roof.',
    icon: ArrowRightLeft,
  },
  'warranty-claim': {
    eyebrow: 'Warranty support',
    title: 'File a Warranty Claim',
    subtitle: 'Tell us what happened and we’ll make it right.',
    icon: LifeBuoy,
  },
}

function FormBody({ form, sourcePage }: { form: Exclude<FormKind, 'contact'>; sourcePage?: string }) {
  switch (form) {
    case 'professional':
      return <ProfessionalContactForm sourcePage={sourcePage} />
    case 'content-request':
      return <ContentRequestForm sourcePage={sourcePage} />
    case 'warranty-registration':
      return <WarrantyRegistrationForm />
    case 'warranty-transfer':
      return <WarrantyTransferForm />
    case 'warranty-claim':
      return <WarrantyClaimForm />
  }
}

/**
 * A button that opens one of the site's forms in a pop-up modal. Works from
 * server components. `openOnHash` opens it automatically when the URL hash
 * matches (keeps old deep links like /warranty#warranty-transfer working) —
 * put it on only one trigger per form per page.
 */
export function FormModalButton({
  form,
  sourcePage,
  defaultProjectType,
  openOnHash,
  variant = 'accent',
  size = 'md',
  className,
  children,
}: {
  form: FormKind
  sourcePage?: string
  defaultProjectType?: string
  openOnHash?: string
  variant?: LinkButtonVariant
  size?: LinkButtonSize
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { openQuoteModal } = useQuoteModal()

  const show = useCallback(() => {
    if (form === 'contact') openQuoteModal({ sourcePage, defaultProjectType })
    else setOpen(true)
  }, [form, openQuoteModal, sourcePage, defaultProjectType])

  useEffect(() => {
    if (!openOnHash) return
    const check = () => {
      if (window.location.hash.replace('#', '') === openOnHash) show()
    }
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [openOnHash, show])

  const close = useCallback(() => {
    setOpen(false)
    // Drop the hash so a refresh doesn't reopen the form.
    if (openOnHash && window.location.hash.replace('#', '') === openOnHash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [openOnHash])

  return (
    <>
      <button type="button" onClick={show} className={linkButtonClassName(variant, size, className)}>
        {children}
      </button>
      {form !== 'contact' && (
        <FormModal
          open={open}
          onClose={close}
          eyebrow={META[form].eyebrow}
          title={META[form].title}
          subtitle={META[form].subtitle}
          icon={META[form].icon}
          width={META[form].width}
        >
          <FormBody form={form} sourcePage={sourcePage} />
        </FormModal>
      )}
    </>
  )
}
