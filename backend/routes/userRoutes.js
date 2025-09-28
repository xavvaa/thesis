const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
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

const upload = multer({ 
  storage: storage,
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

// @route   POST /api/users/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', verifyToken, upload.single('profilePicture'), userController.uploadProfilePicture);

// @route   DELETE /api/users/profile-picture
// @desc    Remove profile picture
// @access  Private
router.delete('/profile-picture', verifyToken, userController.removeProfilePicture);

module.exports = router;