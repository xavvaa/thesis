const mongoose = require('mongoose');
const Job = require('./models/Job');

async function checkJobs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/peso-job-portal');
    console.log('Connected to MongoDB');
    
    // Check all jobs
    const allJobs = await Job.find({}, {
      title: 1, 
      status: 1, 
      expiryDate: 1, 
      postedDate: 1,
      companyName: 1
    }).sort({postedDate: -1});
    
    console.log(`\nTotal jobs in database: ${allJobs.length}`);
    
    if (allJobs.length > 0) {
      console.log('\nAll jobs:');
      allJobs.forEach((job, index) => {
        const isExpired = job.expiryDate < new Date();
        console.log(`${index + 1}. ${job.title} (${job.companyName})`);
        console.log(`   Status: ${job.status}, Expired: ${isExpired}`);
        console.log(`   Posted: ${job.postedDate}, Expires: ${job.expiryDate}`);
        console.log('');
      });
    }
    
    // Check active jobs (what job seekers see)
    const activeJobs = await Job.find({
      status: 'active',
      expiryDate: { $gt: new Date() }
    });
    
    console.log(`Active jobs visible to job seekers: ${activeJobs.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkJobs();
