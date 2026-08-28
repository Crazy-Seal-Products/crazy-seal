import { sendEmail } from './gmail'

const LOGO_URL = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-150.png'
const TRANSFER_URL = 'https://crazyseal.com/warranty-transfer'
const WARRANTY_URL = 'https://crazyseal.com/warranty'
const PROFESSIONALS_URL = 'https://crazyseal.com/professionals'

export interface WarrantyRegistrationMailInput {
  name: string
  email: string
  phone?: string | null
  order_number?: string | null
  project_type?: string | null
  rv_length?: string | null
  square_footage?: string | number | null
  customer_details?: string | null
  install_type?: string | null
  installer_name?: string | null
  installer_phone?: string | null
  installer_email?: string | null
  rating?: string | number | null
  experience_notes?: string | null
  contractor_notes?: string | null
  photo_urls?: string[] | null
  certificate_url: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function firstName(name: string): string {
  return escapeHtml(name.trim().split(/\s+/)[0] || name)
}

function safeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.href
  } catch {
    // ignore invalid URLs
  }
  return null
}

function installTypeLabel(installType?: string | null): string | undefined {
  if (installType === 'diy') return 'Self installed (DIY)'
  if (installType === 'contractor') return 'Installed by a dealer / contractor'
  return installType || undefined
}

function ratingLabel(rating?: string | number | null): string | undefined {
  if (rating == null || rating === '') return undefined
  return `${rating} / 5`
}

function fieldRow(label: string, value: string | number | null | undefined): string {
  if (value == null || value === '') return ''
  return `<tr>
    <td style="padding:8px 12px;font-weight:600;color:#555;vertical-align:top;width:40%;border-bottom:1px solid #f0f2f5;">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;color:#222;border-bottom:1px solid #f0f2f5;white-space:pre-wrap;">${escapeHtml(String(value))}</td>
  </tr>`
}

function detailsTable(rows: string): string {
  if (!rows) return ''
  return `<table style="border-collapse:collapse;width:100%;margin:8px 0 0;font-size:14px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;">${rows}</table>`
}

function photoGalleryHtml(urls?: string[] | null): string {
  if (!urls?.length) return ''
  const cells = urls
    .map((url, i) => {
      const safe = safeUrl(url)
      if (!safe) return ''
      const href = escapeHtml(safe)
      return `<td style="padding:4px;width:25%;vertical-align:top;">
        <a href="${href}" target="_blank" rel="noopener noreferrer">
          <img src="${href}" alt="Application photo ${i + 1}" width="130" style="display:block;width:100%;max-width:130px;height:90px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;" />
        </a>
      </td>`
    })
    .filter(Boolean)

  if (!cells.length) return ''

  const rows: string[] = []
  for (let i = 0; i < cells.length; i += 4) {
    rows.push(`<tr>${cells.slice(i, i + 4).join('')}</tr>`)
  }

  return `
    <p style="margin:20px 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">Application photos</p>
    <table style="border-collapse:collapse;width:100%;">${rows.join('')}</table>
  `
}

function certificateButton(url: string, label: string): string {
  const safe = safeUrl(url)
  if (!safe) return ''
  return `<p style="margin:24px 0 8px;text-align:center;">
    <a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer"
       style="display:inline-block;background:#5BA411;color:#ffffff;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none;">
      ${escapeHtml(label)}
    </a>
  </p>
  <p style="font-size:12px;color:#888;text-align:center;margin:0 0 16px;">
    Save or bookmark this link — you can view and print the certificate any time.
  </p>`
}

function brandedEmail(opts: { heading: string; subheading?: string; body: string }): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:24px 12px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#003365;padding:28px 24px;text-align:center;">
        <img src="${LOGO_URL}" alt="Crazy Seal" height="48" style="height:48px;margin-bottom:12px;" />
        <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;">${escapeHtml(opts.heading)}</h1>
        ${opts.subheading ? `<p style="margin:8px 0 0;color:#bfdbfe;font-size:13px;">${escapeHtml(opts.subheading)}</p>` : ''}
      </div>
      <div style="padding:28px 24px;color:#333333;font-size:14px;line-height:1.6;">
        ${opts.body}
      </div>
      <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#888888;line-height:1.6;">
        Crazy Seal Products, Inc. · (800) 963-0131 · info@crazyseal.com<br/>
        4654 E State Road 64 #204, Bradenton, FL 34208
      </div>
    </div>
  </div>`
}

function customerDetailRows(data: WarrantyRegistrationMailInput): string {
  return [
    fieldRow('Name', data.name),
    fieldRow('Email', data.email),
    fieldRow('Phone', data.phone),
    fieldRow('Order Number', data.order_number),
    fieldRow('Project Type', data.project_type),
    fieldRow('RV Length', data.rv_length),
    fieldRow('Square Footage', data.square_footage),
    fieldRow('Customer Details', data.customer_details),
    fieldRow('Installation', installTypeLabel(data.install_type)),
    fieldRow("Installer's Name", data.installer_name),
    fieldRow("Installer's Phone", data.installer_phone),
    fieldRow("Installer's Email", data.installer_email),
    fieldRow('Experience Rating', ratingLabel(data.rating)),
    fieldRow('Your Notes', data.experience_notes),
    fieldRow('Contractor Notes', data.contractor_notes),
  ].join('')
}

function installerDetailRows(data: WarrantyRegistrationMailInput): string {
  return [
    fieldRow('Customer', data.name),
    fieldRow('Customer Email', data.email),
    fieldRow('Customer Phone', data.phone),
    fieldRow('Order Number', data.order_number),
    fieldRow('Project Type', data.project_type),
    fieldRow('RV Length', data.rv_length),
    fieldRow('Square Footage', data.square_footage),
    fieldRow('Customer Details', data.customer_details),
    fieldRow('Installation', installTypeLabel(data.install_type)),
    fieldRow('Your Name', data.installer_name),
    fieldRow('Your Phone', data.installer_phone),
    fieldRow('Your Email', data.installer_email),
    fieldRow('Customer Experience Rating', ratingLabel(data.rating)),
    fieldRow('Customer Notes', data.experience_notes),
    fieldRow('Contractor Notes', data.contractor_notes),
  ].join('')
}

export function hasInstallerRecipient(
  installerEmail?: string | null,
  customerEmail?: string | null,
): boolean {
  const installer = installerEmail?.trim().toLowerCase()
  if (!installer || !installer.includes('@')) return false
  const customer = customerEmail?.trim().toLowerCase()
  return installer !== customer
}

export function customerConfirmationHtml(data: WarrantyRegistrationMailInput): string {
  const orderNote = data.order_number
    ? `<p>Keep your order number <strong>${escapeHtml(String(data.order_number))}</strong> handy for any future correspondence.</p>`
    : ''

  return brandedEmail({
    heading: 'Your 50-Year Warranty Is Registered',
    subheading: 'Crazy Seal Products, Inc.',
    body: `
      <p>Hi ${firstName(data.name)},</p>
      <p>Congratulations! We've received your warranty registration and photos. Your Crazy Seal application is covered by our <strong>50-year warranty</strong> against defects in materials.</p>
      ${certificateButton(data.certificate_url, 'View Your Warranty Certificate')}
      ${orderNote}
      <p style="margin:24px 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">Your registration details</p>
      ${detailsTable(customerDetailRows(data))}
      ${photoGalleryHtml(data.photo_urls)}
      <p style="margin-top:24px;">This warranty is transferable if you sell the RV or property. New owners can submit a transfer at <a href="${TRANSFER_URL}" style="color:#003365;">crazyseal.com/warranty-transfer</a>. Claims can be filed at <a href="${WARRANTY_URL}" style="color:#003365;">crazyseal.com/warranty</a>.</p>
      <p>Questions? Call us at <strong>(800) 963-0131</strong> (M–F 9AM–6PM EST) or reply to this email.</p>
      <p>— The Crazy Seal Team</p>
    `,
  })
}

export function installerConfirmationHtml(data: WarrantyRegistrationMailInput): string {
  const installerGreeting = data.installer_name
    ? firstName(data.installer_name)
    : 'there'

  return brandedEmail({
    heading: 'Warranty Registered for Your Installation',
    subheading: 'A customer filed a Crazy Seal 50-year warranty',
    body: `
      <p>Hi ${installerGreeting},</p>
      <p><strong>${escapeHtml(data.name)}</strong> just registered a Crazy Seal 50-year warranty for a project you installed. A copy of the certificate is below so you have it on file — your customer received the same confirmation.</p>
      ${certificateButton(data.certificate_url, 'View Warranty Certificate')}
      <p style="margin:24px 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">Project details</p>
      ${detailsTable(installerDetailRows(data))}
      ${photoGalleryHtml(data.photo_urls)}
      <p style="margin-top:24px;">Thank you for installing Crazy Seal. If you want more jobs referred your way, learn about the Professional Partner program at <a href="${PROFESSIONALS_URL}" style="color:#003365;">crazyseal.com/professionals</a>.</p>
      <p>Questions? Call us at <strong>(800) 963-0131</strong> (M–F 9AM–6PM EST) or reply to this email.</p>
      <p>— The Crazy Seal Team</p>
    `,
  })
}

export async function sendWarrantyCustomerConfirmation(data: WarrantyRegistrationMailInput) {
  await sendEmail({
    to: data.email,
    subject: 'Your Crazy Seal 50-Year Warranty Is Registered',
    html: customerConfirmationHtml(data),
  })
}

export async function sendWarrantyInstallerConfirmation(data: WarrantyRegistrationMailInput) {
  if (!hasInstallerRecipient(data.installer_email, data.email) || !data.installer_email) return

  await sendEmail({
    to: data.installer_email,
    subject: `Warranty registered for your Crazy Seal installation — ${data.name}`,
    html: installerConfirmationHtml(data),
    replyTo: data.email,
  })
}

export async function sendWarrantyRegistrationConfirmations(data: WarrantyRegistrationMailInput) {
  await sendWarrantyCustomerConfirmation(data)

  if (!hasInstallerRecipient(data.installer_email, data.email)) {
    return { customer: true, installer: false }
  }

  try {
    await sendWarrantyInstallerConfirmation(data)
    return { customer: true, installer: true }
  } catch (err) {
    console.error('[Gmail] Installer confirmation error:', err)
    throw new Error('Customer email sent, but the installer email failed.')
  }
}
