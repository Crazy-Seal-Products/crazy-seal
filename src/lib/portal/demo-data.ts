/**
 * Seeded sample data for the Pro Portal demo account. Everything here is
 * fictional and only ever rendered behind the demo sign-in.
 */

export type LeadStage = 'new' | 'contacted' | 'quoted' | 'won'

export interface DemoLead {
  id: string
  name: string
  city: string
  application: 'RV' | 'Commercial' | 'Residential' | 'Transportation'
  sqft: number
  value: number
  stage: LeadStage
  source: 'Crazy Seal referral' | 'Website' | 'Repeat customer' | 'Trade show'
  received: string
}

export interface DemoOrder {
  id: string
  item: string
  date: string
  total: number
  status: 'processing' | 'shipped' | 'delivered'
}

export interface DemoWarranty {
  id: string
  customer: string
  application: string
  installed: string
  sqft: number
  status: 'registered' | 'pending_photos' | 'transferred'
}

export const LEAD_STAGES: { id: LeadStage; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'won', label: 'Won' },
]

const LEADS: Record<string, DemoLead[]> = {
  summit: [
    { id: 'L-2291', name: 'Brookside Self Storage', city: 'Maryville, TN', application: 'Commercial', sqft: 12800, value: 21400, stage: 'quoted', source: 'Crazy Seal referral', received: 'Oct 17' },
    { id: 'L-2288', name: 'Dana Whitfield', city: 'Knoxville, TN', application: 'Residential', sqft: 1450, value: 3900, stage: 'new', source: 'Website', received: 'Oct 16' },
    { id: 'L-2284', name: 'Valley Feed & Supply', city: 'Lenoir City, TN', application: 'Commercial', sqft: 6400, value: 11200, stage: 'contacted', source: 'Crazy Seal referral', received: 'Oct 14' },
    { id: 'L-2279', name: 'Hollis Freight', city: 'Alcoa, TN', application: 'Transportation', sqft: 3600, value: 8600, stage: 'won', source: 'Repeat customer', received: 'Oct 11' },
    { id: 'L-2275', name: 'Pine Ridge Church', city: 'Sevierville, TN', application: 'Commercial', sqft: 9200, value: 16300, stage: 'quoted', source: 'Trade show', received: 'Oct 9' },
    { id: 'L-2270', name: 'Marcus Lee', city: 'Oak Ridge, TN', application: 'RV', sqft: 320, value: 1850, stage: 'new', source: 'Crazy Seal referral', received: 'Oct 8' },
    { id: 'L-2266', name: 'Eastgate Plaza', city: 'Knoxville, TN', application: 'Commercial', sqft: 18500, value: 29800, stage: 'contacted', source: 'Website', received: 'Oct 5' },
  ],
}

const ORDERS: Record<string, DemoOrder[]> = {
  summit: [
    { id: '#CS-48213', item: 'Commercial Kit · 6,400 sq ft', date: 'Oct 15', total: 7480, status: 'processing' },
    { id: '#CS-48107', item: 'Double Layer Kit · 3,600 sq ft', date: 'Oct 2', total: 4150, status: 'shipped' },
    { id: '#CS-47952', item: 'Crazy Patch ×12, Crazy Tape ×6', date: 'Sep 21', total: 940, status: 'delivered' },
    { id: '#CS-47810', item: 'Commercial Kit · 12,000 sq ft', date: 'Sep 8', total: 13260, status: 'delivered' },
  ],
}

const WARRANTIES: Record<string, DemoWarranty[]> = {
  summit: [
    { id: 'W-90412', customer: 'Hollis Freight', application: 'Box truck fleet (6)', installed: 'Oct 14', sqft: 3600, status: 'pending_photos' },
    { id: 'W-90377', customer: 'Riverside Dental', application: 'Commercial flat roof', installed: 'Sep 30', sqft: 5800, status: 'registered' },
    { id: 'W-90251', customer: 'Fountain City Storage', application: 'Self storage', installed: 'Sep 12', sqft: 12000, status: 'registered' },
    { id: 'W-89980', customer: 'J. & M. Walker', application: 'Residential flat roof', installed: 'Aug 22', sqft: 1200, status: 'transferred' },
  ],
}

export function demoLeads(accountId: string): DemoLead[] {
  return LEADS[accountId] ?? []
}

export function demoOrders(accountId: string): DemoOrder[] {
  return ORDERS[accountId] ?? []
}

export function demoWarranties(accountId: string): DemoWarranty[] {
  return WARRANTIES[accountId] ?? []
}

export const ANNOUNCEMENTS = [
  { tag: 'New', title: 'Facilities brochure refreshed', body: 'Updated for 2026 trade-show season — grab it in Module 3.', href: '/portal/modules/sales/' },
  { tag: 'Tip', title: 'Loop a video in your lobby', body: 'The loopable videos work great on a showroom TV.', href: '/portal/modules/sales/' },
  { tag: 'Live', title: 'Co-branded presentation pages', body: 'Put your logo on the customer presentation in White Label Studio.', href: '/portal/white-label/' },
]
