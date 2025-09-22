const mongoose = require('mongoose');

// Individual document schema for array items
const documentItemSchema = new mongoose.Schema({
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
  documentUrl: {
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
  }
}, { _id: true });

// Main employer documents schema - one record per employer with documents array
const employerDocumentSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
    unique: true
  },
  employerUid: {
    type: String,
    required: true
  },
  documents: [documentItemSchema],
  
  // Overall verification status for all documents
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'requires_resubmission'],
    default: 'pending'
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: String // Admin UID who verified
  },
  rejectionReason: {
    type: String
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
employerDocumentSchema.index({ employerId: 1, verificationStatus: 1 });
employerDocumentSchema.index({ employerUid: 1 });
employerDocumentSchema.index({ verificationStatus: 1, uploadedAt: -1 });

// Virtual for checking if document is expired
employerDocumentSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Method to check if all required documents are approved for an employer
employerDocumentSchema.statics.areAllRequiredDocumentsApproved = async function(employerId) {
  const employerDoc = await this.findOne({ employerId });
  
  if (!employerDoc || !employerDoc.documents || employerDoc.documents.length === 0) {
    return false;
  }
  
  const requiredDocs = employerDoc.documents.filter(doc => doc.isRequired);
  return requiredDocs.length > 0 && employerDoc.verificationStatus === 'approved';
};

module.exports = mongoose.model('EmployerDocument', employerDocumentSchema);
