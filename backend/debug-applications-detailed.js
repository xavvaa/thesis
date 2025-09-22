const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peso-job-portal');

// Import the Application schema directly since it's defined in routes
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
  employerId: {
    type: String,
    required: true
  },
  resumeData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      address: String
    },
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String,
      gpa: String
    }],
    skills: [String],
    certifications: [{
      name: String,
      issuer: String,
      date: String
    }]
  },
  coverLetter: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const Application = mongoose.model('Application', ApplicationSchema);
const Job = require('./models/Job');
const JobSeeker = require('./models/JobSeeker');
const Employer = require('./models/Employer');

async function debugApplicationsDetailed() {
  try {
    console.log('=== DETAILED APPLICATION DEBUG ===');
    
    // Get all applications
    const applications = await Application.find({}).populate('jobId');
    console.log(`\nTotal applications in database: ${applications.length}`);
    
    if (applications.length === 0) {
      console.log('❌ No applications found in database');
      return;
    }
    
    // Get all job seekers to check names
    const jobSeekers = await JobSeeker.find({});
    console.log(`Total job seekers: ${jobSeekers.length}`);
    
    // Get all employers
    const employers = await Employer.find({});
    console.log(`Total employers: ${employers.length}`);
    
    console.log('\n=== APPLICATION ANALYSIS ===');
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      console.log(`\n--- Application ${i + 1} ---`);
      console.log(`ID: ${app._id}`);
      console.log(`Job Seeker UID: ${app.jobSeekerUid}`);
      console.log(`Employer UID: ${app.employerUid}`);
      console.log(`Status: ${app.status}`);
      console.log(`Applied Date: ${app.appliedDate}`);
      
      // Check resume data
      if (app.resumeData) {
        console.log(`Resume Data Present: YES`);
        console.log(`  Name: ${app.resumeData.personalInfo?.name || 'NOT SET'}`);
        console.log(`  Email: ${app.resumeData.personalInfo?.email || 'NOT SET'}`);
        console.log(`  Phone: ${app.resumeData.personalInfo?.phone || 'NOT SET'}`);
        console.log(`  Skills: ${app.resumeData.skills?.length || 0} skills`);
        console.log(`  Experience: ${app.resumeData.experience?.length || 0} entries`);
        console.log(`  Education: ${app.resumeData.education?.length || 0} entries`);
      } else {
        console.log(`Resume Data Present: NO`);
      }
      
      // Find the job seeker profile
      const jobSeeker = jobSeekers.find(js => js.uid === app.jobSeekerUid);
      if (jobSeeker) {
        console.log(`Job Seeker Profile Found: ${jobSeeker.firstName} ${jobSeeker.lastName}`);
        console.log(`  Email: ${jobSeeker.email}`);
      } else {
        console.log(`Job Seeker Profile: NOT FOUND for UID ${app.jobSeekerUid}`);
      }
      
      // Find the job
      if (app.jobId) {
        console.log(`Job Title: ${app.jobId.title || 'NOT FOUND'}`);
        console.log(`Job Company: ${app.jobId.companyName || 'NOT FOUND'}`);
      } else {
        console.log(`Job: NOT FOUND`);
      }
      
      // Find the employer
      const employer = employers.find(emp => emp.uid === app.employerUid);
      if (employer) {
        console.log(`Employer: ${employer.companyName}`);
      } else {
        console.log(`Employer: NOT FOUND for UID ${app.employerUid}`);
      }
    }
    
    console.log('\n=== JOB SEEKER PROFILES ===');
    jobSeekers.forEach((js, index) => {
      console.log(`${index + 1}. ${js.firstName} ${js.lastName} (${js.uid}) - ${js.email}`);
    });
    
    console.log('\n=== EMPLOYER PROFILES ===');
    employers.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.companyName} (${emp.uid}) - ${emp.email}`);
    });
    
  } catch (error) {
    console.error('Error in detailed debug:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugApplicationsDetailed();
