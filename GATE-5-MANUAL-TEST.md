# Gate 5 Manual Test Guide

**URL:** https://alto-good-vibes-golf.vercel.app  
**Date:** 2026-03-13  
**Tester:** Shawn  
**Status:** APPROVED  
**Device:** iPhone (primary)

---

## Pre-flight

- [x] Logged in as `shawn00@gmail.com` (tier: `players_club`)
- [x] On `/round/create` after login

---

## 1. Game Catalog — Loads Correctly

Go to: `/round/create` → scroll to "Select a Game" section

- [x] Horizontal scroll carousel visible with 7 cards
- [x] Cards: Skins 🎯, Nassau ⛳, Match Play 🤝, Stableford 📊, Wolf 🐺, Chaos Skins 🎲, Custom ✨
- [x] Skins is selected by default (green border + ✓ checkmark)
- [x] Start button reads "Start Round — Skins"

---

## 2. Free Tier — Upgrade Gating

*(Test with a free account or temporarily downgrade in DB)*

- [x] Nassau, Match Play, Stableford, Wolf, Chaos Skins show "Upgrade" badge
- [x] Tapping a locked card opens upgrade modal
- [x] Modal shows "Unlock Standard Games", Grounds Keeper tier, $3/mo, BMC link
- [x] Custom shows "Players Club" badge when locked
- [x] "Maybe Later" closes the modal

---

## 3. Grounds Keeper — Standard Games Unlocked

*(All standard games accessible; Custom still locked)*

- [x] Nassau card tappable — inline detail expands below carousel
- [x] Detail shows full rules: "Three separate bets: front 9, back 9, and overall 18"
- [x] "Select this game" button → card highlights green, detail closes
- [x] Start button updates to "Start Round — Nassau"
- [x] Tapping same card again collapses detail (toggle)
- [x] Tapping a different card switches detail content
- [x] Custom card still shows upgrade modal for Grounds Keeper

---

## 4. Players Club — All Games Unlocked

*(shawn00@gmail.com is set to players_club)*

- [x] All 7 cards tappable, no upgrade badges
- [x] Each standard game: tap → detail → select → start button updates
- [x] Wolf card detail shows "4 players required"

---

## 5. Wolf — Player Count Validation

- [x] Select Wolf in catalog
- [x] Add fewer than 4 players
- [x] Attempting to start round shows error: Wolf requires exactly 4 players
- [x] Adding exactly 4 players clears the error and allows start

---

## 6. Custom Game — Step 1: Base Game Picker

- [x] Tap Custom ✨ card → Custom Game flow opens below carousel
- [x] Step indicators visible: "1 · Base Game → 2 · Your Rules → 3 · Confirm"
- [x] Step 1 active (green border)
- [x] 2-column grid shows 6 base games (all standard games)
- [x] Tap "Skins" → briefly highlights → advances to Step 2

---

## 7. Custom Game — Step 2: AI Rules Chat

- [x] Step 2 active; base game shown ("Base: 🎯 Skins")
- [x] Opening AI message: "Got it — we're playing Skins. Describe your scoring or rule tweaks..."
- [x] Type a rule tweak (e.g. "Double skins on par 3s") → AI responds in plain text (no markdown artifacts)
- [x] Short replies like "yes", "no", "both", "all par 3s" pass through without guardrail error
- [x] Loop counter shows remaining clarifications ("Up to 2 clarifications remaining")
- [x] Off-topic input (e.g. "what's the weather") → guardrail warning appears, clears after 4 seconds
- [x] Mic button visible; tapping starts voice input on supported devices
- [x] "← Change base game" returns to Step 1

---

## 8. Custom Game — Step 3: Confirm

- [x] After 3 exchanges (or AI produces summary), flow advances to Step 3
- [x] Green summary box shows custom rules in plain text
- [x] "✓ Use These Rules" → Custom card highlights green in carousel
- [x] Start button reads "Start Round — Custom Skins" (or relevant base game)
- [x] "← Edit rules" returns to Step 2

---

## 9. Round Creation with Non-Default Game

Select Nassau, fill course + players, start round:

- [x] Round created in DB with `game_id = "nassau"`
- [x] Scorecard header shows "Nassau · Hole 1 of 18"
- [x] Ledger shows F / B / T columns (front 9, back 9, total)

---

## 10. Scorecard — Game-Aware Ledger

Enter scores across a few holes for each game type:

**Nassau:**
- [x] Front 9 tally updates as holes 1–9 are entered
- [x] Back 9 tally updates for holes 10–18
- [x] Total tally tracks overall

**Match Play:**
- [x] Per-hole win/loss tracked
- [x] Ledger shows match state ("Jordan leads 2&1", "All Square")

**Stableford:**
- [x] Points column shown per player
- [x] Eagle = 4pts, Birdie = 3pts, Par = 2pts, Bogey = 1pt, Double+ = 0pts

**Chaos Skins:**
- [x] Multiplier for current hole shown in scorecard header (e.g. "Hole 3 · 2× multiplier")
- [x] Ledger reflects multiplied skin values

---

## 11. Recap — Game-Aware Winner Line

Finish a round with any non-Skins game:

- [x] Nassau recap: winner line shows "F: X, B: X, T: X"
- [x] Match Play recap: shows match result (e.g. "Jordan wins 3&2")
- [x] Stableford recap: shows points total
- [x] Custom recap: shows custom rules description

---

## Known Limitations (Gate 5)

- Stableford uses par = 4 per hole as placeholder (course par data not yet integrated)
- Wolf partner selection UI not yet implemented — standings show skins only
- Custom game scoring falls back to base game logic — AI rules are descriptive only
- AI flow refinement (tone, response quality) deferred to future iteration

---

## Sign-Off

- [x] All required checks pass
- [x] Custom AI flow works end-to-end on iPhone
- [x] **Gate 5 APPROVED** — date: 03-13-26
