/**
 * Business Accelerator Program — module curriculum for the Pro Portal.
 *
 * Mirrors the six public BAP modules (/resources/*) and reuses their real
 * videos and assets, broken into bite-sized lessons with progress tracking.
 */

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export type LessonKind = 'video' | 'assets' | 'checklist' | 'quiz'

export interface LessonResource {
  label: string
  href: string
  type: 'pdf' | 'page' | 'video' | 'images' | 'folder'
  note?: string
}

export interface LessonQuiz {
  question: string
  options: string[]
  answer: number
  explain: string
}

export interface Lesson {
  id: string
  title: string
  kind: LessonKind
  minutes: number
  summary: string
  vimeoId?: string
  youtubeId?: string
  poster?: string
  points?: string[]
  resources?: LessonResource[]
  checklist?: string[]
  quiz?: LessonQuiz
}

export interface PortalModule {
  slug: string
  number: number
  eyebrow: string
  title: string
  summary: string
  outcome: string
  thumbnail: string
  /** lucide icon name, resolved in the UI */
  icon: 'PlayCircle' | 'Megaphone' | 'Presentation' | 'Package' | 'Wrench' | 'FileCheck'
  publicHref: string
  lessons: Lesson[]
}

export const PORTAL_MODULES: PortalModule[] = [
  {
    slug: 'welcome-to-crazy-seal',
    number: 1,
    eyebrow: 'Welcome',
    title: 'Welcome to Crazy Seal',
    summary: 'Get up to speed on the system, the story, and why customers pay for it.',
    outcome: 'Explain the Crazy Seal system confidently in under two minutes.',
    thumbnail: `${MEDIA}/2024/04/Module-1-Thumbnail.jpg`,
    icon: 'PlayCircle',
    publicHref: '/resources/welcome-to-crazy-seal/',
    lessons: [
      {
        id: 'welcome',
        title: 'Welcome from the team',
        kind: 'video',
        minutes: 6,
        vimeoId: '937517485',
        poster: `${MEDIA}/2024/04/Module-1-Thumbnail.jpg`,
        summary: 'A quick hello and a tour of how the Business Accelerator Program is laid out.',
        points: [
          'How the six modules build on each other',
          'Where to find marketing, sales and install assets',
          'Who to call when you need help: (800) 963-0131',
        ],
      },
      {
        id: '21-reasons',
        title: '21½ reasons Crazy Seal is better',
        kind: 'video',
        minutes: 9,
        youtubeId: 'C5FvTulPDaY',
        poster: `${MEDIA}/2021/11/21-Reasons-Video-Cover-No-Icon.jpg`,
        summary: 'The full overview your customers will see — fiber infusion, more actual silicone, and the 3 part sealing system.',
        resources: [
          { label: '21½ Reasons PDF', href: `${MEDIA}/2020/02/21-Reasons.pdf`, type: 'pdf' },
          { label: 'Our System page', href: '/crazy-seal/', type: 'page' },
        ],
      },
      {
        id: 'lets-get-crazy',
        title: "Let's get crazy",
        kind: 'video',
        minutes: 3,
        youtubeId: 'VoPjXn8YCk4',
        poster: `${MEDIA}/2021/11/Lets-Get-Crazy-Video-Cover-1024x576.jpg`,
        summary: 'The brand in three minutes — share it with your crew so everyone tells the same story.',
      },
      {
        id: 'price-question',
        title: 'Handling "why does it cost more?"',
        kind: 'video',
        minutes: 5,
        youtubeId: 'AJpCXi3hqOI',
        poster: `${MEDIA}/2023/07/Why-is-Crazy-Seal-More-Expensive-Thumbnail.jpg`,
        summary: 'You can buy cheaper — you can’t buy better. How to frame value against a one-time, 50-year roof.',
        points: [
          'More actual silicone, no cheap fillers',
          'Do it once vs. recoating every few years',
          'Backed by a 50 year warranty',
        ],
      },
      {
        id: 'quick-check',
        title: 'Quick check',
        kind: 'quiz',
        minutes: 1,
        summary: 'One question to lock it in.',
        quiz: {
          question: 'How long is the Crazy Seal warranty your customers receive?',
          options: ['10 years', '25 years', '50 years'],
          answer: 2,
          explain: 'Every Crazy Seal roof is backed by a 50 year warranty — lead with it.',
        },
      },
      {
        id: 'first-week',
        title: 'Your first-week checklist',
        kind: 'checklist',
        minutes: 10,
        summary: 'Small steps that set up a smooth launch.',
        checklist: [
          'Watch the overview video with your whole crew',
          'Save the support line: (800) 963-0131',
          'Download the 21½ Reasons PDF to your phone',
          'Set up your co-branded materials in White Label Studio',
          'Book time this week for Module 2: Marketing',
        ],
      },
    ],
  },
  {
    slug: 'marketing',
    number: 2,
    eyebrow: 'Marketing',
    title: 'Pre-Built Marketing Campaigns',
    summary: 'Just press play — ready-made video ads, image packs, emails and AI prompts.',
    outcome: 'Launch your first campaign with assets you didn’t have to make.',
    thumbnail: `${MEDIA}/2024/04/Module-2-Thumbnail.jpg`,
    icon: 'Megaphone',
    publicHref: '/resources/marketing/',
    lessons: [
      {
        id: 'overview',
        title: 'How the campaigns work',
        kind: 'video',
        minutes: 7,
        vimeoId: '937517463',
        poster: `${MEDIA}/2024/04/Module-2-Thumbnail.jpg`,
        summary: 'What’s in the marketing library and how partners use it to fill their calendar.',
        resources: [
          {
            label: 'Crazy Seal brand kit',
            href: `${MEDIA}/2024/04/Crazy-Seal-Brand-Kit-8.5-×-11-in.jpg`,
            type: 'images',
          },
        ],
      },
      {
        id: 'video-ads',
        title: 'Video ad packages',
        kind: 'assets',
        minutes: 8,
        summary: '21 ready-to-run video packages with ad copy examples for social and search.',
        resources: [{ label: 'Browse video packages', href: '/marketing/videos/', type: 'video', note: '21 packages' }],
      },
      {
        id: 'image-packages',
        title: 'Image packages',
        kind: 'assets',
        minutes: 5,
        summary: 'Before/after and lifestyle images sorted by application.',
        resources: [
          { label: 'RV images', href: '/marketing/images/rv-images/', type: 'images' },
          { label: 'Commercial images', href: '/marketing/images/commercial-images/', type: 'images' },
          { label: 'Residential images', href: '/marketing/images/residential-images/', type: 'images' },
        ],
      },
      {
        id: 'email-templates',
        title: 'Email templates',
        kind: 'video',
        minutes: 6,
        vimeoId: '937522833',
        poster: `${MEDIA}/2024/04/Module-2-Thumbnail.jpg`,
        summary: 'Plug-and-play follow-ups for new leads, quotes and past customers.',
        resources: [{ label: 'Email templates', href: '/marketing/email-templates/', type: 'page' }],
      },
      {
        id: 'ai-prompts',
        title: 'AI prompts for marketing',
        kind: 'video',
        minutes: 6,
        vimeoId: '937522726',
        poster: `${MEDIA}/2024/04/Module-2-Thumbnail.jpg`,
        summary: 'Prompts that turn ChatGPT into your copywriter for posts, ads and emails.',
        resources: [{ label: 'Marketing AI prompts', href: '/marketing/ai-prompts/', type: 'page' }],
      },
    ],
  },
  {
    slug: 'sales',
    number: 3,
    eyebrow: 'Sales',
    title: 'Assets to Sell and Close Deals',
    summary: 'Digital presentation pages, brochures and videos — by application.',
    outcome: 'Walk into any RV or facilities appointment with a polished pitch.',
    thumbnail: `${MEDIA}/2024/04/Module-3-Thumbnail.jpg`,
    icon: 'Presentation',
    publicHref: '/resources/sales/',
    lessons: [
      {
        id: 'overview',
        title: 'Selling the system',
        kind: 'video',
        minutes: 8,
        vimeoId: '937517448',
        poster: `${MEDIA}/2024/04/Module-3-Thumbnail.jpg`,
        summary: 'How top partners present Crazy Seal and close on the first visit.',
      },
      {
        id: 'rv-kit',
        title: 'RV sales kit',
        kind: 'video',
        minutes: 6,
        vimeoId: '418309408',
        poster: `${MEDIA}/2021/11/Pro-Installation-Video-Cover-1024x576.jpg`,
        summary: 'The RV presentation video, brochure, F&I sheet and Trailer Life feature.',
        resources: [
          { label: 'RV brochure', href: `${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-Final.pdf`, type: 'pdf' },
          { label: 'Dealer F&I two-sheet', href: `${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`, type: 'pdf' },
          { label: 'Trailer Life feature', href: `${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`, type: 'pdf' },
          { label: 'RV sales assets page', href: '/resources/sales/rv/', type: 'page' },
        ],
      },
      {
        id: 'facilities-kit',
        title: 'Facilities sales kit',
        kind: 'video',
        minutes: 6,
        vimeoId: '935230279',
        poster: `${MEDIA}/2024/03/IFMA-Cover-1024x576.jpg`,
        summary: 'Commercial facilities explainer, brochure and the RFMA Facilitator feature.',
        resources: [
          { label: 'Facilities brochure', href: `${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download.pdf`, type: 'pdf' },
          {
            label: 'RFMA Facilitator article',
            href: `${MEDIA}/2022/02/Crazy-Seal-President-in-Facilitator-February_March-2022.pdf`,
            type: 'pdf',
          },
          { label: 'Facilities presentation page', href: '/facilities-overview/', type: 'page' },
        ],
      },
      {
        id: 'loopable-videos',
        title: 'Loopable videos for your website',
        kind: 'assets',
        minutes: 3,
        summary: 'Silent loops and embed codes for your homepage, lobby screen or trade-show booth.',
        resources: [{ label: 'Loopable videos', href: '/resources/sales/loopable-videos/', type: 'video' }],
      },
      {
        id: 'ai-prompts',
        title: 'AI prompts for sales',
        kind: 'video',
        minutes: 5,
        vimeoId: '937522660',
        poster: `${MEDIA}/2024/04/Module-3-Thumbnail.jpg`,
        summary: 'Prompts for objection handling, follow-ups and proposal write-ups.',
        resources: [{ label: 'Sales AI prompts', href: '/resources/sales/ai-prompts/', type: 'page' }],
      },
      {
        id: 'presentation',
        title: 'The customer presentation page',
        kind: 'assets',
        minutes: 4,
        summary: 'A digital presentation you can pull up on a tablet at the appointment — or co-brand in White Label Studio.',
        resources: [{ label: 'Open the RV presentation', href: '/rv-roofing/', type: 'page' }],
      },
    ],
  },
  {
    slug: 'building-a-kit',
    number: 4,
    eyebrow: 'Building a Kit',
    title: 'Get the Products You Need',
    summary: 'Pre-built kits for most jobs, or build your own from the product lineup.',
    outcome: 'Spec and order the right kit for a job in minutes.',
    thumbnail: `${MEDIA}/2024/04/Module-4-Thumbnail.jpg`,
    icon: 'Package',
    publicHref: '/resources/building-a-kit/',
    lessons: [
      {
        id: 'overview',
        title: 'Kits 101',
        kind: 'video',
        minutes: 7,
        vimeoId: '937517426',
        poster: `${MEDIA}/2024/04/Module-4-Thumbnail.jpg`,
        summary: 'Which kit fits which roof, and when to build your own.',
        resources: [
          { label: 'Kit Builder', href: '/kit-builder/', type: 'page' },
          { label: 'Double Layer Kits', href: '/store/double-layer-kit/', type: 'page' },
          { label: 'Direct to Deck Kits', href: '/store/direct-to-deck-kit/', type: 'page' },
        ],
      },
      {
        id: 'products',
        title: 'The product lineup',
        kind: 'assets',
        minutes: 5,
        summary: 'Crazy Seal, Crazy Patch, Crazy Caulk, Crazy Tape, Crazy Clean and Crazy Cloth.',
        resources: [
          { label: 'Crazy Seal roof membrane', href: '/products/crazy-seal-roof-membrane/', type: 'page' },
          { label: 'Crazy Patch', href: '/products/crazy-patch/', type: 'page' },
          { label: 'Crazy Caulk', href: '/products/crazy-caulk/', type: 'page' },
          { label: 'Crazy Tape', href: '/products/crazy-tape/', type: 'page' },
          { label: 'Crazy Clean', href: '/products/crazy-clean/', type: 'page' },
        ],
      },
      {
        id: 'quick-check',
        title: 'Quick check',
        kind: 'quiz',
        minutes: 1,
        summary: 'Pick the right kit.',
        quiz: {
          question: 'A customer wants to seal directly over wood decking. Which kit do you spec?',
          options: ['Double Layer Kit', 'Direct to Deck Kit', 'Crazy Good Repair Kit'],
          answer: 1,
          explain: 'Direct to Deck Kits are made for sealing directly over wood decking.',
        },
      },
      {
        id: 'job-checklist',
        title: 'Before you order',
        kind: 'checklist',
        minutes: 5,
        summary: 'A quick pre-order checklist for every job.',
        checklist: [
          'Measure the roof’s square footage',
          'Note seams, vents and penetrations that need sealing first',
          'Choose a pre-built kit or build your own',
          'Confirm the ship-to address and install date',
        ],
      },
    ],
  },
  {
    slug: 'installation',
    number: 5,
    eyebrow: 'Installation',
    title: 'Installing Our System',
    summary: 'Professional installation, step by step, with videos and PDFs.',
    outcome: 'Install to spec so every roof qualifies for the 50 year warranty.',
    thumbnail: `${MEDIA}/2024/04/Module-5-Thumbnail.jpg`,
    icon: 'Wrench',
    publicHref: '/resources/installation/',
    lessons: [
      {
        id: 'overview',
        title: 'Installation overview',
        kind: 'video',
        minutes: 9,
        vimeoId: '937517369',
        poster: `${MEDIA}/2024/04/Module-5-Thumbnail.jpg`,
        summary: 'Prep, problem areas first, then the seamless membrane over every square inch.',
      },
      {
        id: 'membrane-roof',
        title: 'Over an existing membrane roof',
        kind: 'assets',
        minutes: 12,
        summary: 'Videos and PDFs for installing over EPDM, TPO and other membranes.',
        resources: [{ label: 'Membrane roof installation', href: '/installation/membrane-roof/', type: 'page' }],
      },
      {
        id: 'direct-to-deck',
        title: 'Direct to deck',
        kind: 'assets',
        minutes: 12,
        summary: 'Installing directly over wood decking, start to finish.',
        resources: [{ label: 'Direct to deck installation', href: '/installation/direct-to-deck/', type: 'page' }],
      },
      {
        id: 'quick-check',
        title: 'Quick check',
        kind: 'quiz',
        minutes: 1,
        summary: 'Sequence matters.',
        quiz: {
          question: 'In the 3 part sealing system, what comes first?',
          options: ['The final membrane coat', 'Sealing the problem areas', 'Cleaning up after install'],
          answer: 1,
          explain: 'Eliminate problem areas first, then finish with a seamless membrane over the whole roof.',
        },
      },
      {
        id: 'tech-data',
        title: 'Technical data',
        kind: 'assets',
        minutes: 4,
        summary: 'Specs and data sheets for inspectors, facility managers and spec writers.',
        resources: [{ label: 'Technical data', href: '/technical-data/', type: 'page' }],
      },
    ],
  },
  {
    slug: 'warranty',
    number: 6,
    eyebrow: 'Warranty',
    title: 'File Your Customer’s Warranty',
    summary: 'Register the 50 year warranty on your customer’s behalf.',
    outcome: 'Register every job the day it’s finished.',
    thumbnail: `${MEDIA}/2024/04/Module-6-Thumbnail.jpg`,
    icon: 'FileCheck',
    publicHref: '/resources/warranty/',
    lessons: [
      {
        id: 'overview',
        title: 'How warranty registration works',
        kind: 'video',
        minutes: 6,
        vimeoId: '937517390',
        poster: `${MEDIA}/2024/04/Module-6-Thumbnail.jpg`,
        summary: 'What to collect on site and how to file for your customer.',
        resources: [
          { label: 'Warranty certificate (PDF)', href: `${MEDIA}/2019/06/Crazy-Seal-Warranty-Certificate-Download.pdf`, type: 'pdf' },
        ],
      },
      {
        id: 'register',
        title: 'Register a warranty',
        kind: 'checklist',
        minutes: 5,
        summary: 'Your on-site checklist — then file it from the Warranties tab.',
        checklist: [
          'Take before, during and after photos',
          'Record the install date and roof square footage',
          'Collect the customer’s contact details',
          'File the registration from the Warranties tab',
        ],
        resources: [{ label: 'Public warranty registration', href: '/warranty/', type: 'page' }],
      },
      {
        id: 'transfer',
        title: 'Warranty transfers',
        kind: 'assets',
        minutes: 3,
        summary: 'When your customer sells the RV or building, the warranty can transfer.',
        resources: [{ label: 'Warranty transfer', href: '/warranty-transfer/', type: 'page' }],
      },
    ],
  },
]

export function getPortalModule(slug: string): PortalModule | undefined {
  return PORTAL_MODULES.find((m) => m.slug === slug)
}

export function lessonKey(moduleSlug: string, lessonId: string): string {
  return `${moduleSlug}/${lessonId}`
}

export const TOTAL_LESSONS = PORTAL_MODULES.reduce((n, m) => n + m.lessons.length, 0)

export function moduleMinutes(m: PortalModule): number {
  return m.lessons.reduce((n, l) => n + l.minutes, 0)
}

export function moduleProgress(m: PortalModule, completed: ReadonlySet<string>) {
  const done = m.lessons.filter((l) => completed.has(lessonKey(m.slug, l.id))).length
  return { done, total: m.lessons.length, pct: Math.round((done / m.lessons.length) * 100) }
}

/** First module that isn't finished (or the last one when everything is done). */
export function currentModule(completed: ReadonlySet<string>): PortalModule {
  return (
    PORTAL_MODULES.find((m) => m.lessons.some((l) => !completed.has(lessonKey(m.slug, l.id)))) ??
    PORTAL_MODULES[PORTAL_MODULES.length - 1]
  )
}

export function nextLesson(m: PortalModule, completed: ReadonlySet<string>): Lesson {
  return m.lessons.find((l) => !completed.has(lessonKey(m.slug, l.id))) ?? m.lessons[0]
}
