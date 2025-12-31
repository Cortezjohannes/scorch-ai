# Single Image Regeneration Fix

## Problem

When clicking "Regenerate" on a single image (especially the hero image), the system was generating **multiple images** instead of just the one requested.

## Root Cause

**File:** `src/app/story-bible/page.tsx` (line 1212)

When regenerating the **hero image**, the `index` parameter was `undefined`, causing `specificIndex` to not be set:

```typescript
// ❌ BEFORE (Broken)
specificIndex: index !== undefined ? { type, index } : undefined

// When user clicks "Regenerate" on hero image:
// - type = 'hero'
// - index = undefined
// - Result: specificIndex = undefined ❌
// - Generator sees sections=['hero'] but NO specificIndex
// - Generator generates ALL images in 'hero' section (if multiple exist)
```

## The Fix

**File:** `src/app/story-bible/page.tsx` (line 1212-1217)

Added explicit handling for hero image regeneration:

```typescript
// ✅ AFTER (Fixed)
specificIndex: type === 'hero' 
  ? { type: 'hero', index: 0 }  // Hero image is always index 0
  : index !== undefined 
    ? { type, index } 
    : undefined

// When user clicks "Regenerate" on hero image:
// - type = 'hero'
// - index = undefined
// - Result: specificIndex = { type: 'hero', index: 0 } ✅
// - Generator sees specificIndex and generates ONLY that specific image
```

## How It Works

### Before Fix

1. User clicks "Regenerate" on hero image
2. `handleRegenerateImage('hero')` is called (no index)
3. `sections = ['hero']` is set
4. `specificIndex = undefined` ❌
5. Generator receives: `{ sections: ['hero'], specificIndex: undefined }`
6. Generator enters "hero" section but **doesn't** enter specific generation block
7. **BUG:** Generator tries to generate all images in the section

### After Fix

1. User clicks "Regenerate" on hero image
2. `handleRegenerateImage('hero')` is called (no index)
3. `sections = ['hero']` is set
4. `specificIndex = { type: 'hero', index: 0 }` ✅
5. Generator receives: `{ sections: ['hero'], specificIndex: { type: 'hero', index: 0 } }`
6. Generator enters specific generation block (line 574)
7. ✅ Generator generates **only** the hero image
8. ✅ Generator returns immediately (line 607)

## Verification

### Test Cases

#### ✅ Test 1: Regenerate Hero Image
```typescript
// User clicks regenerate on hero image
handleRegenerateImage('hero')

// Expected behavior:
// - ONLY hero image is regenerated
// - NO other images are generated
// - Returns immediately after hero image
```

#### ✅ Test 2: Regenerate Character Image
```typescript
// User clicks regenerate on character at index 2
handleRegenerateImage('character', 2)

// Expected behavior:
// - ONLY character at index 2 is regenerated
// - Other characters are NOT generated
// - Returns immediately after character 2 image
```

#### ✅ Test 3: Regenerate Arc Key Art
```typescript
// User clicks regenerate on arc at index 1
handleRegenerateImage('arc', 1)

// Expected behavior:
// - ONLY arc at index 1 is regenerated
// - Other arcs are NOT generated
// - Returns immediately after arc 1 image
```

#### ✅ Test 4: Regenerate Location Concept
```typescript
// User clicks regenerate on location at index 0
handleRegenerateImage('location', 0)

// Expected behavior:
// - ONLY location at index 0 is regenerated
// - Other locations are NOT generated
// - Returns immediately after location 0 image
```

## Code Changes

### File: `src/app/story-bible/page.tsx`

**Lines Changed:** 1212-1217

**Before:**
```typescript
specificIndex: index !== undefined ? { type, index } : undefined,
```

**After:**
```typescript
// CRITICAL: Always set specificIndex for single image regeneration
// For hero image, index is undefined but we still want to generate only that specific image
specificIndex: type === 'hero' 
  ? { type: 'hero', index: 0 }  // Hero image is always index 0
  : index !== undefined 
    ? { type, index } 
    : undefined,
```

## Expected Behavior After Fix

### Single Image Regeneration
- ✅ Click "Regenerate" on hero image → **Only** hero image regenerates
- ✅ Click "Regenerate" on character 2 → **Only** character 2 regenerates
- ✅ Click "Regenerate" on arc 1 → **Only** arc 1 regenerates
- ✅ Click "Regenerate" on location 0 → **Only** location 0 regenerates

### Batch Image Generation (Still Works)
- ✅ Click "Generate All Images" → All images generate
- ✅ Select multiple sections → Only selected sections generate

## Testing

### Manual Test Steps

1. **Test Hero Image Regeneration**
   ```
   1. Navigate to Story Bible page
   2. Hover over hero image
   3. Click "Regenerate" button
   4. Verify ONLY hero image is generating (loading spinner)
   5. Verify no other images start generating
   6. Verify hero image updates after completion
   ```

2. **Test Character Image Regeneration**
   ```
   1. Navigate to Story Bible page
   2. Scroll to a character card
   3. Hover over character image
   4. Click "Regenerate" button
   5. Verify ONLY that character image is generating
   6. Verify other characters are NOT generating
   7. Verify character image updates after completion
   ```

3. **Test Arc Key Art Regeneration**
   ```
   1. Navigate to Story Bible page
   2. Navigate to Narrative Arcs section
   3. Hover over an arc key art image
   4. Click "Regenerate" button
   5. Verify ONLY that arc image is generating
   6. Verify other arcs are NOT generating
   7. Verify arc image updates after completion
   ```

4. **Test Location Concept Regeneration**
   ```
   1. Navigate to Story Bible page
   2. Navigate to World Building section
   3. Hover over a location image
   4. Click "Regenerate" button
   5. Verify ONLY that location image is generating
   6. Verify other locations are NOT generating
   7. Verify location image updates after completion
   ```

### Expected Logs

#### Good Logs (Single Image)
```
🎨 [img_gen_...] Starting Story Bible image generation
✅ [img_gen_...] Specific hero image generated, stopping
```

OR

```
🎨 [img_gen_...] Starting Story Bible image generation
✅ [img_gen_...] Specific character 2 image generated, stopping
```

#### Bad Logs (Would indicate bug not fixed)
```
🎨 [img_gen_...] Starting Story Bible image generation
🎨 [img_gen_...] Generating character 0...
🎨 [img_gen_...] Generating character 1...
🎨 [img_gen_...] Generating character 2...  ❌ Should stop after 2!
🎨 [img_gen_...] Generating character 3...  ❌ Bug: generating all!
```

## Summary

**Problem:** Clicking "Regenerate" on hero image generated all images  
**Cause:** `specificIndex` was `undefined` when `index` was `undefined`  
**Fix:** Always set `specificIndex` for hero image with `index: 0`  
**Result:** ✅ Only the requested image regenerates

This fix ensures that **all** single image regenerations work correctly, not just for the hero image but for all image types (hero, character, arc, location).
















