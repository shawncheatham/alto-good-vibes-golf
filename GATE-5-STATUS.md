# Gate 5 — Game Catalog: Status

**Status:** ✅ APPROVED  
**Approved:** 2026-03-13  
**Approved by:** Shawn (iPhone device validation)  
**E2E:** 44/44 passing  

---

## What Was Built

### Database
| Column | Table | Type | Notes |
|--------|-------|------|-------|
| `game_id` | `rounds` | TEXT | Default `'skins'` |
| `game_label` | `rounds` | TEXT | Display name (e.g. "Custom Skins") |
| `custom_rules` | `rounds` | JSONB | null for standard games |
| `metadata` | `rounds` | JSONB | Chaos Skins multipliers stored here |

### New Files
| File | Purpose |
|------|---------|
| `lib/games.ts` | Game definitions, tier config, off-topic guardrail |
| `lib/scoring.ts` | Scoring adapters for all 6 formats + dispatcher |
| `components/GameCatalog.tsx` | Horizontal scroll catalog, tier gating, inline detail, upgrade modal |
| `components/CustomGameFlow.tsx` | 3-step AI custom game flow |
| `app/api/games/parse-rules/route.ts` | AI rules parser (Claude Haiku) |
| `e2e/gate-5-game-catalog.spec.ts` | 9 E2E tests |

### Updated Files
| File | Change |
|------|--------|
| `app/round/create/page.tsx` | GameCatalog replaces hardcoded Skins badge; Wolf validation; Chaos multiplier generation |
| `app/round/[id]/scorecard/page.tsx` | `calculateStandings` dispatcher; multi-shape ledger; Chaos multiplier reveal |
| `app/round/[id]/recap/page.tsx` | Game-aware winner line per format |

---

## Game Library

| Game | Tier | Scoring |
|------|------|---------|
| 🎯 Skins | Free | Low score wins hole; ties carry |
| ⛳ Nassau | Grounds Keeper | Three tallies: F/B/T |
| 🤝 Match Play | Grounds Keeper | Hole win/loss/halve; match state |
| 📊 Stableford | Grounds Keeper | Points vs par (par=4 placeholder) |
| 🐺 Wolf | Grounds Keeper | Rotation tracking; skins standings (partner UI future) |
| 🎲 Chaos Skins | Grounds Keeper | Skins + per-hole multiplier (1×/2×/3×) revealed live |
| ✨ Custom | Players Club | AI-described rules; base game scoring applied |

---

## Fixes Applied During Testing
- AI responses stripping markdown (Claude was returning `**bold**`, numbered lists)
- System prompt updated to enforce plain text only
- Guardrail relaxed: short replies ("yes", "no", "both", ≤3 words) bypass golf-term check

---

## Known Deferred Items
| Item | Gate |
|------|------|
| Stableford par per hole (course data) | Future |
| Wolf partner selection UI | Future |
| Custom game AI scoring engine | Future |
| AI custom flow refinement (tone, quality) | Future |

---

## Next: Gate 6 — Side Bets
