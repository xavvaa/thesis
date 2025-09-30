const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');

const userController = {
  // Get user profile (aligned with frontend expectations)
  async getProfile(req, res) {
    try {
      const { uid } = req.user; // From auth middleware

      const user = await User.findOne({ uid });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
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
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user profile'
      });
    }
  },

  // Update user profile (aligned with frontend expectations)
  async updateProfile(req, res) {
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

      // Update main user fields
      const userFields = ['firstName', 'lastName', 'middleName', 'companyName', 'emailVerified'];
      userFields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });

      await user.save();

      // Update role-specific profile
      let roleProfile = null;
      if (user.role === 'jobseeker') {
        roleProfile = await JobSeeker.findOne({ uid });
        if (roleProfile && updateData.jobseekerData) {
          Object.assign(roleProfile, updateData.jobseekerData);
          await roleProfile.save();
        }
      } else if (user.role === 'employer') {
        roleProfile = await Employer.findOne({ uid });
        if (roleProfile && updateData.employerData) {
          Object.assign(roleProfile, updateData.employerData);
          await roleProfile.save();
        }
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...user.toObject(),
          roleProfile: roleProfile ? roleProfile.toObject() : null
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update user profile'
      });
    }
  },

  // Check if user exists (already exists in userRoutes.js but keeping for consistency)
  async checkUserExists(req, res) {
    try {
      const { uid } = req.params;
      const user = await User.findOne({ uid });
      
      res.json({
        success: true,
        exists: !!user,
        user: user ? {
          uid: user.uid,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified
        } : null
      });
    } catch (error) {
      console.error('Check user exists error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check user existence'
      });
    }
  },

  // Get user by UID (for admin or specific use cases)
  async getUserByUid(req, res) {
    try {
      const { uid } = req.params;
      
      const user = await User.findOne({ uid });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
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
        }
      });

    } catch (error) {
      console.error('Get user by UID error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user'
      });
    }
  }
};

// Upload profile picture
userController.uploadProfilePicture = async (req, res) => {
  try {
    const { uid } = req.user;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete old profile picture if it exists (legacy file path cleanup)
    if (user.profilePicture && !user.profilePicture.startsWith('data:')) {
      const fs = require('fs');
      const path = require('path');
      const oldFilePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Convert uploaded file to Base64 and store in database
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', 'uploads', 'profile-pictures', req.file.filename);
    
    // Read the uploaded file and convert to Base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const profilePictureData = `data:${mimeType};base64,${base64Image}`;
    
    // Store Base64 data in database (cross-device compatible)
    user.profilePicture = profilePictureData;
    await user.save();
    
    // Clean up the temporary file (no longer needed)
    fs.unlinkSync(filePath);
    
    console.log(`✅ Profile picture stored as Base64 for user: ${uid} (${profilePictureData.length} chars)`);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureData
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload profile picture'
    });
  }
};

// Remove profile picture
userController.removeProfilePicture = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete profile picture file if it exists
    if (user.profilePicture) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove profile picture from user record
    user.profilePicture = null;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove profile picture'
    });
  }
};

module.exports = userController;
