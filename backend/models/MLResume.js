const mongoose = require('mongoose');

const MLResumeSchema = new mongoose.Schema({
  // Reference to original resume
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    unique: true
  },
  
  // Job seeker reference for easy querying
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
  
  // Filtered data for ML processing
  name: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
MLResumeSchema.index({ jobSeekerUid: 1, isActive: 1 });
MLResumeSchema.index({ resumeId: 1 });
MLResumeSchema.index({ skills: 1 }); // For skill-based searches

// Update timestamp on save
MLResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create or update ML resume from Resume data
MLResumeSchema.statics.createOrUpdateFromResume = async function(resumeData) {
  try {
    const mlResumeData = {
      resumeId: resumeData._id,
      jobSeekerUid: resumeData.jobSeekerUid,
      jobSeekerId: resumeData.jobSeekerId,
      name: resumeData.personalInfo?.fullName || '',
      skills: resumeData.skills || [],
      isActive: true,
      updatedAt: new Date()
    };

    // Use upsert to create or update
    const result = await this.findOneAndUpdate(
      { resumeId: resumeData._id },
      mlResumeData,
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true 
      }
    );

    return result;
  } catch (error) {
    console.error('Error in MLResume.createOrUpdateFromResume:', error);
    throw error;
  }
};

// Static method to get all active ML resumes
MLResumeSchema.statics.getAllActive = function() {
  return this.find({ isActive: true }).sort({ updatedAt: -1 });
};

// Static method to search by skills
MLResumeSchema.statics.searchBySkills = function(skillsArray) {
  return this.find({ 
    skills: { $in: skillsArray },
    isActive: true 
  }).sort({ updatedAt: -1 });
};

// Static method to get ML resume by job seeker
MLResumeSchema.statics.getByJobSeeker = function(jobSeekerUid) {
  return this.findOne({ 
    jobSeekerUid, 
    isActive: true 
  }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('MLResume', MLResumeSchema);
