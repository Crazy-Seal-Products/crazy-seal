'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, Plus } from 'lucide-react'
import { createModule } from '@/lib/portal/admin/accelerator-actions'
import { Modal } from '../modal'
import { BUTTON, inputCls, labelCls } from '../styles'

/** "Add module": names a new draft module, then opens it in the editor. */
export function AddModuleButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={BUTTON.gold}>
        <Plus className="h-3.5 w-3.5" />
        Add module
      </button>
      {open && (
        <Modal title="Add a module" icon={<GraduationCap className="h-4 w-4 text-adm-gold" />} onClose={() => setOpen(false)}>
          <form
            className="grid gap-2.5 p-4"
            onSubmit={(e) => {
              e.preventDefault()
              setError(null)
              start(async () => {
                const r = await createModule(title)
                if (r.ok && r.slug) router.push(`/portal/admin/dealers/accelerator/${r.slug}/`)
                else if (!r.ok) setError(r.error)
              })
            }}
          >
            <label className={labelCls}>
              <span>Module title</span>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Running Your Crew" autoFocus required />
            </label>
            <p className="text-[11.5px] leading-snug text-adm-muted">
              It starts as a draft, so dealers won’t see it until you add lessons and publish it.
            </p>
            {error && <p className="text-[12px] text-adm-red">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={pending} className={BUTTON.gold}>
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create and edit
              </button>
              <button type="button" onClick={() => setOpen(false)} className={BUTTON.default}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
