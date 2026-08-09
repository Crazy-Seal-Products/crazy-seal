'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#003365] rounded-lg hover:bg-[#00284f] transition-colors print:hidden"
    >
      <Printer className="w-4 h-4" />
      Print / Save as PDF
    </button>
  )
}
