# Debugging Guide: Image Disappears After Refresh

## 🔍 What to Check When Images Disappear

I've added comprehensive logging throughout the entire image save/load flow. When you generate an image and refresh, check the console logs in this order:

### 1. **When Image is Generated** ✅
Look for logs starting with `🎨 [gen_...]`:
- `🎨 [gen_...] Starting image generation for frame`
- `✅ [gen_...] Image generated successfully` - Should show image URL/type
- `💾 [gen_...] Saving frame update to Firestore`

**What to check:**
- ✅ Image was generated successfully
- ✅ Image URL is present (not empty)
- ✅ Save to Firestore was attempted

### 2. **When Saving to Firestore** ✅
Look for logs starting with `💾 [update_...]`:
- `💾 [update_...] Starting pre-production update`
- `📸 [update_...] Found image before migration` - Shows images found
- `📊 [update_...] Total images found before migration: X`
- `🔍 [update_...] Scanning for large base64 images to migrate to Storage...`
- `✅ [update_...] Image migration complete`
- `💾 [update_...] Saving to Firestore: { framesWithImages: X }`
- `🔍 [update_...] Verifying save by reading document back...`
- `📸 [update_...] Verified saved image: {...}`
- `✅ [update_...] Pre-production updated and verified`

**What to check:**
- ✅ Images found before migration: Should be > 0
- ✅ Migration complete: Should show images after migration
- ✅ Images saved: Should match images expected
- ⚠️ **If mismatch**: Image count doesn't match (expected vs saved)

### 3. **When Loading from Firestore** ✅
Look for logs starting with `👂 [sub_...]` and `📥 [load_...]`:
- `👂 [sub_...] Subscribing to pre-production updates`
- `📥 [sub_...] Firestore data loaded (via subscription)`
- `📸 [sub_...] Found X images in Firestore data`
- `📥 [load_...] Received storyboards from Firestore: { framesWithImages: X }`

**What to check:**
- ✅ Images found in Firestore: Should match what was saved
- ⚠️ **If 0 images**: Images were not saved to Firestore or were lost

### 4. **Common Issues & Solutions**

#### Issue: Images found before migration but 0 after save
**Possible causes:**
- Image too large (exceeds Firestore 1MB limit)
- Storage migration failed silently
- Firestore save failed

**Check for:**
- `❌ [update_...] Error migrating images to Storage`
- `❌ [update_...] IMAGE COUNT MISMATCH!`
- `❌ [update_...] Document does not exist after save!`

#### Issue: Images saved but not loaded
**Possible causes:**
- Subscription not loading images correctly
- Images lost during data sync

**Check for:**
- `⚠️  [sub_...] No images found in Firestore storyboards data!`
- Compare image count: saved vs loaded

#### Issue: Large base64 images not migrated
**Possible causes:**
- Storage upload failing
- User not authenticated
- Storage rules blocking upload

**Check for:**
- `❌ [upload_...] Error uploading image to Storage`
- `⚠️  [update_...] Skipping image migration (guest mode)`
- Storage upload errors in console

## 🔧 Quick Debug Steps

1. **Generate an image** → Watch console for `[gen_...]` logs
2. **Check save logs** → Look for `[update_...]` logs
3. **Verify images saved** → Check `📸 [update_...] Verified saved image` logs
4. **Refresh page** → Watch console for `[sub_...]` and `[load_...]` logs
5. **Check image count** → Compare saved vs loaded counts

## 📊 What Logs Tell You

| Log Message | Meaning |
|-------------|---------|
| `📸 Found image before migration` | Image is in the data being saved ✅ |
| `✅ Image migration complete` | Large images uploaded to Storage ✅ |
| `📸 Verified saved image` | Image confirmed in Firestore after save ✅ |
| `📸 Found X images in Firestore data` | Images loaded from Firestore ✅ |
| `⚠️ No images found in Firestore` | Images missing from Firestore ❌ |
| `❌ IMAGE COUNT MISMATCH!` | Images lost during save ❌ |
| `❌ Error migrating images` | Storage upload failed ❌ |

## 🎯 Most Likely Causes

Based on the code, the most likely causes are:

1. **Image too large for Firestore** (1MB limit)
   - Check: Document size in logs
   - Solution: Should auto-migrate to Storage, but check for errors

2. **Storage migration failing**
   - Check: `❌ [upload_...] Error uploading image to Storage`
   - Solution: Check Firebase Storage rules and billing

3. **Save silently failing**
   - Check: `❌ [update_...] Error updating pre-production`
   - Solution: Check Firestore permissions

4. **Images not in saved data**
   - Check: Compare `imagesBeforeMigration` vs `imagesAfterMigration`
   - Solution: Image lost during migration

## 📝 Next Steps

1. **Generate an image** and watch console logs
2. **Copy all logs** related to that image (use request IDs to track)
3. **Share the logs** so we can identify exactly where the image is being lost

The logs will now show you:
- ✅ Where images are in the save flow
- ✅ If migration is working
- ✅ If Firestore save succeeded
- ✅ What's actually loaded from Firestore

---

**All logs are prefixed with unique IDs so you can track a single image through the entire flow!**





































