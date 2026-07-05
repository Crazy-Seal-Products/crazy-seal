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
