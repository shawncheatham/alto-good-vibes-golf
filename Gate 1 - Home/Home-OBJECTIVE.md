# Gate 1: Home Page — Component Objective (DRAFT)

**Status:** Draft for interview  
**Gate:** 1 of 6  
**Component:** Home Page  
**Dependencies:** None (first component)

---

## Purpose

Marketing landing page + legal/info structure

---

## Scope (from outline)

- Marketing landing page (brand intro, value prop, CTA)
- Terms of Service
- Privacy Policy
- Navigation shell for authenticated components

---

## Existing Assets

- GVG homepage: https://good-vibes-golf.vercel.app/ (brand tone reference)

---

## Deliverables

- HTML prototype (Parker)
- Production deployment (Monk)
- Passing E2E smoke test
- Mobile device confirmation (Shawn)

---

## Definition of Done

- Live at production URL
- Design matches Figma comp visual language
- GVG brand tone intact
- Responsive (mobile-first)
- Legal pages accessible

---

## Open Questions for Interview

1. **Marketing landing page content:**
   - What sections? (
	   - Hero
   - Primary CTA: 
	   - Sign Up 
   - Secondary CTAs: 
	   - Login
   
2. **Navigation shell:**
   - What links appear for unauthenticated users? 
	   - Sign Up
   - What links appear for authenticated users?
	   - Start Round
   - Mobile nav pattern (hamburger, bottom nav, etc.)?
	   - hamburger

3. **Terms of Service / Privacy Policy:**
   - Use existing GVG legal text or write new?
	   - Generate boilerplate or lorem ipsum Terms and Conditions
	   - Generate boilerplate or lorem ipsum content for Privacy Policy
	   - I’ll update it with real content later
   - Standalone pages or modal overlays?
	   - Standalone for home, terms and conditions and privacy
	   - Modal overlays for sign up/login

4. **Design comp:**
   - Figma comp reference: https://s3-alpha.figma.com/hub/file/4640124499/85354f41-8eba-4ceb-ae49-55195943c4c7-cover.png
	   - This is a functional example for the Game Catalog, it is not a design comp for the homepage.
   - Is this the visual direction for Home specifically, or general design language?
	   - No. Leverage the GVG design inputs.
   - Any other design references?
	   - https://good-vibes-golf.vercel.app/ (brand tone reference)

5. **Prototype fidelity:**
   - Full interactive prototype or static page layout?
	   - Fully interactive
   - Mock CTA behavior (e.g., "Sign Up" button goes where)?
	   - membership placeholder modal. Empty/non-functional

---

**Next Step:** Interview with Shawn to clarify scope and answer open questions.

--- 
# Shawn’s responses

1. **Marketing landing page content:**
   - What sections? 
	   - Hero
   - Primary CTA: 
	   - Sign Up 
   - Secondary CTAs: 
	   - Login
   
2. **Navigation shell:**
   - What links appear for unauthenticated users? 
	   - Sign Up
   - What links appear for authenticated users?
	   - Start Round
   - Mobile nav pattern (hamburger, bottom nav, etc.)?
	   - I’m not sure this is relevant since there are so little functionality. 
	   - Terms and Privacy can be links in the footer, everything else is a button within the page

3. **Terms of Service / Privacy Policy:**
   - Use existing GVG legal text or write new?
	   - Generate boilerplate or lorem ipsum Terms and Conditions
	   - Generate boilerplate or lorem ipsum content for Privacy Policy
	   - I’ll update it with real content later
   - Standalone pages or modal overlays?
	   - Standalone for home, terms and conditions and privacy
	   - Modal overlays for sign up/login

4. **Design comp:**
   - Figma comp reference: https://s3-alpha.figma.com/hub/file/4640124499/85354f41-8eba-4ceb-ae49-55195943c4c7-cover.png
	   - This is a functional example for the Game Catalog, it is not a design comp for the homepage.
   - Is this the visual direction for Home specifically, or general design language?
	   - No. Leverage the GVG design inputs.
   - Any other design references?
	   - https://good-vibes-golf.vercel.app/ (brand tone reference)

5. **Prototype fidelity:**
   - Full interactive prototype or static page layout?
	   - Fully interactive
   - Mock CTA behavior (e.g., "Sign Up" button goes where)?
	   - membership placeholder modal. Empty/non-functional
