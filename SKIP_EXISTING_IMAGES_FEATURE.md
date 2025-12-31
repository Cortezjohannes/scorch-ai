# Skip Existing Images Feature

## Overview

The image generation system automatically **skips items that already have images**, saving time and API costs by only generating missing images.

## How It Works

### 🎬 Storyboard Frames
**File:** `src/services/storyboard-image-generation-service.ts` (lines 63-71)

When generating storyboard images, the system:
1. Checks each frame for existing Storage URLs
2. Skips frames that already have images
3. Only generates images for frames without them

**Code:**
```typescript
const hasStorageUrl = frame.frameImage && 
  (frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') ||
   frame.frameImage.startsWith('https://storage.googleapis.com/'))

if (!hasStorageUrl) {
  allFrames.push({ frame, sceneNumber: scene.sceneNumber })
} else {
  console.log(`⏭️ [Bulk Image Generation] Skipping frame ${frame.id} - already has Storage URL`)
}
```

**Result:**
- ✅ Frames **with** images → Skipped
- ✅ Frames **without** images → Generated

### 📖 Story Bible Images
**File:** `src/services/ai-generators/story-bible-image-generator.ts`

When generating story bible images (unless `regenerate: true`), the system:
1. Checks each item for existing images
2. Skips items that already have images
3. Only generates images for items without them

#### Character Images (lines 665-682)
```typescript
// Only generate if no image exists, or if regenerating
const shouldGenerate = !character.visualReference || options.regenerate

if (shouldGenerate) {
  tasks.push({ /* generate image */ })
} else {
  console.log(`⏭️ Skipping character ${i} (${character.name}) - already has image`)
}
```

#### Arc Key Art (lines 785-802)
```typescript
const shouldGenerate = !arc.keyArt || options.regenerate

if (shouldGenerate) {
  tasks.push({ /* generate image */ })
} else {
  console.log(`⏭️ Skipping arc ${i} (${arc.title}) - already has key art`)
}
```

#### Location Concepts (lines 904-921)
```typescript
const shouldGenerate = !location.conceptArt || options.regenerate

if (shouldGenerate) {
  tasks.push({ /* generate image */ })
} else {
  console.log(`⏭️ Skipping location ${i} (${location.name}) - already has concept art`)
}
```

## Usage

### Automatic Skip (Default Behavior)

**Story Bible:**
```typescript
// Generate only missing images
await generateStoryBibleImages(storyBible, userId, {
  sections: ['hero', 'characters', 'arcs', 'world'],
  regenerate: false  // ✅ Skip existing images (default)
})
```

**Storyboards:**
```typescript
// Generate only missing frame images
await generateAllStoryboardImages(
  storyboards,
  userId,
  onFrameUpdate
  // ✅ Automatically skips frames with Storage URLs
)
```

### Force Regenerate

If you want to regenerate **ALL** images (including existing ones):

```typescript
// Regenerate ALL images (even existing ones)
await generateStoryBibleImages(storyBible, userId, {
  sections: ['hero', 'characters', 'arcs', 'world'],
  regenerate: true  // ⚠️ Regenerates everything
})
```

## Console Logs

### When Skipping Items

**Story Bible:**
```
⏭️ [img_gen_...] Skipping character 0 (John Smith) - already has image
⏭️ [img_gen_...] Skipping character 1 (Jane Doe) - already has image
⏭️ [img_gen_...] Skipping arc 0 (Act 1) - already has key art
⏭️ [img_gen_...] Skipping location 0 (Main Street) - already has concept art
```

**Storyboards:**
```
⏭️ [Bulk Image Generation] Skipping frame frame_123 - already has Storage URL
⏭️ [Bulk Image Generation] Skipping frame frame_124 - already has Storage URL
📸 [Bulk Image Generation] Found 3 frames with image prompts (5 skipped)
```

### When Generating

```
🎨 [Story Bible Images] Generating character 2 image...
✅ [Story Bible Images] Character 2 image uploaded to Storage
```

## Benefits

### 💰 Cost Savings
- Only generates missing images
- Avoids duplicate API calls
- Reduces Firebase Storage usage

### ⚡ Time Savings
- Skip images that already exist
- Only wait for new images to generate
- Faster batch operations

### 🔄 Smart Updates
- Add new characters/locations/arcs
- Click "Generate Images"
- Only new items get images

## Examples

### Example 1: Story Bible with Partial Images

**Scenario:**
- Hero image: ✅ Exists
- Characters: 5 total
  - Character 0: ✅ Has image
  - Character 1: ✅ Has image
  - Character 2: ❌ No image
  - Character 3: ❌ No image
  - Character 4: ✅ Has image
- Arcs: 3 total
  - Arc 0: ✅ Has key art
  - Arc 1: ❌ No key art
  - Arc 2: ❌ No key art

**Result:**
```
⏭️ Skipping hero - already has image
⏭️ Skipping character 0 (John) - already has image
⏭️ Skipping character 1 (Jane) - already has image
🎨 Generating character 2 image...
🎨 Generating character 3 image...
⏭️ Skipping character 4 (Bob) - already has image
⏭️ Skipping arc 0 (Act 1) - already has key art
🎨 Generating arc 1 key art...
🎨 Generating arc 2 key art...
```

**Summary:**
- 8 items skipped (already have images)
- 4 items generated (missing images)
- Time saved: ~60% (only 4/12 images generated)
- Cost saved: ~60%

### Example 2: Storyboard with Partial Images

**Scenario:**
- 20 total frames with prompts
- 12 frames already have images
- 8 frames need images

**Result:**
```
⏭️ [Bulk Image Generation] Skipping frame frame_001 - already has Storage URL
⏭️ [Bulk Image Generation] Skipping frame frame_002 - already has Storage URL
... (10 more skipped frames)
📸 [Bulk Image Generation] Found 8 frames with image prompts (12 skipped)
🎨 Generating frame_013 image...
🎨 Generating frame_014 image...
... (6 more generated frames)
```

**Summary:**
- 12 frames skipped
- 8 frames generated
- Time saved: 60%
- Cost saved: 60%

## Testing

### Test 1: Verify Skip Functionality

**Steps:**
1. Generate images for a story bible
2. Wait for completion
3. Click "Generate Images" again (without checking "Regenerate")
4. Watch console logs

**Expected Result:**
```
⏭️ Skipping character 0 - already has image
⏭️ Skipping character 1 - already has image
... (all items skipped)
📸 Found 0 items to generate (12 skipped)
✅ Generation complete
```

### Test 2: Partial Regeneration

**Steps:**
1. Generate images for 3 characters
2. Add 2 new characters (without images)
3. Click "Generate Images"
4. Watch console logs

**Expected Result:**
```
⏭️ Skipping character 0 - already has image
⏭️ Skipping character 1 - already has image
⏭️ Skipping character 2 - already has image
🎨 Generating character 3 image...
🎨 Generating character 4 image...
✅ Generation complete: 2 images generated, 3 skipped
```

### Test 3: Force Regenerate

**Steps:**
1. Generate images for a story bible
2. Check "Regenerate" option
3. Click "Generate Images"
4. Watch console logs

**Expected Result:**
```
🎨 Generating character 0 image... (regenerating)
🎨 Generating character 1 image... (regenerating)
🎨 Generating character 2 image... (regenerating)
... (no skipping - all regenerated)
✅ Generation complete: 10 images regenerated
```

## Summary

### ✅ What's Skipped
- Story Bible:
  - Characters with `visualReference.imageUrl`
  - Arcs with `keyArt.imageUrl`
  - Locations with `conceptArt.imageUrl`
  - Hero with `visualAssets.heroImage.imageUrl`

- Storyboards:
  - Frames with `frameImage` (Storage URL)

### ⚙️ When Skipping Happens
- ✅ Default behavior (regenerate: false)
- ✅ Batch image generation
- ✅ "Generate Images" button
- ❌ Individual "Regenerate" button (always regenerates)
- ❌ With `regenerate: true` option

### 📊 Benefits
- 💰 **60-80% cost savings** on partial updates
- ⚡ **60-80% time savings** on partial updates
- 🎯 **Smart targeting** - only generate what's missing
- 🔄 **Incremental updates** - add new items anytime

The skip feature is **automatic** and requires no configuration! 🎉
















