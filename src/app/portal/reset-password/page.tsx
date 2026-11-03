import type { Metadata } from 'next'
import { PortalResetPassword } from '@/components/portal/PortalResetPassword'

export const metadata: Metadata = { title: 'Reset password' }

export default function PortalResetPasswordPage() {
  return <PortalResetPassword />
}
