const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  adminName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    required: true
  },
  adminLevel: {
    type: String,
    enum: ['admin', 'superadmin'],
    required: true
  },
  department: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  canLogin: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'verified'
  },
  profileComplete: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String
  }],
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String // UID of the admin who created this user
  }
});

// Update the updatedAt field before saving
adminSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
adminSchema.index({ uid: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });

module.exports = mongoose.model('Admin', adminSchema);
