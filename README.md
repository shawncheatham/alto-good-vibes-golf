# Alto Good Vibes Golf

Next.js 16 rebuild of Good Vibes Golf — auth-enabled, production-deployed.

## Tech Stack

- **Next.js 16** (React 19)
- **TypeScript**
- **Tailwind CSS 3** (v4 deferred — see decisions log)
- **Supabase** (Auth + PostgreSQL)
- **Playwright** (E2E testing)
- **Vercel** (Production deployment)

---

## Gates

| Gate | Name | Status | Date |
|------|------|--------|------|
| 1 | Home Page | ✅ APPROVED | 2026-03-11 |
| 2 | Account / Auth | ✅ PASSED | 2026-03-12 |
| 3 | Membership | ⬜ Not started | — |
| 4 | Rounds | ⬜ Not started | — |
| 5 | Games | ⬜ Not started | — |
| 6 | Recap | ⬜ Not started | — |

**Production URL:** https://alto-good-vibes-golf.vercel.app

---

## Development Setup

### Prerequisites
- Node 20+
- Supabase project (`agvg-prod-v2`, ref: `pedqpmuclnoufqxvlhzx`)
- Vercel project linked to this repo

### Install

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pedqpmuclnoufqxvlhzx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

### Local Development

```bash
npm run dev
```

Visit http://localhost:3000

### Build

```bash
npm run build
npm start
```

### E2E Tests

```bash
# Install browsers (first time only)
npx playwright install

# Run Gate 2 tests against production
BASE_URL=https://alto-good-vibes-golf.vercel.app npx playwright test e2e/gate-2-account.spec.ts

# Run all tests
npm run test:e2e
```

---

## Project Structure

```
/app
  /page.tsx                    - Home page
  /signup/page.tsx             - Sign Up (magic link)
  /login/page.tsx              - Login (magic link)
  /auth/callback/route.ts      - Supabase auth callback
  /profile/page.tsx            - Profile settings (protected)
  /round-history/page.tsx      - Round history (protected)
  /api/admin/delete-user/      - Admin route for account deletion
  /terms/page.tsx              - Terms of Service
  /privacy/page.tsx            - Privacy Policy

/lib
  /supabase/client.ts          - Browser Supabase client
  /supabase/server.ts          - Server Supabase client
  /supabase/middleware.ts      - Session refresh helper

/supabase
  /migrations/001_users_table.sql - Users table + RLS + email sync trigger

/e2e
  /gate-1-home.spec.ts         - Gate 1 E2E tests (55 tests)
  /gate-2-account.spec.ts      - Gate 2 E2E tests (50 tests)

middleware.ts                  - Route protection (redirects to /login)
```

---

## Auth Architecture

**Magic link only** — no passwords.

**Flow:**
1. User enters email on `/signup` or `/login`
2. Supabase sends magic link to email
3. User clicks link → redirected to `/auth/callback?code=...`
4. Callback exchanges code for session, creates profile in `public.users`
5. User redirected to `/round-history`

**Session:** 30-day expiration, stored in HTTP-only cookies.

**Protected routes:** `/profile`, `/round-history` — middleware redirects unauthenticated users to `/login`.

---

## Database Schema

```sql
-- Profile table (extends auth.users)
public.users (
  id UUID PRIMARY KEY → auth.users(id)
  email TEXT UNIQUE NOT NULL
  phone TEXT NOT NULL DEFAULT ''
  name TEXT NOT NULL DEFAULT ''
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
)

-- RLS: users can only access their own row
-- Email sync trigger: keeps public.users.email in sync with auth.users.email
```

---

## Gate 1 Status ✅

**Approved:** 2026-03-11 by Shawn

- Home page with Hero, Modals (Sign Up/Login placeholders), Footer
- Terms of Service + Privacy Policy pages
- Design tokens from GVG design system
- 55 E2E tests passing (5 browsers/devices)
- Deployed to Vercel production

---

## Gate 2 Status ✅

**Passed:** 2026-03-12

- Magic link auth (signup + login)
- `/auth/callback` handler
- `/profile` settings page (protected)
- `/round-history` empty state (protected)
- `public.users` table with RLS + email sync trigger
- Middleware route protection
- 50/50 E2E tests passing (5 browsers/devices)
- Deployed to Vercel production

**Awaiting Shawn device validation to close gate.**
See `GATE-2-MANUAL-TEST.md` for test guide.
