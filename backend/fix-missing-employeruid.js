const mongoose = require('mongoose');
const Job = require('./models/Job');
const Employer = require('./models/Employer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/peso-job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixMissingEmployerUid() {
  try {
    console.log('🔧 Fixing jobs with missing employerUid...');
    
    // Find jobs without employerUid
    const jobsWithoutUid = await Job.find({ 
      $or: [
        { employerUid: { $exists: false } },
        { employerUid: null },
        { employerUid: '' }
      ]
    });
    
    console.log(`📋 Found ${jobsWithoutUid.length} jobs without employerUid`);
    
    for (const job of jobsWithoutUid) {
      console.log(`\n🔍 Processing job: "${job.title}" (ID: ${job._id})`);
      console.log(`   employerId: ${job.employerId}`);
      
      if (job.employerId) {
        // Find the employer by ObjectId
        const employer = await Employer.findById(job.employerId);
        if (employer) {
          console.log(`   Found employer: ${employer.companyName} (UID: ${employer.uid})`);
          
          // Update the job with employerUid
          await Job.findByIdAndUpdate(job._id, {
            employerUid: employer.uid
          });
          
          console.log(`   ✅ Updated job with employerUid: ${employer.uid}`);
        } else {
          console.log(`   ❌ No employer found for employerId: ${job.employerId}`);
        }
      } else {
        console.log(`   ⚠️  Job has no employerId - cannot determine owner`);
      }
    }
    
    // Verify the fix
    const remainingJobs = await Job.find({ 
      $or: [
        { employerUid: { $exists: false } },
        { employerUid: null },
        { employerUid: '' }
      ]
    });
    
    console.log(`\n✅ Fix complete! Jobs without employerUid: ${remainingJobs.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixMissingEmployerUid();
