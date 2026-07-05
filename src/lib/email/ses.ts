import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@rv-armor.com'

interface EmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, text, replyTo }: EmailParams): Promise<boolean> {
  try {
    const toAddresses = Array.isArray(to) ? to : [to]

    await ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: toAddresses },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          ...(text ? { Text: { Data: text, Charset: 'UTF-8' } } : {}),
        },
      },
      ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
    }))

    return true
  } catch (error) {
    console.error('[SES] Send email error:', error)
    return false
  }
}

export async function sendLeadNotification(lead: {
  name: string
  email: string
  phone?: string
  street_address?: string
  zip_code?: string
  rv_year?: string
  rv_make?: string
  rv_model?: string
  rv_length?: string
  roof_type?: string
  has_roof_damage?: boolean
  how_heard?: string
  travels_south?: string
  location?: string
  message?: string
  source_page?: string
}): Promise<boolean> {
  const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL
  if (!notifyEmail) return false

  const rvInfo = [lead.rv_year, lead.rv_make, lead.rv_model].filter(Boolean).join(' ')
  const locationInfo = [lead.street_address, lead.zip_code].filter(Boolean).join(', ') || lead.location

  const row = (label: string, value: string) =>
    `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">${label}:</td><td style="padding: 8px 0; color: #111827;">${value}</td></tr>`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #003365; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">New Lead from RV Armor</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${row('Name', lead.name)}
          <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${lead.email}" style="color: #003365;">${lead.email}</a></td></tr>
          ${lead.phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${lead.phone}" style="color: #003365;">${lead.phone}</a></td></tr>` : ''}
          ${locationInfo ? row('Location', locationInfo) : ''}
          ${rvInfo ? row('RV', rvInfo) : ''}
          ${lead.rv_length ? row('Length', `${lead.rv_length} ft`) : ''}
          ${lead.roof_type ? row('RV Type', lead.roof_type) : ''}
          ${lead.has_roof_damage !== undefined ? row('Roof Damage', lead.has_roof_damage ? 'Yes' : 'No') : ''}
          ${lead.how_heard ? row('How Heard', lead.how_heard) : ''}
          ${lead.travels_south ? row('Travels South', lead.travels_south) : ''}
          ${lead.source_page ? row('Source', lead.source_page) : ''}
        </table>
        ${lead.message ? `<div style="margin-top: 16px; padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;"><p style="font-weight: bold; color: #374151; margin: 0 0 8px 0;">Message:</p><p style="color: #111827; margin: 0; white-space: pre-wrap;">${lead.message}</p></div>` : ''}
      </div>
    </div>
  `

  return sendEmail({
    to: notifyEmail,
    subject: `New RV Armor Lead: ${lead.name}${lead.source_page ? ` (from ${lead.source_page})` : ''}`,
    html,
    replyTo: lead.email,
  })
}

export async function sendLeadAutoReply(lead: {
  name: string
  email: string
}): Promise<boolean> {
  const firstName = lead.name.split(' ')[0] || lead.name

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #003365; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">RV Armor</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">The Last Roof Your RV Will Ever Need</p>
      </div>
      <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #111827; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thank you for reaching out to RV Armor! We received your request and a member of our team will be in touch within 24 hours.</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">In the meantime, here are some helpful resources:</p>
        <ul style="color: #374151; font-size: 16px; line-height: 1.8;">
          <li><a href="https://rv-armor.com/faq" style="color: #003365;">Frequently Asked Questions</a></li>
          <li><a href="https://rv-armor.com/pricing" style="color: #003365;">Pricing Information</a></li>
          <li><a href="https://rv-armor.com/photos" style="color: #003365;">Our Work Gallery</a></li>
        </ul>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">If you need immediate assistance, call us at <a href="tel:+18559782767" style="color: #003365; font-weight: bold;">(855) 978-2767</a>.</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The RV Armor Team</strong></p>
      </div>
      <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background: #f9fafb;">
        <p style="margin: 0;">RV Armor | (855) 978-2767 | rv-armor.com</p>
      </div>
    </div>
  `

  return sendEmail({
    to: lead.email,
    subject: `We received your quote request, ${firstName}!`,
    html,
  })
}
