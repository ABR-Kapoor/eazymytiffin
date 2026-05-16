# EazyMyTiffin (EMT) — Landing Page Design System
> **India's Premium Tiffin Brand** · Design Reference Document v2.0 (Gourmet Editorial Update)

---

## 1. Brand Identity

| Attribute        | Value                                                        |
|-----------------|--------------------------------------------------------------|
| Brand Name      | EazyMy-Tiffin                                                |
| Tagline         | India's Premium Tiffin Brand                                 |
| Location        | Tarbahar, Bilaspur, Chhattisgarh 495004                      |
| Phone / WhatsApp| 9770144899                                                   |
| Service Days    | 26 days/month · Sundays closed                               |
| Key Promises    | Quality Food · Fast Delivery · Daily Menu Rotation           |

### Logo Usage
- **Wordmark**: `EazyMy-` in `#1A1A1A` (Charcoal) + `Tiffin` in `#E8392A` (Brand Red)
- **Weight**: Font-weight: 900 (Black)
- **Tagline**: "India's Premium Tiffin Brand" — 10px / 600 / tracking 1.5px / Uppercase
- **Footer Variant**: `EazyMy-` switches to White on `#1A1A1A` background.

---

## 2. Color Palette

### Primary Brand Colors

| Token            | Hex       | Usage                                              |
|-----------------|-----------|----------------------------------------------------|
| `--emt-red`     | `#E8392A` | Logo accent, CTA buttons, primary highlights       |
| `--emt-green`   | `#1B5E30` | Veg plan accents, green status indicators          |
| `--premium-dark`| `#1A1A1A` | Footer background, primary headings, text          |
| `--snow-drift`  | `#F8FAFC` | Features section background, clean UI tiles        |
| `--emt-cream`   | `#FDF9F3` | Global page background, warm editorial feel        |
| `--border-soft` | `rgba(212, 184, 150, 0.2)` | Primary layout dividers, subtle framing |

---

## 3. Typography (The 800 Standard)

**Primary Font**: [Montserrat](https://fonts.google.com/specimen/Montserrat) — Google Fonts

### Global Heading Policy
- **Primary Headings**: All section titles (H1, H2) are standardized to **Font-Weight: 800 (Extra Bold)**.
- **Line Height**: Tighter leading (1.1) for headings to achieve a "Technical Gourmet" editorial look.

### Type Scale

| Role              | Size (Desktop) | Weight | Line Height |
|------------------|---------------|--------|-------------|
| Hero H1 Display  | 42–76px        | 800    | 1.1         |
| Section H2       | 32–56px        | 800    | 1.1         |
| Sub-headlines    | 18px           | 500    | 1.7         |
| Card Titles      | 18–20px        | 700    | 1.3         |
| Badge / Tags     | 11px           | 700    | 1.0         |

---

## 4. Visual Effects & Motion

### Premium Glare Effect (`btn-glare`)
- **Behavior**: A cinematic light sweep that travels across an element on hover.
- **Implementation**: Applied to all primary CTA buttons and featured images.
- **Trigger**: `group-hover` support allows card images to glare when any part of the parent card is hovered.
- **Variants**: 
  - `btn-glare`: White sweep for dark backgrounds.
  - `btn-glare-dark`: Subtle dark sweep (opacity 0.15) for white/light cards.

### Interaction States
- **Card Lift**: Cards lift -8px on hover with a smooth cubic-bezier transition.
- **Corner Accents**: Used in the Features section—vibrant corner glows that appear on hover.
- **Section Transitions**: `animate-fade-up` used for entrance animations with a 0.65s duration.

---

## 5. Section Specifications

### 5.1 Hero Section
- **Heading**: "Fresh Tiffins, Delivered Daily." (Explicitly split into 2 lines).
- **Visuals**: Dark cinematic food background with a soft right-to-left gradient fade.
- **CTAs**: Primary Red (glare) + WhatsApp Green (glare).

### 5.2 Built on 4 Promises (Features)
- **Layout**: 4-column editorial grid.
- **Design**: Minimalist white cards on a `#F8FAFC` background.
- **Interactions**: Vibrant background tints and corner accent glows on hover.
- **Typography**: H2 standardized to Weight 800.

### 5.3 Monthly Commitment (Subscription)
- **Icons**: Replaced emojis with Lucide vector icons (`Leaf`, `Sprout`, `Utensils`, `Flame`).
- **Visuals**: Glare effect localized to food images at the top of cards.
- **Badges**: "30 Days Plan" badge updated with a `border-slate-300` for definition.

### 5.4 Weekly Veg Menu
- **Clean UI**: Removed sun/moon emojis from Lunch/Dinner labels for a professional look.
- **Badges**: "7 Days Variety" badge updated with `border-slate-300`.
- **Table**: Alternating row highlights with clear "Chef's Selection" Sunday branding.

### 5.5 Premium Footer
- **Theme**: "Premium Charcoal" (`#1A1A1A`).
- **Logo**: Synchronized with navbar (dash included, tagline added).
- **Credits**: "Built with ❤️ by FrequnSync" + FlagCDN India Flag (no border).
- **Address**: Updated to Tarbahar, Bilaspur, Chhattisgarh.

---

*EazyMyTiffin Design System v2.0 — Last updated May 2026*
*"Gourmet Quality · Technical Precision · Home Comfort"*
