const mongoose = require('mongoose');

const EmployerSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true
  },
  
  // Company Information
  companyName: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length >= 2;
      },
      message: 'Company name must be at least 2 characters long'
    }
  },
  companyDescription: {
    type: String
  },
  industry: {
    type: String
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  foundedYear: {
    type: Number
  },
  website: {
    type: String
  },
  
  // Contact Information
  contactPerson: {
    firstName: String,
    lastName: String,
    position: String,
    email: String,
    phoneNumber: String
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    province: String,
    zipCode: String,
    country: { type: String, default: 'Philippines' }
  },
  
  // Verification and Legal
  businessRegistrationNumber: {
    type: String
  },
  taxIdentificationNumber: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Document verification array
  documents: [{
    documentType: {
      type: String,
      enum: [
        'companyProfile',
        'businessPermit',
        'philjobnetRegistration',
        'doleNoPendingCase'
      ],
      required: true
    },
    documentName: {
      type: String,
      required: true
    },
    cloudUrl: {
      type: String, // Cloud storage URL (Cloudinary, AWS, etc.)
      required: true
    },
    cloudPublicId: {
      type: String, // Cloud storage public ID for management
      required: false
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    expiryDate: {
      type: Date
    },
    documentNumber: {
      type: String
    },
    // Individual document verification status
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'requires_resubmission'],
      default: 'pending'
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: String // Admin UID who verified this document
    },
    rejectionReason: {
      type: String
    },
    adminNotes: {
      type: String
    }
  }],
  
  // Overall document verification status
  documentVerificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'requires_resubmission'],
    default: 'pending'
  },
  documentVerifiedAt: {
    type: Date
  },
  documentVerifiedBy: {
    type: String // Admin UID who verified documents
  },
  documentRejectionReason: {
    type: String
  },
  documentAdminNotes: {
    type: String
  },
  
  // Social Media and Online Presence
  socialMedia: {
    linkedin: String,
    facebook: String,
    twitter: String,
    instagram: String
  },
  
  // Company Culture and Benefits
  benefits: [String],
  companyValues: [String],
  workEnvironment: {
    type: String,
    enum: ['remote', 'hybrid', 'on-site', 'flexible']
  },
  
  // Job Posting Preferences
  jobPostingCredits: {
    type: Number,
    default: 0
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
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
    default: ['post_jobs', 'view_applications', 'manage_company', 'verify_documents', 'contact_jobseekers']
  },
  
  // Account Status & Verification
  accountStatus: {
    type: String,
    enum: ['pending', 'verified', 'suspended', 'rejected'],
    default: 'pending'
  },
  verificationNotes: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
EmployerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate profile completion
  const requiredFields = ['companyName', 'email', 'industry', 'companySize', 'contactPerson.firstName', 'contactPerson.email'];
  const optionalFields = ['companyDescription', 'website', 'foundedYear', 'address.city', 'businessRegistrationNumber'];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  requiredFields.forEach(field => {
    const fieldValue = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj?.[key], this) : this[field];
    if (fieldValue && fieldValue.toString().trim()) completedRequired++;
  });
  
  optionalFields.forEach(field => {
    const fieldValue = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj?.[key], this) : this[field];
    if (fieldValue && fieldValue.toString().trim()) completedOptional++;
  });
  
  // Profile is complete if all required fields are filled and at least 60% of optional fields
  this.profileComplete = (completedRequired === requiredFields.length) && 
                        (completedOptional >= Math.ceil(optionalFields.length * 0.6)) &&
                        this.accountStatus === 'verified';
  
  next();
});

// Method to check if employer can perform specific action
EmployerSchema.methods.canPerform = function(action) {
  if (!this.isActive || this.accountStatus === 'suspended') return false;
  if (action === 'post_jobs' && !['approved', 'verified'].includes(this.accountStatus)) return false;
  return this.permissions.includes(action);
};

// Method to get public company profile
EmployerSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    companyName: this.companyName,
    companyDescription: this.companyDescription,
    industry: this.industry,
    companySize: this.companySize,
    foundedYear: this.foundedYear,
    website: this.website,
    email: this.email,
    contactPerson: this.contactPerson,
    address: this.address,
    socialMedia: this.socialMedia,
    benefits: this.benefits,
    companyValues: this.companyValues,
    workEnvironment: this.workEnvironment,
    documents: this.documents || [],
    documentVerificationStatus: this.documentVerificationStatus,
    isVerified: this.accountStatus === 'verified',
    profileComplete: this.profileComplete
  };
};

// Method to get profile completion percentage
EmployerSchema.methods.getProfileCompletionPercentage = function() {
  const allFields = ['companyName', 'email', 'industry', 'companySize', 'contactPerson.firstName', 'contactPerson.email', 'companyDescription', 'website', 'foundedYear', 'address.city', 'businessRegistrationNumber'];
  let completed = 0;
  
  allFields.forEach(field => {
    const fieldValue = field.includes('.') ? 
      field.split('.').reduce((obj, key) => obj?.[key], this) : this[field];
    if (fieldValue && fieldValue.toString().trim()) completed++;
  });
  
  return Math.round((completed / allFields.length) * 100);
};

// Method to check if employer can access jobseeker profiles
EmployerSchema.methods.canAccessJobseekerProfiles = function() {
  return this.accountStatus === 'verified' && this.isActive && this.canPerform('contact_jobseekers');
};

module.exports = mongoose.model('Employer', EmployerSchema);
