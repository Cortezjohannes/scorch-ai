# Episode Page Loading Fix - Implementation Plan

## Problem Summary

The episode view page (`src/app/episode/[id]/page.tsx`) has a race condition where:
1. Validation runs before auth loads → sets error
2. Auth loads → validation re-runs → clears error  
3. But component still shows error screen because loading state not managed properly

## Root Cause

**Dual Loading System**: Two separate useEffect hooks (`loadData` and `loadEpisode`) with complex dependencies create race conditions:

```typescript
// Effect 1: loadData - runs on auth changes
useEffect(() => {
  loadData() // Validates, may set error
}, [router, episodeId, searchParams, user, authLoading])

// Effect 2: loadEpisode - runs when validation passes
useEffect(() => {
  if (!storyBible || !previousEpisodesExist || generating) return
  loadEpisode() // Loads actual episode
}, [storyBible, episodeId, previousEpisodesExist, ...])
```

**The Issue**: When validation passes (`previousEpisodesExist` becomes `true`), it doesn't guarantee `loadEpisode` will run because:
- `storyBible` might not be loaded yet
- `generating` might be true
- `episodeData` might already exist from previous render

## Solution

### Option A: Fix The Validation Logic (QUICK FIX)

Keep the existing structure but fix the race condition by ensuring `loadEpisode` triggers after validation passes.

**Changes**:
1. After validation succeeds, explicitly trigger episode loading
2. Set loading state properly
3. Ensure error is cleared AND episode loads

**File**: `src/app/episode/[id]/page.tsx` lines 750-788

**Implementation**:
```typescript
// For authenticated users, check Firestore
if (user && storyBibleId) {
  const { getEpisode } = await import('@/services/episode-service')
  const prevEpisode = await getEpisode(storyBibleId, episodeId - 1, user.id)
  previousEpisodeExists = !!prevEpisode
  console.log(`Firestore check: Episode ${episodeId - 1} exists:`, previousEpisodeExists)
  
  // Clear any previous errors if episode found
  if (previousEpisodeExists) {
    setError(null)
    setPreviousEpisodesExist(true)
    
    // NEW: Explicitly trigger episode load
    // Force the loadEpisode effect to run by ensuring episodeData is clear
    if (episodeData && episodeData.episodeNumber !== episodeId) {
      setEpisodeData(null) // Clear stale data
    }
  }
}
```

**Pros**: Minimal changes, quick to implement
**Cons**: Still has complex dual-effect system

---

### Option B: Simplify To Single Loading Flow (RECOMMENDED)

Merge both effects into a single, linear loading flow.

**Changes**:
1. Remove separate `loadEpisode` useEffect
2. Combine all loading logic into `loadData`
3. Make validation part of the loading flow, not a separate step

**File**: `src/app/episode/[id]/page.tsx`

**Implementation Structure**:
```typescript
useEffect(() => {
  async function loadPageData() {
    // Prevent duplicate loads
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    
    try {
      setLoading(true)
      setError(null)
      
      // Step 1: Wait for auth if needed
      if (episodeId > 1 && authLoading) {
        console.log('⏳ Waiting for auth...')
        setLoading(false)
        return
      }
      
      // Step 2: Load story bible (existing code)
      await loadStoryBible()
      
      // Step 3: Validate previous episode (if Episode 2+)
      if (episodeId > 1) {
        const prevExists = await validatePreviousEpisode()
        if (!prevExists) {
          setPreviousEpisodesExist(false)
          setError('Episodes must be generated in order')
          setLoading(false)
          return
        }
      }
      
      // Step 4: Load current episode (merged from loadEpisode)
      await loadCurrentEpisode()
      
      setLoading(false)
    } catch (error) {
      console.error('Load error:', error)
      setError(error.message)
      setLoading(false)
    } finally {
      isLoadingRef.current = false
    }
  }
  
  loadPageData()
}, [episodeId, storyBibleId, user, authLoading])
```

**Pros**: Clean, linear, easy to debug
**Cons**: Larger refactor, need to test thoroughly

---

## Recommended Approach

**Use Option A** (Quick Fix) first to unblock the user immediately, then **refactor to Option B** later for long-term maintainability.

## Implementation Steps - Option A (IMMEDIATE)

### Step 1: Fix Line 757-760
```typescript
// Current:
if (previousEpisodeExists) {
  setError(null)
  setPreviousEpisodesExist(true)
}

// Change to:
if (previousEpisodeExists) {
  console.log('✅ Previous episode found, clearing error and preparing to load')
  setError(null)
  setPreviousEpisodesExist(true)
  setLoading(true) // Ensure loading state is set
  
  // Clear stale episode data to force reload
  if (episodeData?.episodeNumber !== episodeId) {
    setEpisodeData(null)
  }
}
```

### Step 2: Add Safety Check in loadEpisode Effect (Line 813)
```typescript
// Current:
if (!storyBible || !previousEpisodesExist || generating) return

// Change to:
if (!storyBible || !previousEpisodesExist || generating) {
  console.log('⏸️ loadEpisode blocked:', { 
    hasStoryBible: !!storyBible, 
    previousEpisodesExist, 
    generating 
  })
  return
}
console.log('▶️ loadEpisode running')
```

### Step 3: Improve Error Display Logic (Line 1297-1314)
```typescript
// Current:
if (!previousEpisodesExist && episodeId > 1) {
  return <ErrorScreen />
}

// Change to:
if (!previousEpisodesExist && episodeId > 1 && !authLoading) {
  // Only show error after auth has loaded
  return <ErrorScreen />
}
```

### Step 4: Add Debug Logging
Add at line 659 (start of loadData):
```typescript
console.log('🔄 loadData running:', {
  episodeId,
  storyBibleId,
  hasUser: !!user,
  authLoading,
  previousEpisodesExist,
  hasEpisodeData: !!episodeData
})
```

## Testing Checklist After Fix

- [ ] Fresh load of Episode 2 URL (authenticated)
- [ ] Click "View Episode 2" from workspace  
- [ ] Browser refresh on Episode 2
- [ ] Browser back button
- [ ] Load Episode 2 while auth is loading
- [ ] Load Episode 3 (should check Episode 2)
- [ ] Try Episode 2 without Episode 1 (should show error)
- [ ] Check console logs for proper flow

## Expected Console Output After Fix

```
🔄 loadData running: { episodeId: 2, hasUser: false, authLoading: true }
⏳ Auth still loading, waiting...
🔄 loadData running: { episodeId: 2, hasUser: true, authLoading: false }
✅ Story bible loaded from Firestore
Firestore check: Episode 1 exists: true
✅ Previous episode found, clearing error and preparing to load
▶️ loadEpisode running
Loading Episode 2 from Firestore...
✅ Loaded Episode 2 from Firestore
```

## Files To Modify

1. `src/app/episode/[id]/page.tsx` (primary)
2. `TEST_RESULTS.md` (update with results)

## Estimated Time

- Implementation: 15 minutes
- Testing: 15 minutes
- Documentation: 5 minutes
- **Total: 35 minutes**

## Success Criteria

✅ Episode 2 loads successfully from workspace navigation
✅ No error screen flash during loading
✅ Console logs show clear loading progression
✅ Error screen only shows when intentional (missing prev episode)
✅ Loading state properly managed throughout

