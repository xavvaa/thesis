const mongoose = require('mongoose');
const Job = require('./models/Job');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/peso-job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugEmployerJobs() {
  try {
    console.log('🔍 Debugging employer jobs...');
    
    // Get all jobs
    const allJobs = await Job.find({});
    console.log(`📊 Total jobs in database: ${allJobs.length}`);
    
    // Group jobs by employerUid
    const jobsByEmployer = {};
    allJobs.forEach(job => {
      const uid = job.employerUid || 'NO_UID';
      if (!jobsByEmployer[uid]) {
        jobsByEmployer[uid] = [];
      }
      jobsByEmployer[uid].push({
        id: job._id,
        title: job.title,
        status: job.status,
        employerId: job.employerId,
        employerUid: job.employerUid,
        createdAt: job.createdAt
      });
    });
    
    console.log('\n📋 Jobs by Employer UID:');
    Object.entries(jobsByEmployer).forEach(([uid, jobs]) => {
      console.log(`\n👤 Employer UID: ${uid}`);
      console.log(`📝 Job count: ${jobs.length}`);
      jobs.forEach((job, index) => {
        console.log(`  ${index + 1}. ${job.title} (${job.status}) - ID: ${job.id}`);
      });
    });
    
    // Check for jobs without employerUid
    const jobsWithoutUid = allJobs.filter(job => !job.employerUid);
    if (jobsWithoutUid.length > 0) {
      console.log(`\n⚠️  Jobs without employerUid: ${jobsWithoutUid.length}`);
      jobsWithoutUid.forEach(job => {
        console.log(`  - ${job.title} (ID: ${job._id}) - employerId: ${job.employerId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugEmployerJobs();
