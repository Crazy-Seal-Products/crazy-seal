import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export function getPdfUrl(appId: string): string {
  return `https://rv-armor.com/api/tech-applications/${appId}/pdf`
}

function boolLabel(val: unknown): string {
  if (val === true) return 'Yes'
  if (val === false) return 'No'
  return '—'
}

function sanitize(text: string): string {
  return text.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim()
}

const BRAND_BLUE = rgb(0, 0.2, 0.4)
const LABEL_GRAY = rgb(0.33, 0.33, 0.33)
const VALUE_COLOR = rgb(0.13, 0.13, 0.13)
const DIVIDER_COLOR = rgb(0.85, 0.85, 0.85)

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 50
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = createAdminClient()
  const { data: app, error } = await supabase
    .from('tech_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const pdfDoc = await PDFDocument.create()
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      y = PAGE_HEIGHT - MARGIN
    }
  }

  function drawDivider(color = DIVIDER_COLOR, width = 0.5) {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: width,
      color,
    })
  }

  // Header
  page.drawText('RV ARMOR', {
    x: MARGIN + (CONTENT_WIDTH - bold.widthOfTextAtSize('RV ARMOR', 20)) / 2,
    y,
    size: 20,
    font: bold,
    color: BRAND_BLUE,
  })
  y -= 22
  const subtitle = 'Technician Application'
  page.drawText(subtitle, {
    x: MARGIN + (CONTENT_WIDTH - regular.widthOfTextAtSize(subtitle, 14)) / 2,
    y,
    size: 14,
    font: regular,
    color: LABEL_GRAY,
  })
  y -= 18
  const dateStr = `Submitted: ${new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
  page.drawText(dateStr, {
    x: MARGIN + (CONTENT_WIDTH - regular.widthOfTextAtSize(dateStr, 10)) / 2,
    y,
    size: 10,
    font: regular,
    color: rgb(0.53, 0.53, 0.53),
  })
  y -= 20
  drawDivider(BRAND_BLUE, 2)
  y -= 20

  function sectionTitle(title: string) {
    ensureSpace(40)
    y -= 10
    page.drawText(title, { x: MARGIN, y, size: 12, font: bold, color: BRAND_BLUE })
    y -= 12
    drawDivider()
    y -= 14
  }

  function drawWrappedText(text: string, x: number, maxW: number, fontSize: number, font_: typeof regular, color_ = VALUE_COLOR) {
    const clean = sanitize(text)
    const words = clean.split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (font_.widthOfTextAtSize(test, fontSize) > maxW) {
        ensureSpace(fontSize + 4)
        page.drawText(line, { x, y, size: fontSize, font: font_, color: color_ })
        y -= fontSize + 4
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      ensureSpace(fontSize + 4)
      page.drawText(line, { x, y, size: fontSize, font: font_, color: color_ })
      y -= fontSize + 5
    }
  }

  function questionRow(question: string, value: string | null | undefined) {
    const displayVal = sanitize((value || '').trim()) || '—'
    ensureSpace(28)
    drawWrappedText(question, MARGIN, CONTENT_WIDTH, 8, bold, LABEL_GRAY)
    y -= 1
    drawWrappedText(displayVal, MARGIN + 12, CONTENT_WIDTH - 12, 9, regular, VALUE_COLOR)
    y -= 4
  }

  // Personal Information
  sectionTitle('Personal Information')
  questionRow('Name', `${app.first_name} ${app.last_name}`)
  questionRow('Cell Phone', app.phone)
  questionRow('Email', app.email)
  questionRow('Date of Birth', app.date_of_birth)
  questionRow('Street Address', app.street_address)
  questionRow('City', app.city)
  questionRow('State', app.state)
  questionRow('ZIP Code', app.zip_code)

  // Experience
  sectionTitle('Experience')
  questionRow('Do you have construction experience? Please tell us a little about you and your work experience.', app.construction_experience)

  // Employment History
  const workHistory = (app.work_history || []) as Array<{
    employer_name?: string; employer?: string
    street?: string; street2?: string; city?: string; state?: string; zip?: string; country?: string
    position?: string
    start_date?: string; end_date?: string
    dates?: string
    reason_leaving?: string; reason_left?: string
    supervisor_name?: string; supervisor_phone?: string
  }>
  if (workHistory.length > 0) {
    sectionTitle('Employment History')
    workHistory.forEach((job, i) => {
      const empName = job.employer_name || job.employer
      if (!empName) return
      ensureSpace(30)
      page.drawText(`Employer ${i + 1}`, { x: MARGIN, y, size: 10, font: bold, color: BRAND_BLUE })
      y -= 16
      questionRow('Employer Name', empName)
      const addrParts = [job.street, job.street2, job.city, job.state, job.zip, job.country].filter(Boolean)
      if (addrParts.length > 0) questionRow('Employer Address', addrParts.join(', '))
      questionRow('Position Title, Duties, and Skills', job.position)
      if (job.start_date || job.end_date) {
        questionRow('Start Date', job.start_date)
        questionRow('End Date', job.end_date || 'Present')
      } else if (job.dates) {
        questionRow('Dates', job.dates)
      }
      questionRow('Reason for Leaving', job.reason_leaving || job.reason_left)
      if (job.supervisor_name) questionRow('Supervisor Name', job.supervisor_name)
      if (job.supervisor_phone) questionRow('Supervisor Phone', job.supervisor_phone)
      y -= 5
    })
  }

  // Personal References
  const references = (app.personal_references || []) as Array<{
    name?: string; phone?: string; years_known?: string; relationship?: string
  }>
  if (references.length > 0) {
    sectionTitle('Personal References')
    references.forEach((ref, i) => {
      if (!ref.name) return
      ensureSpace(30)
      page.drawText(`Reference ${i + 1}`, { x: MARGIN, y, size: 10, font: bold, color: BRAND_BLUE })
      y -= 16
      questionRow('Name', ref.name)
      questionRow('Phone', ref.phone)
      questionRow('Years Known', ref.years_known || ref.relationship)
      y -= 5
    })
  }

  // Questions
  sectionTitle('Questions')
  questionRow('Are you willing to travel?', boolLabel(app.can_travel))
  if (app.travel_availability) questionRow('If yes, what part of the country?', app.travel_availability)
  questionRow('Are you currently a fulltime RVer?', boolLabel(app.is_fulltime_rver))
  if (app.fulltime_rver_duration) questionRow('If yes, how long have you been full-timing?', app.fulltime_rver_duration)
  questionRow('Do you have your own set of basic construction tools?', boolLabel(app.has_tools))
  questionRow('Do you have any physical or medical conditions that prevent you from working in an outdoor environment?', boolLabel(app.can_work_outdoors))
  questionRow('Do you have any physical or medical conditions that prevent you from lifting 50lbs?', boolLabel(app.can_lift_50lbs))
  questionRow('Do you have any physical or medical conditions that prevent you from climbing ladders?', boolLabel(app.can_climb_ladders))
  questionRow('What kind of vehicle do you plan on using for your business?', app.vehicle_description)
  questionRow('Do you currently own this vehicle?', boolLabel(app.owns_vehicle))
  questionRow('Are you looking for part-time or full-time?', app.employment_type)
  questionRow('Have you ever been convicted of a felony?', boolLabel(app.felony_conviction))
  if (app.felony_explanation) questionRow('If yes, please explain.', app.felony_explanation)

  // Working Capital & Technology
  sectionTitle('Working Capital & Technology')
  questionRow('Do you have working capital to sustain your business?', boolLabel(app.has_working_capital))
  questionRow('Do you have access to a computer?', boolLabel(app.has_computer))
  if (app.computer_device) questionRow('If yes, please list your device.', app.computer_device)
  questionRow('Do you have regular access to the internet?', boolLabel(app.has_internet))
  questionRow('On a scale from 1-10 how would you rank your computer and internet skills?', app.computer_skill_level)
  questionRow('Are you proficient in the use of Google Drive?', boolLabel(app.proficient_google_drive))
  questionRow('Are you proficient in the use of PDF files?', boolLabel(app.proficient_pdf))
  questionRow('Can you take quality job progress pictures and upload them with proper instructions from us?', boolLabel(app.can_take_quality_photos))
  questionRow('Do you have a good quality phone camera or regular camera for taking quality pictures?', boolLabel(app.has_quality_camera))

  // Final Statement
  if (app.final_statement) {
    sectionTitle('Tell us why you believe you have the right stuff to be a part of our team.')
    drawWrappedText(sanitize(app.final_statement), MARGIN, CONTENT_WIDTH, 9, regular, VALUE_COLOR)
  }

  questionRow('Consent to Background Check', boolLabel(app.consent_background_check))

  // Footer
  ensureSpace(40)
  y -= 20
  drawDivider(BRAND_BLUE, 1)
  y -= 14
  const footer = 'RV Armor - Technician Application | Generated automatically | Confidential'
  page.drawText(footer, {
    x: MARGIN + (CONTENT_WIDTH - regular.widthOfTextAtSize(footer, 8)) / 2,
    y,
    size: 8,
    font: regular,
    color: rgb(0.53, 0.53, 0.53),
  })

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(Buffer.from(pdfBytes) as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Tech-Application-${app.first_name}-${app.last_name}.pdf"`,
    },
  })
}
