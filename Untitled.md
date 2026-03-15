---

name: Alto Golf Code Audit

overview: "Code audit of alto-good-vibes-golf with High, Medium, and Low impact changes focused on code efficiency: algorithmic complexity in scoring and side bets, duplicate data and ID mismatches, client lifecycle and API security, and minor deduplication and cleanup."

todos: []

isProject: false

---

  

# Code Audit: alto-good-vibes-golf (Code Efficiency Focus)

  

## High impact

  

### 1. Scoring algorithms – replace repeated linear scans with indexed lookups

  

**File:** [lib/scoring.ts](lib/scoring.ts)

  

All calculator functions (`calculateSkins`, `calculateNassau`, `calculateMatchPlay`, `calculateStableford`, `calculateChaosSkins`) iterate over holes and/or players and repeatedly call `scores.filter(s => s.hole === hole)` or `scores.find(e => e.player_id === p.id && e.hole === hole)`. For 4 players × 18 holes this yields hundreds of full array scans per standings computation.

  

**Change:** Build a single lookup structure once per invocation (e.g. `Map<string, number>` keyed by `${player_id}:${hole}` for strokes, or a `Map<number, ScoreEntry[]>` by hole). Use O(1) lookups inside loops. Pass this structure into helpers or build it at the top of `calculateStandings` and pass to each game-specific calculator. This reduces per-round work from O(holes × players × scores.length) to O(scores.length) for the index plus O(holes × players) for the actual logic.

  

### 2. Side bet results – batch upserts instead of per-hole/per-player awaits

  

**File:** [lib/actions/sideBets.ts](lib/actions/sideBets.ts) (`calculateSideBetResults`)

  

The function runs multiple `await admin.from('side_bet_results').upsert(...)` inside nested loops (hole-type bets per hole, birdie per hole/player, pressure once per bet). Each await is a round-trip.

  

**Change:** Collect all rows to upsert in memory (array of objects), then perform one or a small number of bulk `upsert` calls (Supabase supports inserting multiple rows). This cuts DB round-trips from O(holes × bets) to O(1) or O(bets) and reduces lock time.

  

### 3. Single source of truth for games and tier (fix ID mismatch)

  

**Files:** [lib/games.ts](lib/games.ts), [lib/access-control.ts](lib/access-control.ts)

  

- **lib/games.ts** defines `GAMES` with ids: `skins`, `nassau`, `matchplay`, `stableford`, `wolf`, `chaosskins`, `custom` (used by GameCatalog, scorecard, ledger, recap, parse-rules).

- **lib/access-control.ts** defines a separate `GAMES` array with ids: `skins`, `nassau`, `match-play`, `stableford`, `custom-game`, `side-bets` and different shape (e.g. `category` vs `tier`).

  

So `getRequiredTier('matchplay')` does not find a game (access-control has `match-play`) and returns `'players_club'`, and tier checks can be wrong. Round creation uses `lib/games` ids, so stored `game_id` is `matchplay`; access-control never matches it.

  

**Change:** Use a single source of truth. Option A: Have `access-control` import game metadata from `lib/games` and derive tier/category from it (with a small mapping if needed for `side-bets`). Option B: Align IDs and shape in both places and re-export from one module. This fixes incorrect tier gating and removes duplicate game definitions.

  

### 4. Admin delete-user API – add authentication

  

**File:** [app/api/admin/delete-user/route.ts](app/api/admin/delete-user/route.ts)

  

The route accepts POST with `userId` and deletes that user via Supabase admin with no authentication or authorization. Any client can delete any user.

  

**Change:** Restrict the endpoint: e.g. require a server-only secret header (e.g. `x-admin-secret`) or service key, or move the operation behind an internal-only path and never expose it to the client without server-side checks. This is a critical security fix; included here because it is high-impact for safe operation.

  

---

  

## Medium impact

  

### 5. Supabase browser client – stable reference to avoid effect re-runs

  

**Files:** [app/round/[id]/scorecard/page.tsx](app/round/[id]/scorecard/page.tsx), [app/round/[id]/ledger/page.tsx](app/round/[id]/ledger/page.tsx), [app/round/[id]/recap/page.tsx](app/round/[id]/recap/page.tsx), [app/round/create/page.tsx](app/round/create/page.tsx), [app/round/[id]/side-bets/new/page.tsx](app/round/[id]/side-bets/new/page.tsx)

  

Each page does `const supabase = createClient()` in the component body and uses `supabase` in `useEffect` dependencies (e.g. `[id, supabase]`). `createClient()` returns a new object every render, so the effect can re-run every time, causing redundant loads and potential request storms.

  

**Change:** Use a stable client reference: either a module-level singleton in [lib/supabase/client.ts](lib/supabase/client.ts) (e.g. `let client: ReturnType<typeof createBrowserClient> | null = null; export function createClient() { return client ??= createBrowserClient(...); }`) or create the client once per component with `useState(() => createClient())` / `useMemo`. Then remove `supabase` from effect deps where the effect only needs to run when `id` (or other route params) change.

  

### 6. createSideBet – parallelize independent DB reads

  

**File:** [lib/actions/sideBets.ts](lib/actions/sideBets.ts) (`createSideBet`)

  

Flow is: get user → get user tier → get scores → get players → compute `created_hole` → insert. The first two and the next two can be parallelized.

  

**Change:** After validating auth and tier, run `Promise.all([supabase.from('score_entries').select(...).eq('round_id', roundId), supabase.from('round_players').select(...).eq('round_id', roundId)])` (and optionally combine round + user tier in one or two parallel calls) so that scores and players load in parallel, reducing latency.

  

### 7. Scorecard – debounce or conditional side-bet recalc on score save

  

**File:** [app/round/[id]/scorecard/page.tsx](app/round/[id]/scorecard/page.tsx) (`upsertScore`)

  

On every score upsert the code calls `calculateSideBetResults(id)` then `getSideBets(id)`. Rapid +/- taps can queue many server actions and DB writes.

  

**Change:** Only run `calculateSideBetResults` when the current hole becomes complete for all players (or debounce, e.g. 500–800 ms after last score change). Optionally refresh side bets only when that recalc runs, or when switching holes, to reduce server load and UI churn.

  

---

  

## Low impact

  

### 8. Shared bet type labels and icons

  

**Files:** [app/round/[id]/scorecard/page.tsx](app/round/[id]/scorecard/page.tsx), [app/round/[id]/ledger/page.tsx](app/round/[id]/ledger/page.tsx), [app/round/[id]/recap/page.tsx](app/round/[id]/recap/page.tsx)

  

The same `getBetType` / `getBetName` (or `getBetIcon` / `getBetName`) maps for `hole`, `drive`, `pin`, `birdie`, `pressure` are duplicated in three pages.

  

**Change:** Extract to a small shared module (e.g. `lib/sideBetLabels.ts` or next to [lib/actions/sideBets.ts](lib/actions/sideBets.ts)) and import in all three pages. Reduces duplication and keeps labels consistent.

  

### 9. Ledger/recap – hole completion without repeated filter

  

**Files:** [app/round/[id]/ledger/page.tsx](app/round/[id]/ledger/page.tsx), [app/round/[id]/recap/page.tsx](app/round/[id]/recap/page.tsx)

  

`lastCompleteHole` (ledger) is computed with a loop that does `scores.filter((e) => e.hole === h)` for each hole. Same pattern can appear in recap.

  

**Change:** Reuse an indexed view of scores (e.g. by hole) or a single pass that records the last hole where all players have a score. Aligns with the scoring refactor (indexed lookups) and avoids repeated filters.

  

### 10. Remove no-op useEffect in MembershipClient

  

**File:** [app/membership/MembershipClient.tsx](app/membership/MembershipClient.tsx)

  

`useEffect(() => {}, [])` is empty and the comment says "Prevent body scroll when modal open — not needed here".

  

**Change:** Remove the effect and comment. If scroll lock is needed later, add it when implementing the modal.

  

### 11. Document or parameterize Stableford PAR

  

**File:** [lib/scoring.ts](lib/scoring.ts)

  

`const PAR = 4` is used for all holes in `calculateStableford`. If course-specific par is added later, this will need to change.

  

**Change:** Add a short comment that par is currently global; optionally accept an optional `parByHole?: number[]` (or similar) in the calculator signature for future use. Low priority.

  

### 12. Optional: cache or reuse Anthropic client in parse-rules

  

**File:** [app/api/games/parse-rules/route.ts](app/api/games/parse-rules/route.ts)

  

The Anthropic client is created at module level (`const client = new Anthropic()`), which is already efficient. If the app scales to very high concurrency, consider reuse/caching; otherwise leave as-is. Listed as low/optional.

  

---

  

## Summary diagram

  

```mermaid

flowchart LR

subgraph high [High impact]

A[Scoring: index scores once]

B[Side bets: batch upserts]

C[Single games + tier source]

D[Admin API auth]

end

subgraph medium [Medium impact]

E[Stable Supabase client]

F[createSideBet parallel reads]

G[Debounce side-bet recalc]

end

subgraph low [Low impact]

H[Shared bet labels]

I[Ledger/recap hole index]

J[Remove no-op useEffect]

K[Stableford PAR note]

end

high --> medium

medium --> low

```

  

Implementing the high-impact items (1–4) will yield the largest gains in runtime efficiency, data consistency, and security; medium items (5–7) improve client stability and server load; low items (8–12) tidy the codebase and prepare for future changes.