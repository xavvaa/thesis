const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const cloudStorageService = require('../services/cloudStorageService');

// Configure multer for cloud uploads (memory storage)
const memoryStorage = multer.memoryStorage();

// Legacy disk storage removed - now using cloud storage only

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Cloud upload (memory storage)
const cloudUpload = multer({ 
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Legacy disk upload removed - now using cloud storage only

// @route   POST /api/users
// @desc    Create a new user
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { uid, email, role, firstName, lastName, middleName, companyName, emailVerified } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ uid });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      uid,
      email,
      role,
      firstName,
      lastName,
      middleName,
      companyName,
      emailVerified
    });

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', verifyToken, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', verifyToken, userController.updateProfile);

// @route   GET /api/users/:uid
// @desc    Get user by uid
// @access  Private
router.get('/:uid', verifyToken, userController.getUserByUid);


// @route   GET /api/users/check/:uid
// @desc    Check if user exists
// @access  Public
router.get('/check/:uid', userController.checkUserExists);

// @route   GET /api/users/cloud-test
// @desc    Test cloud storage configuration
// @access  Private
router.get('/cloud-test', verifyToken, async (req, res) => {
  try {
    // Test Cloudinary configuration
    const healthCheck = await cloudStorageService.healthCheck();
    
    res.json({
      success: true,
      cloudinary: healthCheck,
      message: 'Cloud storage is working'
    });
  } catch (error) {
    console.error('Cloud test error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloud storage configuration issue'
    });
  }
});

// @route   POST /api/users/profile-picture-cloud
// @desc    Upload profile picture to cloud storage (RECOMMENDED)
// @access  Private
router.post('/profile-picture-cloud', verifyToken, cloudUpload.single('profilePicture'), async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`🖼️ [${requestId}] Profile picture upload request received`);
  
  try {
    const { uid } = req.user;
    
    if (!req.file) {
      console.log(`❌ [${requestId}] No file uploaded`);
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log(`📁 [${requestId}] File details:`, {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Present' : 'Missing'
    });

    // Find user in database
    const user = await User.findOne({ uid });
    if (!user) {
      console.log(`❌ [${requestId}] User not found: ${uid}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`👤 [${requestId}] User found: ${user.email}`);

    // Upload to cloud storage with image-specific settings
    const cloudResult = await cloudStorageService.uploadImageBuffer(
      req.file.buffer,
      req.file.originalname,
      `profile-pictures/${req.user.uid}`
    );
    
    console.log(`✅ [${requestId}] Cloud upload successful:`, {
      url: cloudResult.url,
      publicId: cloudResult.publicId,
      bytes: cloudResult.bytes
    });

    // Delete old profile picture from cloud if it exists
    if (user.profilePicture && user.profilePicture.startsWith('https://res.cloudinary.com')) {
      try {
        // Extract public ID from old URL to delete it
        const urlParts = user.profilePicture.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await cloudStorageService.deleteFile(publicId);
        console.log(`🗑️ [${requestId}] Old profile picture deleted from cloud`);
      } catch (deleteError) {
        console.log(`⚠️ [${requestId}] Could not delete old profile picture:`, deleteError.message);
      }
    }

    // Update user with cloud URL
    user.profilePicture = cloudResult.url;
    await user.save();
    
    console.log(`💾 [${requestId}] User profile updated with cloud URL`);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: cloudResult.url, // Frontend expects this at root level
      data: {
        profilePicture: cloudResult.url,
        cloudUrl: cloudResult.url,
        publicId: cloudResult.publicId
      }
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Upload error:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload profile picture'
    });
  }
});

// @route   DELETE /api/users/profile-picture-cloud
// @desc    Remove profile picture from cloud storage
// @access  Private
router.delete('/profile-picture-cloud', verifyToken, async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`🗑️ [${requestId}] Profile picture removal request received`);
  
  try {
    const { uid } = req.user;
    
    const user = await User.findOne({ uid });
    if (!user) {
      console.log(`❌ [${requestId}] User not found: ${uid}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`👤 [${requestId}] User found: ${user.email}`);

    // Delete profile picture from cloud if it exists
    if (user.profilePicture && user.profilePicture.startsWith('https://res.cloudinary.com')) {
      try {
        // Extract public ID from cloud URL to delete it
        const urlParts = user.profilePicture.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await cloudStorageService.deleteFile(publicId);
        console.log(`✅ [${requestId}] Profile picture deleted from cloud`);
      } catch (deleteError) {
        console.log(`⚠️ [${requestId}] Could not delete profile picture from cloud:`, deleteError.message);
      }
    }

    // Remove profile picture from user record
    user.profilePicture = null;
    await user.save();
    
    console.log(`💾 [${requestId}] User profile updated - profile picture removed`);

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Remove error:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove profile picture'
    });
  }
});

// Legacy profile picture endpoints removed - use /profile-picture-cloud instead

module.exports = router;