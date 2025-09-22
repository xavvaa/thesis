const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peso-job-portal');

const User = require('./models/User');
const Employer = require('./models/Employer');
const JobSeeker = require('./models/JobSeeker');

async function fixUserRoles() {
  try {
    console.log('Starting user role fix...');
    
    // Find all employers without corresponding User records
    const employers = await Employer.find({});
    console.log(`Found ${employers.length} employer profiles`);
    
    for (const employer of employers) {
      const existingUser = await User.findOne({ uid: employer.uid });
      
      if (!existingUser) {
        console.log(`Creating missing User record for employer: ${employer.companyName} (${employer.uid})`);
        
        // Create User record for this employer
        const userData = {
          uid: employer.uid,
          email: employer.email,
          role: 'employer',
          companyName: employer.companyName,
          emailVerified: true, // Assume verified if they're in the system
          registrationStatus: 'verified',
          canLogin: true,
          isActive: true,
          permissions: ['post_jobs', 'view_applications', 'manage_company', 'verify_documents']
        };
        
        await User.create(userData);
        console.log(`✓ Created User record for ${employer.companyName}`);
      } else {
        console.log(`✓ User record exists for ${employer.companyName}`);
        
        // Ensure the user has correct role and permissions
        if (existingUser.role !== 'employer') {
          existingUser.role = 'employer';
          existingUser.permissions = ['post_jobs', 'view_applications', 'manage_company', 'verify_documents'];
          await existingUser.save();
          console.log(`✓ Fixed role for ${employer.companyName}`);
        }
      }
    }
    
    // Check job seekers too
    const jobSeekers = await JobSeeker.find({});
    console.log(`Found ${jobSeekers.length} job seeker profiles`);
    
    for (const jobSeeker of jobSeekers) {
      const existingUser = await User.findOne({ uid: jobSeeker.uid });
      
      if (!existingUser) {
        console.log(`Creating missing User record for job seeker: ${jobSeeker.firstName} ${jobSeeker.lastName} (${jobSeeker.uid})`);
        
        // Create User record for this job seeker
        const userData = {
          uid: jobSeeker.uid,
          email: jobSeeker.email,
          role: 'jobseeker',
          firstName: jobSeeker.firstName,
          lastName: jobSeeker.lastName,
          middleName: jobSeeker.middleName,
          emailVerified: true,
          registrationStatus: 'verified',
          canLogin: true,
          isActive: true,
          permissions: ['view_jobs', 'apply_jobs', 'manage_profile', 'upload_resume']
        };
        
        await User.create(userData);
        console.log(`✓ Created User record for ${jobSeeker.firstName} ${jobSeeker.lastName}`);
      } else {
        console.log(`✓ User record exists for ${jobSeeker.firstName} ${jobSeeker.lastName}`);
        
        // Ensure the user has correct role and permissions
        if (existingUser.role !== 'jobseeker') {
          existingUser.role = 'jobseeker';
          existingUser.permissions = ['view_jobs', 'apply_jobs', 'manage_profile', 'upload_resume'];
          await existingUser.save();
          console.log(`✓ Fixed role for ${jobSeeker.firstName} ${jobSeeker.lastName}`);
        }
      }
    }
    
    console.log('User role fix completed!');
    
    // Verify the fix
    const totalUsers = await User.countDocuments();
    const employerUsers = await User.countDocuments({ role: 'employer' });
    const jobSeekerUsers = await User.countDocuments({ role: 'jobseeker' });
    
    console.log(`\nSummary:`);
    console.log(`Total User records: ${totalUsers}`);
    console.log(`Employers: ${employerUsers}`);
    console.log(`Job Seekers: ${jobSeekerUsers}`);
    
  } catch (error) {
    console.error('Error fixing user roles:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixUserRoles();
