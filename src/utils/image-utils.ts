/**
 * Image utility functions for handling base64 data URLs and blob URLs
 */

/**
 * Convert a base64 data URL to a blob URL for better browser performance
 * This is especially useful for large base64 images
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) {
    // Already a regular URL, return as-is
    return dataUrl;
  }

  try {
    // Extract the base64 data and mime type
    const [header, base64Data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Create blob URL
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting data URL to blob URL:', error);
    // Fallback to original data URL if conversion fails
    return dataUrl;
  }
}

/**
 * Revoke a blob URL to free up memory
 */
export function revokeBlobUrl(blobUrl: string): void {
  if (blobUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error revoking blob URL:', error);
    }
  }
}

/**
 * Check if a URL is a base64 data URL
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Check if a URL is a blob URL
 */
export function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}














































