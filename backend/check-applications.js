const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peso-job-portal');

const Application = require('./routes/applicationRoutes');
const Job = require('./models/Job');
const JobSeeker = require('./models/JobSeeker');
const Employer = require('./models/Employer');

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

const ApplicationModel = mongoose.model('Application', ApplicationSchema);

async function checkApplications() {
  try {
    console.log('=== APPLICATION DEBUG ===');
    
    // Get all applications
    const applications = await ApplicationModel.find({});
    console.log(`Total applications: ${applications.length}`);
    
    if (applications.length === 0) {
      console.log('No applications found in database');
      return;
    }
    
    // Get all employers
    const employers = await Employer.find({});
    console.log(`Total employers: ${employers.length}`);
    
    // Get all job seekers
    const jobSeekers = await JobSeeker.find({});
    console.log(`Total job seekers: ${jobSeekers.length}`);
    
    // Get all jobs
    const jobs = await Job.find({});
    console.log(`Total jobs: ${jobs.length}`);
    
    console.log('\n=== APPLICATION DETAILS ===');
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      console.log(`\nApplication ${i + 1}:`);
      console.log(`  ID: ${app._id}`);
      console.log(`  Job ID: ${app.jobId}`);
      console.log(`  Job Seeker UID: ${app.jobSeekerUid}`);
      console.log(`  Employer UID: ${app.employerUid}`);
      console.log(`  Employer ID: ${app.employerId}`);
      console.log(`  Status: ${app.status}`);
      console.log(`  Applied Date: ${app.appliedDate}`);
      
      // Find the job
      const job = await Job.findById(app.jobId);
      if (job) {
        console.log(`  Job Title: ${job.title}`);
        console.log(`  Job Employer UID: ${job.employerUid}`);
        console.log(`  Job Company: ${job.companyName}`);
      } else {
        console.log(`  Job: NOT FOUND`);
      }
      
      // Find the job seeker
      const jobSeeker = await JobSeeker.findOne({ uid: app.jobSeekerUid });
      if (jobSeeker) {
        console.log(`  Applicant: ${jobSeeker.firstName} ${jobSeeker.lastName}`);
        console.log(`  Applicant Email: ${jobSeeker.email}`);
      } else {
        console.log(`  Applicant: NOT FOUND`);
      }
      
      // Find the employer
      const employer = await Employer.findOne({ uid: app.employerUid });
      if (employer) {
        console.log(`  Employer: ${employer.companyName}`);
      } else {
        console.log(`  Employer: NOT FOUND`);
      }
    }
    
    console.log('\n=== EMPLOYER UIDS ===');
    employers.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.companyName}: ${emp.uid}`);
    });
    
  } catch (error) {
    console.error('Error checking applications:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkApplications();
