/**
 * Utility functions for handling cloud image URLs only
 */

/**
 * Get image URL - accepts cloud URLs and data URLs for backward compatibility
 * @param {string} imageData - Cloud URL or data URL
 * @returns {string} - Image URL or empty string
 */
const getImageUrl = (imageData) => {
  if (!imageData) return '';
  
  // Accept cloud URLs (preferred)
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }
  
  // Accept data URLs for backward compatibility (existing Base64 photos)
  if (imageData.startsWith('data:')) {
    return imageData;
  }
  
  // Convert legacy Base64 to data URL for backward compatibility
  if (imageData.length > 100 && !imageData.includes('http') && !imageData.includes('data:')) {
    return `data:image/jpeg;base64,${imageData}`;
  }
  
  // Reject invalid data
  console.warn('Invalid image data detected, ignoring:', imageData.substring(0, 50));
  return '';
};

/**
 * Check if image data is a cloud URL
 * @param {string} imageData - Image data to check
 * @returns {boolean} - True if it's a cloud URL
 */
const isCloudUrl = (imageData) => {
  if (!imageData) return false;
  return imageData.startsWith('http://') || imageData.startsWith('https://');
};

module.exports = {
  getImageUrl,
  isCloudUrl
};