/**
 * Utility functions for handling image URLs and formats
 */

/**
 * Get optimized image URL - handles both cloud URLs and legacy base64
 * @param {string} imageData - Cloud URL or base64 data
 * @returns {string} - Properly formatted image URL
 */
const getImageUrl = (imageData) => {
  if (!imageData) return '';
  
  // Cloud URLs (Cloudinary) - Return as-is
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }
  
  // Data URLs - Return as-is  
  if (imageData.startsWith('data:')) {
    return imageData;
  }
  
  // Legacy base64 - Convert to data URL
  return `data:image/jpeg;base64,${imageData}`;
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

/**
 * Check if image data is base64
 * @param {string} imageData - Image data to check
 * @returns {boolean} - True if it's base64 data
 */
const isBase64 = (imageData) => {
  if (!imageData) return false;
  return imageData.startsWith('data:') || (!imageData.startsWith('http'));
};

/**
 * Convert legacy base64 resume data to use cloud URLs
 * @param {Object} resumeData - Resume data object
 * @param {string} newPhotoUrl - New cloud URL for photo
 * @returns {Object} - Updated resume data
 */
const migrateResumePhotoToCloud = (resumeData, newPhotoUrl) => {
  if (!resumeData || !resumeData.personalInfo) return resumeData;
  
  return {
    ...resumeData,
    personalInfo: {
      ...resumeData.personalInfo,
      photo: newPhotoUrl || resumeData.personalInfo.photo
    }
  };
};

module.exports = {
  getImageUrl,
  isCloudUrl,
  isBase64,
  migrateResumePhotoToCloud
};
