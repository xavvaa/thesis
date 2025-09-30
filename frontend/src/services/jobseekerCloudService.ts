class JobseekerCloudService {
  private baseUrl = 'http://localhost:3001/api';

  // Upload profile photo to cloud storage
  async uploadProfilePhoto(file: File): Promise<{ success: boolean; data?: { cloudUrl: string }; message?: string }> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profilePhoto', file);

      // Get Firebase auth token
      const { auth } = await import('../config/firebase');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();

      const response = await fetch(`${this.baseUrl}/jobseekers/upload-profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Profile photo upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload photo'
      };
    }
  }

  // Get optimized image URL for display
  getOptimizedImageUrl(cloudUrl: string, options: { width?: number; height?: number } = {}): string {
    if (!cloudUrl) return '';
    
    // If it's already a cloud URL, return as-is (Cloudinary handles optimization)
    if (cloudUrl.startsWith('http://') || cloudUrl.startsWith('https://')) {
      return cloudUrl;
    }
    
    // If it's a data URL (base64), return as-is for backward compatibility
    if (cloudUrl.startsWith('data:')) {
      return cloudUrl;
    }
    
    // Legacy base64 - convert to data URL
    return `data:image/jpeg;base64,${cloudUrl}`;
  }
}

export default new JobseekerCloudService();
