// Where a job is on the roof: the install steps (Clean & prep, Seams &
// details, First coat, Second coat) plus the warranty, its percent, and the
// one move that takes it forward. Plain module: no React.

import { INSTALL_STEP_LABEL, INSTALL_STEPS, type InstallStep, type ProjectStage } from '@/lib/contractor/types'

export type StepState = 'done' | 'current' | 'todo'

/** The stepper's steps: the four install steps, then the warranty. */
export const JOB_STEPS: readonly { key: InstallStep | 'warranty'; label: string }[] = [
  ...INSTALL_STEPS.map((s) => ({ key: s, label: INSTALL_STEP_LABEL[s] })),
  { key: 'warranty', label: 'Warranty' },
]

export interface JobState {
  stage: ProjectStage
  install_step: InstallStep | null
  warranty_registered: boolean
}

/**
 * Each step's state. Before the install every step is ahead; while
 * installing, the crew's step is current and those before it are done; a
 * complete job has every install step done and the warranty current until a
 * registration names it.
 */
export function stepStates(job: JobState): StepState[] {
  if (job.stage === 'complete') return [...INSTALL_STEPS.map((): StepState => 'done'), job.warranty_registered ? 'done' : 'current']
  if (job.stage === 'in_progress') {
    const at = job.install_step ? INSTALL_STEPS.indexOf(job.install_step) : -1
    return [...INSTALL_STEPS.map((_, i): StepState => (i < at ? 'done' : i === at ? 'current' : 'todo')), 'todo']
  }
  return JOB_STEPS.map((): StepState => 'todo')
}

/** 0-100: each done step counts whole and the current one half. */
export function jobProgress(job: JobState): number {
  const states = stepStates(job)
  const done = states.filter((s) => s === 'done').length + (states.includes('current') ? 0.5 : 0)
  return Math.round((done / states.length) * 100)
}

export type NextMove =
  | { kind: 'stage'; stage: 'ordered' | 'in_progress' | 'complete'; label: string }
  | { kind: 'step'; step: InstallStep; label: string }
  | { kind: 'warranty'; label: string }

/** The button that takes the job forward, or null when it's done. */
export function nextMove(job: JobState): NextMove | null {
  switch (job.stage) {
    case 'won':
      return { kind: 'stage', stage: 'ordered', label: 'Mark materials ordered' }
    case 'ordered':
      return { kind: 'stage', stage: 'in_progress', label: 'Start install' }
    case 'in_progress': {
      const at = job.install_step ? INSTALL_STEPS.indexOf(job.install_step) : -1
      const next = INSTALL_STEPS[at + 1]
      if (next) return { kind: 'step', step: next, label: `Mark ${INSTALL_STEP_LABEL[next].toLowerCase()}` }
      return { kind: 'stage', stage: 'complete', label: 'Mark complete' }
    }
    case 'complete':
      return job.warranty_registered ? null : { kind: 'warranty', label: 'Register warranty' }
    default:
      return null
  }
}

/** One line on where the job stands. */
export function statusLine(job: JobState): string {
  switch (job.stage) {
    case 'won':
      return 'Won. Order the materials to get it on the schedule.'
    case 'ordered':
      return 'Materials ordered. Ready to start.'
    case 'in_progress':
      return job.install_step ? `Installing. Crew on ${INSTALL_STEP_LABEL[job.install_step].toLowerCase()}.` : 'Installing. Mark where the crew is.'
    case 'complete':
      return job.warranty_registered ? 'Complete. Warranty registered.' : 'Complete. Register the warranty to finish.'
    default:
      return ''
  }
}
