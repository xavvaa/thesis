const mongoose = require('mongoose');

const JobSeekerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  uid: {
    type: String,
    required: true,
    unique: true
  },
  
  // Authentication & Basic Info (synced with User model)
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleName: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  
  // Extended Personal Information
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  address: {
    street: String,
    city: String,
    province: String,
    zipCode: String,
    country: { type: String, default: 'Philippines' }
  },
  
  // Professional Information
  jobTitle: {
    type: String
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    location: String
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    gpa: Number
  }],
  
  // Resume and Portfolio
  currentResumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  portfolioUrl: {
    type: String
  },
  linkedInUrl: {
    type: String
  },
  
  // Job Preferences
  desiredSalaryMin: {
    type: Number
  },
  desiredSalaryMax: {
    type: Number
  },
  preferredJobTypes: [{
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
  }],
  preferredLocations: [String],
  remoteWork: {
    type: Boolean,
    default: false
  },
  
  // Profile Status & Permissions
  profileComplete: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Role-specific permissions
  permissions: {
    type: [String],
    default: ['view_jobs', 'apply_jobs', 'manage_profile', 'upload_resume', 'view_applications']
  },
  
  // Privacy & Visibility Settings
  profileVisibility: {
    type: String,
    enum: ['public', 'employers_only', 'private'],
    default: 'employers_only'
  },
  allowContactFromEmployers: {
    type: Boolean,
    default: true
  },
  
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
JobSeekerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate profile completion percentage
  const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'jobTitle'];
  const optionalFields = ['dateOfBirth', 'gender', 'address.city', 'skills', 'experience'];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  requiredFields.forEach(field => {
    if (this[field] && this[field].toString().trim()) completedRequired++;
  });
  
  optionalFields.forEach(field => {
    const fieldValue = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj?.[key], this) : this[field];
    if (fieldValue && (Array.isArray(fieldValue) ? fieldValue.length > 0 : fieldValue.toString().trim())) {
      completedOptional++;
    }
  });
  
  // Profile is complete if all required fields are filled and at least 50% of optional fields
  this.profileComplete = (completedRequired === requiredFields.length) && 
                        (completedOptional >= Math.ceil(optionalFields.length * 0.5));
  
  next();
});

// Method to check if user can perform specific action
JobSeekerSchema.methods.canPerform = function(action) {
  if (!this.isActive) return false;
  return this.permissions.includes(action);
};

// Method to get public profile data (respects privacy settings)
JobSeekerSchema.methods.getPublicProfile = function() {
  const baseProfile = {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    jobTitle: this.jobTitle,
    skills: this.skills,
    profileComplete: this.profileComplete
  };
  
  if (this.profileVisibility === 'public') {
    return {
      ...baseProfile,
      experience: this.experience,
      education: this.education,
      address: { city: this.address?.city, province: this.address?.province }
    };
  } else if (this.profileVisibility === 'employers_only') {
    return baseProfile;
  }
  
  return { _id: this._id, profileComplete: this.profileComplete };
};

// Method to get profile completion percentage
JobSeekerSchema.methods.getProfileCompletionPercentage = function() {
  const allFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'jobTitle', 'dateOfBirth', 'gender', 'address.city', 'skills', 'experience'];
  let completed = 0;
  
  allFields.forEach(field => {
    const fieldValue = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj?.[key], this) : this[field];
    if (fieldValue && (Array.isArray(fieldValue) ? fieldValue.length > 0 : fieldValue.toString().trim())) {
      completed++;
    }
  });
  
  return Math.round((completed / allFields.length) * 100);
};

module.exports = mongoose.model('JobSeeker', JobSeekerSchema);
