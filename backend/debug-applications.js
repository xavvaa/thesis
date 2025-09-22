const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Job = require('./models/Job');

// Application Schema (inline since it's defined in routes)
const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job'
  },
  jobSeekerId: {
    type: String,
    required: true
  },
  employerId: {
    type: String,
    required: true
  },
  jobSeekerUid: {
    type: String,
    required: true
  },
  employerUid: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  resumeData: {
    type: Object,
    required: false
  },
  coverLetter: {
    type: String,
    required: false
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    required: false
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

async function debugApplications() {
  try {
    console.log('=== DEBUGGING APPLICATIONS ===');
    
    // Get all applications
    const applications = await Application.find({}).populate('jobId');
    console.log('\n--- ALL APPLICATIONS ---');
    console.log('Total applications:', applications.length);
    
    applications.forEach((app, index) => {
      console.log(`\nApplication ${index + 1}:`);
      console.log('- ID:', app._id);
      console.log('- Job Title:', app.jobId?.title || 'No job found');
      console.log('- Job Seeker UID:', app.jobSeekerUid);
      console.log('- Employer UID:', app.employerUid);
      console.log('- Employer ID:', app.employerId);
      console.log('- Status:', app.status);
      console.log('- Applied Date:', app.appliedDate);
      console.log('- Has Resume Data:', !!app.resumeData);
    });

    // Get all jobs
    const jobs = await Job.find({});
    console.log('\n--- ALL JOBS ---');
    console.log('Total jobs:', jobs.length);
    
    jobs.forEach((job, index) => {
      console.log(`\nJob ${index + 1}:`);
      console.log('- ID:', job._id);
      console.log('- Title:', job.title);
      console.log('- Employer UID:', job.employerUid);
      console.log('- Employer ID:', job.employerId);
      console.log('- Company:', job.companyName);
    });

    // Check for matching employer UIDs
    console.log('\n--- EMPLOYER UID MATCHING ---');
    const uniqueEmployerUids = [...new Set(applications.map(app => app.employerUid))];
    const uniqueJobEmployerUids = [...new Set(jobs.map(job => job.employerUid))];
    
    console.log('Application Employer UIDs:', uniqueEmployerUids);
    console.log('Job Employer UIDs:', uniqueJobEmployerUids);
    
    const matchingUids = uniqueEmployerUids.filter(uid => uniqueJobEmployerUids.includes(uid));
    console.log('Matching UIDs:', matchingUids);

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugApplications();
