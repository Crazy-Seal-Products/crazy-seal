import type { Metadata } from 'next'
import { TRAINING_LABEL } from '@/lib/contractor/nav'
import { TrainingView } from '@/components/contractor/training/TrainingView'

export const metadata: Metadata = { title: TRAINING_LABEL }

export default function TrainingPage() {
  return <TrainingView />
}
