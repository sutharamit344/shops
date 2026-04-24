# ShopSetu — UI Design System Guidelines

# FOR AI AGENTS: This file is the single source of truth for all UI decisions in ShopSetu.

# Read this file before generating ANY component, page, layout, or style code.

---

## 0. AGENT INSTRUCTIONS

When building UI for ShopSetu:

1. Read this entire file before writing a single line of code
2. Never deviate from the color tokens defined in Section 2
3. Always use the component patterns defined in Section 6
4. Mobile-first — every layout must work at 375px before 1280px
5. WhatsApp CTA must appear on every shop-facing page
6. Never introduce a new font, color, shadow, or radius not listed here

---

## 1. BRAND IDENTITY

**Platform name:** ShopSetu
**Tagline:** Your shop. Online. Found.
**Hindi meaning:** Setu = Bridge (सेतु) — bridges local shops to digital customers
**Audience:** Two groups

- Shop owners (small/medium Indian businesses, semi-urban, mobile-first)
- Customers (looking for local shops on Google or WhatsApp)

**Personality:** Friendly · Trustworthy · Local-first · Simple · Growth-oriented
**Voice tone:** Direct, warm, Hindi-English mix acceptable, never corporate-cold

---

## 2. COLOR TOKENS

### Primary Palette

```
--color-primary:       #FF6B35   /* Brand orange — CTAs, highlights, accents */
--color-primary-hover: #E85C25   /* Darker orange for hover states */
--color-primary-light: #FF6B3515 /* 8% opacity tint — backgrounds, badges */
--color-primary-border:#FF6B3330 /* 18% opacity — bordered elements */

--color-navy:          #1A1F36   /* Primary text, dark backgrounds, logo */
--color-navy-soft:     #1A1F3680 /* 50% opacity — secondary text */
--color-navy-muted:    #1A1F3630 /* 18% opacity — borders, dividers */

--color-green:         #25D366   /* WhatsApp ONLY — no other use */
--color-green-hover:   #1EB855   /* WhatsApp button hover */
--color-green-light:   #25D36615 /* WhatsApp bg tint */

--color-cream:         #FFF8F3   /* Page background for shop-owner screens */
--color-surface:       #FFFFFF   /* Cards, modals, inputs */
--color-bg:            #FAFAF8   /* App-level background (slightly warm white) */
--color-gray-100:      #F5F5F3   /* Input backgrounds, skeleton loaders */
--color-gray-300:      #DDDDDA   /* Disabled states, placeholders */
--color-gray-500:      #888888   /* Secondary body text */
--color-gray-700:      #444444   /* Secondary headings */
```

### Semantic Color Rules

```
DO:
  Primary orange     → Buttons, active states, links, badges, brand accents
  Navy               → Headings, body text, dark sections, logo
  Green (#25D366)    → WhatsApp button ONLY — never repurpose for other actions
  Cream (#FFF8F3)    → Shop page background, owner-facing UI
  White              → Cards, inputs, overlays

DO NOT:
  Use green for anything other than WhatsApp CTAs
  Use orange as a background for large areas (use navy instead)
  Use more than 2 accent colors on any single screen
  Use pure black (#000000) — use navy (#1A1F36) instead
  Introduce purple, blue, or red without explicit instruction
```

---

## 3. TYPOGRAPHY

### Font Stack

```css
/* Primary UI font — headings and body */
font-family: "Plus Jakarta Sans", "DM Sans", system-ui, sans-serif;

/* Hindi / Devanagari support */
font-family: "Noto Sans Devanagari", "Plus Jakarta Sans", system-ui, sans-serif;

/* Monospace — prices, codes, slugs */
font-family: "JetBrains Mono", "Fira Code", monospace;
```

### Type Scale

```
/* Display — Hero headings only */
display-2xl:  font-size: 72px;  line-height: 0.95;  font-weight: 700;  letter-spacing: -0.03em;
display-xl:   font-size: 56px;  line-height: 1.0;   font-weight: 700;  letter-spacing: -0.025em;
display-lg:   font-size: 44px;  line-height: 1.0;   font-weight: 700;  letter-spacing: -0.02em;

/* Headings */
h1:   font-size: 36px;  line-height: 1.1;   font-weight: 700;  letter-spacing: -0.02em;
h2:   font-size: 28px;  line-height: 1.15;  font-weight: 700;  letter-spacing: -0.015em;
h3:   font-size: 22px;  line-height: 1.2;   font-weight: 600;  letter-spacing: -0.01em;
h4:   font-size: 18px;  line-height: 1.3;   font-weight: 600;
h5:   font-size: 15px;  line-height: 1.4;   font-weight: 600;
h6:   font-size: 13px;  line-height: 1.4;   font-weight: 600;

/* Body */
body-lg:  font-size: 17px;  line-height: 1.65;  font-weight: 400;
body-md:  font-size: 15px;  line-height: 1.6;   font-weight: 400;
body-sm:  font-size: 13px;  line-height: 1.55;  font-weight: 400;

/* UI / Labels */
label-lg:  font-size: 12px;  font-weight: 600;  letter-spacing: 0.04em;  text-transform: uppercase;
label-sm:  font-size: 10px;  font-weight: 700;  letter-spacing: 0.08em;  text-transform: uppercase;
caption:   font-size: 11px;  font-weight: 500;  color: var(--color-gray-500);

/* Price / Numeric */
price-lg:  font-size: 20px;  font-weight: 700;  font-family: JetBrains Mono;  color: var(--color-primary);
price-sm:  font-size: 14px;  font-weight: 700;  font-family: JetBrains Mono;  color: var(--color-primary);
```

### Typography Rules

```
DO:
  Use font-weight 700 for all primary CTAs and page titles
  Use letter-spacing: -0.02em or tighter for headings at 28px+
  Use line-height 1.5+ for all body copy
  Use monospace font for prices and numeric values
  Truncate long shop names with text-overflow: ellipsis

DO NOT:
  Use font-weight below 400 in UI
  Use font-size below 10px for any visible text
  Use all-caps for body copy
  Use more than 3 type sizes on a single card component
```

---

## 4. SPACING SYSTEM

Based on a 4px base unit. Always use multiples of 4.

```
space-1:   4px
space-2:   8px
space-3:   12px
space-4:   16px
space-5:   20px
space-6:   24px
space-8:   32px
space-10:  40px
space-12:  48px
space-16:  64px
space-20:  80px
space-24:  96px
```

### Spacing Rules

```
Component internal padding:   16px–24px (space-4 to space-6)
Card gap in grid:             16px (space-4)
Section vertical padding:     64px–96px (space-16 to space-24)
Navbar height:                64px
Button height (sm):           32px
Button height (md):           40px
Button height (lg):           48px
Input height:                 44px
Sticky bar height:            56px
```

---

## 5. BORDER RADIUS

```
radius-sm:   8px   /* Badges, chips, small inputs */
radius-md:   12px  /* Buttons, small cards, inputs */
radius-lg:   16px  /* Cards, modals, dropdowns */
radius-xl:   20px  /* Featured cards, hero elements */
radius-2xl:  24px  /* Page-level sections */
radius-full: 9999px /* Pills, avatars, toggles */
```

---

## 6. SHADOW SYSTEM

```css
/* Use sparingly — only to elevate interactive elements */
shadow-sm:
  0 1px 3px rgba(0, 0, 0, 0.06),
  0 1px 2px rgba(0, 0, 0, 0.04);
shadow-md:
  0 4px 12px rgba(0, 0, 0, 0.08),
  0 2px 4px rgba(0, 0, 0, 0.04);
shadow-lg:
  0 8px 24px rgba(0, 0, 0, 0.1),
  0 4px 8px rgba(0, 0, 0, 0.06);
shadow-xl:
  0 16px 48px rgba(0, 0, 0, 0.12),
  0 8px 16px rgba(0, 0, 0, 0.06);

/* Brand shadow — for primary CTA buttons */
shadow-primary: 0 4px 16px rgba(255, 107, 53, 0.3);

/* WhatsApp shadow */
shadow-green: 0 4px 16px rgba(37, 211, 102, 0.3);
```

### Shadow Rules

```
Cards at rest:        shadow-sm
Cards on hover:       shadow-md
Modals/drawers:       shadow-xl
Primary CTA button:   shadow-primary
Sticky elements:      shadow-md + backdrop-blur
Floating WhatsApp:    shadow-xl + shadow-green
DO NOT use drop-shadow on text
```

---

## 7. COMPONENT PATTERNS

### 7.1 Buttons

```
VARIANT         BG              TEXT     BORDER         USE CASE
──────────────────────────────────────────────────────────────────────
primary         #FF6B35         white    none           Main CTA, form submit
primary-outline transparent     #FF6B35  #FF6B35        Secondary CTA
whatsapp        #25D366         white    none           WhatsApp ONLY
dark            #1A1F36         white    none           Navigation CTA
ghost           transparent     #1A1F36  none           Tertiary actions
muted           #F5F5F3         #444     none           Cancel / dismiss
```

```jsx
/* Button anatomy — always use this structure */
<button
  className={`
  inline-flex items-center justify-center gap-2
  font-semibold rounded-xl transition-all duration-200
  focus-visible:ring-2 focus-visible:ring-offset-2
  active:scale-[0.98]
  /* size: sm */  h-8 px-4 text-xs
  /* size: md */  h-10 px-5 text-sm
  /* size: lg */  h-12 px-7 text-base
  /* size: xl */  h-14 px-8 text-lg
`}
>
  {icon && <Icon size={16} />}
  {label}
</button>

/* Rules:
   - Icon always LEFT of text, size 14–18px
   - Loading state: replace icon with spinner, keep text
   - Disabled: opacity-40, cursor-not-allowed
   - Never stretch a button to 100% width in desktop layouts
   - WhatsApp button always has WhatsApp icon (MessageSquare or custom SVG)
*/
```

### 7.2 Shop Card (Most Important Component)

```jsx
/* ShopCard — used on category pages, explore, homepage */
<Link href={`/${shop.city}/${shop.category}/${shop.slug}`}>
  <div
    className="
    group bg-white rounded-xl border border-black/[0.07]
    hover:border-[#FF6B35]/30 hover:shadow-md
    transition-all duration-300 overflow-hidden
  "
  >
    {/* Brand color top bar — 2px, always present */}
    <div className="h-0.5 bg-gradient-to-r from-[#FF6B35] to-transparent opacity-60" />

    <div className="p-5">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        {/* Logo or initial avatar */}
        <div className="w-11 h-11 rounded-xl bg-[#1A1F36] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
          {shop.name.charAt(0)}
        </div>
        {/* Category badge */}
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">
          {shop.category}
        </span>
      </div>

      {/* Shop name */}
      <h3 className="font-bold text-[#1A1F36] text-[15px] leading-snug mb-1 group-hover:text-[#FF6B35] transition-colors line-clamp-1">
        {shop.name}
      </h3>

      {/* Location */}
      <p className="flex items-center gap-1 text-[11px] text-gray-400 mb-3">
        <MapPin size={10} />
        {shop.area}, {shop.city}
      </p>

      {/* Description */}
      <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-4">
        {shop.description}
      </p>

      {/* Action row */}
      <div className="flex gap-2 pt-3 border-t border-black/[0.05]">
        <a
          href={`https://wa.me/91${shop.phone}...`}
          className="flex-1 h-9 bg-[#25D366] hover:bg-[#1EB855] text-white rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <WAIcon size={13} /> WhatsApp
        </a>
        <div className="flex-1 h-9 bg-[#F5F5F3] hover:bg-[#EBEBEA] text-[#1A1F36] rounded-xl text-[11px] font-semibold flex items-center justify-center transition-colors">
          View Shop →
        </div>
      </div>
    </div>
  </div>
</Link>

/* Card Grid Rules:
   Mobile:  1 column
   Tablet:  2 columns, gap-4
   Desktop: 3 columns, gap-4 (max 4 columns on very wide screens)
*/
```

### 7.3 Input Fields

```jsx
/* Standard input */
<div className="flex flex-col gap-1.5">
  <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">
    {label}
    {required && <span className="text-[#FF6B35] ml-0.5">*</span>}
  </label>
  <input
    className="
      w-full h-11 px-4 rounded-xl
      bg-white border border-black/10
      text-[14px] font-medium text-[#1A1F36]
      placeholder:text-[#bbb]
      focus:outline-none focus:border-[#FF6B35]/60 focus:ring-2 focus:ring-[#FF6B35]/15
      transition-all
    "
  />
  {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
</div>

/* Select field — always custom styled, never browser default */
/* Textarea — min-height: 96px, resize: vertical */
/* Phone input — prefix +91 as inert text inside input left side */
```

### 7.4 Sticky WhatsApp Button (Required on all shop pages)

```jsx
/* Always positioned: fixed bottom-6 right-5 z-50 */
<a
  href={`https://wa.me/91${phone}?text=Hi%20I%20found%20you%20on%20ShopSetu!`}
  target="_blank"
  rel="noopener noreferrer"
  className="
    fixed bottom-6 right-5 z-50
    w-14 h-14 rounded-full
    bg-[#25D366] hover:bg-[#1EB855]
    text-white shadow-xl
    flex items-center justify-center
    transition-all duration-200
    hover:scale-110 active:scale-95
  "
  style={{ boxShadow: "0 4px 20px rgba(37,211,102,0.45)" }}
>
  <WAIcon size={28} />
</a>

/* Rules:
   - ALWAYS include on shop profile pages
   - NEVER include on admin pages, create form, homepage
   - Must have tooltip on hover showing "Chat on WhatsApp"
   - On mobile, slightly smaller: w-12 h-12
*/
```

### 7.5 Status Badges

```jsx
/* Shop status badges — admin and listings */
const STATUS_STYLES = {
  approved: 'bg-green-50 text-green-700 border-green-200',
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

<span className={`
  inline-flex items-center gap-1.5
  px-2.5 py-1 rounded-full
  text-[10px] font-bold uppercase tracking-wider
  border ${STATUS_STYLES[status]}
`}>
  <span className="w-1.5 h-1.5 rounded-full bg-current" />
  {status}
</span>
```

### 7.6 Section Headers (Page-level)

```jsx
/* Standard section header pattern */
<div className="mb-12">
  <p className="text-[11px] font-semibold text-[#FF6B35] uppercase tracking-[0.12em] mb-3">
    {eyebrow}
  </p>
  <h2 className="text-[36px] md:text-[44px] font-bold text-[#1A1F36] leading-tight tracking-tight">
    {heading}
  </h2>
  {subheading && (
    <p className="mt-3 text-[16px] text-[#888] leading-relaxed max-w-xl">
      {subheading}
    </p>
  )}
</div>

/* Always: orange eyebrow label → navy bold heading → gray subheading */
```

### 7.7 Navbar

```jsx
/* 
  Height: h-16 (64px)
  Position: sticky top-0 z-50
  Background: bg-[#FAFAF8]/90 backdrop-blur-md
  Border: border-b border-black/[0.06]
  
  Left:    Logo (icon + wordmark)
  Center:  Nav links (hidden on mobile)
  Right:   Sign in link + "List Your Shop" button (dark variant)
  
  Mobile:  Hamburger menu, logo centered
  
  Logo rules:
    - Icon: 32px square, #FF6B35 bg, rounded-lg, Store icon white
    - Wordmark: "Shop" bold navy + "Setu" orange — no spaces
    - Never use a different logo format
*/
```

---

## 8. PAGE LAYOUTS

### 8.1 Homepage

```
Navbar (sticky)
└── Hero section
    ├── Left: Headline + search bar + trust tags
    └── Right: Animated shop card mockup with floating stats
Wave divider
Features grid (3 columns desktop, 1 mobile)
How it works (dark navy bg, 3 steps)
Category browse grid (2col mobile, 4col desktop)
Final CTA banner (orange bg, rounded-3xl, mx-4)
Footer
```

### 8.2 Shop Profile Page

```
Navbar (minimal or none — shop has its own header)
Shop Header (navy bg, shop name, category badge, WhatsApp + Call CTAs)
Sticky tab bar (Menu | About) — sticks below navbar
Content area (max-w-2xl mx-auto):
  ├── Tab: Menu → Product list
  └── Tab: About → Description, Gallery, Contact, Map, Reviews
Sticky WhatsApp floating button (always visible)
```

### 8.3 Category / Explore Page

```
Top bar (sticky, search input + filter toggle + view toggle)
  └── Expandable filter panel (dropdowns: state, city, category, area)
Main content (max-w-7xl):
  ├── Results meta (count + active filter chips)
  └── Shop grid / list (see ShopCard)
```

### 8.4 Create Shop Form

```
Navbar
Page header (title + trust tags: Free · Verified · Secure)
Form card (max-w-2xl, centered):
  Step 1: Basic info (name, category, city, area, phone)
  Step 2: Description + menu items (dynamic add/remove)
  Step 3: Images (optional)
  Submit → success screen with pending status message
```

### 8.5 Admin Dashboard

```
Top bar (filter tabs: pending | approved | rejected)
Password gate (centered card, minimal)
Shop list (cards with Approve / Reject / View actions)
```

---

## 9. RESPONSIVE BREAKPOINTS

```
Mobile:   375px–767px    (default, mobile-first)
Tablet:   768px–1023px   (md:)
Desktop:  1024px–1279px  (lg:)
Wide:     1280px+        (xl:)

Max content width: max-w-7xl (1280px) with px-4 md:px-8 xl:px-12
Shop profile max width: max-w-2xl (centered)
```

---

## 10. WHATSAPP INTEGRATION

### URL Format

```
Standard:  https://wa.me/91{10-digit-phone}
With text: https://wa.me/91{phone}?text=Hi%2C%20I%20found%20you%20on%20ShopSetu!%20I%20am%20interested%20in%20your%20services.

Rules:
  - Always prefix with 91 (India country code)
  - Strip all non-digit characters from phone before building URL
  - URL-encode the text parameter
  - Always open in new tab: target="_blank" rel="noopener noreferrer"
  - Pre-fill message always mentions ShopSetu for attribution
```

### WhatsApp Visual Rules

```
Color:      #25D366 ONLY — never approximate with other greens
Icon:       Use MessageSquare (lucide) or official WhatsApp SVG
Label:      "Chat on WhatsApp" (long form) or "WhatsApp" (short form)
Never:      Use green color for non-WhatsApp actions
Never:      Use "Order on WhatsApp" without explicit instruction
```

---

## 11. FORMS — CREATE SHOP

### Field Definitions

```javascript
{
  name:        { type: 'text',     required: true,  maxLength: 80,  placeholder: 'e.g. Sharma Kirana Store' },
  category:    { type: 'select',   required: true,  options: SHOP_CATEGORIES },
  city:        { type: 'text',     required: true,  maxLength: 50,  lowercase: true, placeholder: 'e.g. ahmedabad' },
  area:        { type: 'text',     required: true,  maxLength: 60,  placeholder: 'e.g. Maninagar' },
  phone:       { type: 'tel',      required: true,  pattern: /^[6-9]\d{9}$/, prefix: '+91' },
  description: { type: 'textarea', required: false, maxLength: 400, placeholder: 'Describe your shop, what you sell, and your speciality' },
  menu:        { type: 'array',    required: false, items: { name, price?, description? } },
  images:      { type: 'file',     required: false, accept: 'image/*', max: 5 },
}
```

### Validation Messages

```
phone:    "Enter a valid 10-digit Indian mobile number"
name:     "Shop name must be between 3 and 80 characters"
city:     "Please enter the city name"
category: "Please select a category"
```

### Post-submit State

```
Show: Green checkmark + "Your shop page is under review!"
Show: "We'll make it live within 24 hours"
Show: "Share this with your friends while you wait" + WhatsApp share link
DO NOT: auto-redirect to the pending shop page
```

---

## 12. SEO METADATA PATTERNS

```javascript
/* Shop page */
title:       `${shop.name} — ${CategoryLabel} in ${City} | ShopSetu`
description: First 155 chars of shop.description, fallback:
             `${shop.name} is a trusted ${category} in ${city}. Chat on WhatsApp or call directly.`
canonical:   `https://www.shopsetu.in/${city}/${category}/${slug}`
og:image:    First shop image or fallback OG image

/* Category page */
title:       `Best ${CategoryLabel} in ${City || 'India'} | ShopSetu`
description: `Find verified ${category} shops near you. Contact directly on WhatsApp — no middlemen.`

/* Homepage */
title:       `ShopSetu — Your Shop. Online. Found.`
description: `ShopSetu helps local Indian shops get a Google-friendly page and receive customers on WhatsApp. Free listing, 5 minutes to set up.`
```

---

## 13. ANIMATION & MOTION

```css
/* Transition defaults */
--transition-fast:
  150ms ease --transition-base: 200ms ease --transition-slow: 300ms ease
    --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1) /* Use on: */
    button hover/active states: transition-all duration-200 card hover
    states: transition-all duration-300 overlay/modal open: animate-in fade-in
    duration-200 drawer slide-in: animate-in slide-in-from-bottom-4 duration-300
    filter panel expand: animate-in slide-in-from-top-2 duration-200 floating
    WhatsApp button: animate-in slide-in-from-bottom-8 duration-500 hero
    elements on load: staggered opacity + translateY,
  delay 0/100/200ms /* Rules:
   Never animate layout shifts
   Never use animation-duration > 500ms for UI interactions
   Reduce motion: always respect prefers-reduced-motion
   Skeleton loaders: animate-pulse (Tailwind default)
*/;
```

---

## 14. ICON SYSTEM

```
Library: lucide-react (primary)
Size scale:
  12px — inline with text (captions, badges)
  14px — buttons sm, input adornments
  16px — buttons md, nav items
  18px — buttons lg, section labels
  20px — feature cards, headings
  24px — empty states, section icons
  32px — hero/feature illustration icons

Key icons and their LOCKED use cases:
  Store           → ShopSetu logo icon, shop-related actions
  MessageSquare   → WhatsApp (always with green color)
  Phone           → Call action (always with navy/orange color)
  MapPin          → Location, address
  Search          → Search inputs and actions
  ShieldCheck     → Verified badge
  Star            → Ratings (filled = orange #FF6B35)
  ArrowRight      → CTAs, navigation forward
  ChevronDown     → Dropdowns, accordions
  RotateCcw       → Reset filters
  LayoutGrid      → Grid view toggle
  List            → List view toggle
  X               → Close, clear
  CheckCircle2    → Success, trust tags (use green #25D366)
  AlertCircle     → Warnings (amber)
  TrendingUp      → Analytics, growth stats
  Zap             → Speed/quick setup badge
```

---

## 15. DATA DISPLAY PATTERNS

### Price Display

```jsx
/* Always use orange + monospace for prices */
<span className="font-bold text-[#FF6B35] font-mono">₹{price}</span>

/* Price range */
<span className="font-bold text-[#FF6B35] font-mono">₹{min}–₹{max}</span>

/* Free / On request */
<span className="text-[#888] text-[12px] font-medium italic">On request</span>
```

### Empty States

```jsx
/* Standard empty state pattern */
<div className="flex flex-col items-center py-20 gap-4 text-center">
  <div className="w-16 h-16 rounded-2xl bg-[#F5F5F3] flex items-center justify-center">
    <Icon size={24} className="text-[#ccc]" />
  </div>
  <div>
    <h3 className="text-[17px] font-semibold text-[#1A1F36] mb-1">{title}</h3>
    <p className="text-[13px] text-[#888] max-w-sm">{message}</p>
  </div>
  {action && <PrimaryButton>{action}</PrimaryButton>}
</div>
```

### Loading / Skeleton

```jsx
/* Skeleton cards — always use animate-pulse with bg-white border */
<div className="bg-white rounded-xl border border-black/[0.06] h-64 animate-pulse" />

/* Loading text */
<p className="text-[13px] text-[#999] font-medium">Loading shops...</p>
```

---

## 16. WHAT NOT TO DO (HARD RULES)

```
❌ Never use purple, blue, or pink colors anywhere in the UI
❌ Never repurpose green (#25D366) for non-WhatsApp elements
❌ Never use font-weight 300 or 100 (too light for Indian mobile screens)
❌ Never place the WhatsApp button behind a tab or scroll
❌ Never show unapproved/pending shop pages to customers
❌ Never use border-radius below 8px on interactive elements
❌ Never use px-2 or py-1 as the only padding on tap targets (min 44px height)
❌ Never use text-xs (12px) as the primary text on cards
❌ Never use pure white (#FFFFFF) as the page background (use #FAFAF8)
❌ Never use box-shadow with colored tints except shadow-primary and shadow-green
❌ Never display the phone number as plain text without a tel: link
❌ Never hard-code city names — always use shop.city (lowercased)
❌ Never show the admin dashboard without authentication
❌ Never place more than 2 primary (orange) buttons on the same view
```

---

## 17. TAILWIND CLASS REFERENCE (QUICK LOOKUP)

```
# Colors (add to tailwind.config.js)
primary:   #FF6B35
navy:      #1A1F36
green:     #25D366 (whatsapp)
cream:     #FFF8F3

# Common patterns
Card:          bg-white rounded-xl border border-black/[0.07] shadow-sm
Card hover:    hover:border-[#FF6B35]/30 hover:shadow-md transition-all duration-300
Input:         h-11 px-4 rounded-xl border border-black/10 text-sm focus:border-[#FF6B35]/60 focus:ring-2 focus:ring-[#FF6B35]/15 outline-none transition-all
Badge orange:  bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full
Badge green:   bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full
Divider:       border-t border-black/[0.06]
Page bg:       bg-[#FAFAF8]
Shop page bg:  bg-[#FFF8F3]
Section dark:  bg-[#1A1F36] text-white
```
