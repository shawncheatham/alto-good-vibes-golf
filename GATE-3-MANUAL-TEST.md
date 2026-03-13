# Gate 3 Manual Test Guide

**URL:** https://alto-good-vibes-golf.vercel.app  
**Date:** 2026-03-12  
**Tester:** Shawn

---

## 1. Membership Page — Public (No Login)

Go to: https://alto-good-vibes-golf.vercel.app/membership

- [x] Page loads (no error, no blank screen)
- [x] "Choose Your Plan" heading is visible
- [x] Three tier cards visible: **Free**, **Grounds Keeper**, **Players Club**
- [x] "Most Popular" badge appears on the Grounds Keeper card
- [x] Free tier shows **$0/mo**
- [x] Grounds Keeper shows **$3/mo** with "7-day free trial" note
- [x] Players Club shows **$8/mo** with "7-day free trial" note
- [x] Free tier card has a "Current Plan" button that is **grayed out / disabled**
- [x] Grounds Keeper and Players Club cards show **"Sign Up to Upgrade"** links (orange and green buttons)
- [x] A "Log In" CTA section appears in the middle of the page
- [x] FAQ section at the bottom is visible with at least 4 questions

---

## 2. BMC Upgrade Links

Still on the Membership page (no login required):

- [x] Click **"Sign Up to Upgrade"** on the Grounds Keeper card
  - Should open Buy Me a Coffee in a new tab
  - URL should contain `golfvibes/membership` and `level=309472`
- [x] Click **"Sign Up to Upgrade"** on the Players Club card
  - Should open Buy Me a Coffee in a new tab
  - URL should contain `golfvibes/membership` and `level=309474`

---

## 3. Hero Page — Membership Link

Go to: https://alto-good-vibes-golf.vercel.app

- [x] "View Membership Plans" link is visible on the home/hero page
- [x] Clicking it goes to `/membership`

---

## 4. Authenticated User — Membership Page

Log in first: https://alto-good-vibes-golf.vercel.app/login

Then go to: https://alto-good-vibes-golf.vercel.app/membership

- [x] Your current tier (Free) shows **"Current Plan"** disabled button
- [x] Grounds Keeper and Players Club show **"Upgrade to Grounds Keeper"** / **"Upgrade to Players Club"** (with your email pre-filled in the BMC URL)
- [x] No "Log In" CTA visible (you're already logged in)

---

## 5. Profile Page — Button Layout Fix

Go to: https://alto-good-vibes-golf.vercel.app/profile (must be logged in)

- [x] Click "Edit" on your display name
- [x] Input field appears
- [x] **Save** and **Cancel** buttons appear **below** the input field (not inline with it on the same row)
- [x] Cancel closes the edit without saving
- [x] Save updates the name and shows success

---

## 6. Mobile Check

On your phone or browser DevTools at 375px width:

- [x] Membership page loads on mobile
- [x] All three tier cards stack vertically
- [x] "Most Popular" badge still visible
- [x] Upgrade buttons still tappable

---

## Notes

- **Webhook live test** — a real BMC subscription event will automatically update your tier in the database. Not required for gate approval; webhook was verified via BMC dashboard registration.
- **Game access control** — the `canAccessGame()` logic is in place but won't be visible until game selection UI is wired up in a future gate.

---

## Sign-Off

- [x] All manual checks pass
- [x] **Gate 3 APPROVED** — date: 03-12-26___________
