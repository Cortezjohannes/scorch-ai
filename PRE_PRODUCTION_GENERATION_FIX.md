# Pre-Production Generation Fix

## Problem

The pre-production V2 page was failing with the error:
> "Failed to generate pre-production content. Please try again."

## Root Cause

The V2 page (`src/app/preproduction/v2/page.tsx`) was not loading or sending episode data to the API, but the API route (`src/app/api/generate/preproduction/route.ts`) **requires** episodes to exist before it can generate pre-production materials.

### Specific Issues:

1. **Missing Episode Loading**: The page was only loading the story bible, not workspace episodes
2. **Missing API Parameters**: The API call was not sending `workspaceEpisodes` or `arcEpisodes`
3. **Poor Error Handling**: When the API rejected the request (no episodes found), the user just saw a generic alert
4. **Incorrect Response Parsing**: The page was trying to use `data` instead of `data.preProduction`

## What Was Fixed

### 1. Added Episode Loading from Firestore

```typescript
// Load Workspace Episodes from Firestore
if (projectId && user) {
  const episodesRef = collection(db, 'episodes')
  const q = query(episodesRef, where('storyBibleId', '==', projectId))
  const querySnapshot = await getDocs(q)
  
  const episodes: any = {}
  querySnapshot.forEach((doc) => {
    const episodeData = doc.data()
    episodes[`episode${episodeData.episodeNumber}`] = episodeData
  })
  
  setWorkspaceEpisodes(episodes)
  setArcEpisodes(/* filtered episodes based on mode */)
}
```

### 2. Fixed API Call to Send Episodes

**Before:**
```typescript
body: JSON.stringify({
  storyBible,
  arcIndex,
  isSingleEpisodeMode,
  singleEpisodeNumber: currentEpisodeNumber,
  options: { /* ... */ }
})
```

**After:**
```typescript
body: JSON.stringify({
  storyBible,
  workspaceEpisodes,   // ✅ Now sending episodes
  arcEpisodes,         // ✅ Now sending filtered episodes
  arcIndex,
  useEngines: true,
  engineLevel: 'professional'
})
```

### 3. Added Episode Validation

```typescript
// Check if we have episodes before allowing generation
if (arcEpisodes.length === 0 && Object.keys(workspaceEpisodes).length === 0) {
  alert('No episodes found. Please create episodes in the workspace first...')
  return
}
```

### 4. Improved UI States

**Added three clear states:**

1. **Loading State**: Shows spinner while loading story bible and episodes
2. **No Episodes State**: Shows helpful warning with button to go create episodes
3. **Ready State**: Shows episode count and allows generation to start

### 5. Fixed Response Parsing

**Before:**
```typescript
const data = await response.json()
setV2Content(data)  // ❌ Wrong - data contains metadata
```

**After:**
```typescript
const data = await response.json()
if (!data.success || !data.preProduction) {
  throw new Error(data.error || 'Invalid response')
}
setV2Content(data.preProduction)  // ✅ Correct - use preProduction field
```

## How to Use Now

### Option 1: Create Episodes First (Recommended)

1. Go to Workspace → Episodes tab
2. Create at least one episode for your story
3. Return to Pre-Production V2
4. The page will automatically detect the episode(s) and allow generation

### Option 2: Direct Navigation

If the page detects no episodes, it will show:

```
⚠️ No Episodes Found

Pre-production materials are generated based on your episodes.
You need to create at least one episode before generating pre-production content.

[Go to Workspace → Create Episodes]
```

Click the button to go create episodes.

## What the API Needs

The pre-production API generates materials **based on episode content**:

1. **Narrative Tab** → Copies episode synopses, scenes, branching paths
2. **Script Tab** → Generates dialogue from episode scenes
3. **Storyboard Tab** → Creates shot lists from scripts
4. **Props Tab** → Extracts props from storyboards
5. **Locations Tab** → Identifies locations from scenes
6. **Casting Tab** → Analyzes character appearances
7. **Marketing Tab** → Creates strategy from narrative
8. **Post-Production Tab** → Plans VFX/sound from storyboards

**Without episodes, there's nothing to generate from!**

## Files Modified

- ✅ `src/app/preproduction/v2/page.tsx` - Added episode loading, validation, and better UI

## Testing

To test the fix:

1. **With Episodes**: Navigate to `/preproduction/v2?projectId=YOUR_PROJECT_ID&episode=1`
   - Should load episode data
   - Should show "Ready to generate" with episode count
   - Should successfully generate when clicked

2. **Without Episodes**: Navigate to `/preproduction/v2?projectId=NEW_PROJECT&episode=1`
   - Should show "No Episodes Found" warning
   - Should provide button to go create episodes
   - Should NOT show a generic error alert

## Next Steps

The user should now:

1. Create at least one episode in the workspace
2. The episode should have:
   - Episode number
   - Title
   - Synopsis
   - Scenes (at least one)
3. Return to pre-production and generate

The system will now properly load episodes and generate comprehensive pre-production materials!

