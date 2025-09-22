const mongoose = require('mongoose');
const User = require('../models/User');
const Employer = require('../models/Employer');
const EmployerDocument = require('../models/EmployerDocument');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addTestData() {
  try {
    console.log('Adding test employer and documents...');

    // Check if test user already exists, if not create one
    let testUser = await User.findOne({ email: 'testemployer@example.com' });
    if (!testUser) {
      testUser = new User({
        uid: 'test_employer_' + Date.now(),
        email: 'testemployer@example.com',
        role: 'employer',
        companyName: 'Test Company Inc.',
        emailVerified: true,
        registrationStatus: 'pending',
        canLogin: false,
        profileComplete: true
      });
      await testUser.save();
    }

    // Check if test employer already exists, if not create one
    let testEmployer = await Employer.findOne({ uid: testUser.uid });
    if (!testEmployer) {
      testEmployer = new Employer({
        userId: testUser._id,
        uid: testUser.uid,
        email: testUser.email,
        companyName: 'Test Company Inc.',
        industry: 'Technology',
        companySize: '51-200',
        accountStatus: 'pending',
        contactPerson: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@testcompany.com'
        }
      });
      await testEmployer.save();
    }

    // Remove existing test documents
    await EmployerDocument.deleteMany({ employerId: testEmployer._id });

    // Create single test document record with documents array
    const testDocuments = {
      employerId: testEmployer._id,
      employerUid: testUser.uid,
      documents: [
        {
          documentType: 'businessPermit',
          documentName: 'business_permit.pdf',
          documentUrl: 'https://example.com/business_permit.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          uploadedAt: new Date(),
          isRequired: true
        },
        {
          documentType: 'companyProfile',
          documentName: 'company_profile.pdf',
          documentUrl: 'https://example.com/company_profile.pdf',
          fileSize: 2048000,
          mimeType: 'application/pdf',
          uploadedAt: new Date(),
          isRequired: true
        },
        {
          documentType: 'philjobnetRegistration',
          documentName: 'philjobnet_registration.pdf',
          documentUrl: 'https://example.com/philjobnet_registration.pdf',
          fileSize: 512000,
          mimeType: 'application/pdf',
          uploadedAt: new Date(),
          isRequired: true
        }
      ],
      verificationStatus: 'pending'
    };

    const employerDoc = new EmployerDocument(testDocuments);
    await employerDoc.save();

    console.log('Test data added successfully!');
    console.log('Test employer ID:', testEmployer._id);
    console.log('Test user UID:', testUser.uid);
    console.log('Documents created:', testDocuments.length);

  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestData();
