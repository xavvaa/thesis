const express = require('express');
const router = express.Router();
const User = require('../models/User');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

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

module.exports = router;