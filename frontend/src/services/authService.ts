const API_BASE_URL = 'http://localhost:3001/api'; // Update with your actual API URL

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const authService = {
  // Verify Email
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // Mock email verification for now - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful verification
      console.log('Mock email verification for token:', token);
      return { 
        success: true, 
        message: 'Email verified successfully!' 
      };
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Resend Verification Email
  async resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // Mock resend verification for now - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful resend
      console.log('Mock resend verification email to:', email);
      return { 
        success: true, 
        message: 'Verification email sent successfully!' 
      };
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Forgot Password
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send password reset email');
      }

      return { success: true, ...data };
    } catch (error) {
      console.error('Forgot password error:', error);
      return handleNetworkError(error);
    }
  },

  // Reset Password
  async resetPassword(
    token: string, 
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(
          data.error || 
          data.message || 
          `Failed to reset password (${response.status} ${response.statusText})`
        );
      }

      return { success: true, ...data };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  }
};

// Enhanced error handling for network issues
const handleNetworkError = (error: any): ApiResponse<never> => {
  console.error('Network error:', error);
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return {
      success: false,
      error: 'Unable to connect to the server. Please check your internet connection and try again.'
    };
  }
  return {
    success: false,
    error: error.message || 'An unexpected error occurred. Please try again.'
  };
};

export default authService;
