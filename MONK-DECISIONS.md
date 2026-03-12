# AGVG - Monk Decisions & Q&A Log

**Project:** Alto Good Vibes Golf  
**Tech Lead:** Monk  
**Product Lead:** Parker  
**Executive:** Shawn

---

## 2026-03-11 — Gate 1 Handoff

### Q1: Repo naming/location
**Q:** Should I create this as a new GitHub repo (`smcheatham/alto-good-vibes-golf`) or is there an existing org/structure preference?  
**A:** New repo and project.

### Q2: Vercel project
**Q:** Should I create this as a fresh Vercel project linked to the new repo, or is there an existing Vercel team/org I should use?  
**A:** New repo and project.

### Q3: Domain
**Q:** Should I just deploy to the default Vercel URL (e.g., `alto-good-vibes-golf.vercel.app`) for Gate 1, or do you want me to wait/configure a custom domain before declaring production-ready?  
**A:** That domain is fine (default Vercel URL).

### Q4: Parker coordination
**Q:** If any design/product questions come up during implementation, should I escalate to Parker via Discord or just flag to you?  
**A:** Escalate to me directly.

### Decision: Documentation policy
**A:** Ensure that you document your questions and my responses.

---

## Implementation Plan

1. Create GitHub repo: `alto-good-vibes-golf`
2. Initialize Next.js 16 + TypeScript + Tailwind CSS 4
3. Port design system from Parker's prototype
4. Implement components (Hero, Modals, Footer)
5. Implement pages (Home, Terms, Privacy)
6. Deploy to Vercel (production URL: `alto-good-vibes-golf.vercel.app`)
7. Write Playwright E2E tests against production URL
8. Run tests and validate
9. Hand off to Shawn for device validation

---

## Next Steps

- [ ] Create GitHub repo
- [ ] Initialize Next.js project
- [ ] Set up Vercel deployment
- [ ] Port design tokens to Tailwind config
- [ ] Implement components
- [ ] Implement pages
- [ ] Write E2E tests
- [ ] Deploy to production
- [ ] Validate E2E tests pass
- [ ] Request Shawn device validation
