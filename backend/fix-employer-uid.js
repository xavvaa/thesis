const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peso-job-portal');

const Job = require('./models/Job');
const Employer = require('./models/Employer');

async function fixEmployerUids() {
  try {
    console.log('Starting employer UID fix...');
    
    // Find all jobs that don't have employerUid set
    const jobsWithoutUid = await Job.find({
      $or: [
        { employerUid: { $exists: false } },
        { employerUid: null },
        { employerUid: '' }
      ]
    }).populate('employerId');
    
    console.log(`Found ${jobsWithoutUid.length} jobs without employerUid`);
    
    for (const job of jobsWithoutUid) {
      if (job.employerId && job.employerId.uid) {
        console.log(`Updating job ${job._id} with employerUid: ${job.employerId.uid}`);
        await Job.findByIdAndUpdate(job._id, {
          employerUid: job.employerId.uid
        });
      } else {
        console.log(`Warning: Job ${job._id} has no valid employer UID`);
      }
    }
    
    console.log('Employer UID fix completed!');
    
    // Verify the fix
    const updatedJobs = await Job.find({ employerUid: { $exists: true, $ne: null, $ne: '' } });
    console.log(`${updatedJobs.length} jobs now have employerUid set`);
    
  } catch (error) {
    console.error('Error fixing employer UIDs:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixEmployerUids();
