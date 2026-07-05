import nodemailer from 'nodemailer'

const GMAIL_USER = 'info@crazyseal.com'
const FROM_NAME = 'CRAZY SEAL'
const NOTIFY_TO = process.env.LEAD_NOTIFICATION_EMAIL || 'info@crazyseal.com'

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

function photoLinksHtml(urls?: string[]): string | undefined {
  return urls?.length
    ? urls.map((url, i) => `<a href="${url}" target="_blank">Photo ${i + 1}</a>`).join(', ')
    : undefined
}

// ---------------------------------------------------------------------------
// Contact / Quote (Lead) Notifications
// ---------------------------------------------------------------------------

interface LeadNotificationData {
  name: string
  email: string
  phone?: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  project_type?: string
  rv_length?: string
  square_footage?: string
  business_name?: string
  business_type?: string
  photo_urls?: string[]
  texting_consent?: boolean
  message?: string
  source_page?: string
}

function leadFieldRows(data: LeadNotificationData, includeMeta: boolean): string {
  return [
    formatFieldRow('Name', data.name),
    formatFieldRow('Email', data.email),
    formatFieldRow('Phone', data.phone),
    formatFieldRow('Street Address', data.street_address),
    formatFieldRow('City', data.city),
    formatFieldRow('State', data.state),
    formatFieldRow('ZIP Code', data.zip_code),
    formatFieldRow('Project Type', data.project_type),
    formatFieldRow('RV Length', data.rv_length ? `${data.rv_length} ft` : undefined),
    formatFieldRow('Square Footage', data.square_footage),
    formatFieldRow('Business Name', data.business_name),
    formatFieldRow('Business Type', data.business_type),
    formatFieldRow('Message', data.message),
    ...(includeMeta
      ? [
          formatFieldRow('Photos', photoLinksHtml(data.photo_urls)),
          formatFieldRow('Texting Consent', data.texting_consent ? 'Yes' : 'No'),
          formatFieldRow('Source Page', data.source_page),
        ]
      : []),
  ].filter(Boolean).join('')
}

export async function sendLeadNotification(data: LeadNotificationData) {
  await sendEmail({
    to: NOTIFY_TO,
    subject: 'New Website Form Submission',
    html: wrapFieldsTable(leadFieldRows(data, true)),
  })
}

export async function sendLeadAutoReply(data: LeadNotificationData) {
  const firstName = data.name.split(' ')[0] || data.name

  await sendEmail({
    to: data.email,
    subject: "We've Received Your Form Entry!",
    html: `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;max-width:600px;">
        <p>Hi ${firstName},</p>
        <p>Thank you for contacting Crazy Seal!</p>
        <p>You're one step closer to a seamless roofing system backed by our 50 year warranty. One of our specialists will reach out as soon as possible. Please check your spam folder if you do not see a reply within 24 hours.</p>
        <p>You can also give us a call if you have any questions: <strong>(800) 963-0131</strong> (M-F 9AM-6PM EST).</p>
        <p>Have a wonderful day!</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0;" />
        <p style="font-size:12px;color:#888;margin-bottom:8px;">Your submission:</p>
        ${wrapFieldsTable(leadFieldRows(data, false))}
      </div>
    `,
  })
}

// ---------------------------------------------------------------------------
// Warranty Notifications (registration / transfer / claim)
// ---------------------------------------------------------------------------

interface WarrantyNotificationData {
  kind: 'registration' | 'transfer' | 'claim'
  name: string
  email: string
  fields: Record<string, string | null | undefined>
  photo_urls?: string[]
}

const WARRANTY_SUBJECTS = {
  registration: 'New Warranty Registration',
  transfer: 'New Warranty Transfer Request',
  claim: 'New Warranty Claim',
} as const

export async function sendWarrantyNotification(data: WarrantyNotificationData) {
  const rows = [
    formatFieldRow('Name', data.name),
    formatFieldRow('Email', data.email),
    ...Object.entries(data.fields).map(([label, value]) => formatFieldRow(label, value)),
    formatFieldRow('Photos', photoLinksHtml(data.photo_urls)),
  ].filter(Boolean).join('')

  await sendEmail({
    to: NOTIFY_TO,
    subject: WARRANTY_SUBJECTS[data.kind],
    html: wrapFieldsTable(rows),
    replyTo: data.email,
  })
}

const WARRANTY_REPLY_COPY = {
  registration: {
    subject: 'Your Crazy Seal Warranty Registration Was Received!',
    body: `<p>Congratulations! We've received your warranty registration and photos. Once reviewed, your application is covered by our 50 year warranty.</p>
           <p>Keep your order number handy for any future correspondence.</p>`,
  },
  transfer: {
    subject: "We've Received Your Warranty Transfer Request",
    body: `<p>We've received your warranty transfer request and our team will process it shortly. We'll reach out if we need any additional information.</p>`,
  },
  claim: {
    subject: "We've Received Your Warranty Claim",
    body: `<p>We're sorry you're having an issue! Our team has received your warranty claim and will be in touch as soon as possible to make it right.</p>`,
  },
} as const

export async function sendWarrantyAutoReply(data: WarrantyNotificationData) {
  const firstName = data.name.split(' ')[0] || data.name
  const copy = WARRANTY_REPLY_COPY[data.kind]

  await sendEmail({
    to: data.email,
    subject: copy.subject,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;max-width:600px;">
        <p>Hi ${firstName},</p>
        ${copy.body}
        <p>Questions? Call us at <strong>(800) 963-0131</strong> (M-F 9AM-6PM EST) or reply to this email.</p>
        <p>— The Crazy Seal Team</p>
      </div>
    `,
  })
}
