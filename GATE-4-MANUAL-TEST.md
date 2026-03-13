# Gate 4 Manual Test Guide

**URL:** https://alto-good-vibes-golf.vercel.app  
**Date:** 2026-03-13  
**Tester:** Shawn  
**Device:** iPhone (primary), browser optional

---

## Pre-flight

- [x] You're logged in at https://alto-good-vibes-golf.vercel.app/login
- [x] You see the home page after login (or visit `/` while logged in)

---

## 1. Home Page — New CTAs

Go to: https://alto-good-vibes-golf.vercel.app

- [ ] **⛳ Start a Round** button/link is visible
- [ ] **Round History** link is visible
- [ ] Tapping "Start a Round" goes to `/round/create`
- [ ] Tapping "Round History" goes to `/round-history`

---

## 2. Round Creation — Course Search

Go to: https://alto-good-vibes-golf.vercel.app/round/create

- [ ] Page loads with no errors
- [ ] Course search input is visible
- [ ] Type **"Pebble Beach"** — dropdown of results appears within ~1 second
- [ ] Results show course names and locations
- [ ] Tap a result to select it — course name fills the field / selection confirmed
- [ ] Type a short query like **"Torrey"** — results update
- [ ] Clearing the input clears results

---

## 3. Round Creation — Player Setup

Still on `/round/create` after selecting a course:

- [ ] At least one player name field is visible ("Player 1")
- [ ] Enter your name in Player 1
- [ ] Tap **"+ Add Player"** — a second player field appears
- [ ] Enter a second player name (e.g. "Alex")
- [ ] Add a third player if you like
- [ ] Remove a player — player is removed from the list
- [ ] Reorder players (up/down arrows or drag) — order updates

---

## 4. Round Creation — Start Round

- [ ] Tap **"Start Round"** (or "Confirm" button)
- [ ] Page redirects to `/round/[id]/scorecard`
- [ ] Scorecard loads with the correct course name in the header
- [ ] Header shows "Skins · Hole 1 of 18"
- [ ] All players you added appear as cards
- [ ] Hole strip shows 18 holes; Hole 1 is active (◆)

---

## 5. Live Scorecard — Score Entry

On the scorecard page:

- [ ] Hole strip is horizontally scrollable
- [ ] Hole 1 is marked active (◆ / orange)
- [ ] Tap a player card to make them active
- [ ] **− button** and **+ button** appear (large circles, orange)
- [ ] Tap **+** — score increments
- [ ] Tap **−** — score decrements (won't go below 0 or 1)
- [ ] Score auto-saves — no manual save button needed
- [ ] **"Undo last entry"** link is visible after a change
- [ ] Tap "Undo" — score reverts to previous value

---

## 6. Live Scorecard — Navigation

- [ ] Tap **"Hole 2 ▶"** button — advances to Hole 2
- [ ] Hole 1 now shows ✓ (complete) in the hole strip after all players scored
- [ ] Tap a hole number in the hole strip — jumps directly to that hole
- [ ] Tap **"◀ Hole 1"** — goes back

---

## 7. Ledger View

On the scorecard page:

- [ ] Tap the **"Ledger"** tab/button
- [ ] Ledger view shows all players with skins counts
- [ ] After entering scores for a completed hole, ledger reflects the winner
- [ ] If a hole is partially scored (not all players), a **warning banner** appears ("Hole X scores incomplete")
- [ ] Tap **"Scorecard"** — returns to score entry view

---

## 8. Enter Scores for Several Holes

Enter scores for holes 1–3 across all players:

- [ ] Mix in some ties (same score) and some clear winners (different scores)
- [ ] After a tie, the ledger shows the skin carried over to the next hole
- [ ] After a winner, that player shows skins won
- [ ] Standings in ledger update after each entry

---

## 9. Abandon / Delete

Test the escape hatches (use a test round, not your real round):

- [ ] Tap **"..."** or menu icon on the scorecard
- [ ] "Abandon Round" option is visible
- [ ] Tap "Abandon" → round marked as abandoned, you're redirected away
- [ ] Abandoned round appears in Round History (faded / labeled)

For delete (optional):
- [ ] Tap "Delete Round" → confirmation modal appears
- [ ] Confirm delete → round removed from history

---

## 10. Recap

Create a fresh round and enter scores for all 18 holes (or use a round with enough holes scored):

- [ ] After all 18 holes have scores for all players, a **"Finish Round"** button appears
- [ ] Tap "Finish Round" → redirected to `/round/[id]/recap`
- [ ] Recap shows:
  - [ ] Course name
  - [ ] Player names
  - [ ] 🏆 Winner with skins count
  - [ ] Hole highlights ("Hole X: [Player] took it with a [score]")
  - [ ] "Good vibes only. 🤙" line
- [ ] **Share button** is visible
- [ ] Tap Share → native iOS share sheet opens
- [ ] Recap text is in the share sheet, looks clean

---

## 11. Round History

Go to: https://alto-good-vibes-golf.vercel.app/round-history

- [ ] Your rounds are listed (in-progress and completed)
- [ ] In-progress round → tapping it goes to the scorecard
- [ ] Completed round → tapping it goes to the recap
- [ ] Abandoned round appears faded / labeled "Abandoned"

---

## 12. Protected Routes (no login required to test)

Open an incognito window:

- [ ] Go to `/round/create` → redirected to `/login`
- [ ] Go to `/round-history` → redirected to `/login`

---

## Known Limitations (Gate 4)

These are intentional — not bugs:

- No dollar amounts shown anywhere (bet amounts are a future gate)
- Ledger shows skins won, not settlement (who owes who)
- No par values or handicap shown — raw strokes only
- Single scorekeeper only — no multi-device sync
- Game is always Skins — no selection UI yet (Gate 5)

---

## Sign-Off

- [ ] All required checks pass
- [ ] Share recap works on iPhone
- [ ] **Gate 4 APPROVED** — date: ___________
