# Gate 1: Home Page Prototype

**Status:** Ready for review  
**Built:** 2026-03-11  
**Builder:** Parker

---

## What's Included

**Pages:**
- `index.html` — Home/landing page with hero, CTAs, footer
- `terms.html` — Terms of Service (boilerplate)
- `privacy.html` — Privacy Policy (boilerplate)

**Assets:**
- `design-tokens.css` — GVG design system (colors, typography, spacing)
- `home.css` — Home page styles
- `legal.css` — Legal pages styles
- `home.js` — Modal interactions (Sign Up / Login)

---

## Quick Start

Open `index.html` in a browser:

```bash
open /Users/smcheatham/.openclaw/workspace-parker/projects/alto-good-vibes-golf/Gate\ 1\ -\ Home/prototypes/index.html
```

Or navigate directly to any file. No build step required.

---

## Features

### Home Page
✅ **Hero section** — Brand title, tagline, description  
✅ **Primary CTA** — Sign Up button → modal placeholder  
✅ **Secondary CTA** — Login button → modal placeholder  
✅ **Footer** — Terms of Service + Privacy Policy links  
✅ **Mobile-first responsive** — Works on phone, tablet, desktop  
✅ **GVG design system** — Course-inspired palette, Outfit font, 4px spacing scale  

### Modals
✅ **Sign Up modal** — Placeholder (non-functional for now)  
✅ **Login modal** — Placeholder (non-functional for now)  
✅ **Close interactions** — Click overlay, close button, or ESC key  
✅ **Smooth animations** — Fade + slide-in entrance  

### Legal Pages
✅ **Terms of Service** — Boilerplate legal text (Shawn will update later)  
✅ **Privacy Policy** — Boilerplate legal text (Shawn will update later)  
✅ **Back navigation** — Return to home from legal pages  
✅ **Footer links** — Cross-link between legal pages + home  

---

## Design Decisions

**GVG brand tone:**
- Playful yet premium ("It's not about the score. It's about who you're playing with.")
- Course-inspired palette (grass greens, sand tones, sky blues)
- Outfit font for headings, system stack for body
- Orange accent (#ff6b35) for primary CTAs

**Mobile-first:**
- Touch targets ≥ 48px
- Responsive hero (title, tagline, CTAs stack on mobile)
- Readable text sizes (16px body, 36px hero title on mobile)

**Interaction patterns:**
- Modals for Sign Up / Login (placeholder, non-functional)
- No hamburger nav needed (minimal functionality, CTAs are buttons within page)
- Legal links in footer (standalone pages)

**Boilerplate legal text:**
- Generic Terms of Service (standard SaaS clauses)
- Generic Privacy Policy (standard data collection/usage/sharing)
- Shawn will replace with final content later

---

## What's Not Included (By Design)

❌ **Functional auth** — Modals are placeholders (Gate 2: Account will implement)  
❌ **Navigation bar** — Not needed (Sign Up/Login are CTAs, legal links in footer)  
❌ **Features section** — Not in scope (hero + legal only)  
❌ **Pricing preview** — Not in scope (Gate 3: Membership will handle)  

---

## Next Steps

1. **Shawn reviews on device** — Open on phone, test modals, check legal pages
2. **Shawn confirms design/UX** — GVG brand tone intact, responsive works, interactions feel right
3. **Shawn approves handoff to Monk** — Ready for production implementation

---

## Monk Handoff (After Approval)

**Implementation:**
- Next.js 16 + Tailwind CSS 4
- Port HTML structure to React components
- Deploy to Vercel

**E2E Test:**
- Home page loads
- Legal pages accessible
- Sign Up / Login modals trigger (placeholder state)

**Gate Validation:**
- Deployed URL
- Passing E2E smoke test
- Shawn device confirmation

---

**Ready for review.** Open `index.html` and let me know if anything needs adjustment.
