# Gate 3: Membership — Status Report

## What Was Built

### 1. Database Migration
- **File**: `supabase/migrations/20260312000001_gate3_membership.sql`
- Adds `tier` column to `public.users` (enum: `free`, `grounds_keeper`, `players_club`, default `free`)
- Adds `bmc_supporter_id` TEXT column for BMC subscriber tracking
- Adds `tier_updated_at` TIMESTAMPTZ column
- Creates indexes on `tier` and `bmc_supporter_id`

### 2. Access Control Library
- **File**: `lib/access-control.ts`
- `GAMES` constant with 6 game definitions (skins, nassau, match-play, stableford, custom-game, side-bets)
- `canAccessGame(userTier, gameId)` — returns boolean
- `getRequiredTier(gameId)` — returns minimum tier required
- Tier hierarchy: free → grounds_keeper → players_club

### 3. BMC Webhook Handler
- **File**: `app/api/webhooks/bmc/route.ts`
- POST `/api/webhooks/bmc`
- HMAC SHA-256 signature verification via `x-signature-sha256` header
- Uses `crypto.timingSafeEqual` for constant-time comparison
- Handles `membership.started`, `membership.updated`, `membership.cancelled` events
- Level ID mapping: 309472 → `grounds_keeper`, 309474 → `players_club`
- Immediate downgrade to `free` on cancellation (no grace period, Shawn approved)
- Idempotency check on `bmc_supporter_id`

### 4. Membership Page
- **Files**: `app/membership/page.tsx` (server) + `app/membership/MembershipClient.tsx` (client)
- Three tier cards: Free ($0), Grounds Keeper ($3/mo), Players Club ($8/mo)
- "Most Popular" badge on Grounds Keeper card
- "Current Plan" disabled button on active tier
- BMC checkout URLs with email pre-filled
- "Manage on Buy Me a Coffee" link for paid tier users
- Login CTA for unauthenticated users
- FAQ section: 7-day trial, cancel anytime, downgrade data policy, why BMC

### 5. UpgradeModal Component
- **File**: `components/UpgradeModal.tsx`
- Props: `tier`, `gameName`, `userEmail?`, `onClose`
- ESC key and overlay click to close
- Correct modal variant per tier (☕ Grounds Keeper, ⛳ Players Club)
- BMC upgrade CTA opens in new tab with email pre-filled

### 6. Navigation Update
- **File**: `components/Hero.tsx`
- Added "View Membership Plans" link pointing to `/membership`

### 7. E2E Tests
- **File**: `e2e/gate-3-membership.spec.ts`
- 8 tests, all unauthenticated (no login required)
- Tests: page loads, all tier names visible, "Most Popular" badge, BMC level IDs (309472/309474), FAQ, mobile viewport (375px)

### 8. Profile Page Fix
- **File**: `app/profile/page.tsx`
- Fixed Save/Cancel button alignment: buttons now appear in their own flex row below the name input, not inline with it

### 9. Environment Variables
- **File**: `.env.example`
- Added `BMC_WEBHOOK_SECRET=your_bmc_webhook_secret_here`

---

## Deployment Checklist (Manual Steps)

### Step 1: Apply DB Migration
Run in Supabase SQL Editor (project: `pedqpmuclnoufqxvlhzx`):
```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'grounds_keeper', 'players_club')),
ADD COLUMN IF NOT EXISTS bmc_supporter_id TEXT,
ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier);
CREATE INDEX IF NOT EXISTS idx_users_bmc_supporter_id ON public.users(bmc_supporter_id);
```

### Step 2: Add Vercel Environment Variable
In Vercel dashboard → Project Settings → Environment Variables:
- `BMC_WEBHOOK_SECRET` = (generate a strong random secret, e.g. `openssl rand -hex 32`)

### Step 3: Register BMC Webhook
In Buy Me a Coffee dashboard → Webhooks:
- URL: `https://alto-good-vibes-golf.vercel.app/api/webhooks/bmc`
- Events: `membership.started`, `membership.updated`, `membership.cancelled`
- Copy the webhook secret and add it to Vercel (Step 2)

### Step 4: Redeploy on Vercel
After adding env vars, trigger a new deployment (or it auto-deploys from the push).

---

## E2E Test Results

| # | Test | Status |
|---|------|--------|
| 1 | Membership page loads with all three tier cards | ⏳ Pending run |
| 2 | All tier names visible (Free, Grounds Keeper, Players Club) | ⏳ Pending run |
| 3 | "Most Popular" badge visible on Grounds Keeper card | ⏳ Pending run |
| 4 | Grounds Keeper CTA has correct BMC level ID (309472) | ⏳ Pending run |
| 5 | Players Club CTA has correct BMC level ID (309474) | ⏳ Pending run |
| 6 | Upgrade CTAs have href containing buymeacoffee.com | ⏳ Pending run |
| 7 | FAQ section is visible | ⏳ Pending run |
| 8 | Page is mobile responsive (375px viewport) | ⏳ Pending run |

---

## Gate Validation Criteria

- [ ] `/membership` page renders three tier cards (Free, Grounds Keeper, Players Club)
- [ ] "Most Popular" badge on Grounds Keeper
- [ ] BMC checkout links include correct level IDs (309472, 309474)
- [ ] Authenticated user sees their current tier highlighted with "Current Plan"
- [ ] Paid tier user sees "Manage on Buy Me a Coffee" link
- [ ] Unauthenticated user sees Login CTA in the page
- [ ] Hero page has "View Membership Plans" link
- [ ] `POST /api/webhooks/bmc` correctly upgrades/downgrades tier
- [ ] Webhook rejects invalid signatures with 401
- [ ] Profile page Save/Cancel buttons appear below the name input
- [ ] All 8 E2E tests pass against production URL
