import { redirect } from 'next/navigation'

/** The Staff page grew into Users & roles; old links land on its staff filter. */
export default function AdminStaffPage() {
  redirect('/portal/admin/users/?type=staff')
}
