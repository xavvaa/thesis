const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job'
  },
  jobSeekerUid: {
    type: String,
    required: true
  },
  employerUid: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interview', 'hired', 'rejected'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  resumeData: {
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
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String
    }],
    certifications: [String]
  },
  coverLetter: String,
  notes: String,
  // Additional fields for admin tracking
  applicantName: String,
  applicantEmail: String,
  applicantPhone: String,
  applicantAddress: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
