# Gate 1: Home Page — Monk Handoff

**Status:** Approved for implementation  
**Approved by:** Shawn (2026-03-11)  
**Tech Lead:** Monk  
**Product Lead:** Parker
**Project:** [alto-good-vibes-goolf](/Users/smcheatham/.openclaw/workspace-parker/projects/alto-good-vibes-golf/ALTO-GVG-PROJECT-OUTLINE.md)

---

## Overview

Implement Alto GVG home page based on approved HTML prototype. This is Gate 1 of 6 in the Alto GVG rebuild.

**Prototype location:**  
`/Users/smcheatham/.openclaw/workspace-parker/projects/alto-good-vibes-golf/Gate 1 - Home/prototypes/`

**Production repo:** (TBD — create new Next.js 16 repo for Alto GVG)

---

## Scope

**Pages to implement:**
1. Home/landing page (`index.html`)
2. Terms of Service (`terms.html`)
3. Privacy Policy (`privacy.html`)

**Components:**
- Hero section (brand title, tagline, description)
- Primary CTA: Sign Up button → modal placeholder
- Secondary CTA: Login button → modal placeholder
- Footer (legal links)
- Modals (Sign Up, Login) — placeholder state only, non-functional

**Key constraint:** No auth implementation yet. Modals are placeholders. Gate 2 will implement Supabase Auth integration.

---

## Tech Stack

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS 4

**Deployment:**
- Vercel (linked deployment)
- Production URL required for gate validation

**Testing:**
- Playwright E2E smoke test
- Must validate deployed behavior (not just local/CI)

**Design system:**
- Use GVG design tokens from prototype (`design-tokens.css`)
- Port CSS variables to Tailwind config
- Maintain exact color palette, typography, spacing scale

---

## Implementation Requirements

### 1. Repository Setup

**Create new repo:** `alto-good-vibes-golf`
- Initialize with Next.js 16 + TypeScript + Tailwind CSS 4
- Configure Vercel deployment (auto-deploy from main branch)
- Set up folder structure:
  ```
  /app
    /page.tsx          (Home page)
    /terms/page.tsx    (Terms of Service)
    /privacy/page.tsx  (Privacy Policy)
  /components
    /Hero.tsx
    /SignUpModal.tsx
    /LoginModal.tsx
    /Footer.tsx
  /styles
    /globals.css       (design tokens ported to Tailwind)
  ```

**Must include:**
- ESLint config
- Prettier config
- TypeScript strict mode
- `.env` files (dev/preview/prod)

---

### 2. Design System Port

**Port GVG design tokens to Tailwind config:**

From prototype `design-tokens.css`, port all CSS variables to `tailwind.config.ts`:

```typescript
// Example structure (full port required)
module.exports = {
  theme: {
    extend: {
      colors: {
        'gvg-grass-dark': '#1a4d2e',
        'gvg-grass': '#2d7a4f',
        'gvg-accent': '#ff6b35',
        // ... all colors from design-tokens.css
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'monospace'],
      },
      spacing: {
        // ... all spacing scale from design-tokens.css
      },
      borderRadius: {
        // ... all radius values
      },
      // ... all other tokens
    },
  },
}
```

**Design tokens reference:**  
`/Users/smcheatham/.openclaw/workspace-parker/projects/alto-good-vibes-golf/Gate 1 - Home/prototypes/design-tokens.css`

**Critical:** Do not deviate from prototype colors, typography, or spacing. Match exactly.

---

### 3. Component Structure

#### Home Page (`/app/page.tsx`)

**Layout:**
```typescript
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Hero />
      <Footer />
    </>
  )
}
```

**Hero component** (`/components/Hero.tsx`):
- Full-screen layout (flexbox, centered content)
- Background: Linear gradient (grass-dark → grass)
- Title: "Good Vibes Golf" (Outfit font, 36px mobile, 48px desktop)
- Tagline: "It's not about the score. It's about who you're playing with."
- Description: Value prop paragraph
- CTAs: Sign Up (primary orange button), Login (secondary glass button)
- Modal triggers: onClick → open modal, ESC key closes

**Modals** (`/components/SignUpModal.tsx`, `/components/LoginModal.tsx`):
- Placeholder content: "Sign up flow coming soon..." / "Login flow coming soon..."
- Overlay: Black 70% opacity + blur(4px)
- Card: White background, rounded corners, drop shadow
- Close affordances: X button, overlay click, ESC key
- Animation: Fade + slide-in on open

**Footer** (`/components/Footer.tsx`):
- Background: Black 20% opacity + blur
- Links: Terms of Service, Privacy Policy (Next.js Link components)
- Copyright: "© 2026 Good Vibes Golf"

---

#### Legal Pages

**Terms of Service** (`/app/terms/page.tsx`):
- Header: Green gradient background, "Back to Home" link
- Content: Boilerplate legal text from prototype (`terms.html`)
- Footer: Same as home page

**Privacy Policy** (`/app/privacy/page.tsx`):
- Header: Green gradient background, "Back to Home" link
- Content: Boilerplate legal text from prototype (`privacy.html`)
- Footer: Same as home page

**Legal page styles:**  
Port from `legal.css` in prototype. Use Tailwind classes.

---

### 4. Responsive Behavior

**Mobile-first:**
- Touch targets ≥ 48px
- Hero title: 36px (mobile), 48px (desktop)
- Hero CTAs: Stack vertically on mobile, horizontal on desktop
- Footer links: Wrap on small screens

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Test on:**
- iPhone (Safari)
- Android (Chrome)
- Desktop (Chrome, Safari, Firefox)

---

### 5. Deployment

**Vercel setup:**
- Link repo to Vercel
- Configure environment (production)
- Auto-deploy from main branch
- Custom domain: TBD (Shawn will provide if needed)

**Production URL required:**  
Gate validation requires live deployed URL. Local dev or preview deploy not sufficient.

---

### 6. E2E Testing

**Playwright tests required:**

File: `e2e/gate-1-home.spec.ts`

**Test cases:**
1. Home page loads (hero visible, CTAs present, footer links present)
2. Sign Up modal opens on button click
3. Sign Up modal closes on overlay click, X button, ESC key
4. Login modal opens on button click
5. Login modal closes on overlay click, X button, ESC key
6. Terms of Service page loads (header, content, footer)
7. Privacy Policy page loads (header, content, footer)
8. Navigation works (home → terms → home, home → privacy → home)

**Critical:** E2E tests must run against deployed production URL, not localhost.

**Test command:**  
- `npm run test:e2e` (or `pnpm test:e2e`)
- Must pass before gate validation

---

### 7. Gate Validation Criteria

**All three required before declaring "done":**

1. ✅ **Deployed to production URL**
   - Vercel production deploy complete
   - URL accessible from any device
   - No "preview" or "staging" — must be production

2. ✅ **Passing E2E smoke test**
   - All Playwright tests pass against production URL
   - Tests validate deployed behavior (not localhost)
   - CI/CD pipeline green

3. ✅ **Shawn device confirmation**
   - Shawn opens production URL on iPhone
   - Tests modals, legal pages, navigation
   - Confirms design matches prototype
   - Approves gate completion

**Do not proceed to Gate 2 until all three criteria met.**

---

## Reference Files

**Prototype:**
- `index.html` — Home page structure
- `terms.html` — Terms of Service content
- `privacy.html` — Privacy Policy content
- `design-tokens.css` — Design system (port to Tailwind)
- `home.css` — Home page styles (reference for Tailwind classes)
- `legal.css` — Legal page styles (reference for Tailwind classes)
- `home.js` — Modal interactions (port to React state)

**Location:**  
`/Users/smcheatham/.openclaw/workspace-parker/projects/alto-good-vibes-golf/Gate 1 - Home/prototypes/`

---

## Deliverables Checklist

**Repository:**
- [ ] New repo created (`alto-good-vibes-golf`)
- [ ] Next.js 16 + TypeScript + Tailwind CSS 4 initialized
- [ ] Vercel deployment configured
- [ ] ESLint + Prettier configured
- [ ] `.gitignore` includes `.env*` files

**Design System:**
- [ ] GVG design tokens ported to Tailwind config
- [ ] Outfit font loaded via Google Fonts
- [ ] Color palette matches prototype exactly
- [ ] Typography scale matches prototype exactly
- [ ] Spacing scale matches prototype exactly

**Components:**
- [ ] `Hero.tsx` implemented (matches prototype layout/styles)
- [ ] `SignUpModal.tsx` implemented (placeholder state)
- [ ] `LoginModal.tsx` implemented (placeholder state)
- [ ] `Footer.tsx` implemented (legal links, copyright)

**Pages:**
- [ ] Home page (`/app/page.tsx`) implemented
- [ ] Terms of Service (`/app/terms/page.tsx`) implemented
- [ ] Privacy Policy (`/app/privacy/page.tsx`) implemented

**Testing:**
- [ ] Playwright E2E tests written (`e2e/gate-1-home.spec.ts`)
- [ ] All tests pass against production URL
- [ ] Test command documented in README

**Deployment:**
- [ ] Deployed to Vercel production
- [ ] Production URL provided to Shawn
- [ ] No build errors or warnings

**Documentation:**
- [ ] README.md includes:
  - Project setup instructions
  - Development commands
  - Testing commands
  - Deployment process
  - Production URL

**Gate Validation:**
- [ ] Production URL live and accessible
- [ ] E2E tests passing
- [ ] Shawn device confirmation received

---

## Timeline

**No strict deadline,** but expected cadence:
- Repository setup + design system port: 1-2 days
- Component implementation: 1-2 days
- E2E tests + deployment: 1 day
- Gate validation: 1 day (Shawn testing)

**Total estimate:** 4-6 days from handoff to gate completion

---

## Known Constraints

**No auth yet:**  
Sign Up and Login modals are placeholders only. Do not implement Supabase Auth. Gate 2 will handle auth integration.

**Legal text is temporary:**  
Boilerplate content in Terms/Privacy will be replaced later. Port exact text from prototype for now.

**No feature sections:**  
Home page is minimal (hero + footer only). No features section, no pricing preview, no testimonials. Gate 3 (Membership) will add pricing, Gate 4 (Round) will add product details.

---

## Questions / Blockers

**If blocked, escalate immediately to:**
- Parker (product questions, design decisions)
- Shawn (strategic decisions, approval gates)

**Do not:**
- Proceed with ambiguous requirements (ask first)
- Claim "done" without all three gate criteria met
- Skip E2E tests or device validation

---

## Success Looks Like

1. **Shawn opens production URL on iPhone**
2. **Hero loads instantly, design matches prototype**
3. **Sign Up / Login modals trigger smoothly**
4. **Legal pages load without errors**
5. **Navigation works seamlessly**
6. **Shawn says: "Approved, proceed to Gate 2"**

That's the gate. No shortcuts.

---

**Handoff date:** 2026-03-11  
**Approved by:** Shawn  
**Next gate:** Gate 2 (Account) — awaits Gate 1 completion
