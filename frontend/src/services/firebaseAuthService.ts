import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup,
  reload,
  fetchSignInMethodsForEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';

// API URL for backend integration
const API_BASE_URL = 'http://localhost:3001/api';

export interface AuthResponse {
  success: boolean;
  user?: User | null;
  error?: string;
  message?: string;
}

export interface UserData {
  uid: string;
  email: string;
  role: 'jobseeker' | 'employer';
  firstName?: string;
  lastName?: string;
  middleName?: string;
  companyName?: string;
  emailVerified: boolean;
}

// Helper functions for database interaction
const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/check/${uid}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Check user error:', error);
    return false;
  }
};

const saveUserToDatabase = async (userData: Partial<UserData>): Promise<void> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/auth/create-profile`, { // Corrected endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save user data to database');
    }
  } catch (error) {
    console.error('Save user error:', error);
    // We don't throw here to prevent blocking the registration process
  }
};

const getUserFromDatabase = async (uid: string): Promise<UserData | null> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

const updateUserInDatabase = async (uid: string, userData: Partial<UserData>): Promise<void> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

const firebaseAuthService = {
  // Register a new user with email and password
  async registerWithEmailPassword(
    email: string, 
    password: string, 
    userData: Partial<UserData>
  ): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      if (userData.firstName && userData.lastName) {
        await updateProfile(user, {
          displayName: `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}`.trim()
        });
      } else if (userData.companyName) {
        await updateProfile(user, {
          displayName: userData.companyName
        });
      }
      
      await sendEmailVerification(user);
      
      await saveUserToDatabase({
        uid: user.uid,
        email: user.email || email,
        emailVerified: user.emailVerified,
        ...userData
      });
      
      return {
        success: true,
        user,
        message: 'Registration successful! Please verify your email.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Failed to register user'
      };
    }
  },
  
  // Sign in with email and password
  async signInWithEmailPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      await getUserFromDatabase(user.uid);
      
      return {
        success: true,
        user,
        message: 'Sign in successful!'
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in'
      };
    }
  },
  
  // Check what sign-in methods exist for an email
  async checkSignInMethods(email: string): Promise<{ success: boolean; methods: string[]; error?: string }> {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return {
        success: true,
        methods
      };
    } catch (error: any) {
      console.error('Check sign-in methods error:', error);
      return {
        success: false,
        methods: [],
        error: error.message || 'Failed to check sign-in methods'
      };
    }
  },

  // Sign in with Google (without auto-creating backend user)
  async signInWithGoogle(role: 'jobseeker' | 'employer'): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;
      
      // Don't automatically create backend user - let the frontend handle this
      // This prevents the race condition where backend creates user before frontend checks
      
      return {
        success: true,
        user,
        message: 'Google sign in successful!'
      };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with Google'
      };
    }
  },
  
  // Sign out
  async signOut(): Promise<AuthResponse> {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Sign out successful!'
      };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  },
  
  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('Firebase auth service: Sending password reset email to:', email);
      
      // Try without action code settings first to see if that's the issue
      await sendPasswordResetEmail(auth, email);
      
      console.log('Firebase auth service: Password reset email sent successfully');
      return {
        success: true,
        message: 'Password reset email sent!'
      };
    } catch (error: any) {
      console.error('Firebase auth service - Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to send password reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/missing-email') {
        errorMessage = 'Email address is required.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // Resend verification email
  async resendVerificationEmail(): Promise<AuthResponse> {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found'
        };
      }
      
      await sendEmailVerification(user);
      return {
        success: true,
        message: 'Verification email sent!'
      };
    } catch (error: any) {
      console.error('Verification email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      };
    }
  },

  // Send email verification (alias for resendVerificationEmail for compatibility)
  async sendEmailVerification(email?: string): Promise<AuthResponse> {
    return this.resendVerificationEmail();
  },

  // Confirm password reset
  async confirmPasswordReset(code: string, newPassword: string): Promise<AuthResponse> {
    try {
      const { confirmPasswordReset } = await import('firebase/auth');
      await confirmPasswordReset(auth, code, newPassword);
      return {
        success: true,
        message: 'Password reset successfully!'
      };
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password'
      };
    }
  },
  
  // Verify email with token (placeholder)
  async verifyEmail(token: string): Promise<AuthResponse> {
    return {
      success: true,
      message: 'Email verified successfully (client-side placeholder)'
    };
  },
  
  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Add the helper functions to the exported object
  updateUserInDatabase,
  getUserFromDatabase,

  // Check if user has password authentication
  async checkUserAuthMethods(): Promise<{ hasPassword: boolean; providers: string[] }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        console.log('No current user or email found');
        return { hasPassword: false, providers: [] };
      }

      console.log('Current user:', {
        email: user.email,
        providerId: user.providerId,
        providerData: user.providerData
      });

      const methods = await fetchSignInMethodsForEmail(auth, user.email);
      console.log('User sign-in methods for', user.email, ':', methods);
      console.log('Provider data:', user.providerData);
      
      // Check provider data for more reliable detection
      const hasGoogleProvider = user.providerData.some(provider => provider.providerId === 'google.com');
      const hasEmailProvider = user.providerData.some(provider => provider.providerId === 'password');
      
      console.log('Has Google provider:', hasGoogleProvider);
      console.log('Has email provider:', hasEmailProvider);
      
      // If fetchSignInMethodsForEmail returns empty but user exists, 
      // check if they have a password provider in providerData
      let hasPassword = methods.includes('password') || hasEmailProvider;
      
      // If no methods detected but user is authenticated with email, assume password auth
      if (methods.length === 0 && !hasGoogleProvider && user.email) {
        console.log('No methods detected but user authenticated with email, assuming password auth');
        hasPassword = true;
      }
      
      console.log('Final hasPassword decision:', hasPassword);
      
      return {
        hasPassword: hasPassword,
        providers: methods
      };
    } catch (error) {
      console.error('Error checking auth methods:', error);
      // If there's an error, assume they have password auth to show the form
      return { hasPassword: true, providers: [] };
    }
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      console.log('Starting password update process...');
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        console.error('No authenticated user found for password update');
        return {
          success: false,
          error: 'No authenticated user found. Please sign in again.'
        };
      }

      // Check if user has password authentication
      const authMethods = await this.checkUserAuthMethods();
      console.log('User auth methods:', authMethods);

      if (!authMethods.hasPassword) {
        console.log('User signed up with Google OAuth, no password set');
        return {
          success: false,
          error: 'Your account was created with Google sign-in. You cannot change your password here. Please use Google Account settings to manage your password.'
        };
      }
      
      console.log('User has password auth, attempting re-authentication...');
      
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      console.log('Re-authentication successful, updating password...');
      
      // Update password
      await updatePassword(user, newPassword);
      
      console.log('Password updated successfully');
      return {
        success: true,
        message: 'Password updated successfully!'
      };
    } catch (error: any) {
      console.error('Update password error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to update password';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak (minimum 6 characters required)';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign back in before changing your password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/user-mismatch') {
        errorMessage = 'Authentication error. Please try signing out and back in.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User account not found. Please sign in again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  reloadUser: async (): Promise<void> => {
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
      }
    } catch (error) {
      console.error('Reload user error:', error);
      throw error;
    }
  }
};

export default firebaseAuthService;