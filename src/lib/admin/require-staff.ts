import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export interface StaffRecord {
  id: string
  auth_user_id: string | null
  name: string | null
  full_name?: string | null
  email: string
  role: string | null
  is_active: boolean
}

export async function requireStaff(): Promise<StaffRecord | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('staff')
    .select('*')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) return null
  return data as StaffRecord
}
