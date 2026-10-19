export const WARRANTY_REGISTRATION_FORM_IDS = [3, 4] as const
const PLACEHOLDER_EMAILS = new Set(['unknown@legacy.import'])

export function isSendableCustomerEmail(email?: string | null): boolean {
  const value = email?.trim().toLowerCase() || ''
  return value.includes('@') && !PLACEHOLDER_EMAILS.has(value)
}

const FIELD_PATTERNS: Record<string, RegExp[]> = {
  first_name: [/^name \(first\)$/i, /^first name$/i, /^first$/i],
  last_name: [/^name \(last\)$/i, /^last name$/i, /^last$/i],
  full_name: [/^name$/i],
  email: [/^email$/i, /^email address$/i],
  phone: [/^phone$/i, /^phone number$/i],
  customer_details: [/customer details/i],
  order_number: [/^order number$/i, /order #/i, /crazy seal order number/i],
  project_type: [/project type/i, /describes your project/i],
  rv_length: [/how long is your rv/i, /rv length/i],
  square_footage: [/square footage/i],
  install_type: [/how was your kit installed/i, /installed\?$/i],
  installer_name: [/installer'?s? name/i],
  installer_phone: [/installer'?s? phone/i],
  installer_email: [/installer'?s? email/i],
  experience_notes: [/experience with crazy seal/i, /note about your experience/i],
  contractor_notes: [/contractor notes/i],
}

export function isWarrantyRegistrationForm(formId: number): boolean {
  return (WARRANTY_REGISTRATION_FORM_IDS as readonly number[]).includes(formId)
}

function pick(data: Record<string, string>, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const key = Object.keys(data).find((k) => pattern.test(k.trim()) && String(data[k] || '').trim())
    if (key) return String(data[key]).trim()
  }
  return null
}

export function mapLegacyWarrantyEntry(entry: {
  gf_entry_id: number
  gf_form_id: number
  entry_data: Record<string, string>
  file_urls?: string[] | null
  submitted_at?: string | null
  imported_at?: string | null
}) {
  const d = entry.entry_data || {}
  const get = (field: keyof typeof FIELD_PATTERNS) => pick(d, FIELD_PATTERNS[field])

  const name = [get('first_name'), get('last_name')].filter(Boolean).join(' ')
    || get('full_name')
    || get('email')
    || `GF Entry #${entry.gf_entry_id}`

  const installRaw = (get('install_type') || '').toLowerCase()
  const install_type = !installRaw ? null
    : /self|diy/.test(installRaw) ? 'diy'
    : 'contractor'

  const customer_details = [
    get('customer_details'),
    get('project_type') ? `Project type: ${get('project_type')}` : null,
    get('rv_length') ? `RV length: ${get('rv_length')}` : null,
    get('square_footage') ? `Square footage: ${get('square_footage')}` : null,
  ].filter(Boolean).join('\n') || null

  return {
    name,
    email: (get('email') || '').toLowerCase(),
    phone: get('phone'),
    customer_details,
    order_number: get('order_number'),
    install_type,
    installer_name: get('installer_name'),
    installer_phone: get('installer_phone'),
    installer_email: get('installer_email')?.toLowerCase() || null,
    photo_urls: entry.file_urls || [],
    experience_notes: get('experience_notes'),
    contractor_notes: get('contractor_notes'),
    warranty_consent: true,
    photo_display_consent: true,
    gf_entry_id: entry.gf_entry_id,
    wp_form_id: entry.gf_form_id,
    status: 'approved',
    admin_notes: `Imported from Gravity Forms entry #${entry.gf_entry_id}`,
    created_at: entry.submitted_at || entry.imported_at || undefined,
  }
}
