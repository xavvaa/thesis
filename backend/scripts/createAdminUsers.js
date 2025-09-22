require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('../config/firebase');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/peso_job_portal');
    console.log('MongoDB connected for admin user creation');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createAdminUsers = async () => {
  try {
    await connectDB();

    // Create Firebase admin users first
    const superAdminFirebaseUser = {
      email: 'superadmin@peso.gov.ph',
      password: 'admin123',
      displayName: 'PESO Super Administrator',
      emailVerified: true
    };

    const adminFirebaseUser = {
      email: 'admin@peso.gov.ph', 
      password: 'admin123',
      displayName: 'PESO Administrator',
      emailVerified: true
    };

    let superAdminUid, adminUid;

    // Create or get Super Admin Firebase user
    try {
      const existingSuperAdmin = await admin.auth().getUserByEmail('superadmin@peso.gov.ph');
      superAdminUid = existingSuperAdmin.uid;
      console.log('⚠️  Super Admin Firebase user already exists');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        const createdSuperAdmin = await admin.auth().createUser(superAdminFirebaseUser);
        superAdminUid = createdSuperAdmin.uid;
        console.log('✅ Super Admin Firebase user created');
      } else {
        throw error;
      }
    }

    // Create or get Regular Admin Firebase user
    try {
      const existingAdmin = await admin.auth().getUserByEmail('admin@peso.gov.ph');
      adminUid = existingAdmin.uid;
      console.log('⚠️  Admin Firebase user already exists');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        const createdAdmin = await admin.auth().createUser(adminFirebaseUser);
        adminUid = createdAdmin.uid;
        console.log('✅ Admin Firebase user created');
      } else {
        throw error;
      }
    }

    // Create MongoDB user records
    const superAdmin = new User({
      uid: superAdminUid,
      email: 'superadmin@peso.gov.ph',
      role: 'superadmin',
      adminName: 'PESO Super Administrator',
      adminLevel: 'superadmin',
      department: 'System Administration',
      emailVerified: true,
      registrationStatus: 'verified',
      canLogin: true,
      profileComplete: true,
      isActive: true
    });

    const adminUser = new User({
      uid: adminUid,
      email: 'admin@peso.gov.ph',
      role: 'admin',
      adminName: 'PESO Administrator',
      adminLevel: 'admin',
      department: 'Employment Services',
      emailVerified: true,
      registrationStatus: 'verified',
      canLogin: true,
      profileComplete: true,
      isActive: true
    });

    // Save to MongoDB if they don't exist
    const existingSuperAdminDB = await User.findOne({ uid: superAdminUid });
    const existingAdminDB = await User.findOne({ uid: adminUid });

    if (!existingSuperAdminDB) {
      await superAdmin.save();
      console.log('✅ Super Admin MongoDB record created');
    } else {
      console.log('⚠️  Super Admin MongoDB record already exists');
    }

    if (!existingAdminDB) {
      await adminUser.save();
      console.log('✅ Admin MongoDB record created');
    } else {
      console.log('⚠️  Admin MongoDB record already exists');
    }

    console.log('\n🔑 Admin Credentials:');
    console.log('   Super Admin: superadmin@peso.gov.ph / admin123');
    console.log('   Regular Admin: admin@peso.gov.ph / admin123');
    console.log('\n🔗 Admin Portal Access:');
    console.log('   URL: http://localhost:3000/admin/auth');
    console.log('\n📋 Admin Capabilities:');
    console.log('   Super Admin: Full system control, admin management, system settings');
    console.log('   Regular Admin: Employer verification, job management, user analytics');

  } catch (error) {
    console.error('Error creating admin users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
createAdminUsers();
