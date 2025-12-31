# Image Generation & Storage Logging Guide

## Overview

Comprehensive logging has been added throughout the image generation, caching, and storage system to help debug issues. All logs include unique request IDs for tracking operations across services.

## Log Format

All logs follow this format:
```
[📝/✅/❌/⚠️] [requestId] Message
```

Where:
- **📝** = Info/Process
- **✅** = Success
- **❌** = Error
- **⚠️** = Warning
- **requestId** = Unique identifier for tracking (e.g., `req_1234567890_abc123`)

## Log Locations

### 1. Image Generation API (`/api/generate-image`)

**Request ID Format**: `req_{timestamp}_{random}`

**Key Log Points**:
- Request start with details (prompt, userId, artStyle)
- Cache check (hit/miss)
- Provider selection (Gemini/Azure/Mock)
- Generation start/complete with duration
- Cache save attempt
- Errors with full stack traces

**Example Logs**:
```
🖼️  [req_1234567890_abc] Image generation request started
📝 [req_1234567890_abc] Request details: { hasPrompt: true, hasUserId: true, ... }
🔍 [req_1234567890_abc] Checking cache for userId: abc12345...
✅ [req_1234567890_abc] CACHE HIT! { cacheDuration: "45ms", ... }
```

### 2. Image Cache Service (`image-cache-service.ts`)

**Request ID Format**: `cache_{timestamp}_{random}` or `save_{timestamp}_{random}`

**Key Log Points**:
- Cache lookup with hash generation
- Cache hit/miss with details
- Cache save with image processing
- Storage upload decisions
- Usage stats updates

**Example Logs**:
```
🔍 [cache_1234567890_abc] Checking cache { userId: "abc12345...", promptLength: 150 }
🔑 [cache_1234567890_abc] Prompt hash generated { hash: "a1b2c3d4...", hashDuration: "12ms" }
✅ [cache_1234567890_abc] CACHE HIT! { imageUrl: "https://...", usageCount: 5 }
```

### 3. Image Storage Service (`image-storage-service.ts`)

**Request ID Format**: `upload_{timestamp}_{random}` or `process_{timestamp}_{random}`

**Key Log Points**:
- Image size calculation
- Upload decision (threshold check)
- Storage upload progress
- Upload success/failure with duration
- URL generation

**Example Logs**:
```
📤 [upload_1234567890_abc] Starting Storage upload { imageSize: "250KB", hash: "a1b2c3d4..." }
📂 [upload_1234567890_abc] Storage path: users/abc12345/images/a1b2c3d4.png
✅ [upload_1234567890_abc] Storage upload complete { totalDuration: "1234ms", downloadURL: "https://..." }
```

### 4. Pre-Production Firestore Service (`preproduction-firestore.ts`)

**Request ID Format**: `update_{timestamp}_{random}` or `migrate_{timestamp}_{random}`

**Key Log Points**:
- Update start with document details
- Image migration scan
- Large image detection
- Migration progress (arrays/objects)
- Migration success/failure

**Example Logs**:
```
💾 [update_1234567890_abc] Starting pre-production update { docId: "ep1", userId: "abc12345..." }
🔍 [update_1234567890_abc] Scanning for large base64 images to migrate to Storage...
📦 [migrate_1234567890_abc] Migrating large base64 image to Storage { size: "250KB", hash: "a1b2c3d4..." }
✅ [update_1234567890_abc] Image migration complete { duration: "2345ms" }
```

### 5. StoryboardsTab Component (`StoryboardsTab.tsx`)

**Request ID Format**: `gen_{timestamp}_{random}`

**Key Log Points**:
- Image generation start
- API request/response
- Local state updates
- Firestore save
- Error handling

**Example Logs**:
```
🎨 [gen_1234567890_abc] Starting image generation for frame { frameId: "frame-123", promptLength: 150 }
📡 [gen_1234567890_abc] Sending request to /api/generate-image
📥 [gen_1234567890_abc] Received response { status: 200, duration: "2345ms" }
✅ [gen_1234567890_abc] Image generated successfully { imageType: "Data URL (base64)", imageSize: "250KB" }
💾 [gen_1234567890_abc] Saving frame update to Firestore
✅ [gen_1234567890_abc] Frame update completed and saved { totalDuration: "3456ms" }
```

## Tracking Operations

### Using Request IDs

Each operation generates a unique request ID that flows through related operations:

1. **Image Generation Request**: `req_1234567890_abc`
   - Used in API route
   - Passed to cache service operations
   - Included in response

2. **Cache Operations**: `cache_1234567890_abc` or `save_1234567890_abc`
   - Generated for cache lookups/saves
   - Linked to parent request via timing

3. **Storage Operations**: `upload_1234567890_abc` or `process_1234567890_abc`
   - Generated for storage uploads
   - Linked to cache operations

### Finding Related Logs

To track a single image generation operation:

1. Find the initial request log: `🖼️  [req_...] Image generation request started`
2. Search for that request ID or timestamp
3. Follow the logs through:
   - Cache check
   - Image generation
   - Storage upload (if needed)
   - Cache save
   - Firestore save

## Common Issues & Logs to Check

### Issue: Image Not Persisting

**Check These Logs**:
1. `💾 [gen_...] Saving frame update to Firestore` - Did save start?
2. `✅ [update_...] Image migration complete` - Did migration succeed?
3. `✅ [update_...] Pre-production update complete` - Did Firestore save succeed?

**Look For**:
- Errors in migration: `❌ [migrate_...] Failed to migrate image`
- Firestore errors: `❌ [update_...] Error updating pre-production`
- Missing userId: `⚠️  [update_...] Skipping image migration (guest mode)`

### Issue: Cache Not Working

**Check These Logs**:
1. `🔍 [req_...] Checking cache` - Is cache check running?
2. `✅ [cache_...] CACHE HIT!` or `❌ [cache_...] Cache miss` - What was result?
3. `💾 [save_...] Image cached successfully` - Did save succeed?

**Look For**:
- Cache errors: `❌ [cache_...] Error getting cached image`
- Missing userId: `⚠️  [cache_...] Cache check skipped (no userId)`
- Save failures: `❌ [save_...] Error saving cached image`

### Issue: Storage Upload Failing

**Check These Logs**:
1. `📤 [upload_...] Starting Storage upload` - Did upload start?
2. `✅ [upload_...] Storage upload complete` - Did it succeed?
3. `❌ [upload_...] Error uploading image to Storage` - What was the error?

**Look For**:
- Storage errors: `❌ [upload_...] Error uploading image to Storage`
- Permission errors: Check Firebase Storage rules
- Size issues: Check image size in logs

### Issue: Slow Performance

**Check These Logs**:
- Duration metrics in all logs (e.g., `duration: "1234ms"`)
- Cache hit/miss (cache hits should be fast)
- Storage upload duration
- Firestore save duration

**Look For**:
- Long cache lookups: `cacheDuration: "5000ms"` (should be <100ms)
- Slow uploads: `uploadDuration: "10000ms"` (check network/Storage)
- Slow Firestore saves: `saveDuration: "5000ms"` (check Firestore performance)

## Log Levels

- **Info (📝)**: Normal operation flow
- **Success (✅)**: Successful operations
- **Warning (⚠️)**: Non-critical issues (continues operation)
- **Error (❌)**: Critical failures (may block operation)

## Browser Console

All logs appear in the browser console. Use browser DevTools to:
1. Filter by request ID
2. Filter by log level (✅/❌/⚠️)
3. Search for specific operations
4. Export logs for analysis

## Server Logs

API route logs appear in:
- **Development**: Terminal running `npm run dev`
- **Production**: Cloud Run logs (GCP Console)

## Best Practices

1. **Always check logs when debugging** - They provide detailed context
2. **Use request IDs** - Track operations across services
3. **Check duration metrics** - Identify performance bottlenecks
4. **Look for error patterns** - Multiple similar errors indicate systemic issues
5. **Verify userId presence** - Many operations require authentication

## Example Debugging Session

```
1. User reports: "Image not saving"
2. Check browser console for: [gen_...] logs
3. Find request ID: gen_1234567890_abc
4. Search for related logs:
   - ✅ [gen_...] Image generated successfully
   - 💾 [gen_...] Saving frame update to Firestore
   - ❌ [update_...] Error updating pre-production: Permission denied
5. Issue identified: Firestore permission error
6. Check Firestore rules and user authentication
```

---

**All logs include timestamps, request IDs, and detailed context for easy debugging!**





































