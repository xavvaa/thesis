// Quick script to create User record for employer
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Employer = require('./models/Employer');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/peso-job-portal');

const app = express();
app.use(express.json());

// Endpoint to create User record for employer
app.post('/create-user/:employerUid', async (req, res) => {
  try {
    const { employerUid } = req.params;
    
    // Find the employer
    const employer = await Employer.findOne({ uid: employerUid });
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }
    
    // Check if User record already exists
    const existingUser = await User.findOne({ uid: employerUid });
    if (existingUser) {
      return res.json({ message: 'User record already exists', user: existingUser });
    }
    
    // Create User record
    const userData = {
      uid: employer.uid,
      email: employer.email,
      role: 'employer',
      companyName: employer.companyName,
      emailVerified: true,
      registrationStatus: 'verified',
      canLogin: true,
      isActive: true,
      permissions: ['post_jobs', 'view_applications', 'manage_company', 'verify_documents']
    };
    
    const newUser = await User.create(userData);
    res.json({ message: 'User record created successfully', user: newUser });
    
  } catch (error) {
    console.error('Error creating user record:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all employers and their User records
app.get('/debug-users', async (req, res) => {
  try {
    const employers = await Employer.find({});
    const users = await User.find({});
    
    const result = {
      employers: employers.map(e => ({ uid: e.uid, company: e.companyName, email: e.email })),
      users: users.map(u => ({ uid: u.uid, role: u.role, email: u.email })),
      missingUserRecords: []
    };
    
    for (const employer of employers) {
      const userRecord = users.find(u => u.uid === employer.uid);
      if (!userRecord) {
        result.missingUserRecords.push({
          uid: employer.uid,
          company: employer.companyName,
          email: employer.email
        });
      }
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`User creation service running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/debug-users to see current state`);
});
