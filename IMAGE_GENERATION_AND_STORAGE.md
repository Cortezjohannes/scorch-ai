# Image Generation & Storage Flow Documentation

## Overview

This document explains how images are generated and saved in the application. **You are correct** - images are uploaded to Firebase Storage first, then the Storage URL is saved to Firestore (not the image data itself).

## Why This Approach?

Firestore has a **1MB document size limit**. Base64 images can easily exceed this limit, causing errors like:
```
Document cannot be written because its size (2,534,938 bytes) exceeds the maximum allowed size of 1,048,576 bytes
```

**Solution:** Store images in Firebase Storage (unlimited size) and save only the lightweight Storage URL in Firestore.

---

## Complete Flow

### 1. Image Generation

**Service:** `src/services/image-generation-with-storage.ts`

**Function:** `generateImageWithStorage(prompt, options)`

**Process:**
1. Generate image using Gemini API (Nano Banana Pro)
2. Returns base64 data URL: `data:image/png;base64,iVBORw0KG...`

**Code:**
```typescript
const geminiResult = await generateImageWithGemini(prompt, {
  aspectRatio: options.aspectRatio,
  quality: options.quality,
  // ... other options
})
// Returns: { imageUrl: "data:image/png;base64,...", success: true }
```

---

### 2. Upload to Firebase Storage (Client-Side)

**Service:** `src/services/image-storage-service.ts`

**Function:** `uploadImageToStorage(userId, imageData, promptHash)`

**Process:**
1. Converts base64 data URL to Blob
2. Uploads to Firebase Storage at path: `users/{userId}/images/{promptHash}.{ext}`
3. Returns Firebase Storage download URL: `https://firebasestorage.googleapis.com/v0/b/greenlitai.firebaseapp.com/o/users%2F...`

**Storage Path:**
```
users/{userId}/images/{promptHash}.{extension}
```

**Example:**
```
users/JB1XQt1gTwdsybRZo4lTc7rkPam1/images/a1b2c3d4e5f6g7h8.png
```

**Code:**
```typescript
// In image-generation-with-storage.ts
if (options.userId && !options.skipStorage && isBase64Image(geminiResult.imageUrl)) {
  const promptHash = await hashPrompt(prompt, undefined, options.context)
  finalImageUrl = await uploadImageToStorage(
    options.userId,
    geminiResult.imageUrl,  // base64 data URL
    promptHash
  )
  // Returns: "https://firebasestorage.googleapis.com/v0/b/..."
}
```

**Key Point:** This happens **client-side** using the Firebase Client SDK (`firebase/storage`).

---

### 3. Save Storage URL to Firestore (Client-Side)

**After Storage upload completes**, the Storage URL is saved to Firestore via client-side updates.

**Example - Storyboard Frames:**
```typescript
// In StoryboardsTab.tsx or storyboard-image-generation-service.ts
await onFrameUpdate(frame.id, {
  frameImage: finalImageUrl  // Storage URL, not base64!
})
```

**Firestore Path (Storyboards):**
```
users/{userId}/storyBibles/{storyBibleId}/preproduction/{preProductionId}
```

**Field:**
```json
{
  "storyboards": {
    "scenes": [
      {
        "frames": [
          {
            "frameImage": "https://firebasestorage.googleapis.com/v0/b/..."
          }
        ]
      }
    ]
  }
}
```

**Example - Story Bible Images:**
```typescript
// In story-bible-service.ts or GenerateImagesModal.tsx
character.visualReference = {
  imageUrl: finalImageUrl,  // Storage URL
  prompt: prompt,
  generatedAt: new Date().toISOString(),
  source: 'gemini'
}
await saveStoryBibleData(updatedStoryBible)
```

**Firestore Path (Story Bible):**
```
users/{userId}/storyBibles/{storyBibleId}
```

**Field:**
```json
{
  "mainCharacters": [
    {
      "visualReference": {
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/...",
        "prompt": "...",
        "generatedAt": "2025-12-06T...",
        "source": "gemini"
      }
    }
  ]
}
```

---

## Two Implementation Paths

### Path A: Client-Side Generation (Most Common)

**Flow:**
1. Client calls `generateImageWithStorage(prompt, { userId, ... })`
2. Service generates image → gets base64
3. Service uploads base64 to Firebase Storage (client-side)
4. Service returns Storage URL
5. Client saves Storage URL to Firestore via `onUpdate()` or `onFrameUpdate()`

**Used For:**
- Storyboard frame images
- Character images (single generation)
- Marketing visuals
- Story bible images (when generated individually)

**Code Example:**
```typescript
// Client-side
const result = await generateImageWithStorage(prompt, {
  userId: user.id,
  aspectRatio: '16:9',
  context: 'storyboard'
})

// result.imageUrl is now a Storage URL
await onFrameUpdate(frameId, {
  frameImage: result.imageUrl  // Save Storage URL to Firestore
})
```

---

### Path B: Server-Side Generation (Bulk Operations)

**Flow:**
1. Client calls API route (e.g., `/api/generate/story-bible-images`)
2. Server generates images using Admin SDK
3. Server uploads to Storage using Admin SDK (`uploadImageToStorageAdmin`)
4. Server saves Storage URLs to Firestore using Admin SDK (`saveStoryBibleServer`)
5. Server returns results to client

**Used For:**
- Bulk story bible image generation
- Parallel image generation (first 3 sequential, then 12 parallel)

**Code Example:**
```typescript
// Server-side (API route)
const result = await generateImageWithStorageAdmin(prompt, {
  userId: userId,
  aspectRatio: '16:9'
})

// result.imageUrl is Storage URL
const updatedBible = {
  ...currentBible,
  mainCharacters: [{
    ...character,
    visualReference: {
      imageUrl: result.imageUrl,  // Storage URL
      // ...
    }
  }]
}

await saveStoryBibleServer(updatedBible, userId)  // Admin SDK saves to Firestore
```

---

## Critical Rules

### ✅ DO:
1. **Always upload base64 images to Storage** before saving to Firestore
2. **Save only Storage URLs** in Firestore documents
3. **Use `generateImageWithStorage()`** for all image generation
4. **Check `uploadedToStorage` flag** to verify upload succeeded

### ❌ DON'T:
1. **Never save base64 images directly to Firestore** (causes 1MB limit errors)
2. **Never skip Storage upload** unless testing (`skipStorage: true`)
3. **Never save image data in Firestore** - only URLs

---

## Storage vs Firestore

| Aspect | Firebase Storage | Firestore |
|--------|------------------|-----------|
| **Purpose** | Store image files (binary data) | Store image URLs (text strings) |
| **Size Limit** | Unlimited | 1MB per document |
| **Content** | Actual image file | Lightweight URL reference |
| **Path** | `users/{userId}/images/{hash}.{ext}` | `users/{userId}/storyBibles/{id}` |
| **Access** | Public download URL | Document field (e.g., `frameImage`) |

---

## Migration for Existing Base64 Images

If you have existing Firestore documents with base64 images, they need to be migrated:

**Service:** `src/services/preproduction-firestore.ts`

**Function:** `migrateLargeImagesToStorage()`

**Process:**
1. Scans Firestore document for base64 images
2. Uploads each base64 image to Storage
3. Replaces base64 with Storage URL in document
4. Saves updated document back to Firestore

**Note:** This migration runs automatically when saving pre-production data if base64 images are detected.

---

## Example: Complete Storyboard Image Flow

```typescript
// 1. User clicks "Generate Image" for a frame
// 2. Client calls generateImageWithStorage()
const result = await generateImageWithStorage(
  frame.imagePrompt,
  {
    userId: user.id,
    aspectRatio: '16:9',
    context: 'storyboard',
    referenceImages: [characterImage],
    characterDescriptions: [characterDescription]
  }
)

// 3. Inside generateImageWithStorage():
//    - Generates image via Gemini → base64
//    - Uploads base64 to Storage → Storage URL
//    - Returns Storage URL

// 4. Client receives Storage URL
if (result.success && result.uploadedToStorage) {
  // 5. Save Storage URL to Firestore
  await onFrameUpdate(frame.id, {
    frameImage: result.imageUrl  // Storage URL, not base64!
  })
}

// 6. Firestore document now contains:
// {
//   storyboards: {
//     scenes: [{
//       frames: [{
//         frameImage: "https://firebasestorage.googleapis.com/v0/b/..."
//       }]
//     }]
//   }
// }

// 7. When displaying, use the Storage URL directly:
<img src={frame.frameImage} />  // Loads from Firebase Storage
```

---

## Troubleshooting

### Error: "Document exceeds maximum allowed size"
**Cause:** Base64 images were saved directly to Firestore.

**Fix:** Ensure all images go through `generateImageWithStorage()` which uploads to Storage first.

### Images not persisting across devices
**Cause:** Base64 images in Firestore (not Storage URLs).

**Fix:** Migrate existing base64 images using `migrateLargeImagesToStorage()`.

### Storage upload fails
**Cause:** Missing `userId` or Firebase Storage not configured.

**Fix:** Ensure user is authenticated and Firebase Storage rules allow uploads.

---

## Summary

**Your understanding is correct:**

1. ✅ **Generate image** → Returns base64 data URL
2. ✅ **Upload to Firebase Storage** → Returns Storage download URL
3. ✅ **Save Storage URL to Firestore** → Lightweight reference (not the image itself)

**Key Services:**
- `image-generation-with-storage.ts` - Main generation + Storage upload
- `image-storage-service.ts` - Client-side Storage upload
- `image-storage-admin-service.ts` - Server-side Storage upload (Admin SDK)
- `preproduction-firestore.ts` - Firestore save operations

**Result:** Images persist across devices via Firebase Storage URLs stored in Firestore! 🎉





















