require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Resume = require('../models/Resume');
const MLResume = require('../models/MLResume');

async function syncResumesToML() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Starting resume sync to ML collection...');
    
    // Get all active resumes
    const resumes = await Resume.find({ isActive: true });
    
    console.log(`Found ${resumes.length} active resumes to sync`);
    
    let successCount = 0;
    const errors = [];
    
    // Process each resume
    for (const resume of resumes) {
      try {
        await MLResume.createOrUpdateFromResume(resume);
        successCount++;
        console.log(`Synced resume: ${resume._id} - ${resume.personalInfo?.fullName || 'No name'}`);
      } catch (error) {
        errors.push({
          resumeId: resume._id,
          error: error.message
        });
        console.error(`Error syncing resume ${resume._id}:`, error.message);
      }
    }
    
    console.log('\nSync completed!');
    console.log(`Successfully synced: ${successCount}/${resumes.length} resumes`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach((err, index) => {
        console.log(`\n${index + 1}. Resume ID: ${err.resumeId}`);
        console.log(`   Error: ${err.error}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncResumesToML();
