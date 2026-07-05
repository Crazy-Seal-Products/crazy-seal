# Page Building Rules - RV Armor

**Last Updated:** March 22, 2026
**Reference Page:** `src/app/page.tsx` (Homepage)

---

## Design Philosophy

RV Armor pages are **big, bold, and expansive**. Sections fill the viewport. Content breathes. Minimal padding, maximum impact. Think Apple.com meets industrial strength — clean whitespace with confident, full-width section cards.

---

## Layout Zones (Source of Truth)

The layout classification system lives in `src/lib/layout-config.ts`. It controls which chrome (header, footer, sidebar) each route zone gets.

| Zone | Routes | Header | Footer | Sidebar |
|------|--------|--------|--------|---------|
| `marketing` | All public pages | Yes | Yes | none |
| `admin` | `/admin/*` | No | No | admin |
| `lms` | `/lms/*` | No | No | lms |
| `bare` | `/print/*`, `/pdf/*`, `/api/*` | No | No | none |

Marketing pages get `Header` + `PageLayout` + `Footer` automatically from `GlobalLayout`. Admin and LMS have their own sidebar layouts. Never add headers/footers manually.

---

## Layout Hierarchy

```
GlobalLayout (automatic)
  -> PageLayout (automatic — just a <main> flex wrapper)
      -> Your Page Content
          -> Container size="xl" (max-width 1600px + horizontal padding)
              -> Section cards (rounded-3xl, full-width within container)
```

**PageLayout** adds no padding — it's just a flex wrapper. **Container** provides horizontal padding (`px-5 sm:px-6 lg:px-8`) and constrains width. Individual sections handle their own internal padding.

---

## Brand Colors (from `src/lib/design-system/tokens.ts`)

| Color | Hex | CSS Class | Usage |
|-------|-----|-----------|-------|
| **Navy (Primary)** | `#003365` | `bg-primary`, `text-primary` | Hero backgrounds, headings, nav |
| **Blue (Secondary)** | `#125F97` | `bg-secondary`, `text-secondary` | Gradients, accents |
| **Green (Accent)** | `#5BA411` | `bg-accent`, `text-accent` | CTAs, success, trust, eyebrows |
| **Yellow (Highlight)** | `#F9EA1C` | `text-highlight` | Hero emphasis text, badges |
| **Accent Dark** | `#4A870E` | `hover:bg-accent-dark` | Green button hover state |

**Gradients:**
- Hero/dark sections: `bg-primary` with radial overlays
- Subtle light: `from-primary/5 via-white to-secondary/5`

---

## Standard Page Template (Copy from Homepage)

```tsx
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  LinkButton,
  GoogleReviews,
} from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'

export default function YourPage() {
  return (
    <>
      {/* Hero — full-bleed dark section */}
      <Container size="xl">
        <div className="rounded-3xl bg-primary overflow-hidden">
          {/* Hero content */}
        </div>
      </Container>

      {/* Content sections — tight vertical rhythm */}
      <Container size="xl" className="pt-4 md:pt-8">
        <div className="rounded-3xl bg-white border border-gray-200/80 px-4 py-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Eyebrow" heading="Section Title" />
          {/* Section content */}
        </div>
      </Container>

      {/* Dark accent section */}
      <Container size="xl" className="pt-4 md:pt-8">
        <div className="rounded-3xl bg-primary overflow-hidden px-4 py-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Eyebrow" heading="Title" variant="dark" />
          {/* Dark section content */}
        </div>
      </Container>

      {/* CTA */}
      <Container size="xl" className="pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
```

---

## Section Patterns

### The RV Armor Section Card

Every content block is a **rounded-3xl card** inside a Container. This is the signature look.

**Light section (most common):**
```tsx
<Container size="xl" className="pt-4 md:pt-8">
  <div className="rounded-3xl bg-white border border-gray-200/80 px-4 py-6 md:p-6 lg:p-8">
    {/* Content */}
  </div>
</Container>
```

**Dark section (navy background):**
```tsx
<Container size="xl" className="pt-4 md:pt-8">
  <div className="rounded-3xl bg-primary overflow-hidden px-4 py-6 md:p-6 lg:p-8">
    {/* Content — use variant="dark" on SectionHeading, text-white, etc. */}
  </div>
</Container>
```

**Promo banner:**
```tsx
<Container size="xl" className="pt-4 md:pt-8">
  <PromoBanner buttonText="Learn More" buttonHref="/page" variant="primary" className="rounded-3xl py-8 sm:py-10">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
      <span className="text-highlight">Highlight Text</span> Rest of Title
    </h2>
  </PromoBanner>
</Container>
```

### Section Spacing

Sections use `className="pt-4 md:pt-8"` on the Container — not Stack, not margin classes. This keeps vertical rhythm tight and expansive.

**DO NOT** use `Stack gap="lg"` at the page level for marketing pages. Each Container manages its own top spacing.

### Hero Section

The hero is a full `bg-primary` card with radial gradient overlays for depth:

```tsx
<Container size="xl">
  <div className="relative rounded-3xl bg-primary overflow-hidden">
    {/* Radial gradient overlays for depth */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.1),transparent_40%)]" />

    <div className="relative z-10 px-4 py-6 sm:py-10 md:px-6 md:py-14 lg:px-8 lg:py-18">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left: text content */}
        {/* Right: video/image */}
      </div>
    </div>
  </div>
</Container>
```

### SectionHeading Component

Use for all section titles. Handles eyebrow, heading, and subheading with proper sizing.

```tsx
<SectionHeading
  eyebrow="Why RV Armor"              // xs uppercase tracking-[0.2em] in accent green
  heading="The RV Armor Experience"    // 3xl to 5xl bold in primary navy
  subheading="Description text..."     // base to lg in gray-500
  variant="dark"                       // optional: white text for dark backgrounds
  align="center"                       // default center, or "left"
/>
```

### Feature Cards Grid

```tsx
<Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
  <FeatureCard
    image="https://media.rv-armor.com/..."   // or icon={<Icon />}
    title="Card Title"
    description="Card description text."
  />
</Grid>
```

### ContentImageSection

Two-column text + image layout:

```tsx
<ContentImageSection
  imageSrc="https://media.rv-armor.com/..."
  imageAlt="Description"
  imagePosition="right"     // or "left"
  variant="light"           // or "dark"
>
  <SectionHeading heading="Title" align="left" />
  <p className="text-gray-600 text-base leading-relaxed">Content...</p>
</ContentImageSection>
```

---

## Key Components

Import everything from `@/lib/design-system`:

| Component | Usage |
|-----------|-------|
| `Container` | Width constraint + horizontal padding. Always `size="xl"` for pages |
| `SectionHeading` | Eyebrow + heading + subheading. Centered by default |
| `Grid` | Responsive grid. `responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }}` |
| `FeatureCard` | Image or icon card with title + description |
| `TestimonialCard` | Review card with photo, name, text |
| `LinkButton` | Styled anchor. Variants: `accent`, `outline`, `outline-white`, `white` |
| `PromoBanner` | Full-width colored banner with CTA button |
| `LogoStrip` | Horizontal logo row (As Seen In) |
| `GoogleReviews` | Featurable reviews widget |
| `ContentImageSection` | Two-column text + image |
| `VideoHero` | Hero with video player + CTA buttons |
| `BeforeAfterSlider` | Draggable before/after image comparison |
| `CtaSection` | Bottom-of-page call-to-action |
| `ContactModal` | Lead form modal |

---

## Spacing & Sizing Rules

### Expansive Layout Principles
- Sections fill the container width — no narrow centered content
- Internal padding is minimal but responsive: `px-4 py-6 md:p-6 lg:p-8`
- Let content breathe with generous grid gaps: `gap-6` to `gap-10`
- Hero padding is large: `py-6 sm:py-10 md:py-14 lg:py-18`
- Section-to-section gap is tight: `pt-4 md:pt-8` (cards feel like a continuous flow)

### Container Sizes
- `xl` (1600px) — Standard for all marketing pages
- `full` — Rare, for true edge-to-edge
- `default` (1280px) — Only for narrow content pages (legal, blog)

### Responsive Text
```
Headings: text-2xl sm:text-3xl lg:text-4xl xl:text-5xl
Body:     text-base sm:text-lg
Small:    text-sm md:text-base
Eyebrow:  text-xs uppercase tracking-[0.2em]
```

### Responsive Padding
```
Section card: px-4 py-6 md:p-6 lg:p-8
Hero:         px-4 py-6 sm:py-10 md:px-6 md:py-14 lg:px-8 lg:py-18
CTA:          py-10 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12
```

---

## Button Rules

- Use `LinkButton` (design system) for navigation, not raw `<a>` or `<button>`
- Primary CTA: `variant="accent"` (green)
- Secondary: `variant="outline"` or `variant="outline-white"` on dark backgrounds
- Phone: `variant="outline"` or `variant="outline-white"`
- Size: `size="lg"` for hero/CTA, `size="md"` default
- Center groups: `flex flex-col sm:flex-row items-center justify-center gap-4`
- NEVER use `w-full` on buttons
- ALWAYS let buttons have natural width

---

## Mobile Rules

1. **Grid cols**: Always start `mobile: 1`, scale up at `tablet` and `desktop`
2. **Button stacking**: `flex-col sm:flex-row` — stack on mobile, inline on desktop
3. **Text sizing**: Always responsive (`text-base sm:text-lg`)
4. **No overflow**: Use `overflow-hidden` on rounded cards, `truncate` on text
5. **Touch targets**: Minimum 44px height on interactive elements
6. **Horizontal scroll**: Use `overflow-x-auto snap-x` for carousels (see Before/After)

---

## Anti-Patterns

| DO NOT | DO INSTEAD |
|--------|------------|
| `<PageLayout>` in page files | GlobalLayout provides it automatically |
| `Stack gap="lg"` at page level | `Container className="pt-4 md:pt-8"` per section |
| `mb-8`, `mb-12` manual margins | Let section card pattern handle spacing |
| Import from `@/lib/design-system/components` | Import from `@/lib/design-system` |
| Fixed `text-4xl` without breakpoints | `text-2xl sm:text-3xl lg:text-4xl` |
| `w-full` on buttons | Center with `flex justify-center` |
| `p-12` without responsive | `px-4 py-6 md:p-6 lg:p-8` |
| Flat colored backgrounds | `rounded-3xl` cards with border or `bg-primary` |
| Generic hex colors | Use brand tokens: `bg-primary`, `text-accent`, `text-highlight` |

---

## Reference Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage — the gold standard for page structure |
| `src/lib/design-system/tokens.ts` | Color and spacing tokens (source of truth) |
| `src/lib/design-system/index.ts` | Component barrel export (import from here) |
| `src/lib/layout-config.ts` | Layout zone classification (header/footer/sidebar) |
| `src/components/VideoHero.tsx` | Reusable hero with video + CTA |
| `src/components/CtaSection.tsx` | Bottom-of-page CTA section |
| `src/components/ContactModal.tsx` | Lead form modal |

---

## Pre-Build Checklist

- [ ] Import from `@/lib/design-system` (not `/components` subpath)
- [ ] Use `Container size="xl"` for each section
- [ ] Each section is a `rounded-3xl` card (white+border or bg-primary)
- [ ] Section spacing via `className="pt-4 md:pt-8"` on Container
- [ ] Responsive text sizes on all headings
- [ ] Responsive padding on all cards
- [ ] Grids start at `mobile: 1` columns
- [ ] Buttons centered, not full-width
- [ ] Dark sections use `variant="dark"` on SectionHeading
- [ ] Hero has radial gradient overlays for depth
- [ ] No horizontal scroll on mobile (320px+)
- [ ] Test touch targets are 44px+
