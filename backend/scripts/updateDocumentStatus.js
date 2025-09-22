const mongoose = require('mongoose');
require('dotenv').config();
const Employer = require('../models/Employer');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peso-job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateDocumentStatuses() {
  try {
    console.log('🔄 Starting document status update...');
    
    // Find all employers with documents
    const employers = await Employer.find({
      documents: { $exists: true, $ne: [] }
    });
    
    console.log(`📋 Found ${employers.length} employers with documents`);
    
    let updatedCount = 0;
    
    for (const employer of employers) {
      let hasUpdates = false;
      
      // Update each document to have verificationStatus if it doesn't exist
      employer.documents.forEach(doc => {
        if (!doc.verificationStatus) {
          // Set based on employer's overall status
          if (employer.accountStatus === 'verified') {
            doc.verificationStatus = 'approved';
            doc.verifiedAt = employer.verifiedAt || new Date();
            doc.verifiedBy = employer.verifiedBy || 'system';
          } else if (employer.accountStatus === 'rejected') {
            doc.verificationStatus = 'rejected';
            doc.rejectionReason = employer.verificationNotes || 'Employer verification rejected';
          } else {
            doc.verificationStatus = 'pending';
          }
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        await employer.save();
        updatedCount++;
        console.log(`✅ Updated documents for employer: ${employer.companyName}`);
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} employers`);
    console.log('✨ Document status update complete!');
    
  } catch (error) {
    console.error('❌ Error updating document statuses:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateDocumentStatuses();
