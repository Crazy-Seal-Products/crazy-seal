import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createZohoLead } from '@/lib/zoho/client'
import { sendTechApplicationNotification, sendTechApplicationAutoReply } from '@/lib/email/gmail'
import { getPdfUrl } from '@/app/api/tech-applications/[id]/pdf/route'

function toBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.toLowerCase() === 'yes' || val === 'true'
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      first_name, last_name, email, phone,
      date_of_birth, street_address, city, state, zip_code,
      construction_experience,
      work_history, personal_references,
      can_travel, travel_availability,
      is_fulltime_rver, fulltime_rver_duration,
      has_tools,
      can_work_outdoors, can_lift_50lbs, can_climb_ladders,
      vehicle_description, owns_vehicle,
      employment_type,
      felony_conviction, felony_explanation,
      has_working_capital,
      has_computer, computer_device, has_internet,
      computer_skill_level,
      proficient_google_drive, proficient_pdf,
      can_take_quality_photos, has_quality_camera,
      final_statement, consent_background_check,
    } = body

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: app, error: insertError } = await supabase
      .from('tech_applications')
      .insert({
        first_name,
        last_name,
        email: email.toLowerCase(),
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        street_address: street_address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        construction_experience: construction_experience || null,
        work_history: work_history || null,
        personal_references: personal_references || null,
        can_travel: toBool(can_travel),
        travel_availability: travel_availability || null,
        is_fulltime_rver: toBool(is_fulltime_rver),
        fulltime_rver_duration: fulltime_rver_duration || null,
        has_tools: toBool(has_tools),
        can_work_outdoors: toBool(can_work_outdoors),
        can_lift_50lbs: toBool(can_lift_50lbs),
        can_climb_ladders: toBool(can_climb_ladders),
        vehicle_description: vehicle_description || null,
        owns_vehicle: toBool(owns_vehicle),
        employment_type: employment_type || null,
        felony_conviction: toBool(felony_conviction),
        felony_explanation: felony_explanation || null,
        has_working_capital: toBool(has_working_capital),
        has_computer: toBool(has_computer),
        computer_device: computer_device || null,
        has_internet: toBool(has_internet),
        computer_skill_level: computer_skill_level || null,
        proficient_google_drive: toBool(proficient_google_drive),
        proficient_pdf: toBool(proficient_pdf),
        can_take_quality_photos: toBool(can_take_quality_photos),
        has_quality_camera: toBool(has_quality_camera),
        final_statement: final_statement || null,
        consent_background_check: toBool(consent_background_check),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[TechApp] Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save application.' }, { status: 500 })
    }

    const leadComments = [
      construction_experience,
      final_statement,
    ].filter(Boolean).join('\n\n')

    const pdfUrlForZoho = getPdfUrl(app.id)

    createZohoLead({
      First_Name: first_name,
      Last_Name: last_name,
      Email: email.toLowerCase(),
      Phone: phone || undefined,
      Street: street_address || undefined,
      City: city || undefined,
      State: state || undefined,
      Zip_Code: zip_code || undefined,
      Lead_Form_Comments: leadComments || undefined,
      Lead_Source: 'Website Lead form',
      Lead_Status: 'Application Returned',
      Owner: process.env.ZOHO_TECH_LEAD_OWNER_ID || undefined,
      Tech_Application_Date: new Date().toISOString().split('T')[0],
      Tech_Application_PDF: pdfUrlForZoho,
    }).then(async (zohoResult) => {
      if (zohoResult) {
        await supabase
          .from('tech_applications')
          .update({
            zoho_lead_id: zohoResult.id,
            zoho_synced_at: new Date().toISOString(),
          })
          .eq('id', app.id)
      }
    }).catch(err => console.error('[TechApp] Zoho push error:', err))

    sendTechApplicationNotification({
      pdf_url: pdfUrlForZoho,
      first_name, last_name, email, phone,
      date_of_birth, street_address, city, state, zip_code,
      construction_experience,
      work_history, personal_references,
      can_travel: toBool(can_travel),
      travel_availability,
      is_fulltime_rver: toBool(is_fulltime_rver),
      fulltime_rver_duration,
      has_tools: toBool(has_tools),
      can_work_outdoors: toBool(can_work_outdoors),
      can_lift_50lbs: toBool(can_lift_50lbs),
      can_climb_ladders: toBool(can_climb_ladders),
      vehicle_description, owns_vehicle: toBool(owns_vehicle),
      employment_type,
      felony_conviction: toBool(felony_conviction),
      felony_explanation,
      has_working_capital: toBool(has_working_capital),
      has_computer: toBool(has_computer),
      computer_device,
      has_internet: toBool(has_internet),
      computer_skill_level,
      proficient_google_drive: toBool(proficient_google_drive),
      proficient_pdf: toBool(proficient_pdf),
      can_take_quality_photos: toBool(can_take_quality_photos),
      has_quality_camera: toBool(has_quality_camera),
      final_statement,
      consent_background_check: toBool(consent_background_check),
    }).catch(err => console.error('[Gmail] Tech app notification error:', err))

    sendTechApplicationAutoReply({ first_name, last_name, email })
      .catch(err => console.error('[Gmail] Tech app auto-reply error:', err))

    return NextResponse.json({ success: true, application_id: app.id })
  } catch (err) {
    console.error('[TechApp] API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
