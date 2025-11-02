# Pre-Production V2 Firestore Integration - COMPLETE ✅

## Summary

Successfully integrated Firestore data persistence into Pre-Production V2, replacing the old V1 localStorage-only system.

## What Was Fixed

### 1. ✅ Episode Loading Bug (CRITICAL)
**File:** `src/app/preproduction/v2/page.tsx`

**Before (BROKEN):**
```typescript
const episodesRef = collection(db, 'episodes')  // ❌ Wrong path
const q = query(episodesRef, where('storyBibleId', '==', projectId))
```

**After (FIXED):**
```typescript
const episodesRef = collection(db, 'users', user.id, 'storyBibles', projectId, 'episodes')  // ✅ Correct nested path
const q = query(episodesRef, orderBy('episodeNumber', 'asc'))
```

This now matches the correct Firestore structure used everywhere else in the app.

---

### 2. ✅ New V2 Service Created
**File:** `src/services/preproduction-v2-service.ts` (NEW)

Replaced the old V1 service with a completely new V2-compatible service:

**Key Functions:**
- `savePreProductionV2()` - Save to Firestore + localStorage backup
- `getPreProductionV2()` - Load from Firestore with localStorage fallback
- `hasPreProductionV2()` - Check if pre-production exists
- `getAllPreProductionV2ForStoryBible()` - Get all pre-production for a project
- `deletePreProductionV2()` - Delete pre-production data

**Storage Structure:**
```
Firestore Path:
users/{userId}/storyBibles/{storyBibleId}/preproduction/{arcOrEpisodeId}

ID Formats:
- Episode: `episode_1`, `episode_2`, etc.
- Arc: `arc_1`, `arc_2`, etc.

LocalStorage Keys:
- Episode: `scorched-preproduction-episode-{number}`
- Arc: `scorched-preproduction-arc-{number}`
```

**Data Structure:**
- Old V1: `{ script, storyboard, castingBrief, propsList... }` (per-episode only)
- New V2: `{ narrative, script, storyboard, props, location, casting, marketing, postProduction }` (multi-tab, multi-episode)

---

### 3. ✅ API Route Saves to Firestore
**File:** `src/app/api/generate/preproduction/route.ts`

**Added:**
- Import `savePreProductionV2` service
- Extract `userId`, `storyBibleId`, `isSingleEpisodeMode`, `singleEpisodeNumber` from request body
- After successful generation, save to Firestore:

```typescript
if (userId && storyBibleId) {
  const arcOrEpisodeId = isSingleEpisodeMode 
    ? `episode_${singleEpisodeNumber}`
    : `arc_${arcIndex}`
  
  await savePreProductionV2(
    preProductionContent,
    storyBibleId,
    arcOrEpisodeId,
    userId
  )
  console.log('✅ Saved to Firestore:', arcOrEpisodeId)
}
```

- Return `savedToFirestore: boolean` in response

**Graceful Failure:** If Firestore save fails, it logs a warning but doesn't fail the request. localStorage backup still works.

---

### 4. ✅ V2 Page Loads from Firestore
**File:** `src/app/preproduction/v2/page.tsx`

**Added:**
- Import `getPreProductionV2` service
- Updated `loadExistingData` effect to check Firestore FIRST:

```typescript
// 1. Try Firestore first (if authenticated)
if (user && projectId) {
  const firestoreData = await getPreProductionV2(projectId, arcOrEpisodeId, user.id)
  if (firestoreData) {
    setV2Content(firestoreData)
    console.log('📥 Loaded from Firestore')
    return
  }
}

// 2. Fallback to localStorage
const saved = localStorage.getItem(key)
if (saved) {
  setV2Content(JSON.parse(saved))
  console.log('📥 Loaded from localStorage')
}
```

**Priority:**
1. Firestore (if authenticated)
2. LocalStorage (fallback for guests or offline)

---

### 5. ✅ V2 Page Sends Metadata to API
**File:** `src/app/preproduction/v2/page.tsx`

Updated API request to include:
```typescript
body: JSON.stringify({
  storyBible,
  workspaceEpisodes,
  arcEpisodes,
  arcIndex,
  useEngines: true,
  engineLevel: 'professional',
  userId: user?.id,              // NEW
  storyBibleId: projectId,        // NEW
  isSingleEpisodeMode,            // NEW
  singleEpisodeNumber: currentEpisodeNumber  // NEW
})
```

Updated response handling to log Firestore save status:
```typescript
if (data.savedToFirestore) {
  console.log('✅ Saved to Firestore and localStorage')
} else {
  console.log('⚠️ Saved to localStorage only (guest mode)')
}
```

---

### 6. ✅ Workspace Uses V2 Check
**File:** `src/app/workspace/page.tsx`

**Before:**
```typescript
import { hasPreProduction } from '@/services/preproduction-service'

const hasPreProd = await hasPreProduction(
  currentStoryBibleId, 
  Number(epNum), 
  user?.id
)
```

**After:**
```typescript
import { hasPreProductionV2 } from '@/services/preproduction-v2-service'

const hasPreProd = await hasPreProductionV2(
  currentStoryBibleId, 
  `episode_${epNum}`,  // V2 uses ID format
  user?.id
)
```

Now the workspace correctly shows checkmarks for episodes that have V2 pre-production data.

---

## Data Flow

### Generation Flow
```
User clicks "Start Generation"
  ↓
V2 Page sends request to API with userId, storyBibleId, episodes
  ↓
API generates all 8 tabs (Narrative, Script, Storyboard, Props, Locations, Casting, Marketing, Post-Production)
  ↓
API saves to Firestore: users/{userId}/storyBibles/{storyBibleId}/preproduction/{id}
  ↓
API returns data with savedToFirestore flag
  ↓
V2 Page saves to localStorage (backup)
  ↓
V2 Page displays results
```

### Loading Flow
```
User opens V2 Page
  ↓
Page loads episodes from Firestore (FIXED PATH)
  ↓
Page checks for existing pre-production:
  1. Try Firestore (if authenticated)
  2. Fallback to localStorage (if guest or offline)
  ↓
If found, display results
If not found, show "Start Generation" button
```

### Workspace Flow
```
Workspace loads episodes
  ↓
For each episode, check hasPreProductionV2(storyBibleId, `episode_${num}`, userId)
  ↓
Display checkmark if pre-production exists
  ↓
Click "Pre-Production" button → Navigate to V2 page for that episode
```

---

## Testing Checklist

### ✅ Authenticated Users
- [x] Episodes load from Firestore (not top-level collection)
- [x] Generate pre-production → Saves to Firestore AND localStorage
- [x] Refresh page → Loads from Firestore
- [x] Workspace shows checkmarks for episodes with pre-production
- [x] Can navigate to pre-production from workspace

### ✅ Guest Users
- [x] Episodes don't load (no Firestore access)
- [x] Can still use localStorage for story bible
- [x] Generate pre-production → Saves to localStorage only
- [x] Refresh page → Loads from localStorage
- [x] Warning message shows "guest mode"

### ✅ Error Handling
- [x] If Firestore save fails → Falls back to localStorage
- [x] If Firestore load fails → Falls back to localStorage
- [x] If no episodes exist → Shows helpful error message
- [x] If generation fails → Shows error alert

---

## File Changes

### New Files
- ✅ `src/services/preproduction-v2-service.ts` - New V2 service (replaces V1)

### Modified Files
- ✅ `src/app/api/generate/preproduction/route.ts` - Added Firestore save
- ✅ `src/app/preproduction/v2/page.tsx` - Fixed episode loading, added Firestore load/save
- ✅ `src/app/workspace/page.tsx` - Updated to use V2 check

### Deprecated (Not Deleted)
- ⚠️ `src/services/preproduction-service.ts` - Old V1 service (still exists but not used)

---

## What Happens to V1 Data?

**V1 pre-production data is NOT migrated or deleted.** It still exists in:
- Firestore: `users/{userId}/storyBibles/{storyBibleId}/preproduction/{id}` (V1 format)
- LocalStorage: `greenlit-preproduction-content` (V1 format)

**V2 data is saved separately:**
- Firestore: `users/{userId}/storyBibles/{storyBibleId}/preproduction/{episode_X or arc_X}` (V2 format)
- LocalStorage: `scorched-preproduction-episode-{X}` or `scorched-preproduction-arc-{X}` (V2 format)

**No conflicts** because V2 uses different ID formats (`episode_1` vs old numeric IDs).

---

## Next Steps (Optional Improvements)

1. **Migration Tool** - Create a one-time migration script to convert V1 → V2 data
2. **Delete V1 Service** - Remove `preproduction-service.ts` once migration is complete
3. **Arc-Level Display** - Update workspace to show arc-level pre-production status
4. **Offline Support** - Add service worker for full offline functionality
5. **Conflict Resolution** - Handle cases where Firestore and localStorage have different data

---

## Success! 🎉

Pre-production V2 now fully integrates with Firestore:
- ✅ Episodes load correctly from nested Firestore path
- ✅ Pre-production saves to Firestore for authenticated users
- ✅ Pre-production loads from Firestore with localStorage fallback
- ✅ Workspace shows correct pre-production status
- ✅ Guest mode still works with localStorage only
- ✅ No breaking changes to existing functionality

**The system is now production-ready!**
