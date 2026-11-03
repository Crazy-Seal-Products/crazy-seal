'use client'

import { useSyncExternalStore } from 'react'

/**
 * MediaConvert jobs started from this browser, kept in localStorage so their
 * status survives a reload while the 2–5 minute job runs.
 */

export interface VideoJob {
  id: string
  name: string
  /** S3 key of the source video. */
  key: string
  /** Folder of the source video; outputs land in `${folder}/processed`. */
  folder: string
  startedAt: string
  status: string
  percent?: number
  error?: string
}

/** MediaConvert statuses after which a job no longer changes. */
export const FINISHED = new Set(['COMPLETE', 'ERROR', 'CANCELED'])

const STORAGE_KEY = 'cs_admin_video_jobs'
const LIMIT = 20
const EMPTY: VideoJob[] = []
const listeners = new Set<() => void>()
let jobs: VideoJob[] | null = null

function read(): VideoJob[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as VideoJob[]).filter((j) => j && typeof j.id === 'string') : EMPTY
  } catch {
    return EMPTY
  }
}

function snapshot(): VideoJob[] {
  if (jobs === null) jobs = read()
  return jobs
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function updateJobs(update: (prev: VideoJob[]) => VideoJob[]) {
  const prev = snapshot()
  const updated = update(prev)
  if (updated === prev) return
  const next = updated.slice(0, LIMIT)
  jobs = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Private mode or storage full: the list still works for this visit.
  }
  listeners.forEach((l) => l())
}

export function useVideoJobs(): VideoJob[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY)
}
