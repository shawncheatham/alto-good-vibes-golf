# Gate 3 Manual Test Guide

**URL:** https://alto-good-vibes-golf.vercel.app  
**Date:** 2026-03-12  
**Tester:** Shawn

---

## 1. Membership Page — Public (No Login)

Go to: https://alto-good-vibes-golf.vercel.app/membership

- [ ] Page loads (no error, no blank screen)
- [ ] "Choose Your Plan" heading is visible
- [ ] Three tier cards visible: **Free**, **Grounds Keeper**, **Players Club**
- [ ] "Most Popular" badge appears on the Grounds Keeper card
- [ ] Free tier shows **$0/mo**
- [ ] Grounds Keeper shows **$3/mo** with "7-day free trial" note
- [ ] Players Club shows **$8/mo** with "7-day free trial" note
- [ ] Free tier card has a "Current Plan" button that is **grayed out / disabled**
- [ ] Grounds Keeper and Players Club cards show **"Sign Up to Upgrade"** links (orange and green buttons)
- [ ] A "Log In" CTA section appears in the middle of the page
- [ ] FAQ section at the bottom is visible with at least 4 questions

---

## 2. BMC Upgrade Links

Still on the Membership page (no login required):

- [ ] Click **"Sign Up to Upgrade"** on the Grounds Keeper card
  - Should open Buy Me a Coffee in a new tab
  - URL should contain `golfvibes/membership` and `level=309472`
- [ ] Click **"Sign Up to Upgrade"** on the Players Club card
  - Should open Buy Me a Coffee in a new tab
  - URL should contain `golfvibes/membership` and `level=309474`

---

## 3. Hero Page — Membership Link

Go to: https://alto-good-vibes-golf.vercel.app

- [ ] "View Membership Plans" link is visible on the home/hero page
- [ ] Clicking it goes to `/membership`

---

## 4. Authenticated User — Membership Page

Log in first: https://alto-good-vibes-golf.vercel.app/login

Then go to: https://alto-good-vibes-golf.vercel.app/membership

- [ ] Your current tier (Free) shows **"Current Plan"** disabled button
- [ ] Grounds Keeper and Players Club show **"Upgrade to Grounds Keeper"** / **"Upgrade to Players Club"** (with your email pre-filled in the BMC URL)
- [ ] No "Log In" CTA visible (you're already logged in)

---

## 5. Profile Page — Button Layout Fix

Go to: https://alto-good-vibes-golf.vercel.app/profile (must be logged in)

- [ ] Click "Edit" on your display name
- [ ] Input field appears
- [ ] **Save** and **Cancel** buttons appear **below** the input field (not inline with it on the same row)
- [ ] Cancel closes the edit without saving
- [ ] Save updates the name and shows success

---

## 6. Mobile Check

On your phone or browser DevTools at 375px width:

- [ ] Membership page loads on mobile
- [ ] All three tier cards stack vertically
- [ ] "Most Popular" badge still visible
- [ ] Upgrade buttons still tappable

---

## Notes

- **Webhook live test** — a real BMC subscription event will automatically update your tier in the database. Not required for gate approval; webhook was verified via BMC dashboard registration.
- **Game access control** — the `canAccessGame()` logic is in place but won't be visible until game selection UI is wired up in a future gate.

---

## Sign-Off

- [ ] All manual checks pass
- [ ] **Gate 3 APPROVED** — date: ___________
