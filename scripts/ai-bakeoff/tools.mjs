// Mock back-end tools for the dealer-assistant cases. The data is fictional
// (example.com addresses, 555 numbers) and stands in for the real lookups the
// production assistant would make against Supabase and Shopify.

export const TOOLS = [
  {
    name: 'lookup_order',
    description: 'Look up a Crazy Seal order by its order number (for example CS-10482). Returns status, dates, items, totals and tracking.',
    parameters: {
      type: 'object',
      properties: { order_number: { type: 'string', description: 'Order number, such as CS-10482.' } },
      required: ['order_number'],
    },
  },
  {
    name: 'lookup_warranty',
    description: 'Look up warranty registrations and transfers by the owner\'s email address. Returns each registration with its status.',
    parameters: {
      type: 'object',
      properties: { email: { type: 'string', description: 'Email address of the warranty owner.' } },
      required: ['email'],
    },
  },
  {
    name: 'lookup_customer',
    description: 'Find a customer or dealer account by email or phone number. Returns contact details and their order numbers, newest first.',
    parameters: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email address.' },
        phone: { type: 'string', description: 'Phone number, digits and dashes.' },
      },
    },
  },
]

const ORDERS = {
  'CS-10482': {
    order_number: 'CS-10482', status: 'shipped', placed: '2026-10-28', shipped: '2026-10-30',
    carrier: 'FedEx', tracking: '7790 1234 5566', customer_email: 'jane.doe@example.com',
    items: ['RV Roofing Kit, 200-300 sq ft, White', 'Crazy Clean, 1 gal'], total_usd: 1690.0,
  },
  'CS-10511': {
    order_number: 'CS-10511', status: 'delivered', placed: '2026-06-01', delivered: '2026-06-05',
    carrier: 'FedEx', customer_email: 'tom.becker@example.com',
    items: ['Direct-to-Deck RV Roofing Kit, Gray'], total_usd: 1120.0,
  },
  'CS-10533': {
    order_number: 'CS-10533', status: 'processing', placed: '2026-11-06',
    customer_email: 'ops@summitroofing.example', items: ['Crazy Seal, 5 gal, White x 4', 'Crazy Caulk, 11 oz tube x 12'], total_usd: 1380.0,
  },
  'CS-10391': {
    order_number: 'CS-10391', status: 'delivered', placed: '2026-08-14', delivered: '2026-08-19',
    customer_email: 'ops@summitroofing.example', items: ['RV Roofing Kit, 300-400 sq ft, White'], total_usd: 1985.0,
  },
}

const WARRANTIES = {
  'jane.doe@example.com': [],
  'mark.rivera@example.com': [
    { id: 'W-55120', type: 'transfer', status: 'pending review', submitted: '2026-11-03', original_owner: 'Linda Park', application: '2019 Grand Design fifth wheel' },
  ],
  'tom.becker@example.com': [],
}

const CUSTOMERS = [
  { name: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0142', type: 'retail', orders: ['CS-10482'] },
  { name: 'Tom Becker', email: 'tom.becker@example.com', phone: '555-0199', type: 'retail', orders: ['CS-10511'] },
  { name: 'Summit Roofing Co.', email: 'ops@summitroofing.example', phone: '555-0177', type: 'dealer', orders: ['CS-10533', 'CS-10391'] },
  { name: 'Mark Rivera', email: 'mark.rivera@example.com', phone: '555-0110', type: 'retail', orders: [] },
]

const digits = (s) => String(s ?? '').replace(/\D/g, '')

export function runTool(name, args = {}) {
  if (name === 'lookup_order') {
    const key = String(args.order_number ?? '').toUpperCase().replace(/^#/, '').replace(/^(\d)/, 'CS-$1')
    return ORDERS[key] ?? { found: false, message: `No order ${args.order_number}` }
  }
  if (name === 'lookup_warranty') {
    const list = WARRANTIES[String(args.email ?? '').toLowerCase()]
    return list ? { email: args.email, registrations: list } : { found: false, message: `No warranty records for ${args.email}` }
  }
  if (name === 'lookup_customer') {
    const email = String(args.email ?? '').toLowerCase()
    const phone = digits(args.phone).slice(-7)
    const hit = CUSTOMERS.find((c) => (email && c.email === email) || (phone && digits(c.phone) === phone))
    return hit ?? { found: false, message: 'No matching customer' }
  }
  return { error: `Unknown tool ${name}` }
}
