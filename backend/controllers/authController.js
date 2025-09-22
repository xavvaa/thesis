const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const admin = require('../config/firebase');
const { filterDataByRole } = require('../middleware/roleBasedAccess');

const authController = {
  // Create user profile after Firebase registration
  async createUserProfile(req, res) {
    try {
      const { uid, email, role, firstName, lastName, middleName, companyName, emailVerified } = req.body;

      // Validate required fields
      if (!uid || !email || !role) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: uid, email, and role are required'
        });
      }

      // Validate role-specific required fields
      if (role === 'jobseeker') {
        if (!firstName || !lastName) {
          return res.status(400).json({
            success: false,
            error: 'First name and last name are required for job seekers'
          });
        }
      } else if (role === 'employer') {
        if (!companyName) {
          return res.status(400).json({
            success: false,
            error: 'Company name is required for employers'
          });
        }
      }

      // Check if user already exists by UID
      const existingUser = await User.findOne({ uid });
      if (existingUser) {
        // If user already exists, return success with existing user data
        // This handles cases where Firebase user was created but profile creation was retried
        return res.status(200).json({
          success: true,
          message: 'User profile already exists',
          user: {
            uid: existingUser.uid,
            email: existingUser.email,
            role: existingUser.role,
            emailVerified: existingUser.emailVerified,
            registrationStatus: existingUser.registrationStatus
          }
        });
      }

      // Check if email is already taken
      const emailTaken = await User.isEmailTaken(email);
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: 'Email address is already registered. Please use a different email or try logging in.'
        });
      }

      // Create main user record with role-specific fields
      const userData = {
        uid,
        email: email.toLowerCase(),
        role,
        emailVerified: emailVerified || false,
        registrationStatus: 'pending',
        canLogin: false
      };

      // Add role-specific fields to main user record
      if (role === 'jobseeker') {
        userData.firstName = firstName?.trim();
        userData.lastName = lastName?.trim();
        userData.middleName = middleName?.trim() || '';
      } else if (role === 'employer') {
        userData.companyName = companyName?.trim();
      }

      const user = await User.create(userData);
      
      // Generate email verification token
      const verificationToken = user.generateVerificationToken();
      await user.save();

      // Create role-specific profile with authentication data
      let roleProfile = null;
      if (role === 'jobseeker') {
        roleProfile = await JobSeeker.create({
          userId: user._id,
          uid: user.uid,
          firstName: firstName?.trim(),
          lastName: lastName?.trim(),
          middleName: middleName?.trim() || '',
          email: email
        });
      } else if (role === 'employer') {
        roleProfile = await Employer.create({
          userId: user._id,
          uid: user.uid,
          email: email,
          companyName: companyName?.trim()
        });
      }

      // Return filtered data based on role
      const responseData = {
        ...user.toObject(),
        roleProfile: roleProfile ? roleProfile.toObject() : null
      };

      res.status(201).json({
        success: true,
        message: 'User profile created successfully. Please verify your email before logging in.',
        user: {
          ...responseData,
          requiresEmailVerification: true,
          verificationToken: verificationToken
        }
      });

    } catch (error) {
      console.error('Create user profile error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create user profile'
      });
    }
  },

  // Verify Firebase token and return user data
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken;

      // Get user from database
      const user = await User.findOne({ uid });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found in database. Please register first.'
        });
      }

      // Check if user can login (verified and registered)
      if (!user.canUserLogin()) {
        const reasons = [];
        if (!user.emailVerified) reasons.push('email not verified');
        if (user.registrationStatus !== 'verified') reasons.push('registration not verified');
        if (!user.isActive) reasons.push('account inactive');
        
        return res.status(403).json({
          success: false,
          error: `Login not allowed: ${reasons.join(', ')}`,
          requiresVerification: !user.emailVerified,
          registrationStatus: user.registrationStatus
        });
      }

      // Get role-specific profile
      let roleProfile = null;
      if (user.role === 'jobseeker') {
        roleProfile = await JobSeeker.findOne({ uid });
      } else if (user.role === 'employer') {
        roleProfile = await Employer.findOne({ uid });
      }

      res.json({
        success: true,
        user: {
          ...user.toObject(),
          roleProfile: roleProfile ? roleProfile.toObject() : null
        },
        firebaseUser: decodedToken
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  },

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const { uid } = req.user; // From auth middleware

      const user = await User.findOne({ uid });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user can login (additional security check)
      if (!user.canUserLogin()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Account requires verification.',
          requiresVerification: !user.emailVerified,
          registrationStatus: user.registrationStatus
        });
      }

      // Update last login time
      user.lastLoginAt = new Date();
      await user.save();

      // Get role-specific profile
      let roleProfile = null;
      if (user.role === 'jobseeker') {
        roleProfile = await JobSeeker.findOne({ uid });
      } else if (user.role === 'employer') {
        roleProfile = await Employer.findOne({ uid });
      }

      // Calculate profile completion if role profile exists
      let profileCompletion = 0;
      if (roleProfile && typeof roleProfile.getProfileCompletionPercentage === 'function') {
        profileCompletion = roleProfile.getProfileCompletionPercentage();
      }

      res.json({
        success: true,
        user: {
          ...user.toObject(),
          roleProfile: roleProfile ? roleProfile.toObject() : null,
          profileCompletion,
          permissions: user.permissions,
          verificationStatus: {
            emailVerified: user.emailVerified,
            registrationStatus: user.registrationStatus,
            canLogin: user.canLogin
          }
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user profile'
      });
    }
  },

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const { uid } = req.user; // From auth middleware
      const updateData = req.body;

      // Find user
      const user = await User.findOne({ uid });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Validate role-specific updates
      if (user.role === 'jobseeker' && updateData.companyName) {
        return res.status(400).json({
          success: false,
          error: 'Job seekers cannot have company information'
        });
      }
      
      if (user.role === 'employer' && (updateData.firstName || updateData.lastName)) {
        return res.status(400).json({
          success: false,
          error: 'Employers use company name, not personal names'
        });
      }

      // Update main user fields based on role
      const allowedUserFields = user.role === 'jobseeker' 
        ? ['firstName', 'lastName', 'middleName', 'emailVerified']
        : ['companyName', 'emailVerified'];
        
      allowedUserFields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = typeof updateData[field] === 'string' ? updateData[field].trim() : updateData[field];
        }
      });

      await user.save();

      // Update role-specific profile
      let roleProfile = null;
      if (user.role === 'jobseeker') {
        roleProfile = await JobSeeker.findOne({ uid });
        if (roleProfile && updateData.jobseekerData) {
          // Sync basic fields with User model
          if (updateData.firstName) roleProfile.firstName = updateData.firstName.trim();
          if (updateData.lastName) roleProfile.lastName = updateData.lastName.trim();
          if (updateData.middleName !== undefined) roleProfile.middleName = updateData.middleName.trim();
          
          // Update other jobseeker-specific fields
          Object.assign(roleProfile, updateData.jobseekerData);
          await roleProfile.save();
        }
      } else if (user.role === 'employer') {
        roleProfile = await Employer.findOne({ uid });
        if (roleProfile && updateData.employerData) {
          // Sync company name with User model
          if (updateData.companyName) roleProfile.companyName = updateData.companyName.trim();
          
          // Update other employer-specific fields
          Object.assign(roleProfile, updateData.employerData);
          await roleProfile.save();
        }
      }

      // Calculate updated profile completion
      let profileCompletion = 0;
      if (roleProfile && typeof roleProfile.getProfileCompletionPercentage === 'function') {
        profileCompletion = roleProfile.getProfileCompletionPercentage();
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...user.toObject(),
          roleProfile: roleProfile ? roleProfile.toObject() : null,
          profileCompletion
        }
      });

    } catch (error) {
      console.error('Update user profile error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update user profile'
      });
    }
  },

  // Verify email with token
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Verification token is required'
        });
      }

      // Find user by verification token
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired verification token'
        });
      }

      // Verify the user's email
      user.verifyEmail();
      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.',
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          registrationStatus: user.registrationStatus,
          canLogin: user.canLogin
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to verify email'
      });
    }
  },

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email address is required'
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found with this email address'
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          error: 'Email is already verified'
        });
      }

      // Generate new verification token
      const verificationToken = user.generateVerificationToken();
      await user.save();

      res.json({
        success: true,
        message: 'Verification email sent successfully',
        verificationToken: verificationToken
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to resend verification email'
      });
    }
  },

  // Check if email exists (for login validation and cross-role conflict detection)
  async checkEmailExists(req, res) {
    try {
      const { email } = req.params;
      const { role } = req.query; // Optional role parameter for cross-role checking
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email address is required'
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'No account found with this email address. Please register first.',
          exists: false
        });
      }

      // Check for cross-role conflict if role is provided
      let crossRoleConflict = false;
      if (role && user.role !== role) {
        crossRoleConflict = true;
      }

      res.json({
        success: true,
        exists: true,
        crossRoleConflict,
        user: {
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          registrationStatus: user.registrationStatus,
          canLogin: user.canLogin,
          requiresVerification: !user.emailVerified
        }
      });

    } catch (error) {
      console.error('Check email exists error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check email'
      });
    }
  }
};

module.exports = authController;
