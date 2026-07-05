# Mobile-First Design Rules - RV Armor

**Last Updated:** March 22, 2026

## Core Principle

Every page must look great on a 375px screen first, then scale up. RV Armor's expansive section-card layout naturally adapts — cards stack vertically, grids collapse to single columns, and padding reduces.

---

## Critical Rules

### 1. Button Centering
- NEVER `w-full` or `flex-1` on buttons
- ALWAYS center: `flex flex-col sm:flex-row items-center justify-center gap-4`
- Buttons stack vertically on mobile, go inline on `sm:`

### 2. No Overflow
- ALWAYS `overflow-hidden` on rounded cards and media containers
- ALWAYS `truncate` or `line-clamp-2` on dynamic text
- NEVER allow horizontal scroll (except intentional carousels with `overflow-x-auto snap-x`)

### 3. Responsive Grids
- ALWAYS start `mobile: 1` in Grid `responsiveCols`
- Scale: `mobile: 1` -> `tablet: 2` -> `desktop: 3` (or 4)
- Gap: `gap-4 md:gap-6 lg:gap-8`

### 4. Section Card Padding
- Standard: `px-4 py-6 md:p-6 lg:p-8`
- Hero: `px-4 py-6 sm:py-10 md:px-6 md:py-14 lg:px-8 lg:py-18`
- CTA: `py-10 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12`
- NEVER skip breakpoints (`p-4 lg:p-12` is wrong — add `md:p-8`)

### 5. Responsive Text
- Headings: `text-2xl sm:text-3xl lg:text-4xl xl:text-5xl`
- Body: `text-base sm:text-lg`
- Small: `text-sm md:text-base`
- Eyebrow: `text-xs` (fixed — small enough at all sizes)

### 6. Touch Targets
- Minimum 44px height on all interactive elements
- Buttons: `py-3` minimum on mobile
- Links in nav/lists: `py-2` minimum

---

## Responsive Breakpoints

| Prefix | Width | Target |
|--------|-------|--------|
| (none) | 0+ | Mobile phones |
| `sm:` | 640px+ | Large phones / small tablets |
| `md:` | 768px+ | Tablets |
| `lg:` | 1024px+ | Laptops |
| `xl:` | 1280px+ | Desktops |

---

## Mobile Patterns

### Horizontal Scroll Carousel
For items that should scroll horizontally on mobile but grid on desktop:

```tsx
{/* Mobile: horizontal scroll */}
<div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4">
  {items.map((item, i) => (
    <div key={i} className="flex-shrink-0 w-[85%] snap-center">
      {/* Card content */}
    </div>
  ))}
</div>

{/* Desktop: grid */}
<div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-3">
  {items.map((item, i) => (
    <div key={i}>{/* Card content */}</div>
  ))}
</div>
```

### Two-Column to Stacked
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
  <div>{/* Text content */}</div>
  <div>{/* Image/video */}</div>
</div>
```

---

## Testing Checklist

- [ ] No elements overflow on 375px width
- [ ] Cards stack vertically on mobile
- [ ] Buttons fit within containers and are not full-width
- [ ] Text is readable without zooming
- [ ] No horizontal scrollbar (except carousels)
- [ ] Touch targets are minimum 44px
- [ ] Grids collapse to single column
- [ ] Hero text is readable on small screens
- [ ] Images don't break layout (use `overflow-hidden`)
