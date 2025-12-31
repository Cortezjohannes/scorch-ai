# Image Generation Testing Guide

## Overview

This guide helps you test that ALL image generation paths now correctly upload to Firebase Storage before saving to Firestore.

## Quick Test Commands

### 1. Check for Base64 in Firestore (Should be ZERO)

```bash
# Search for base64 images in codebase
grep -r "data:image" src/ --include="*.ts" --include="*.tsx" | grep -v "test" | grep -v "mock"

# This should only show:
# - Comments explaining NOT to use base64
# - Validation checks that reject base64
# - No actual base64 image returns
```

### 2. Test Story Bible Image Generation

**Steps:**
1. Navigate to Story Bible page
2. Click "Generate Images" button
3. Select all sections (Hero, Characters, Arcs, World)
4. Click "Generate"
5. Watch terminal logs

**Expected Logs:**
```
✅ [Story Bible Images] Character image uploaded to Storage: https://firebasestorage.googleapis.com/...
✅ [Story Bible Images] Arc key art uploaded to Storage: https://firebasestorage.googleapis.com/...
✅ [Story Bible Images] Location image uploaded to Storage: https://firebasestorage.googleapis.com/...
✅ [Story Bible Images] Hero image uploaded to Storage: https://firebasestorage.googleapis.com/...
```

**Should NEVER See:**
```
❌ Storage upload failed, returning base64
❌ Fall through - return base64 as fallback
```

### 3. Test Storyboard Image Generation

**Steps:**
1. Navigate to Pre-Production > Storyboards
2. Add frames with image prompts
3. Click "Generate All Images"
4. Watch terminal logs

**Expected Logs:**
```
📤 [Bulk Image Generation] Uploading frame frame_123 to Firebase Storage...
✅ [Bulk Image Generation] Frame frame_123 uploaded to Storage: https://firebasestorage.googleapis.com/...
✅ [Bulk Image Generation] Frame frame_123: Valid Storage URL confirmed
💾 [Bulk Image Generation] Saving frame frame_123 to Firestore...
✅ [Bulk Image Generation] Frame frame_123 saved in 234ms
```

**Should NEVER See:**
```
❌ [Bulk Image Generation] Frame frame_123: CRITICAL ERROR - Image is NOT a Storage URL!
```

### 4. Test Marketing Materials

**Steps:**
1. Navigate to Marketing Materials section
2. Generate series poster
3. Generate character spotlight cards
4. Watch terminal logs

**Expected Logs:**
```
📤 [req_...] Uploading to Firebase Storage...
✅ [req_...] Uploaded to Storage in 1234ms
```

**Should NEVER See:**
```
❌ [req_...] Storage upload failed, returning base64
```

## Detailed Testing Scenarios

### Scenario 1: Normal Image Generation (Success Path)

**Test:** Generate a character image

**Expected Flow:**
1. ✅ Image generated via Gemini
2. ✅ Base64 detected
3. ✅ Upload to Firebase Storage initiated
4. ✅ Storage URL received
5. ✅ Storage URL validated (starts with `https://firebasestorage.googleapis.com/`)
6. ✅ Storage URL saved to Firestore
7. ✅ Image displays in UI

**Verification:**
```typescript
// Check Firestore document
{
  mainCharacters: [{
    visualReference: {
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/...",  // ✅ Storage URL
      prompt: "...",
      generatedAt: "2025-12-12T...",
      source: "gemini"
    }
  }]
}
```

### Scenario 2: Storage Upload Failure (Error Handling)

**Test:** Simulate Storage upload failure (disconnect network during upload)

**Expected Flow:**
1. ✅ Image generated via Gemini
2. ✅ Base64 detected
3. ❌ Upload to Firebase Storage fails
4. ⚠️  Error thrown: "Failed to upload image to Storage"
5. ⚠️  Retry logic kicks in (attempt 2)
6. ❌ Upload fails again
7. ⚠️  Retry logic kicks in (attempt 3)
8. ❌ Upload fails again
9. ⚠️  All retries exhausted
10. ⚠️  Fallback returns empty `imageUrl`
11. ✅ Empty `imageUrl` saved to Firestore (no error)
12. ⚠️  No image displays in UI (graceful degradation)

**Verification:**
```typescript
// Check Firestore document
{
  mainCharacters: [{
    visualReference: {
      imageUrl: "",  // ✅ Empty string (not base64!)
      prompt: "Failed to generate...",
      generatedAt: "2025-12-12T...",
      source: "fallback"
    }
  }]
}
```

### Scenario 3: Image Generation Failure

**Test:** Invalid prompt or API error

**Expected Flow:**
1. ❌ Image generation fails
2. ⚠️  Retry logic kicks in
3. ❌ All retries fail
4. ⚠️  Fallback returns empty `imageUrl`
5. ✅ Empty `imageUrl` saved to Firestore
6. ⚠️  No image displays in UI

**Verification:**
```typescript
// Check Firestore document
{
  mainCharacters: [{
    visualReference: {
      imageUrl: "",  // ✅ Empty string
      prompt: "Failed to generate...",
      source: "fallback"
    }
  }]
}
```

## Validation Checks

### Check 1: No Base64 in Firestore

**Command:**
```bash
# Check Firestore documents for base64 images
# This should return ZERO results
```

**Manual Check:**
1. Open Firebase Console
2. Navigate to Firestore
3. Open any story bible document
4. Check `mainCharacters[].visualReference.imageUrl`
5. Verify it starts with `https://firebasestorage.googleapis.com/`

### Check 2: Storage URLs Only

**Expected Format:**
```
https://firebasestorage.googleapis.com/v0/b/greenlitai.appspot.com/o/users%2F{userId}%2Fimages%2F{hash}.png?alt=media&token=...
```

**Should NEVER See:**
```
data:image/png;base64,iVBORw0KG...  ❌ Base64
data:image/svg+xml;charset=utf-8,... ❌ SVG data URL
```

### Check 3: Terminal Logs

**Good Logs:**
```
✅ [Story Bible Images] Character image uploaded to Storage
✅ [Bulk Image Generation] Valid Storage URL confirmed
✅ [req_...] Uploaded to Storage in 1234ms
```

**Bad Logs (Should NEVER See):**
```
❌ Storage upload failed, returning base64
❌ Fall through - return base64 as fallback
❌ Image is NOT a Storage URL!
```

## Error Messages to Watch For

### ✅ Good Errors (Expected)

```
⚠️  [img_...] Firestore save failed, retrying...
❌ Failed to generate character image after retries
⚠️  [Story Bible Images] Creating fallback for Character - no image will be displayed
```

### ❌ Bad Errors (Should NEVER See)

```
❌ Cannot save story bible: contains base64 images at mainCharacters[2].visualReference.imageUrl
❌ Document cannot be written because its size (2,534,938 bytes) exceeds the maximum allowed size of 1,048,576 bytes
❌ CRITICAL: Cannot save story bible - contains base64 images!
```

## Performance Benchmarks

### Story Bible Image Generation (4 characters)

**Expected Times:**
- Image generation: ~3-5 seconds per image
- Storage upload: ~1-2 seconds per image
- Firestore save: ~200-500ms per image
- **Total:** ~20-30 seconds for 4 characters

### Storyboard Bulk Generation (12 frames)

**Expected Times:**
- Sequential (first 3): ~15-20 seconds
- Parallel (next 9): ~30-40 seconds
- **Total:** ~45-60 seconds for 12 frames

## Troubleshooting

### Issue: "Storage upload failed"

**Possible Causes:**
1. Firebase Admin SDK not initialized
2. Network connectivity issues
3. Invalid service account credentials
4. Storage bucket permissions

**Solution:**
```bash
# Check Firebase Admin SDK initialization
# Look for this log on server startup:
✅ Firebase Admin SDK initialized from environment variables
# OR
✅ Firebase Admin SDK initialized from service account file
```

### Issue: "Image is base64, skipping Firestore save"

**This should NEVER happen now!**

If you see this:
1. Check which image generator is being used
2. Verify the generator is using `uploadImageToStorageAdmin()` or `uploadImageToStorage()`
3. Check if the generator has a try-catch fallback that returns base64
4. Report the issue - this is a bug!

### Issue: Empty images in UI

**Expected Behavior:**
- This is graceful degradation when image generation/upload fails
- User can retry image generation
- No Firestore errors

**Not Expected:**
- If ALL images are empty, check:
  1. Gemini API key is valid
  2. Firebase Storage is configured
  3. Network connectivity

## Success Criteria

### ✅ All Tests Pass When:

1. **No base64 in Firestore**
   - All `imageUrl` fields start with `https://firebasestorage.googleapis.com/`
   - OR are empty strings (fallback)

2. **No Firestore size errors**
   - No "Document exceeds maximum allowed size" errors
   - No "Cannot save story bible: contains base64 images" errors

3. **Images persist across devices**
   - Open story bible on Device A
   - Generate images
   - Open same story bible on Device B
   - Images display correctly

4. **Graceful error handling**
   - Simulate Storage upload failure
   - No crashes or error messages to user
   - Empty image placeholders shown
   - User can retry

5. **Performance acceptable**
   - Story bible images: < 30 seconds for 4 characters
   - Storyboard images: < 60 seconds for 12 frames
   - No timeouts or hanging

## Automated Testing (Future)

```typescript
// Test: Story Bible Image Generation
describe('Story Bible Image Generation', () => {
  it('should upload images to Storage before saving to Firestore', async () => {
    const result = await generateCharacterImage(character, storyBible, userId)
    
    expect(result.imageUrl).toMatch(/^https:\/\/firebasestorage\.googleapis\.com\//)
    expect(result.imageUrl).not.toMatch(/^data:/)
  })
  
  it('should return empty imageUrl on failure, not base64', async () => {
    // Mock Storage upload failure
    mockUploadImageToStorageAdmin.mockRejectedValue(new Error('Upload failed'))
    
    const result = await generateCharacterImage(character, storyBible, userId)
    
    expect(result.imageUrl).toBe('')
    expect(result.source).toBe('fallback')
  })
})
```

## Conclusion

After running all tests, you should see:
- ✅ All images are Storage URLs
- ✅ No base64 in Firestore
- ✅ No Firestore size errors
- ✅ Images persist across devices
- ✅ Graceful error handling

If any test fails, check:
1. `COMPLETE_FIX_SUMMARY.md` for implementation details
2. `IMAGE_FLOW_DIAGRAM.md` for flow visualization
3. `FIX_SUMMARY.md` for specific fixes applied

**The fix is complete when ALL image generation paths follow the Storage-first pattern!** 🎉
















