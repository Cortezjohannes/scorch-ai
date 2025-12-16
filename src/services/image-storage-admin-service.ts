/**
 * Image Storage Service using Firebase Admin SDK
 * 
 * This is for SERVER-SIDE uploads (API routes) where user authentication isn't available.
 * Uses Admin SDK which bypasses security rules.
 */

import { getAdminStorage, isAdminInitialized } from '@/lib/firebase-admin';
import { isBase64Image } from './image-storage-service';

/**
 * Upload image to Firebase Storage using Admin SDK (server-side)
 * 
 * @param userId User ID (for path organization)
 * @param imageData Base64 data URL or external URL
 * @param promptHash Hash to use as filename
 * @returns Storage download URL
 */
export async function uploadImageToStorageAdmin(
  userId: string,
  imageData: string,
  promptHash: string
): Promise<string> {
  const uploadId = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  if (!userId) {
    console.error(`❌ [${uploadId}] User ID is required to upload images`);
    throw new Error('User ID is required to upload images');
  }

  if (!imageData) {
    console.error(`❌ [${uploadId}] Image data is required`);
    throw new Error('Image data is required');
  }

  // If it's already an external URL, return as-is
  if (!isBase64Image(imageData)) {
    console.log(`📦 [${uploadId}] Image is already an external URL, skipping upload:`, {
      url: imageData.substring(0, 60) + '...',
      urlLength: imageData.length
    })
    return imageData;
  }

  // Check if Admin SDK is initialized
  if (!isAdminInitialized()) {
    throw new Error('Firebase Admin SDK not initialized. Please set up service account credentials. See FIREBASE_ADMIN_SETUP.md');
  }

  try {
    // Extract base64 data and mime type
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 data URL format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const extension = mimeType.split('/')[1] || 'png';
    
    // Calculate size
    const sizeKB = Math.round((base64Data.length * 3) / 4 / 1024);
    
    console.log(`📤 [${uploadId}] Starting Admin SDK Storage upload`, {
      userId: userId.substring(0, 8) + '...',
      hash: promptHash.substring(0, 16) + '...',
      imageSize: `${sizeKB}KB`,
      mimeType,
      extension
    });
    
    // Create storage path: users/{userId}/images/{promptHash}.{ext}
    const storagePath = `users/${userId}/images/${promptHash}.${extension}`;
    const adminStorage = getAdminStorage();
    
    // Get bucket name from environment or use default
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'greenlitai.appspot.com';
    const bucket = adminStorage.bucket(bucketName);
    
    console.log(`📦 [${uploadId}] Using Storage bucket: ${bucketName}`);
    
    const file = bucket.file(storagePath);

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload file
    const uploadStartTime = Date.now();
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          promptHash: promptHash.substring(0, 16) + '...'
        }
      }
    });
    const uploadDuration = Date.now() - uploadStartTime;
    
    console.log(`✅ [${uploadId}] Image uploaded to Storage via Admin SDK`, {
      uploadDuration: `${uploadDuration}ms`,
      size: `${sizeKB}KB`,
      path: storagePath
    });

    // Try to make file publicly accessible (may fail if uniform bucket-level access is enabled)
    // With uniform bucket-level access, access is controlled at the bucket level, not per-object
    // This is OK - we'll still get a valid URL
    try {
      await file.makePublic();
      console.log(`✅ [${uploadId}] File marked as public`);
    } catch (aclError: any) {
      // If uniform bucket-level access is enabled, this will fail but it's OK
      // Access is controlled by bucket-level IAM policies instead
      if (aclError.message?.includes('uniform bucket-level access')) {
        console.log(`ℹ️ [${uploadId}] Uniform bucket-level access enabled - access controlled at bucket level (this is OK)`);
      } else {
        // Other ACL errors - log but continue since the file was uploaded successfully
        console.warn(`⚠️ [${uploadId}] Failed to set file ACL (non-fatal):`, aclError.message);
      }
    }
    
    // Get download URL using getSignedUrl - this works regardless of ACL method
    // Use a long expiration (10 years) so URLs don't expire
    // This matches the Firebase Storage download URL format
    const urlStartTime = Date.now();
    const [downloadURL] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2035' // 10 years from now
    });
    const urlDuration = Date.now() - urlStartTime;

    // Alternative: Use Firebase Storage download URL format if getSignedUrl doesn't work
    // const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;

    console.log(`✅ [${uploadId}] Admin SDK Storage upload complete`, {
      totalDuration: `${Date.now() - uploadStartTime}ms`,
      uploadDuration: `${uploadDuration}ms`,
      urlDuration: `${urlDuration}ms`,
      downloadURL: downloadURL.substring(0, 80) + '...',
      size: `${sizeKB}KB`
    });
    
    return downloadURL;
  } catch (error: any) {
    console.error(`❌ [${uploadId}] Error uploading image to Storage via Admin SDK:`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
      userId: userId.substring(0, 8) + '...',
      hash: promptHash.substring(0, 16) + '...',
      bucketName: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'greenlitai.appspot.com',
      isAdminInitialized: isAdminInitialized()
    });
    
    // CRITICAL: Never return base64 - this violates IMAGE_GENERATION_AND_STORAGE.md
    // If upload fails, throw error so caller can handle it properly
    throw new Error(`Failed to upload image to Storage: ${error.message}`);
  }
}

