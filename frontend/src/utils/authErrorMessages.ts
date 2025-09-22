export interface AuthErrorDetails {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  actionButton?: {
    text: string;
    action: 'signup' | 'login' | 'forgot-password' | 'verify-email' | 'retry';
  };
}

export const getAuthErrorDetails = (errorCode: string, errorMessage: string, userRole: 'employer' | 'jobseeker'): AuthErrorDetails => {
  // Firebase Auth error codes
  switch (errorCode) {
    case 'auth/user-not-found':
      return {
        title: 'Account Not Found',
        message: `No ${userRole} account exists with this email address. Would you like to create a new account?`,
        type: 'warning',
        actionButton: {
          text: 'Create Account',
          action: 'signup'
        }
      };

    case 'auth/wrong-password':
      return {
        title: 'Incorrect Password',
        message: 'The password you entered is incorrect. Please check your password and try again, or reset your password if you\'ve forgotten it.',
        type: 'error',
        actionButton: {
          text: 'Reset Password',
          action: 'forgot-password'
        }
      };

    case 'auth/invalid-email':
      return {
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        type: 'error'
      };

    case 'auth/user-disabled':
      return {
        title: 'Account Disabled',
        message: 'Your account has been disabled. Please contact support for assistance.',
        type: 'error'
      };

    case 'auth/too-many-requests':
      return {
        title: 'Too Many Attempts',
        message: 'Too many failed login attempts. Please wait a moment before trying again, or reset your password.',
        type: 'warning',
        actionButton: {
          text: 'Reset Password',
          action: 'forgot-password'
        }
      };

    case 'auth/email-already-in-use':
      return {
        title: 'Email Already Registered',
        message: `An account with this email already exists. Please sign in instead or use a different email address.`,
        type: 'warning',
        actionButton: {
          text: 'Sign In',
          action: 'login'
        }
      };

    case 'auth/weak-password':
      return {
        title: 'Weak Password',
        message: 'Your password should be at least 6 characters long and include a mix of letters, numbers, and symbols.',
        type: 'warning'
      };

    case 'auth/invalid-credential':
      return {
        title: 'Invalid Login Credentials',
        message: 'The email or password you entered is incorrect. Please check your credentials and try again.',
        type: 'error',
        actionButton: {
          text: 'Reset Password',
          action: 'forgot-password'
        }
      };

    case 'auth/network-request-failed':
      return {
        title: 'Connection Error',
        message: 'Unable to connect to our servers. Please check your internet connection and try again.',
        type: 'error',
        actionButton: {
          text: 'Try Again',
          action: 'retry'
        }
      };

    case 'auth/popup-closed-by-user':
      return {
        title: 'Sign-in Cancelled',
        message: 'Google sign-in was cancelled. Please try again if you want to continue.',
        type: 'info'
      };

    case 'auth/popup-blocked':
      return {
        title: 'Popup Blocked',
        message: 'Your browser blocked the sign-in popup. Please allow popups for this site and try again.',
        type: 'warning',
        actionButton: {
          text: 'Try Again',
          action: 'retry'
        }
      };

    case 'auth/unauthorized-domain':
      return {
        title: 'Domain Not Authorized',
        message: 'This domain is not authorized for authentication. Please contact support.',
        type: 'error'
      };

    // Custom application errors
    case 'account-not-verified':
      return {
        title: 'Email Not Verified',
        message: 'Please verify your email address before signing in. Check your inbox for the verification link.',
        type: 'warning',
        actionButton: {
          text: 'Resend Verification',
          action: 'verify-email'
        }
      };

    case 'role-mismatch':
      return {
        title: 'Wrong Account Type',
        message: errorMessage || `This email is registered for a different account type. Please use the correct login page.`,
        type: 'warning'
      };

    case 'account-pending-verification':
      return {
        title: 'Account Under Review',
        message: 'Your account is currently under review. You will receive an email once verification is complete.',
        type: 'info'
      };

    case 'documents-required':
      return {
        title: 'Documents Required',
        message: 'Please complete your account setup by uploading the required documents.',
        type: 'warning'
      };

    // Generic network/server errors
    case 'network-error':
      return {
        title: 'Network Error',
        message: 'Unable to connect to our servers. Please check your internet connection and try again.',
        type: 'error',
        actionButton: {
          text: 'Try Again',
          action: 'retry'
        }
      };

    case 'server-error':
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again in a moment.',
        type: 'error',
        actionButton: {
          text: 'Try Again',
          action: 'retry'
        }
      };

    default:
      // Fallback for unknown errors
      return {
        title: 'Authentication Error',
        message: errorMessage || 'An unexpected error occurred. Please try again.',
        type: 'error',
        actionButton: {
          text: 'Try Again',
          action: 'retry'
        }
      };
  }
};

// Helper function to extract error code from Firebase error
export const extractErrorCode = (error: any): string => {
  if (error?.code) {
    return error.code;
  }
  
  // Check for common error patterns in error messages
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('user not found') || message.includes('no user record')) {
    return 'auth/user-not-found';
  }
  
  if (message.includes('wrong password') || message.includes('incorrect password')) {
    return 'auth/wrong-password';
  }
  
  if (message.includes('email already in use') || message.includes('already exists')) {
    return 'auth/email-already-in-use';
  }
  
  if (message.includes('invalid email')) {
    return 'auth/invalid-email';
  }
  
  if (message.includes('weak password')) {
    return 'auth/weak-password';
  }
  
  if (message.includes('too many requests') || message.includes('too many attempts')) {
    return 'auth/too-many-requests';
  }
  
  if (message.includes('network') || message.includes('connection')) {
    return 'network-error';
  }
  
  if (message.includes('role') || message.includes('account type')) {
    return 'role-mismatch';
  }
  
  if (message.includes('not verified') || message.includes('verify')) {
    return 'account-not-verified';
  }
  
  return 'unknown-error';
};
