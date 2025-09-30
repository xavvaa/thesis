/**
 * Utility functions for handling images in the application
 */

/**
 * Formats a Base64 image string to be used as a data URL
 * @param imageData - Base64 string or data URL
 * @returns Properly formatted data URL
 */
export const getImageSrc = (imageData: string | null | undefined): string => {
  if (!imageData) return '';
  
  // If it's already a data URL, return as is
  if (imageData.startsWith('data:')) {
    return imageData;
  }
  
  // If it's a cloud URL (Cloudinary, AWS, etc.), return as is
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }
  
  // If it's a base64 string, convert to data URL (legacy support)
  return `data:image/jpeg;base64,${imageData}`;
};

/**
 * Gets initials from a full name
 * @returns Uppercase initials
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

/**
 * Validates if a string is a valid Base64 image
 * @param str - String to validate
 * @returns True if valid Base64 image
 */
export const isValidBase64Image = (str: string): boolean => {
  if (!str) return false;
  
  // Check if it's a data URL
  if (str.startsWith('data:image/')) {
    return true;
  }
  
  // Check if it's a valid Base64 string
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};
