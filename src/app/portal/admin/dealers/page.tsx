import { redirect } from 'next/navigation'

/** The Dealer roster was consolidated into Contractors (Nov 2026); its old address leads there. */
export default function AdminDealerRosterPage() {
  redirect('/portal/admin/dealers/contractors/')
}
