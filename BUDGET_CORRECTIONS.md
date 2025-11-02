# Script Breakdown Budget Corrections

**Date:** October 30, 2025  
**Status:** ✅ **CORRECTED**

---

## The Problem

**Original Budget Estimates (WRONG):**
- Per episode: $1,450
- Total series (32 episodes): **$46,400** 😱
- This is **2-46x OVER the actual budget!**

**User Feedback:**
> "$1000-$20,000 budget is for the whole series not per episode"  
> "make sure that it's a literal UGC budget bro"  
> "these are 5 minute fucking episodes"

---

## The Correction

### Budget Reality (CORRECT):

**Series Budget:**
- Total: $1,000 - $20,000 for **ALL 32 episodes**
- Per episode: **$30-$625** (depending on series budget tier)

**Budget Breakdown:**
| Series Budget | Per Episode |
|---------------|-------------|
| $1,000 (low) | ~$31/ep |
| $10,000 (mid) | ~$312/ep |
| $20,000 (high) | ~$625/ep |

### Cost Categories (BASE BUDGET ONLY):

**What DOES Cost Money:**
- ✅ **Extras:** $10-$20/day (non-Greenlit actors with 0-minimal speaking lines)
- ✅ **Props:** $5-$50 (mostly cheap/borrowed/actor-owned)
- ✅ **Locations:** $0-$200 (often free: actor's home, public spaces)

**What DOES NOT Cost Money (Base Budget):**
- ❌ **Actors:** Revenue share model (NOT paid)
- ❌ **Crew:** Optional, added separately in Budget tab

### Realistic Scene Costs:

| Scene Type | Budget Range | Breakdown |
|-----------|--------------|-----------|
| Simple dialogue (2 actors, no extras) | **$5-$20** | Props only |
| Scene with 1-3 extras | **$30-$80** | Extras ($10-$20/day) + props |
| Scene with location fee | **$50-$150** | Location + props |
| Complex (extras + location + props) | **$100-$200** | All costs |

**Target:** Keep total episode under $30-$625 range

---

## Shoot Time Corrections

### Original Estimates (WRONG):
- Scene 1: 60 min
- Scene 2: 75 min
- Scene 3: 120 min
- **Total: 4h 15m** (255 minutes)

### Corrected Estimates (REALISTIC):

**Key Facts:**
- 5-minute episodes = 5 pages
- Actors rehearse beforehand (Rehearsal tab)
- Multiple episodes shot per day
- Actors are prepared and know their lines

**Realistic Times:**
| Scene Type | Shoot Time |
|-----------|------------|
| Simple dialogue | 15-30 min |
| Scene with movement/blocking | 30-45 min |
| Complex (multiple actors/action) | 45-90 min |

**Total per episode:** 30 min - 2 hours maximum

---

## Example: "Ghosts and Gut Instinct" Corrected

### OLD Budget (WRONG):
- Scene 1 (Penthouse): $600
- Scene 2 (Chase Center): $400
- Scene 3 (Greenlit AI Loft): $450
- **Total: $1,450** ❌

### NEW Budget (CORRECT):
- Scene 1 (Penthouse - 2 actors, minimal props): **$15-$30**
  - Whiskey tumbler: $8
  - Stock certificate (prop): $10
  - Phone (actor-owned): Free
  - Location (actor's home): Free
  
- Scene 2 (Chase Center - 2 actors, extras): **$50-$100**
  - Knicks gear (actor-owned): Free
  - Location (public arena - filmed during game or exterior): $50-$100
  - Background crowd (if needed as extras): $20-$40 (2-4 extras @ $10-$20)
  
- Scene 3 (Greenlit AI Loft - 4 actors, set dressing): **$30-$80**
  - Whiteboards/markers (cheap): $20
  - Laptops/monitors (actor/crew-owned): Free
  - Table/chairs (location furnished): Free
  - Location (startup office/coworking space): $20-$50 or Free
  - Dossier (printed): $5
  - Tablet (actor-owned): Free

**Corrected Total: $95-$210** ✅

This fits comfortably in the $30-$625/episode range!

---

## Updated AI Prompt Rules

### System Prompt Changes:

**Before:**
```
Total episode budget: $1k-$20k
Simple dialogue scene: $50-$200
Complex scene: $500-$1000
```

**After:**
```
Total SERIES budget: $1k-$20k for ALL 32 episodes
Per episode budget: $30-$625 (ultra-micro-budget)
Simple dialogue scene: $5-$50
Complex scene: $100-$200
ACTORS ARE NOT PAID (revenue share model)
CREW NOT INCLUDED (optional, Budget tab)
```

### Key Additions:

1. **UGC Context:**
   - Format: User-Generated Content
   - Actors: Revenue share (NOT paid)
   - Crew: Optional (added in Budget tab)

2. **Extras Specificity:**
   - Non-Greenlit actors only
   - 0-minimal speaking lines
   - $10-$20/day

3. **Shoot Time Reality:**
   - 5-minute episodes with rehearsed actors
   - Multiple episodes per day
   - Total: 30 min - 2 hours max

4. **Prop Reality:**
   - Most props cheap ($5-$50)
   - Often borrowed or actor-owned (free)
   - No expensive purchases

5. **Location Reality:**
   - Often free (actor's home, public spaces)
   - Sometimes fee ($50-$200 for special locations)
   - No expensive rentals

---

## Budget Tab Integration

**Script Breakdown:**
- Shows **BASE budget** only
- Includes: Extras, props, location fees
- Excludes: Actor pay, crew costs

**Budget Tab:**
- Shows **FULL budget** (base + optional)
- Adds: Crew costs, equipment rental
- User can opt-in to additional expenses

**Flow:**
```
Script Breakdown generates BASE budget ($30-$625)
    ↓
Budget Tab adds OPTIONAL costs
    ↓
    - Camera operator: $100-$300/day
    - Sound person: $100-$200/day
    - Lighting equipment: $50-$200/rental
    - Editor: $200-$500
    ↓
TOTAL budget (base + optional)
```

---

## Cross-Episode Features

### Shooting Schedule & Rehearsal Schedule:

**Requirements:**
- Unlocked after: At least 1 arc completed
- Scope: Cross-episode (shared across all episodes)
- Data: Synced in all episode pre-productions

**Why Cross-Episode:**
- Multiple episodes shot per day
- Schedule combines episodes by location/cast availability
- Rehearsals span multiple episodes

**Implementation:**
- Separate collection/document structure
- Not tied to single episode
- Accessible from any episode's pre-production

---

## Updated Validation

### API Route Budget Checks:

**Before:**
```javascript
if (breakdown.totalBudgetImpact > 20000) {
  console.warn('Budget exceeds $20k target')
} else if (breakdown.totalBudgetImpact < 1000) {
  console.warn('Budget seems too low')
}
```

**After:**
```javascript
if (breakdown.totalBudgetImpact > 625) {
  console.warn('Budget exceeds per-episode range: $' + breakdown.totalBudgetImpact)
  console.warn('(Series budget $1k-$20k ÷ 32 episodes = ~$30-$625/ep)')
} else if (breakdown.totalBudgetImpact < 10) {
  console.warn('Budget seems very low: $' + breakdown.totalBudgetImpact)
} else {
  console.log('✅ Budget within UGC micro-budget range ($10-$625/episode)')
}
```

---

## Next Steps

1. ✅ **Updated prompts** with correct budget ranges
2. ✅ **Updated validation** in API route
3. 🔄 **Test regeneration** with corrected AI
4. 🔄 **Verify new estimates** are realistic
5. 🔄 **Document** final results

---

## Expected Results (Corrected)

For "Ghosts and Gut Instinct" episode:

**Budget:** $95-$210 (vs. $1,450 before) ✅  
**Shoot Time:** 60-90 min (vs. 255 min before) ✅  
**Realism:** HIGH (fits UGC model) ✅

---

**Status:** ✅ **READY TO RE-TEST**


