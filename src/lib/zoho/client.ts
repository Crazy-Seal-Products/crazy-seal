const ZOHO_API_DOMAIN = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Zoho CRM credentials not configured')
  }

  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error(`Zoho token refresh failed: ${response.status}`)
  }

  const data = await response.json()
  if (!data.access_token) {
    throw new Error('No access token in Zoho response')
  }

  return data.access_token
}

export interface ZohoLeadData {
  // Standard Zoho fields
  First_Name?: string
  Last_Name: string
  Email: string
  Phone?: string
  Street?: string
  City?: string
  State?: string
  Zip_Code?: string
  Lead_Source?: string
  Lead_Status?: string
  Owner?: string

  // Custom fields — API names must match Zoho CRM Leads module exactly
  How_did_you_hear_about_us?: string
  What_type_of_RV_roof_do_you_have?: string
  Lead_Form_Comments?: string
  How_old_is_your_roof?: string
  RV_Make?: string
  RV_Model?: string
  How_long_is_your_RV?: string
  Travel_South?: string
  States_Traveled_To?: string
  Do_you_have_roof_damage_or_an_existing_roof_leak?: string
  Photo_URLS?: string
  Tech_Application_Date?: string
  Tech_Application_PDF?: string

  // Attribution (new — not in legacy WP feed)
  UTM_Source?: string
  UTM_Medium?: string
  UTM_Campaign?: string
  Landing_Page?: string
  Referrer?: string
}

export async function createZohoLead(leadData: ZohoLeadData): Promise<{ id: string } | null> {
  try {
    const accessToken = await getAccessToken()

    const payload = {
      ...leadData,
      Lead_Status: leadData.Lead_Status || 'Not Contacted',
      Owner: leadData.Owner || process.env.ZOHO_LEAD_OWNER_ID || undefined,
    }

    const response = await fetch(`${ZOHO_API_DOMAIN}/crm/v7/Leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [payload],
        trigger: ['workflow'],
        duplicate_check_fields: ['Email'],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Zoho] Create lead failed:', response.status, error)
      return null
    }

    const result = await response.json()
    const createdLead = result.data?.[0]

    if (createdLead?.status === 'success') {
      return { id: createdLead.details.id }
    }

    console.error('[Zoho] Lead creation response:', createdLead)
    return null
  } catch (error) {
    console.error('[Zoho] Error creating lead:', error)
    return null
  }
}

export class ZohoScopeError extends Error {
  constructor(message = 'Zoho token is missing Contacts module scopes') {
    super(message)
    this.name = 'ZohoScopeError'
  }
}

function assertContactsScope(status: number, body: string) {
  if (status === 401 && /OAUTH_SCOPE_MISMATCH|invalid oauth scope/i.test(body)) {
    throw new ZohoScopeError(
      'Zoho token cannot read Contacts. Generate a new Self Client grant with scopes ZohoCRM.modules.contacts.READ,ZohoCRM.modules.contacts.UPDATE (plus the existing Leads scopes) and exchange it via scripts/zoho-setup.mjs.'
    )
  }
}

export interface ZohoContactReview {
  id: string
  email: string
  name: string | null
  reviews_for_marketing: string | null
}

async function zohoGet(path: string) {
  const accessToken = await getAccessToken()
  const response = await fetch(`${ZOHO_API_DOMAIN}${path}`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  })
  const text = await response.text()
  assertContactsScope(response.status, text)
  let json: Record<string, unknown> = {}
  try { json = text ? JSON.parse(text) : {} } catch { /* non-JSON error page */ }
  return { ok: response.ok, status: response.status, json, text }
}

/**
 * Page through Contacts that have a Reviews_for_Marketing picklist value set.
 * One search per picklist option (Zoho search cannot easily exclude "-None-").
 */
export async function listContactMarketingReviews(values: readonly string[]): Promise<ZohoContactReview[]> {
  const byEmail = new Map<string, ZohoContactReview>()

  for (const value of values) {
    for (let page = 1; page <= 10; page++) {
      const criteria = encodeURIComponent(`(Reviews_for_Marketing:equals:${value})`)
      const { ok, status, json, text } = await zohoGet(
        `/crm/v7/Contacts/search?criteria=${criteria}&fields=Email,Full_Name,Reviews_for_Marketing&page=${page}&per_page=200`
      )
      if (status === 204 || (json as { data?: unknown }).data == null) break
      if (!ok) {
        throw new Error(`Zoho Contacts search failed (${status}): ${text.slice(0, 400)}`)
      }
      const rows = (json as { data?: Array<Record<string, string | null>> }).data || []
      for (const row of rows) {
        const email = row.Email?.trim().toLowerCase()
        if (!email) continue
        byEmail.set(email, {
          id: String(row.id),
          email,
          name: row.Full_Name || null,
          reviews_for_marketing: row.Reviews_for_Marketing || value,
        })
      }
      const more = (json as { info?: { more_records?: boolean } }).info?.more_records
      if (!more || rows.length < 200) break
    }
  }

  return [...byEmail.values()]
}

export async function updateContactMarketingReview(email: string, value: string | null): Promise<boolean> {
  const criteria = encodeURIComponent(`(Email:equals:${email.trim()})`)
  const found = await zohoGet(
    `/crm/v7/Contacts/search?criteria=${criteria}&fields=id,Email,Reviews_for_Marketing&per_page=2`
  )
  if (found.status === 204 || !found.ok) return false
  const contact = (found.json as { data?: Array<{ id: string }> }).data?.[0]
  if (!contact?.id) return false

  const accessToken = await getAccessToken()
  const response = await fetch(`${ZOHO_API_DOMAIN}/crm/v7/Contacts`, {
    method: 'PUT',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: [{ id: contact.id, Reviews_for_Marketing: value || null }],
    }),
  })
  const text = await response.text()
  assertContactsScope(response.status, text)
  if (!response.ok) {
    console.error('[Zoho] Update contact review failed:', response.status, text.slice(0, 400))
    return false
  }
  return true
}
