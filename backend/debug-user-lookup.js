const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peso-job-portal');

const User = require('./models/User');
const Employer = require('./models/Employer');

async function debugUserLookup() {
  try {
    console.log('=== DEBUG USER LOOKUP ===');
    
    // Get all users and employers
    const allUsers = await User.find({});
    const allEmployers = await Employer.find({});
    
    console.log(`\nDatabase counts:`);
    console.log(`- Users: ${allUsers.length}`);
    console.log(`- Employers: ${allEmployers.length}`);
    
    if (allUsers.length > 0) {
      console.log(`\nUser records:`);
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. UID: ${user.uid}, Role: ${user.role}, Email: ${user.email}`);
      });
    }
    
    if (allEmployers.length > 0) {
      console.log(`\nEmployer records:`);
      allEmployers.forEach((employer, index) => {
        console.log(`${index + 1}. UID: ${employer.uid}, Company: ${employer.companyName}, Email: ${employer.email}`);
      });
    }
    
    // Check for missing User records
    console.log(`\nChecking for missing User records:`);
    for (const employer of allEmployers) {
      const userRecord = await User.findOne({ uid: employer.uid });
      if (!userRecord) {
        console.log(`❌ Missing User record for employer: ${employer.companyName} (${employer.uid})`);
        
        // Create the missing User record
        const userData = {
          uid: employer.uid,
          email: employer.email,
          role: 'employer',
          companyName: employer.companyName,
          emailVerified: true,
          registrationStatus: 'verified',
          canLogin: true,
          isActive: true,
          permissions: ['post_jobs', 'view_applications', 'manage_company', 'verify_documents']
        };
        
        const newUser = await User.create(userData);
        console.log(`✅ Created User record for ${employer.companyName}`);
      } else {
        console.log(`✅ User record exists for ${employer.companyName}`);
      }
    }
    
    console.log(`\n=== FINAL COUNTS ===`);
    const finalUserCount = await User.countDocuments();
    const finalEmployerCount = await User.countDocuments({ role: 'employer' });
    console.log(`Total Users: ${finalUserCount}`);
    console.log(`Employer Users: ${finalEmployerCount}`);
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugUserLookup();
