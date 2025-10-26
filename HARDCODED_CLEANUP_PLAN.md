# 🧹 Comprehensive Hardcoded Limits Cleanup Plan

## 🎯 Mission: Make EVERYTHING AI-Determined

### Category 1: Story Structure (CRITICAL)

#### ❌ Hardcoded Arc Counts
**Location:** `master-conductor.ts` lines 188-210 (fallback code)
```typescript
const arcCount = characterComplexity > 8 ? 5 : 
                characterComplexity > 5 ? 4 : 3
```
**Status:** ⚠️ Used as fallback when AI generation fails  
**Action:** Make fallback more intelligent or remove entirely

#### ❌ Hardcoded Episode Counts  
**Location:** `master-conductor.ts` lines 194-195
```typescript
const totalEpisodes = characterComplexity > 8 ? 60 :
                     characterComplexity > 5 ? 40 : 30
```
**Status:** ⚠️ Fallback using fixed 60/40/30 episodes  
**Action:** Use AI to determine even in fallback

#### ❌ Hardcoded Arc Titles
**Location:** `master-conductor.ts` line 204
```typescript
const arcTitles = ['Foundation', 'Development', 'Complication', 'Crisis', 'Resolution']
```
**Status:** ⚠️ Generic titles instead of story-specific  
**Action:** Let AI generate titles based on story

---

### Category 2: Character Generation (CRITICAL)

#### ❌ Fixed Character Roles Pattern
**Location:** `master-conductor.ts` lines 252-300
```typescript
const protagonist = await...
const antagonist = await...
const mentor = await...
const ally = await...
const foil = await...
// Always generates same 8-10 roles
```
**Status:** 🚨 **RUNNING ALONGSIDE V2** - Creating duplicates  
**Action:** **DELETE** this entire section (V2 handles it)

---

### Category 3: UI Fallbacks

#### ⚠️ Episode Count Fallbacks
**Locations:**
- `workspace/page.tsx` line 405: `|| 60`
- `workspace/page.tsx` line 85: `|| 10`
- `episode/[id]/page.tsx` line 1117: `|| 10`

**Issue:** When episodes aren't defined, defaults to 10 per arc or 60 total

**Action:** 
- Change to dynamic calculation
- Use actual arc data or prompt user

#### ⚠️ Scene Count Assumptions
**Location:** `PreProductionV2LoadingScreen.tsx` line 132
```typescript
const totalScenes = arcEpisodes.reduce((total, ep) => total + (ep.scenes?.length || 3), 0)
```
**Issue:** Assumes 3 scenes per episode as fallback

**Action:** 
- Episodes should define their scene count
- No hardcoded fallback

---

### Category 4: API Routes

#### ❌ Story Bible Generation Fallback
**Location:** `api/generate/story-bible/route.ts` line 1073
```typescript
episodes: Array.from({length: 8}, (_, j) => ({
```
**Issue:** Creates exactly 8 episodes in fallback

**Action:** Calculate dynamically based on story needs

#### ✅ Narrative Arc Count
**Location:** `api/generate/story-bible/route.ts` line 776
```typescript
const optimalArcCount = parseInt(arcCountResponse) || 4
```
**Status:** ✅ AI-driven with sensible fallback

---

### Category 5: Engine Defaults

#### ⚠️ Fractal Narrative Engine
**Location:** `fractal-narrative-engine.ts` line 220
```typescript
arcCount: number = 4,
```
**Issue:** Default parameter of 4 arcs

**Action:** No default, require explicit input

#### ⚠️ Episode Structure Detection  
**Location:** `fractal-narrative-engine.ts` line 1507
```typescript
if (episodeCount >= 15) return 'five-act';
```
**Issue:** Assumes structure based on fixed numbers

**Action:** Let AI determine structure type

---

## 🚀 Implementation Plan

### Phase 1: Remove Duplicate Character Generation (30 min)
1. Delete lines 252-300 in `master-conductor.ts`
2. Verify Character Engine V2 is sole generator
3. Test with multiple story types

### Phase 2: Dynamic Fallbacks (1 hour)
1. Replace hardcoded arc/episode counts in fallbacks
2. Add AI determination even in error cases
3. Update UI fallbacks to calculate dynamically

### Phase 3: Remove Fixed Numbers (1 hour)
1. Remove `|| 10` and `|| 60` fallbacks from UI
2. Make story bible always include structure data
3. Add validation instead of assumptions

### Phase 4: Arc Title Generation (30 min)
1. Replace ['Foundation', 'Development'...] with AI generation
2. Make titles story-specific
3. Add to dynamic structure method

### Phase 5: Scene Count Intelligence (30 min)
1. Remove `|| 3` scene assumptions
2. Make episodes define their scene structure
3. Add AI scene planning

---

## Expected Results

### Before:
- Every story: 4 arcs
- Every story: 60 episodes (or 40, or 30)
- Every story: protagonist, antagonist, mentor, ally...
- Every episode: assumed 3 scenes
- Every arc: Foundation, Development, Crisis...

### After:
- Intimate drama: 3 arcs, 24 episodes, 6 characters
- Epic saga: 7 arcs, 100 episodes, 20 characters  
- Detective story: 5 arcs, 45 episodes, 11 characters
- Scenes per episode: varies 2-6 based on pacing
- Arc titles: specific to the story

---

## Priority Order

### 🔥 **DO NOW** (Breaking Issues):
1. ✅ Remove duplicate character generation (lines 252-300)
2. ✅ Fix character count to be fully AI-driven

### ⚡ **DO SOON** (Quality Issues):
3. Make fallbacks intelligent (not hardcoded 60)
4. Remove arc title hardcoding
5. Dynamic scene counts

### 📊 **DO LATER** (Polish):
6. Remove all `|| 10` UI fallbacks
7. Validation instead of assumptions
8. Better error messages

---

## Files to Modify

### Critical:
- ✅ `src/services/master-conductor.ts` (character duplication, fallback limits)
- ✅ `src/services/character-drafting-service.ts` (already fixed!)

### Important:
- `src/app/workspace/page.tsx` (UI fallbacks)
- `src/app/episode/[id]/page.tsx` (UI fallbacks)
- `src/components/PreProductionV2LoadingScreen.tsx` (scene assumptions)

### Nice to Have:
- `src/services/fractal-narrative-engine.ts` (default parameters)
- `src/app/api/generate/story-bible/route.ts` (fallback episode count)

---

## Testing Checklist

After cleanup, test:
- [ ] Simple family drama (should be ~6 characters, 3 arcs, 24 episodes)
- [ ] Epic fantasy (should be ~15 characters, 6 arcs, 80+ episodes)
- [ ] Detective series (should be ~11 characters, 5 arcs, 50 episodes)
- [ ] Teen drama (should be ~8 characters, 4 arcs, 32 episodes)

Each should have:
- ✅ Different character counts
- ✅ Different arc counts  
- ✅ Different episode counts
- ✅ Story-specific arc titles
- ✅ Varied scenes per episode

---

## Status

**Characters:** ✅ AI-driven (V2 working)  
**Arcs:** ⚠️ AI-driven but hardcoded fallback  
**Episodes:** ⚠️ AI-driven but hardcoded fallback  
**Arc Titles:** ❌ Hardcoded generic  
**Scenes:** ❌ Assumptions in UI

**Overall:** 60% AI-driven, 40% still has hardcoded logic

**Goal:** 100% AI-driven with intelligent fallbacks only










