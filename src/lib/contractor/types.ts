// Records and labels for the contractor portal (tables in
// supabase/migrations/027_contractor_portal.sql and 032_contractor_projects.sql).
// Plain module: safe to import from client components.

import type { ContractorRow } from '@/lib/contractors/types'
import type { ContractorRole, MemberStatus } from './roles'

/** A contractors row with the pricing columns added in 031_pricing.sql. */
export interface PortalContractor extends ContractorRow {
  pricing_tier_id: string | null
  rep_id: string | null
  payment_terms: 'card' | 'terms'
}

export interface MemberRow {
  pro_user_id: string
  contractor_id: string
  role: ContractorRole
  status: MemberStatus
  title: string | null
  invited_by: string | null
  created_at: string
  updated_at: string
}

/** A team member with their Pro Hub account. */
export interface TeamMember extends MemberRow {
  email: string
  name: string | null
  phone: string | null
  last_login_at: string | null
  has_password: boolean
}

export const CUSTOMER_TYPES = [
  'RV owner',
  'Homeowner',
  'Building owner',
  'Property manager',
  'Facility manager',
  'General contractor',
  'Fleet',
  'Other',
] as const

export interface CustomerRow {
  id: string
  contractor_id: string
  name: string
  type: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  assigned_to: string | null
  lead_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

/** A project's stage, in order. `lost` sits outside the flow. */
export const PROJECT_STAGES = ['lead', 'quoted', 'won', 'ordered', 'in_progress', 'complete', 'lost'] as const
export type ProjectStage = (typeof PROJECT_STAGES)[number]

export const PROJECT_STAGE_LABEL: Record<ProjectStage, string> = {
  lead: 'Lead',
  quoted: 'Quoted',
  won: 'Won',
  ordered: 'Materials ordered',
  in_progress: 'Installing',
  complete: 'Complete',
  lost: 'Lost',
}

/** The stages shown as board columns, left to right. */
export const BOARD_STAGES: readonly ProjectStage[] = ['lead', 'quoted', 'won', 'ordered', 'in_progress', 'complete']

/** Where the crew is while a project is installing. */
export const INSTALL_STEPS = ['clean_prep', 'seams', 'first_coat', 'second_coat'] as const
export type InstallStep = (typeof INSTALL_STEPS)[number]

export const INSTALL_STEP_LABEL: Record<InstallStep, string> = {
  clean_prep: 'Clean & prep',
  seams: 'Seams & details',
  first_coat: 'First coat',
  second_coat: 'Second coat',
}

export const PROJECT_SOURCES = ['Crazy Seal page', 'Referral', 'Website', 'Repeat customer', 'Walk-in', 'Trade show', 'Other'] as const

export const ROOF_TYPES = ['RV roof', 'Metal', 'Flat / low slope', 'TPO', 'EPDM', 'Modified bitumen', 'Shingle', 'Commercial roof', 'Other'] as const

export const ROOF_COLORS = ['White', 'Gray', 'Tan'] as const

/** contractor_projects.site: where the roof is. */
export interface ProjectSite {
  street?: string
  city?: string
  state?: string
  zip?: string
}

export interface ProjectRow {
  id: string
  contractor_id: string
  customer_id: string | null
  lead_id: string | null
  name: string
  stage: ProjectStage
  install_step: InstallStep | null
  value: number
  roof_type: string | null
  sqft: number | null
  seams: number | null
  color: string | null
  site: ProjectSite | null
  source: string | null
  crew: string | null
  start_date: string | null
  completed_on: string | null
  expected_close: string | null
  notes: string | null
  assigned_to: string | null
  ops_lead_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export const ACTIVITY_ACTIONS = ['create', 'update', 'delete', 'sign_in', 'view_as', 'request'] as const
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number]

export interface ActivityRow {
  id: number
  at: string
  contractor_id: string
  actor_id: string | null
  actor_name: string
  actor_role: string | null
  entity: string
  entity_id: string | null
  action: ActivityAction
  summary: string
  changes: Record<string, [unknown, unknown]> | null
}

/** "Jordan Ellis", or the company or email when there's no name. */
export function contractorName(c: Pick<ContractorRow, 'company' | 'first_name' | 'goes_by' | 'last_name' | 'email'>): string {
  const person = [c.goes_by || c.first_name, c.last_name].filter(Boolean).join(' ')
  return c.company || person || c.email || 'Contractor'
}
