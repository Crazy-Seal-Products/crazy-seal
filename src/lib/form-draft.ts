'use client'

/**
 * Keeps a long form's progress on the visitor's device so a reload, a closed
 * pop-up, a new deploy, or the phone dropping the tab while they're in the
 * camera doesn't wipe it. Text and choices go in localStorage; photos (too big
 * for localStorage) go in IndexedDB. Everything fails quietly: drafts are a
 * convenience and the form works without them.
 */

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const DB_NAME = 'crazy-seal-form-drafts'
const STORE = 'files'

export type FieldValues = Record<string, string | boolean>

type StoredDraft<T> = { savedAt: number; data: T }

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(`draft:${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft<T>
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

export function saveDraft<T>(key: string, data: T) {
  try {
    window.localStorage.setItem(`draft:${key}`, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Storage full or blocked (private mode): skip.
  }
}

export async function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(`draft:${key}`)
  } catch {}
  await withStore('readwrite', (s) => s.delete(key)).catch(() => {})
}

/** Reads every named field in the form, skipping files and the honeypot. */
export function readFields(form: HTMLFormElement, skip: string[] = []): FieldValues {
  const out: FieldValues = {}
  for (const el of Array.from(form.elements)) {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) continue
    if (!el.name || skip.includes(el.name)) continue
    if (el instanceof HTMLInputElement) {
      if (el.type === 'file' || el.type === 'hidden' || el.type === 'password') continue
      if (el.type === 'checkbox') {
        out[el.name] = el.checked
        continue
      }
    }
    out[el.name] = el.value
  }
  return out
}

/**
 * Fills fields that are currently in the form and removes them from
 * `pending`. Fields that only appear after a choice is restored (e.g. RV
 * length) are filled on a later call once they've rendered.
 */
export function applyFields(form: HTMLFormElement, pending: FieldValues) {
  for (const [name, value] of Object.entries(pending)) {
    const el = form.elements.namedItem(name)
    if (!el || el instanceof RadioNodeList) continue
    if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = Boolean(value)
    else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) el.value = String(value)
    else continue
    delete pending[name]
  }
}

export async function loadDraftFiles<T>(key: string): Promise<T | null> {
  try {
    const stored = await withStore<StoredDraft<T> | undefined>('readonly', (s) => s.get(key))
    if (!stored?.savedAt || Date.now() - stored.savedAt > MAX_AGE_MS) return null
    return stored.data
  } catch {
    return null
  }
}

export async function saveDraftFiles<T>(key: string, data: T) {
  await withStore('readwrite', (s) => s.put({ savedAt: Date.now(), data }, key)).catch(() => {})
}

function withStore<R = unknown>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<R> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'))
    const open = indexedDB.open(DB_NAME, 1)
    open.onupgradeneeded = () => open.result.createObjectStore(STORE)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      try {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE))
        req.onsuccess = () => resolve(req.result as R)
        req.onerror = () => reject(req.error)
      } catch (err) {
        reject(err)
      } finally {
        db.close()
      }
    }
  })
}
