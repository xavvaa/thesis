/**
 * Utility functions for handling cloud image URLs only
 */

/**
 * Get cloud image URL - accepts only cloud URLs
 * @param {string} imageData - Cloud URL only
 * @returns {string} - Cloud URL or empty string
 */
const getImageUrl = (imageData) => {
  if (!imageData) return '';
  
  // Only accept cloud URLs
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }
  
  // Reject non-cloud URLs
  console.warn('Non-cloud URL detected, ignoring:', imageData.substring(0, 50));
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
