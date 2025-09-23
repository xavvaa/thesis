const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  jobSeekerUid: {
    type: String,
    required: true,
    index: true
  },
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  
  // File Information
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Processing Status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Personal Information
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    age: String,
    birthday: String
  },
  
  // Professional Summary
  summary: String,
  
  // Skills
  skills: [String],
  
  // Work Experience
  workExperience: [{
    company: String,
    position: String,
    duration: String,
    description: String,
    startDate: String,
    endDate: String,
    location: String
  }],
  
  // Educational Background
  education: {
    tertiary: {
      institution: String,
      degree: String,
      year: String,
    },
    secondary: {
      institution: String,
      degree: String,
      year: String,
    },
    primary: {
      institution: String,
      degree: String,
      year: String,
      
    }
  },
  
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ResumeSchema.index({ jobSeekerUid: 1, isActive: 1 });
ResumeSchema.index({ processingStatus: 1 });

// Update timestamp on save
ResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to mark as processed
ResumeSchema.methods.markAsProcessed = function(resumeData) {
  this.processingStatus = 'completed';
  this.personalInfo = resumeData.personalInfo;
  this.summary = resumeData.summary;
  this.skills = resumeData.skills;
  this.workExperience = resumeData.workExperience;
  this.education = resumeData.education;
  this.processedAt = new Date();
};

// Method to mark as failed
ResumeSchema.methods.markAsFailed = function(errorMessage) {
  this.processingStatus = 'failed';
};

// Static method to get active resume for job seeker
ResumeSchema.statics.getActiveResumeForJobSeeker = function(jobSeekerUid) {
  return this.findOne({ 
    jobSeekerUid, 
    isActive: true 
  }).sort({ uploadedAt: -1 });
};

module.exports = mongoose.model('Resume', ResumeSchema);
