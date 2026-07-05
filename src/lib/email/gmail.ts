import nodemailer from 'nodemailer'

const GMAIL_USER = 'info@rv-armor.com'
const FROM_NAME = 'RV ARMOR'

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  })
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const transport = createTransport()
  const toList = Array.isArray(to) ? to.join(', ') : to

  const result = await transport.sendMail({
    from: `${FROM_NAME} <${GMAIL_USER}>`,
    to: toList,
    subject,
    html,
    replyTo: replyTo || undefined,
  })

  console.log(`[Gmail] Email sent to ${toList}: ${result.messageId}`)
  return result
}

function formatFieldRow(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `<tr><td style="padding:6px 12px;font-weight:600;color:#555;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 12px;">${value}</td></tr>`
}

function wrapFieldsTable(rows: string): string {
  return `<table style="border-collapse:collapse;width:100%;max-width:600px;font-family:Arial,sans-serif;font-size:14px;">${rows}</table>`
}

// ---------------------------------------------------------------------------
// Contact Us (Lead) Notifications
// ---------------------------------------------------------------------------

interface LeadNotificationData {
  name: string
  email: string
  phone?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  rv_year?: string
  rv_make?: string
  rv_model?: string
  rv_length?: string
  roof_type?: string
  has_roof_damage?: boolean | null
  photo_urls?: string[]
  texting_consent?: boolean
  message?: string
  source_page?: string
}

export async function sendLeadNotification(data: LeadNotificationData) {
  const photoLinks = data.photo_urls?.length
    ? data.photo_urls.map((url, i) => `<a href="${url}" target="_blank">Photo ${i + 1}</a>`).join(', ')
    : undefined

  const rows = [
    formatFieldRow('Name', data.name),
    formatFieldRow('Email', data.email),
    formatFieldRow('Phone', data.phone),
    formatFieldRow('Street Address', data.street_address),
    formatFieldRow('City', data.city),
    formatFieldRow('State', data.state),
    formatFieldRow('ZIP Code', data.zip_code),
    formatFieldRow('RV Year', data.rv_year),
    formatFieldRow('RV Make', data.rv_make),
    formatFieldRow('RV Model', data.rv_model),
    formatFieldRow('RV Length', data.rv_length ? `${data.rv_length} ft` : undefined),
    formatFieldRow('Roof Type', data.roof_type),
    formatFieldRow('Roof Damage', data.has_roof_damage == null ? undefined : data.has_roof_damage ? 'Yes' : 'No'),
    formatFieldRow('Roof Photos', photoLinks),
    formatFieldRow('Message', data.message),
    formatFieldRow('Texting Consent', data.texting_consent ? 'Yes' : 'No'),
    formatFieldRow('Source Page', data.source_page),
  ].filter(Boolean).join('')

  await sendEmail({
    to: process.env.LEAD_NOTIFICATION_EMAIL || 'info@rv-armor.com',
    subject: 'New Contact Us Form Submission',
    html: wrapFieldsTable(rows),
  })
}

export async function sendLeadAutoReply(data: LeadNotificationData) {
  const firstName = data.name.split(' ')[0] || data.name

  const fieldRows = [
    formatFieldRow('Name', data.name),
    formatFieldRow('Email', data.email),
    formatFieldRow('Phone', data.phone),
    formatFieldRow('Street Address', data.street_address),
    formatFieldRow('City', data.city),
    formatFieldRow('State', data.state),
    formatFieldRow('ZIP Code', data.zip_code),
    formatFieldRow('RV Year', data.rv_year),
    formatFieldRow('RV Make', data.rv_make),
    formatFieldRow('RV Model', data.rv_model),
    formatFieldRow('RV Length', data.rv_length ? `${data.rv_length} ft` : undefined),
    formatFieldRow('Roof Type', data.roof_type),
    formatFieldRow('Roof Damage', data.has_roof_damage == null ? undefined : data.has_roof_damage ? 'Yes' : 'No'),
    formatFieldRow('Message', data.message),
  ].filter(Boolean).join('')

  await sendEmail({
    to: data.email,
    subject: "We've Received Your Form Entry!",
    html: `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;max-width:600px;">
        <p>Hi ${firstName},</p>
        <p>Thank you for contacting us!</p>
        <p>You're one step closer to having a seamless roofing system that is guaranteed for life! We are looking forward to connecting with you about joining the RV Armor family.</p>
        <p>One of our specialists will reach out as soon as possible. Please check your spam folder if you do not see it within 24 hours. You can also give us a call if you have any questions: <strong>855-782-7667</strong>.</p>
        <p>Have a wonderful day!</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
        <p style="font-size:12px;color:#888;margin-bottom:8px;">Your submission:</p>
        ${wrapFieldsTable(fieldRows)}
      </div>
    `,
  })
}

// ---------------------------------------------------------------------------
// Tech Lead Notifications
// ---------------------------------------------------------------------------

interface TechLeadNotificationData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  experience?: string
}

export async function sendTechLeadNotification(data: TechLeadNotificationData) {
  const rows = [
    formatFieldRow('Name', `${data.first_name} ${data.last_name}`),
    formatFieldRow('Email', data.email),
    formatFieldRow('Phone', data.phone),
    formatFieldRow('Street Address', data.street_address),
    formatFieldRow('City', data.city),
    formatFieldRow('State', data.state),
    formatFieldRow('ZIP Code', data.zip_code),
    formatFieldRow('Experience / Message', data.experience),
  ].filter(Boolean).join('')

  await sendEmail({
    to: process.env.LEAD_NOTIFICATION_EMAIL || 'info@rv-armor.com',
    subject: `New Tech Lead - ${data.first_name} ${data.last_name}`,
    html: wrapFieldsTable(rows),
    replyTo: 'jim@rv-armor.com',
  })
}

export async function sendTechLeadAutoReply(data: TechLeadNotificationData) {
  const fieldRows = [
    formatFieldRow('Name', `${data.first_name} ${data.last_name}`),
    formatFieldRow('Email', data.email),
    formatFieldRow('Phone', data.phone),
    formatFieldRow('Street Address', data.street_address),
    formatFieldRow('City', data.city),
    formatFieldRow('State', data.state),
    formatFieldRow('ZIP Code', data.zip_code),
    formatFieldRow('Experience / Message', data.experience),
  ].filter(Boolean).join('')

  await sendEmail({
    to: data.email,
    subject: "We've Received Your Form Entry!",
    html: `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;max-width:600px;">
        <p>Hi ${data.first_name},</p>
        <p>Thank you for contacting us!</p>
        <p>You're one step closer to becoming an RV Armor Technician! We are looking forward to connecting with you about joining the RV Armor family.</p>
        <p>The next stage of the process is filling out our application form <a href="https://rv-armor.com/tech-application/">here</a>:</p>
        <p><a href="https://rv-armor.com/tech-application/"><strong>Technician Application</strong></a></p>
        <p>Please fill out that form, and we will review your full application.</p>
        <p>Thank you and have a wonderful day!</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
        <p style="font-size:12px;color:#888;margin-bottom:8px;">Your submission:</p>
        ${wrapFieldsTable(fieldRows)}
      </div>
    `,
  })
}

// ---------------------------------------------------------------------------
// Tech Application Notifications
// ---------------------------------------------------------------------------

interface TechApplicationNotificationData {
  pdf_url?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  construction_experience?: string
  work_history?: Array<{ employer?: string; position?: string; dates?: string; reason_left?: string }>
  personal_references?: Array<{ name?: string; phone?: string; relationship?: string }>
  can_travel?: boolean
  travel_availability?: string
  is_fulltime_rver?: boolean
  fulltime_rver_duration?: string
  has_tools?: boolean
  can_work_outdoors?: boolean
  can_lift_50lbs?: boolean
  can_climb_ladders?: boolean
  vehicle_description?: string
  owns_vehicle?: boolean
  employment_type?: string
  felony_conviction?: boolean
  felony_explanation?: string
  has_working_capital?: boolean
  has_computer?: boolean
  computer_device?: string
  has_internet?: boolean
  computer_skill_level?: string
  proficient_google_drive?: boolean
  proficient_pdf?: boolean
  can_take_quality_photos?: boolean
  has_quality_camera?: boolean
  final_statement?: string
  consent_background_check?: boolean
}

function boolLabel(val: boolean | undefined): string | undefined {
  if (val === undefined) return undefined
  return val ? 'Yes' : 'No'
}

function formatWorkHistory(history?: TechApplicationNotificationData['work_history']): string {
  if (!history?.length) return ''
  return history.map((job, i) => {
    const parts = [
      job.employer ? `<strong>Employer:</strong> ${job.employer}` : '',
      job.position ? `<strong>Position:</strong> ${job.position}` : '',
      job.dates ? `<strong>Dates:</strong> ${job.dates}` : '',
      job.reason_left ? `<strong>Reason Left:</strong> ${job.reason_left}` : '',
    ].filter(Boolean).join('<br/>')
    return `<div style="margin-bottom:8px;"><em>Job ${i + 1}:</em><br/>${parts}</div>`
  }).join('')
}

function formatReferences(refs?: TechApplicationNotificationData['personal_references']): string {
  if (!refs?.length) return ''
  return refs.map((ref, i) => {
    const parts = [
      ref.name ? `<strong>Name:</strong> ${ref.name}` : '',
      ref.phone ? `<strong>Phone:</strong> ${ref.phone}` : '',
      ref.relationship ? `<strong>Relationship:</strong> ${ref.relationship}` : '',
    ].filter(Boolean).join('<br/>')
    return `<div style="margin-bottom:8px;"><em>Reference ${i + 1}:</em><br/>${parts}</div>`
  }).join('')
}

export async function sendTechApplicationNotification(data: TechApplicationNotificationData) {
  const workHistoryHtml = formatWorkHistory(data.work_history)
  const referencesHtml = formatReferences(data.personal_references)

  const rows = [
    formatFieldRow('Name', `${data.first_name} ${data.last_name}`),
    formatFieldRow('Email', data.email),
    formatFieldRow('Phone', data.phone),
    formatFieldRow('Date of Birth', data.date_of_birth),
    formatFieldRow('Street Address', data.street_address),
    formatFieldRow('City', data.city),
    formatFieldRow('State', data.state),
    formatFieldRow('ZIP Code', data.zip_code),
    formatFieldRow('Construction Experience', data.construction_experience),
    formatFieldRow('Can Travel', boolLabel(data.can_travel)),
    formatFieldRow('Travel Availability', data.travel_availability),
    formatFieldRow('Full-Time RVer', boolLabel(data.is_fulltime_rver)),
    formatFieldRow('Full-Time RVer Duration', data.fulltime_rver_duration),
    formatFieldRow('Has Tools', boolLabel(data.has_tools)),
    formatFieldRow('Can Work Outdoors', boolLabel(data.can_work_outdoors)),
    formatFieldRow('Can Lift 50 lbs', boolLabel(data.can_lift_50lbs)),
    formatFieldRow('Can Climb Ladders', boolLabel(data.can_climb_ladders)),
    formatFieldRow('Owns Vehicle', boolLabel(data.owns_vehicle)),
    formatFieldRow('Vehicle Description', data.vehicle_description),
    formatFieldRow('Employment Type', data.employment_type),
    formatFieldRow('Felony Conviction', boolLabel(data.felony_conviction)),
    formatFieldRow('Felony Explanation', data.felony_explanation),
    formatFieldRow('Has Working Capital', boolLabel(data.has_working_capital)),
    formatFieldRow('Has Computer', boolLabel(data.has_computer)),
    formatFieldRow('Computer Device', data.computer_device),
    formatFieldRow('Has Internet', boolLabel(data.has_internet)),
    formatFieldRow('Computer Skill Level', data.computer_skill_level),
    formatFieldRow('Proficient Google Drive', boolLabel(data.proficient_google_drive)),
    formatFieldRow('Proficient PDF', boolLabel(data.proficient_pdf)),
    formatFieldRow('Can Take Quality Photos', boolLabel(data.can_take_quality_photos)),
    formatFieldRow('Has Quality Camera', boolLabel(data.has_quality_camera)),
    formatFieldRow('Final Statement', data.final_statement),
    formatFieldRow('Consent to Background Check', boolLabel(data.consent_background_check)),
  ].filter(Boolean).join('')

  const pdfButton = data.pdf_url
    ? `<div style="margin:0 0 20px;text-align:center;">
        <a href="${data.pdf_url}" target="_blank" style="display:inline-block;background:#003365;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">View Full Application PDF</a>
      </div>`
    : ''

  let html = pdfButton + wrapFieldsTable(rows)

  if (workHistoryHtml) {
    html += `<h3 style="font-family:Arial,sans-serif;margin:16px 0 8px;">Work History</h3>${workHistoryHtml}`
  }
  if (referencesHtml) {
    html += `<h3 style="font-family:Arial,sans-serif;margin:16px 0 8px;">Personal References</h3>${referencesHtml}`
  }

  await sendEmail({
    to: ['rob@rv-armor.com', 'jim@rv-armor.com'],
    subject: `Application Submitted - ${data.first_name} ${data.last_name}`,
    html,
    replyTo: 'jim@rv-armor.com',
  })
}

export async function sendTechApplicationAutoReply(data: { first_name: string; last_name: string; email: string }) {
  const fieldRows = [
    formatFieldRow('Name', `${data.first_name} ${data.last_name}`),
    formatFieldRow('Email', data.email),
  ].filter(Boolean).join('')

  await sendEmail({
    to: data.email,
    subject: "We've Received Your Form Entry!",
    html: `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;max-width:600px;">
        <p>Hi ${data.first_name},</p>
        <p>Thank you for submitting your application!</p>
        <p>You're one step closer to becoming an RV Armor Technician! We are looking forward to connecting with you about joining the RV Armor family. One of our team members will review your application.</p>
        <p>Have a wonderful day!</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
        <p style="font-size:12px;color:#888;margin-bottom:8px;">Your submission:</p>
        ${wrapFieldsTable(fieldRows)}
      </div>
    `,
  })
}
