const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check applications
    const applications = await mongoose.connection.db.collection('applications').find({}).toArray();
    console.log('\n📋 Applications in database:', applications.length);
    
    applications.forEach((app, i) => {
      console.log(`App ${i + 1}:`, {
        id: app._id?.toString(),
        jobId: app.jobId?.toString(),
        employerUid: app.employerUid,
        employerId: app.employerId,
        jobSeekerUid: app.jobSeekerUid,
        status: app.status,
        hasResumeData: !!app.resumeData
      });
    });
    
    // Check jobs
    const jobs = await mongoose.connection.db.collection('jobs').find({}).toArray();
    console.log('\n💼 Jobs in database:', jobs.length);
    
    jobs.forEach((job, i) => {
      console.log(`Job ${i + 1}:`, {
        id: job._id?.toString(),
        title: job.title,
        employerUid: job.employerUid,
        employerId: job.employerId?.toString(),
        companyName: job.companyName
      });
    });
    
    // Check for UID matches
    const appEmployerUids = applications.map(app => app.employerUid).filter(Boolean);
    const jobEmployerUids = jobs.map(job => job.employerUid).filter(Boolean);
    
    console.log('\n🔍 UID Analysis:');
    console.log('Application employer UIDs:', [...new Set(appEmployerUids)]);
    console.log('Job employer UIDs:', [...new Set(jobEmployerUids)]);
    
    const matches = appEmployerUids.filter(uid => jobEmployerUids.includes(uid));
    console.log('Matching UIDs:', [...new Set(matches)]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();
