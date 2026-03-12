# Alto Good Vibes Golf

Next.js 16 rebuild of Good Vibes Golf landing page.

## Tech Stack

- **Next.js 16** (React 19)
- **TypeScript**
- **Tailwind CSS 4**
- **Playwright** (E2E testing)

## Development

### Setup

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

### Testing

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e
```

## Deployment

Deployed to Vercel:

**Production URL:** `https://alto-good-vibes-golf.vercel.app`

Auto-deploys from `main` branch.

## Project Structure

```
/app
  /page.tsx          - Home page
  /terms/page.tsx    - Terms of Service
  /privacy/page.tsx  - Privacy Policy
  /layout.tsx        - Root layout with Outfit font
  /globals.css       - Global styles + Tailwind

/components
  /Hero.tsx          - Hero section with CTAs
  /SignUpModal.tsx   - Sign Up modal (placeholder)
  /LoginModal.tsx    - Login modal (placeholder)
  /Footer.tsx        - Footer with legal links

/e2e
  /gate-1-home.spec.ts - Playwright E2E tests

/styles
  (none - Tailwind only)

tailwind.config.ts - GVG design tokens
```

## Design System

All GVG design tokens are ported to Tailwind config:

- **Colors:** `gvg-grass-dark`, `gvg-accent`, etc.
- **Typography:** `font-display` (Outfit), `font-body`
- **Spacing:** 4px base scale
- **Shadows:** `shadow-sm`, `shadow-md`, `shadow-lg`

See `tailwind.config.ts` for full token reference.

## Gate 1 Status

**Deliverables:**
- [x] Repository created
- [x] Next.js 16 + TypeScript + Tailwind 4 initialized
- [x] Design tokens ported to Tailwind config
- [x] Components implemented (Hero, Modals, Footer)
- [x] Pages implemented (Home, Terms, Privacy)
- [ ] Deployed to Vercel production
- [ ] E2E tests written
- [ ] E2E tests passing
- [ ] Shawn device validation

**Production URL:** (pending deployment)

## Notes

- Sign Up and Login modals are **placeholders only** (no auth yet)
- Auth integration comes in Gate 2
- Legal text is boilerplate (will be replaced later)
