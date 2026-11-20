import { createAdminClient } from '@/lib/supabase/admin'

/** A Pro Hub sign-up flagged for review (lib/pro/signup-flags) that no one has looked at yet. */
export interface FlaggedSignup {
  id: string
  email: string
  created_at: string
  flagged_at: string
  reasons: string[]
  signup_ip: string | null
  has_password: boolean
  last_login_at: string | null
}

/** The review queue, newest flag first. Empty until migration 034 adds the flag columns. */
export async function getFlaggedSignups(): Promise<FlaggedSignup[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('pro_users')
    .select('id, email, created_at, flagged_at, flag_reasons, signup_ip, password_hash, last_login_at')
    .not('flagged_at', 'is', null)
    .is('flag_reviewed_at', null)
    .order('flagged_at', { ascending: false })
    .limit(200)
  if (error) {
    if (error.code === '42703') return [] // flag columns not added yet
    throw new Error(error.message)
  }
  return (data ?? []).map(({ password_hash, flag_reasons, ...u }) => ({
    ...u,
    reasons: flag_reasons ?? [],
    has_password: Boolean(password_hash),
  }))
}
