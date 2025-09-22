const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check applications collection
    const applications = await mongoose.connection.db.collection('applications').find({}).toArray();
    console.log('Applications found:', applications.length);
    
    applications.forEach((app, i) => {
      console.log(`App ${i + 1}:`, {
        id: app._id,
        jobId: app.jobId,
        employerUid: app.employerUid,
        employerId: app.employerId,
        jobSeekerUid: app.jobSeekerUid,
        status: app.status
      });
    });

    // Check jobs collection
    const jobs = await mongoose.connection.db.collection('jobs').find({}).toArray();
    console.log('\nJobs found:', jobs.length);
    
    jobs.forEach((job, i) => {
      console.log(`Job ${i + 1}:`, {
        id: job._id,
        title: job.title,
        employerUid: job.employerUid,
        employerId: job.employerId
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
});
