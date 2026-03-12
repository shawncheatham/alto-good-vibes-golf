# Gate 2 Manual Test Guide

**For:** Shawn  
**Date:** 2026-03-12  
**URL:** https://alto-good-vibes-golf.vercel.app  
**Time to complete:** ~10 minutes  

Best done on **iPhone** (that's the real validation). Desktop works too.

---

## Before You Start

You'll need:
- Access to an email inbox you can check
- A phone number (any real format)

Use a **real email you can receive messages at** — Supabase sends actual emails.

---

## Test 1 — Sign Up

**What this validates:** New user can create an account via magic link.

1. Go to https://alto-good-vibes-golf.vercel.app
2. Tap **"Get Started Free"** or **"Sign Up"**
3. Fill in:
   - Email: your real email
   - Phone: your phone number
   - Name: your name
4. Tap **"Sign Up"**

**Expected:** "Check your email" confirmation message appears immediately.

5. Open your email inbox
6. Find the email from Supabase / Good Vibes Golf
7. Tap the magic link

**Expected:** You're redirected to the app, land on `/round-history` page showing "No rounds yet."

✅ Pass / ❌ Fail — notes:

---

## Test 2 — Round History (Empty State)

**What this validates:** Authenticated users see the correct empty state.

After signing in from Test 1, you should be on `/round-history`.

**Expected:**
- "No rounds yet" heading (or similar)
- Some prompt to start a round (placeholder — not functional yet, Gate 4)
- No errors

✅ Pass / ❌ Fail — notes:

---

## Test 3 — Session Persistence

**What this validates:** You stay logged in after closing and reopening the browser.

1. Close the browser tab (or the app)
2. Open a new tab and go to https://alto-good-vibes-golf.vercel.app/round-history

**Expected:** You're still logged in. You see the round history page, NOT redirected to `/login`.

✅ Pass / ❌ Fail — notes:

---

## Test 4 — Profile Page

**What this validates:** Profile settings page loads and shows your info.

1. Go to https://alto-good-vibes-golf.vercel.app/profile

**Expected:**
- Your name is displayed
- Your email is displayed
- Edit options are visible
- Logout button is visible

✅ Pass / ❌ Fail — notes:

---

## Test 5 — Edit Name

**What this validates:** Users can update their display name.

1. On the profile page, find the Name field
2. Edit it (change to something slightly different)
3. Save

**Expected:** Name updates successfully. Shows confirmation or updated value.

✅ Pass / ❌ Fail — notes:

---

## Test 6 — Logout

**What this validates:** Logout works cleanly.

1. From the profile page, tap **"Log Out"** (or however it's labeled)

**Expected:** Redirected to home page or login page. No longer authenticated.

2. Try to go directly to https://alto-good-vibes-golf.vercel.app/round-history

**Expected:** Redirected to `/login`. You cannot access protected pages while logged out.

✅ Pass / ❌ Fail — notes:

---

## Test 7 — Login (Existing Account)

**What this validates:** Existing users can log back in via magic link.

1. Go to https://alto-good-vibes-golf.vercel.app/login
2. Enter the same email you used in Test 1
3. Tap **"Send Magic Link"**

**Expected:** "Check your email" confirmation appears.

4. Check your email, click the magic link

**Expected:** Logged back in, land on `/round-history`.

✅ Pass / ❌ Fail — notes:

---

## Test 8 — Account Deletion (Optional)

**What this validates:** Account can be permanently deleted.

Only run this if you want to clean up the test account. You'll need to re-sign-up after.

1. While logged in, go to `/profile`
2. Find the **"Delete Account"** option
3. Confirm deletion

**Expected:** Account deleted, redirected to home page. Trying to log in with that email should require a new sign-up.

✅ Pass / ❌ Fail — notes:

---

## Summary Checklist

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| 1. Sign Up | | |
| 2. Round History Empty State | | |
| 3. Session Persistence | | |
| 4. Profile Page | | |
| 5. Edit Name | | |
| 6. Logout + Route Protection | | |
| 7. Login (Existing Account) | | |
| 8. Account Deletion (optional) | | |

---

## Known Limitations (Free Tier)

- **Email rate limit:** Supabase free tier limits to ~2 magic link emails/hour. If you hit "email rate limit exceeded," just wait ~30 minutes and try again.
- **Email delivery time:** Magic link emails typically arrive within 30 seconds, but can take up to a few minutes.

---

## If Something Breaks

Screenshot the error + URL and drop it in Discord or ping Monk directly.

Most likely culprits:
- Email went to spam → check spam folder
- Rate limit hit → wait 30 min
- Link expired (>1 hour) → request a new one

---

## Gate 2 Approval

Once all tests pass on device:

> "Gate 2 approved, proceed to Gate 3."

That closes Gate 2 and unlocks Gate 3 (Membership).
