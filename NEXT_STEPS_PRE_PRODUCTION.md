# Pre-Production System - Next Steps

**Date:** October 30, 2025  
**Current Status:** Script Breakdown AI Generation ✅ COMPLETE

---

## Completed ✅

1. **Scripts Tab** - Hollywood-grade screenplay generation
2. **Script Breakdown Tab** - Ultra-micro-budget UGC breakdowns ($30-$625/episode)

---

## Immediate Next Steps

### 1. Budget Tab Enhancements

**Current State:**
- Basic budget tracking UI exists
- No AI generation yet

**Required Changes:**

**a) Budget Display Logic:**
- Show **BASE budget** from Script Breakdown (extras, props, locations)
- Show **OPTIONAL costs** (crew, equipment - user can add/remove)
- Show **TOTAL budget** (base + optional)

**b) Budget Categories:**

**BASE Budget (from Script Breakdown):**
- Extras: $10-$20/day
- Props: $5-$50 per item
- Locations: $0-$200 per location
- **Subtotal:** Auto-populated from breakdown

**OPTIONAL Budget (user adds in Budget tab):**
- Camera operator: $100-$300/day
- Sound person: $100-$200/day
- Lighting equipment: $50-$200/rental
- Editor: $200-$500
- Other crew/equipment
- **Subtotal:** User-controlled

**TOTAL Budget:**
- Base + Optional
- Color-coded by range:
  - Green: Under $300/episode
  - Yellow: $300-$500/episode
  - Red: Over $500/episode (approaching max $625/episode)

**c) Budget Tab UI:**
```
┌─────────────────────────────────────────────┐
│ Base Budget (from Script Breakdown)        │
│  • Extras: $30                              │
│  • Props: $45                               │
│  • Locations: $90                           │
│  • BASE TOTAL: $165                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Optional Costs (editable)                   │
│  [+] Add Crew Member                        │
│  [+] Add Equipment Rental                   │
│  • Camera Operator: $200                    │
│  • Sound Person: $150                       │
│  • OPTIONAL TOTAL: $350                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ TOTAL EPISODE BUDGET: $515                  │
│ (within $30-$625 range) ✅                  │
└─────────────────────────────────────────────┘
```

**Implementation:**
- Read `scriptBreakdown.totalBudgetImpact` for base budget
- Calculate base breakdown from `scriptBreakdown.scenes[].budgetImpact`
- User adds optional line items
- Real-time total calculation

---

### 2. Cross-Episode Features

**User Requirements:**
- **Shooting Schedule** and **Rehearsal Schedule** are **cross-episode**
- Unlocked after **at least 1 arc is completed**
- Data is **synced across all episode pre-productions**

**Why Cross-Episode:**
- Multiple episodes shot per day (batch shooting by location/cast)
- Rehearsals span multiple episodes
- Schedule combines episodes efficiently

**Implementation Strategy:**

**a) Data Structure:**
```
users/{userId}/storyBibles/{storyBibleId}/
  ├─ shootingSchedule/  (NEW - cross-episode)
  │   └─ shootDays/
  │       ├─ day1: { date, location, episodes: [1, 3, 5], scenes: [...] }
  │       ├─ day2: { date, location, episodes: [2, 4], scenes: [...] }
  │
  ├─ rehearsalSchedule/  (NEW - cross-episode)
  │   └─ sessions/
  │       ├─ session1: { date, location, episodes: [1, 2, 3], scenes: [...], actors: [...] }
  │
  └─ preproduction/  (existing - per episode)
      ├─ {episodeId1}/
      ├─ {episodeId2}/
```

**b) UI Changes:**

**Shooting Schedule Tab:**
```
┌─────────────────────────────────────────────┐
│ 🔒 Shooting Schedule (Unlocked after Arc 1) │
│                                             │
│ Cross-Episode Schedule                      │
│ Combines all episodes for efficient         │
│ shooting by location and cast availability  │
└─────────────────────────────────────────────┘

When unlocked:
┌─────────────────────────────────────────────┐
│ Shoot Day 1: Monday, Nov 4                  │
│ Location: Jason's Penthouse                 │
│ Episodes: 1, 3, 5                           │
│ Scenes: E1-S1, E3-S2, E5-S1                 │
│ Cast: Jason (all day)                       │
└─────────────────────────────────────────────┘
```

**Rehearsal Schedule Tab:**
```
┌─────────────────────────────────────────────┐
│ 🔒 Rehearsal Schedule (Unlocked after Arc 1)│
│                                             │
│ Cross-Episode Rehearsal Planning            │
│ Practice multiple episodes together         │
└─────────────────────────────────────────────┘

When unlocked:
┌─────────────────────────────────────────────┐
│ Rehearsal Session 1: Saturday, Nov 2        │
│ Location: Community Center                  │
│ Episodes: 1, 2, 3                           │
│ Scenes: Dialogue-heavy scenes               │
│ Actors: Jason, Marco, Anya                  │
│ Duration: 3 hours                           │
└─────────────────────────────────────────────┘
```

**c) Unlock Logic:**
```typescript
// Check if any arc is completed
const isArcCompleted = storyBible.arcs.some(arc => arc.status === 'completed')

// Show locked state if not unlocked
if (!isArcCompleted) {
  return (
    <div className="locked-state">
      <div className="lock-icon">🔒</div>
      <h3>Shooting Schedule Locked</h3>
      <p>Complete at least one arc to unlock cross-episode scheduling</p>
      <div className="progress">
        <p>Arcs completed: {completedArcs.length}/{totalArcs}</p>
      </div>
    </div>
  )
}
```

**d) Sync Logic:**
- All episodes read from same shooting/rehearsal schedule
- Changes in one episode reflect in all
- Firestore real-time listeners for cross-episode sync

---

### 3. Remaining Tab AI Generations

**Priority Order:**

1. **Budget Tab** (next - builds on Script Breakdown)
2. **Locations Tab** (extract from script + breakdown)
3. **Props/Wardrobe Tab** (extract from breakdown)
4. **Equipment Tab** (based on scene requirements)
5. **Casting Tab** (extract characters from script)
6. **Storyboards Tab** (visual planning from script)

**AI Generation Strategy:**
- Use same pattern as Scripts & Script Breakdown
- Client-side data fetch → API route → AI generator service → return to client → Firestore save
- Gemini 2.5 Pro for all analytical tasks
- Temperature: 0.6-0.8 depending on creativity needs

---

## Technical Debt & Improvements

### 1. Export Functionality
- **Current:** Basic CSV export in breakdown
- **Needed:** PDF export, call sheets, printable schedules
- **Priority:** Medium (after AI generation complete)

### 2. Production & Post-Production Roadmap
- **Current:** Pre-production only
- **Needed:** Design Production and Post-Production phases
- **Priority:** Low (future phase)

---

## Timeline Estimate

**Budget Tab (BASE + OPTIONAL):**
- Time: 2-3 hours
- Complexity: Low (UI logic, no AI)

**Cross-Episode Features (Shooting & Rehearsal):**
- Time: 4-6 hours
- Complexity: Medium (new data structure, unlock logic, sync)

**Remaining AI Generations (5 tabs):**
- Time: 8-12 hours (2-3 hours per tab)
- Complexity: Medium (similar to Script Breakdown)

**Total Remaining:** ~15-20 hours

---

## Success Criteria

**Budget Tab:**
- [x] Show base budget from Script Breakdown
- [x] Allow adding optional crew/equipment costs
- [x] Calculate and display total budget
- [x] Color-code by budget range
- [x] Real-time updates

**Cross-Episode Features:**
- [x] Locked until arc completed
- [x] Separate Firestore collection
- [x] Accessible from all episode pre-productions
- [x] Real-time sync across episodes
- [x] Efficient batch scheduling UI

**AI Generations:**
- [x] Generate in <30 seconds
- [x] Extract from episode/script only (no invention)
- [x] Realistic UGC-appropriate output
- [x] Save to Firestore
- [x] Regenerate capability

---

**Next Actions:**
1. Implement Budget Tab BASE + OPTIONAL display
2. Design cross-episode data structure
3. Implement unlock logic for Shooting/Rehearsal schedules
4. Continue AI generation for remaining tabs

---

**Status:** Ready to proceed with Budget Tab and cross-episode features


