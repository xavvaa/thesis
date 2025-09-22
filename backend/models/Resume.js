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
  
  // Parsed Resume Data (from NER service)
  parsedData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      address: String
    },
    summary: String,
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String,
      startDate: String,
      endDate: String,
      location: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String,
      fieldOfStudy: String,
      gpa: String,
      honors: String
    }],
    certifications: [String],
    languages: [String],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      duration: String
    }],
    references: [{
      name: String,
      position: String,
      company: String,
      contact: String
    }]
  },
  
  // Processing Metadata
  processingLog: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  }],
  
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

// Method to add processing log entry
ResumeSchema.methods.addProcessingLog = function(status, message, details = null) {
  this.processingLog.push({
    status,
    message,
    details
  });
};

// Method to mark as processed
ResumeSchema.methods.markAsProcessed = function(parsedData) {
  this.processingStatus = 'completed';
  this.parsedData = parsedData;
  this.processedAt = new Date();
};

// Method to mark as failed
ResumeSchema.methods.markAsFailed = function(errorMessage) {
  this.processingStatus = 'failed';
  this.addProcessingLog('failed', errorMessage);
};

// Static method to get active resume for job seeker
ResumeSchema.statics.getActiveResumeForJobSeeker = function(jobSeekerUid) {
  return this.findOne({ 
    jobSeekerUid, 
    isActive: true 
  }).sort({ uploadedAt: -1 });
};

module.exports = mongoose.model('Resume', ResumeSchema);
