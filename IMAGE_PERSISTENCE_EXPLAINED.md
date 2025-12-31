# Image Persistence in Storyboards - Explained

## ✅ YES - Images Persist and Sync Across Devices!

## How It Works

### 1. **Image Generation** 
When you generate a storyboard image:

```
User clicks "Generate Image"
  ↓
API checks cache (by prompt hash)
  ↓
If cached: Returns cached image (instant, no token cost!)
If not cached: Generates new image
  ↓
If image > 100KB: Uploads to Firebase Storage → Returns Storage URL
If image < 100KB: Returns base64 data URL
  ↓
Saves to image cache (for future reuse)
```

### 2. **Image Saving to Firestore**
The image is saved in TWO ways:

#### A. **Image Cache** (For Reuse)
- Stored in: `users/{userId}/imageCache/{promptHash}`
- Contains: Storage URL (for large images) or base64 (for small)
- Purpose: Prevents regenerating the same image

#### B. **Storyboard Document** (In Your Project)
- Stored in: `users/{userId}/storyBibles/{storyBibleId}/preproduction/{docId}`
- Path: `storyboards.scenes[].frames[].frameImage`
- **Before saving**: Large base64 images are automatically uploaded to Storage
- **In Firestore**: Storage URL (lightweight) or small base64

### 3. **Storage Migration (Automatic)**
Before saving to Firestore, the system automatically:

```typescript
// In updatePreProduction():
1. Scans document for large base64 images
2. Uploads images >100KB to Firebase Storage
3. Replaces base64 with Storage URL in document
4. Saves document with Storage URLs (stays under 1MB limit)
```

## ✅ Persistence Guarantees

### **Across Devices** ✅
- ✅ Images are saved to **Firestore** (cloud database)
- ✅ Large images stored in **Firebase Storage** (cloud storage)
- ✅ Both are tied to your **user account**
- ✅ When you log in on another device, data syncs automatically
- ✅ Storage URLs are publicly accessible (for sharing)

### **After Refresh** ✅
- ✅ Images loaded from Firestore when page loads
- ✅ Also cached in localStorage (for faster loading)
- ✅ Storage URLs persist forever (until you delete them)

### **Even After Logout/Login** ✅
- ✅ All images stored in your user account
- ✅ Logging back in restores all your images
- ✅ Works on any device where you're logged in

## 📊 Storage Strategy

| Image Size | Storage Location | How It's Saved |
|------------|-----------------|----------------|
| **Small (<100KB)** | Firestore document | Base64 string directly in document |
| **Large (>100KB)** | Firebase Storage | Storage URL saved in Firestore |
| **Cached Images** | Image Cache + Storage | Storage URL or base64 in cache |

## 🔍 What Gets Saved Where

### In Firestore Document:
```javascript
{
  storyboards: {
    scenes: [
      {
        frames: [
          {
            id: "frame-123",
            frameImage: "https://firebasestorage.googleapis.com/..." // Storage URL
            // OR
            frameImage: "data:image/png;base64,..." // Small base64
          }
        ]
      }
    ]
  }
}
```

### In Image Cache:
```javascript
{
  promptHash: "abc123...",
  imageUrl: "https://firebasestorage.googleapis.com/...", // Storage URL
  prompt: "A cinematic shot of...",
  source: "gemini",
  createdAt: Timestamp,
  usageCount: 5 // How many times it's been reused
}
```

## 🚀 Benefits

1. **✅ Persists Across Devices**: Cloud storage syncs automatically
2. **✅ Saves Tokens**: Cached images don't require regeneration
3. **✅ Fast Loading**: Storage URLs load faster than base64
4. **✅ No Size Limits**: Large images stored separately (not in Firestore)
5. **✅ Shareable**: Storage URLs work in share links (investor materials)

## 📱 Cross-Device Flow

### Device A (Desktop):
1. Generate storyboard image
2. Image saved to Firestore + Storage
3. Image appears immediately

### Device B (Mobile):
1. Log in with same account
2. Open same storyboard
3. Image loads from Firestore/Storage
4. ✅ Same image appears!

### After Refresh:
1. Page reloads
2. Storyboard data fetched from Firestore
3. Images loaded from Storage URLs or base64
4. ✅ All images appear!

## ⚠️ Important Notes

### Guest Mode (No Login):
- ⚠️ Images saved to **localStorage only**
- ⚠️ **Won't sync** across devices
- ⚠️ **Lost** if you clear browser data

### Authenticated (Logged In):
- ✅ Images saved to **Firestore + Storage**
- ✅ **Syncs** across all devices
- ✅ **Persists** even after logout

## 🎯 Summary

**YES** - When you generate a storyboard image:

1. ✅ **It's saved** to Firestore (with Storage migration for large images)
2. ✅ **It persists** after page refresh
3. ✅ **It syncs** across all devices (when logged in)
4. ✅ **It's cached** for future reuse (saves tokens)
5. ✅ **It's shareable** via Storage URLs (for investor materials)

**The image will be there whenever you open the storyboard, on any device!** 🎉

---

**Note**: Make sure you're logged in for cross-device sync. Guest mode only uses localStorage (device-specific).





































