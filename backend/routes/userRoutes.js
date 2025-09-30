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

// Legacy disk storage for backward compatibility
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.uid + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Legacy disk upload
const upload = multer({ 
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
      error: error.message,
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
      uid: req.user.uid
    });

    // Validate Cloudinary configuration
    try {
      cloudStorageService.validateConfig();
      console.log(`✅ [${requestId}] Cloudinary config validated`);
    } catch (configError) {
      console.error(`❌ [${requestId}] Cloudinary config error:`, configError);
      return res.status(500).json({
        success: false,
        error: 'Cloud storage not configured properly'
      });
    }

    // Upload to cloud storage
    console.log(`☁️ [${requestId}] Uploading to cloud storage...`);
    const cloudResult = await cloudStorageService.uploadBuffer(
      req.file.buffer,
      req.file.originalname,
      `profile-pictures/${req.user.uid}`
    );
    
    console.log(`✅ [${requestId}] Cloud upload successful:`, {
      url: cloudResult.url,
      publicId: cloudResult.publicId
    });

    // Update user profile with cloud URL
    console.log(`💾 [${requestId}] Updating user profile in database...`);
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { profilePicture: cloudResult.url },
      { new: true }
    );

    if (!user) {
      console.log(`❌ [${requestId}] User not found in database`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ [${requestId}] Profile picture saved successfully`);
    res.json({
      success: true,
      profilePicture: cloudResult.url,
      message: 'Profile picture uploaded successfully'
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Cloud profile picture upload error:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to upload profile picture: ${error.message}`
    });
  }
});

// @route   POST /api/users/profile-picture
// @desc    Upload profile picture (legacy)
// @access  Private
router.post('/profile-picture', verifyToken, upload.single('profilePicture'), userController.uploadProfilePicture);

// @route   DELETE /api/users/profile-picture
// @desc    Remove profile picture
// @access  Private
router.delete('/profile-picture', verifyToken, userController.removeProfilePicture);

module.exports = router;