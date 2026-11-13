'use server'

import { completePasswordSetup } from './password-setup'

export type SetPasswordState = { ok: true; email: string } | { ok: false; error: string; expired?: boolean } | null

/** The set-your-own-password form. The token comes from the emailed link. */
export async function setPasswordFromLink(_prev: SetPasswordState, form: FormData): Promise<SetPasswordState> {
  return completePasswordSetup(String(form.get('token') ?? ''), String(form.get('password') ?? ''), String(form.get('confirm') ?? ''))
}
