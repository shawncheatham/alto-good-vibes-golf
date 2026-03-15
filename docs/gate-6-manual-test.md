# Gate 6 — Manual Test Plan
**Feature:** Side Bets  
**Tester:** Shawn  
**Build:** https://alto-good-vibes-golf.vercel.app  
**Date:** ___________

---

## Prerequisites

- [ ] Logged in as a **Players Club** account
- [ ] At least one active round exists (or create one in the test)
- [ ] Round has 2+ players

---

## 1. Tier Gate — Side Bets Hidden for Non-Players Club

> Verify free/grounds_keeper users cannot access side bets.

- [ ] Log in as a **Free** or **Grounds Keeper** account
- [ ] Open an active round → scorecard
- [ ] Tap **···** menu
- [ ] **Expected:** "Add Side Bet" is NOT present in the menu (not disabled — completely absent)
- [ ] Log back in as **Players Club** for remaining tests

---

## 2. Add Side Bet — Entry Point

- [ ] Open an active round → scorecard
- [ ] Tap **···** menu
- [ ] **Expected:** "Add Side Bet" is the first item in the menu

---

## 3. Side Bet Config Flow — Step 1: Bet Type

- [ ] Tap "Add Side Bet"
- [ ] **Expected:** Sheet opens with 5 bet type cards:
  - 🏌️ Bet on Each Hole
  - 💥 Longest Drive
  - 🎯 Closest to the Pin
  - 🐦 Birdie or Better Bonus
  - 🔥 Last Hole Pressure
- [ ] Tap **Bet on Each Hole**
- [ ] **Expected:** Card highlights (selected state)
- [ ] **Expected:** Next button becomes active
- [ ] Tap **Next**

---

## 4. Side Bet Config Flow — Step 2: Configure (Bet on Each Hole)

- [ ] **Expected:** Two-column layout — player checkboxes (left), dollar amount (right)
- [ ] **Expected:** All players pre-selected
- [ ] **Expected:** Hole scope shows **Range** toggle (default) + **Single** option
- [ ] **Expected:** Range default spans full round (e.g. holes 1–9 or 1–18)
- [ ] Deselect one player, then re-select — verify min-2 validation if you try to deselect all but one
- [ ] Enter amount: `0.01` → tap Next → **Expected:** validation error (min $0.05)
- [ ] Enter amount: `5.00`
- [ ] Set hole range: **1 to 9**
- [ ] Tap **Next**

---

## 5. Side Bet Config Flow — Step 3: Confirm

- [ ] **Expected:** Summary card shows:
  - Bet type: Bet on Each Hole
  - Players: all selected players listed
  - Holes: 1–9
  - Amount: $5.00
- [ ] Tap **🎲 Start Side Bet**
- [ ] **Expected:** Sheet dismisses, returns to scorecard

---

## 6. Hole Strip — Orange Dot Indicator

- [ ] On the scorecard, scroll the hole strip
- [ ] **Expected:** Holes 1–9 each show a small orange dot (≈5px) below the hole number
- [ ] **Expected:** Holes 10–18 have no dot
- [ ] Navigate to hole 1 — dot visible on hole 1 pip
- [ ] Navigate to hole 10 — no dot on hole 10 pip

---

## 7. Active Bet Callout — Scorecard

- [ ] On a hole covered by the side bet (e.g. hole 1)
- [ ] **Expected:** Orange callout strip appears above player score cards
- [ ] **Expected:** Callout shows: 🏌️ Bet on Each Hole · $5.00
- [ ] **Expected:** Callout sub-line lists participating player names
- [ ] Navigate to hole 10 (outside range)
- [ ] **Expected:** Callout is not shown

---

## 8. Multiple Side Bets

- [ ] Tap **···** → Add Side Bet
- [ ] Select **🔥 Last Hole Pressure**, configure for hole 18, $10
- [ ] Confirm
- [ ] Navigate to hole 18
- [ ] **Expected:** Two callout strips stacked (Bet on Each Hole is out of range, Last Hole Pressure shows)
- [ ] Navigate to hole 9 (last hole covered by first bet)
- [ ] **Expected:** Only Bet on Each Hole callout shows

---

## 9. Closest to Pin — Par 3 Warning

- [ ] Add a new side bet → select **🎯 Closest to the Pin**
- [ ] Step 2: **Expected:** Warning note visible: *"Verify this is a par 3 — par data unavailable from course API."*
- [ ] Configure hole 7, $3 → confirm
- [ ] **Expected:** Bet created successfully

---

## 10. Undo Removed

- [ ] On the scorecard, enter a score for any player
- [ ] **Expected:** No undo bar appears at the bottom
- [ ] **Expected:** No "Score saved" toast
- [ ] Score is saved automatically (confirmed by persisting on navigation)

---

## 11. Manual Winner — Longest Drive / Closest to Pin

- [ ] Add a **💥 Longest Drive** side bet on hole 3, $8
- [ ] Navigate to hole 3
- [ ] Enter scores for **all** participating players
- [ ] **Expected:** After last score entered, callout updates to show **"👆 Tap to select winner"** with player name rows
- [ ] Tap a player name
- [ ] **Expected:** Callout updates to show that player as winner (e.g. ✅ [Name] wins $8)
- [ ] Navigate away and back to hole 3
- [ ] **Expected:** Winner is still shown (persisted)

---

## 12. Ledger — Overall Totals + Side Bets

- [ ] Navigate to the round **Ledger**
- [ ] **Expected:** Page loads without error
- [ ] **Expected:** Top card has dark green header (#1a3a2a) labeled **💰 Overall**
- [ ] **Expected:** Per-player rows with net amounts (positive green, negative red)
- [ ] **Expected:** Main game standings section below overall totals
- [ ] **Expected:** **Side Bets** section below main game
- [ ] **Expected:** Each side bet shown as a card with orange left border
- [ ] **Expected:** Orange header strip with bet name and status badge (In Progress / Complete)
- [ ] **Expected:** Per-player running totals shown in each card

---

## 13. Recap — Settlement Card First

> Complete or end the round to access recap.

- [ ] Navigate to **Recap**
- [ ] **Expected:** First card on page has dark green (#1a3a2a) background
- [ ] **Expected:** Card shows net per player (+ green / − red)
- [ ] **Expected:** "Who pays who" sub-section with transfer rows (e.g. "Alice pays Bob $5.00")
- [ ] **Expected:** Main game winner card appears **after** the settlement card
- [ ] **Expected:** Side bet result cards appear below main game standings
- [ ] **Expected:** Each side bet result card shows winner and amounts

---

## 14. Share Text

- [ ] On the recap, tap **Share**
- [ ] **Expected:** Shared text includes settlement summary (net amounts)
- [ ] **Expected:** Shared text includes side bet winners

---

## 15. Regression — Prior Gates Intact

- [ ] Score entry (+ / − steppers) still works
- [ ] Scores auto-save (no explicit save button needed)
- [ ] Round history page loads and shows completed rounds
- [ ] Game catalog accessible at round creation
- [ ] Tier gating on game catalog still works (premium games locked for free users)
- [ ] Profile page loads
- [ ] Magic link auth still works (logout → login flow)

---

## Pass Criteria

All items above checked. Gate 6 APPROVED when Shawn signs off after device validation.

---

## Issues Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| | | | |
