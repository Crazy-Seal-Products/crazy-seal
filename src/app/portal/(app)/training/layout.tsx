import { requireAccount } from '@/lib/contractor/guard'
import { getProgramContent } from '@/lib/portal/accelerator'
import { TrainingProvider } from '@/components/contractor/training/TrainingProvider'

/**
 * Training: the Accelerator Program's published modules (edited in the admin's
 * Training page), with each person's progress kept in their browser.
 */
export default async function TrainingLayout({ children }: { children: React.ReactNode }) {
  const { account } = await requireAccount('training.view')
  const { program, modules } = await getProgramContent()
  return (
    <TrainingProvider proUserId={account.proUserId} program={program} modules={modules}>
      {children}
    </TrainingProvider>
  )
}
