# EazyMyTiffin Design System & Guidelines

This document outlines the complete design system used for the EazyMyTiffin landing page and web application.

## 1. Tech Stack & Libraries
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (v4) with custom CSS variables
- **Icons:** `lucide-react`
- **Animations:** `lottie-react` and custom CSS keyframes

## 2. Typography
- **Primary Font:** **Montserrat** (via `next/font/google`)
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold), 900 (Black)
- **Font Variable:** `--font-montserrat`

## 3. Color Palette
The colors are inspired by Indian culinary aesthetics (warm, earthy, appetizing colors).

### Brand Colors
- **EMT Red (Primary):** `#E8392A` — *Used for primary actions, CTA buttons, and branding.*
- **EMT Green (Secondary):** `#1B5E30`
- **EMT Brown (Dark Accent):** `#3D1F0A`
- **EMT Gold (Highlight):** `#F5A623`

### Backgrounds
- **EMT Cream (App Background):** `#FDF9F3`
- **EMT Beige:** `#F4EBE0`

### Tiffin Category Tags
- **Veg:** `#164626`
- **Non-Veg:** `#A02E23`
- **Mix:** `#B34700`

### Typography & Borders
- **Text Primary:** `#121212`
- **Text Secondary:** `#4A3A2A`
- **Border Warm:** `rgba(212, 184, 150, 0.2)`
- **Success:** `#10B981`

## 4. Border Radius (Rounding)
The app uses smooth, slightly larger border radii for a modern and friendly appearance.
- **Small (`--r-sm`):** `10px`
- **Medium (`--r-md`):** `16px`
- **Large (`--r-lg`):** `24px`
- **Extra Large (`--r-xl`):** `32px`
- **Pill (`--r-pill`):** `999px` (Used for primary buttons)

## 5. Shadows
Elevation and depth are implemented through custom layered shadows, creating a soft, premium look.
- **Small (`--shadow-sm`):** `0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.04)`
- **Medium (`--shadow-md`):** `0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)`
- **Large (`--shadow-lg`):** `0 8px 16px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.12)`

## 6. Layout & Max Width
- **Global Max Width:** `1280px`
- **Body Background:** `var(--emt-cream)`
- **Body Text:** `var(--text-primary)`

## 7. Animations & Interactions
The landing page relies heavily on micro-animations for an engaging experience.
- **Fade Up (`.animate-fade-up`):** Slides elements up while fading in (for sections and cards).
- **Fade In (`.animate-fade-in`):** Simple opacity transition.
- **Float (`.float`):** Gentle up-and-down hovering effect (3.2s infinite).
- **Bounce Icon (`.bounce-icon`):** For interactive icons.
- **Wiggle (`.wiggle`):** Playful wiggle effect on hover.
- **Shimmer Badge (`.shimmer-badge`):** Animated text gradient shifting from Gold to Red (used for special tags/pricing).
- **Button Glare (`.btn-glare`):** A sweeping light reflection effect when hovering over main CTA buttons.
- **Card Lift (`.card-lift`):** Hovering over cards lifts them by `6px` and intensifies the shadow and border color.

## 8. Specific Component Styles

### Buttons
- Primary buttons use the EMT Red (`#E8392A`) background with white text, a pill shape (`999px`), bold uppercase font, and a colored shadow (`rgba(232, 57, 42, 0.18)`).
- Hover state darkens the red to `#C72E1F` and triggers the `.btn-glare` animation if applied.

### Cards
- Standard cards use a white background with the medium or large border radius, bordered with `rgba(212, 184, 150, 0.2)` (warm border), and apply the `.card-lift` class for hover interactions.

## 9. Third Party Integrations Overrides
- **Clerk (Auth):**
  - Clerk components are heavily customized to match the brand.
  - Auth Modals use the `.emt-clerk-card` styling.
  - Buttons use the `.emt-clerk-button-primary` styling (EMT Red pill buttons).
- **MapLibre GL:**
  - Custom overrides for map popups removing default white backgrounds and tips.
