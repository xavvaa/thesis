const express = require('express');
const router = express.Router();
const Employer = require('../models/Employer');
const EmployerDocument = require('../models/EmployerDocument');
const User = require('../models/User');
const emailService = require('../services/emailService');
const Admin = require('../models/Admin');
const JobSeeker = require('../models/JobSeeker');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminMiddleware, superAdminMiddleware } = require('../middleware/adminMiddleware');
const admin = require('../config/firebase');

// Admin login endpoint - Firebase Auth integration
router.post('/login', verifyToken, async (req, res) => {
  try {
    const { uid, email } = req.user; // From Firebase token
    
    console.log('🔐 Admin login attempt:', { uid, email });

    // First check Admin collection
    let adminUser = await Admin.findOne({ 
      uid: uid,
      isActive: true
    });

    // If not found in Admin collection, check User collection for backward compatibility
    if (!adminUser) {
      console.log('🔍 Not found in Admin collection, checking User collection...');
      const userAdmin = await User.findOne({ 
        uid: uid,
        role: { $in: ['admin', 'superadmin'] },
        isActive: true
      });
      
      if (userAdmin) {
        // Migrate user to Admin collection
        console.log('🔄 Migrating admin user to Admin collection...');
        adminUser = new Admin({
          uid: userAdmin.uid,
          email: userAdmin.email,
          role: userAdmin.role,
          adminName: userAdmin.adminName,
          adminLevel: userAdmin.adminLevel || userAdmin.role,
          department: userAdmin.department || '',
          isActive: userAdmin.isActive,
          canLogin: userAdmin.canLogin,
          emailVerified: userAdmin.emailVerified,
          registrationStatus: userAdmin.registrationStatus,
          profileComplete: userAdmin.profileComplete,
          permissions: userAdmin.permissions || [],
          lastLogin: userAdmin.lastLogin,
          createdAt: userAdmin.createdAt || new Date()
        });
        await adminUser.save();
        console.log('✅ Admin user migrated successfully');
      }
    }

    console.log('👤 Database lookup result:', adminUser ? {
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive,
      registrationStatus: adminUser.registrationStatus
    } : 'Admin user not found');

    if (!adminUser) {
      console.log('❌ Access denied - no admin user found');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Update last login
    adminUser.lastLogin = new Date();
    await adminUser.save();

    console.log('✅ Admin login successful');
    
    // Return admin data
    res.json({
      success: true,
      admin: {
        uid: adminUser.uid,
        email: adminUser.email,
        role: adminUser.role,
        adminName: adminUser.adminName,
        adminLevel: adminUser.adminLevel,
        department: adminUser.department,
        permissions: adminUser.permissions || []
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during admin login' 
    });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      totalApplications,
      pendingEmployers,
      activeJobs,
      recentApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'jobseeker' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Employer.countDocuments({ accountStatus: 'pending' }),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEmployers,
        totalJobSeekers,
        totalJobs,
        totalApplications,
        pendingEmployers,
        activeJobs,
        recentApplications
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard statistics' 
    });
  }
});

// Get all employers for admin review (with optional status filter)
router.get('/employers', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query; // Optional status filter: 'pending', 'verified', 'rejected'
    
    let query = {};
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      query.accountStatus = status;
    }

    // Get all employers (or filtered by status) with full company details
    const employers = await Employer.find(query)
      .populate('userId', 'email companyName createdAt')
      .sort({ createdAt: -1 });

    // Format employers with full company details and documents
    const employersWithFullDetails = employers.map(employer => ({
      _id: employer._id,
      userId: employer.userId,
      accountStatus: employer.accountStatus,
      verificationNotes: employer.verificationNotes,
      verifiedAt: employer.verifiedAt,
      // Full company information
      companyDetails: {
        companyName: employer.companyName,
        companyDescription: employer.companyDescription,
        industry: employer.industry,
        companySize: employer.companySize,
        foundedYear: employer.foundedYear,
        website: employer.website,
        businessRegistrationNumber: employer.businessRegistrationNumber,
        taxIdentificationNumber: employer.taxIdentificationNumber
      },
      // Contact person information
      contactPerson: employer.contactPerson || {},
      // Address information
      address: employer.address || {},
      // Social media and other details
      socialMedia: employer.socialMedia || {},
      benefits: employer.benefits || [],
      companyValues: employer.companyValues || [],
      workEnvironment: employer.workEnvironment,
      // Documents and verification
      documents: employer.documents || [],
      documentVerificationStatus: employer.documentVerificationStatus || 'pending',
      documentVerifiedAt: employer.documentVerifiedAt,
      documentRejectionReason: employer.documentRejectionReason,
      // Profile status
      profileComplete: employer.profileComplete,
      isActive: employer.isActive,
      createdAt: employer.createdAt,
      updatedAt: employer.updatedAt
    }));

    // Only include employers that have uploaded documents
    const employersWithDocs = employersWithFullDetails.filter(employer => 
      employer.documents && employer.documents.length > 0
    );

    res.json({
      success: true,
      employers: employersWithDocs
    });

  } catch (error) {
    console.error('Employers fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching employers' 
    });
  }
});

// Keep the old pending endpoint for backward compatibility
router.get('/employers/pending', verifyToken, adminMiddleware, async (req, res) => {
  try {
    // First, get employers with pending account status
    const pendingEmployers = await Employer.find({ 
      accountStatus: 'pending' 
    }).populate('userId', 'email companyName createdAt').sort({ createdAt: -1 });

    // Also get employers who have pending documents (regardless of account status)
    const additionalEmployers = await Employer.find({
      documentVerificationStatus: 'pending',
      accountStatus: { $ne: 'pending' }
    }).populate('userId', 'email companyName createdAt').sort({ createdAt: -1 });

    // Combine both lists
    const allEmployers = [...pendingEmployers, ...additionalEmployers];

    // Get documents for each employer (now stored in employer record)
    const employersWithDocuments = allEmployers.map(employer => ({
      ...employer.toObject(),
      documents: employer.documents || [],
      documentVerificationStatus: employer.documentVerificationStatus || 'pending'
    }));

    // Filter out employers with no documents or no pending documents
    const employersNeedingReview = employersWithDocuments.filter(employer => 
      employer.documents && employer.documents.length > 0 && 
      (employer.accountStatus === 'pending' || 
       employer.documentVerificationStatus === 'pending')
    );

    res.json({
      success: true,
      employers: employersNeedingReview
    });

  } catch (error) {
    console.error('Pending employers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending employers' 
    });
  }
});

// Verify/reject employer
router.put('/employers/:employerId/verify', verifyToken, adminMiddleware, async (req, res) => {
  try {
    console.log('🔄 Employer verification request:', {
      employerId: req.params.employerId,
      action: req.body.action,
      reason: req.body.reason,
      adminUid: req.user.uid
    });

    const { employerId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    const employer = await Employer.findById(employerId).populate('userId', 'email uid');
    if (!employer) {
      console.error('❌ Employer not found:', employerId);
      return res.status(404).json({ 
        success: false, 
        message: 'Employer not found' 
      });
    }

    console.log('📋 Current employer status:', employer.accountStatus);
    console.log('👤 Employer details:', {
      id: employer._id,
      email: employer.userId?.email,
      uid: employer.userId?.uid,
      companyName: employer.companyName
    });

    // Update employer status
    employer.accountStatus = action === 'approve' ? 'verified' : 'rejected';
    if (reason) {
      employer.verificationNotes = reason;
    }
    employer.verifiedAt = new Date();
    
    // Skip verifiedBy field for now to avoid ObjectId validation issues
    // employer.verifiedBy = req.user.uid; // Will implement proper admin tracking later

    await employer.save();
    console.log('✅ Employer status updated to:', employer.accountStatus);
    console.log('🔍 DEBUG: About to start document update section');

    // Update all employer documents to match the employer decision
    const documentUpdateStatus = action === 'approve' ? 'approved' : 'rejected';
    console.log('🔄 Starting document update process for employer:', employerId, 'to status:', documentUpdateStatus);
    
    try {
      // Update document verification status in employer record
      console.log('📋 Updating document verification status in employer record');
      
      employer.documentVerificationStatus = documentUpdateStatus;
      employer.documentVerifiedAt = new Date();
      
      // Update individual document verification statuses
      if (employer.documents && employer.documents.length > 0) {
        employer.documents.forEach(doc => {
          doc.verificationStatus = documentUpdateStatus;
          doc.verifiedAt = new Date();
          doc.verifiedBy = req.user.uid;
          
          if (action === 'reject') {
            doc.rejectionReason = reason || 'Document rejected during employer verification';
          } else {
            doc.rejectionReason = undefined;
          }
        });
        console.log('📄 Updated verification status for', employer.documents.length, 'individual documents');
      }
      
      if (action === 'reject') {
        employer.documentRejectionReason = reason || 'Employer verification rejected';
      } else {
        employer.documentRejectionReason = undefined;
      }
      
      console.log('📄 Document verification status updated to:', documentUpdateStatus);
      
      // Save the employer again with document verification updates
      await employer.save();
      console.log('✅ Employer saved with document verification updates');
      
    } catch (docUpdateError) {
      console.error('❌ Error updating document verification:', docUpdateError);
    }

    // Update user canLogin status
    const userUpdate = await User.findOneAndUpdate(
      { _id: employer.userId._id },
      { 
        canLogin: action === 'approve',
        registrationStatus: action === 'approve' ? 'verified' : 'rejected'
      },
      { new: true }
    );

    console.log('✅ User status updated:', {
      canLogin: userUpdate?.canLogin,
      registrationStatus: userUpdate?.registrationStatus
    });

    // Send email notification
    try {
      const employerEmail = employer.userId?.email;
      const companyName = employer.companyName;
      
      if (employerEmail) {
        console.log('📧 Sending email notification to:', employerEmail);
        
        if (action === 'approve') {
          const emailResult = await emailService.sendEmployerApprovalEmail(employerEmail, companyName);
          console.log('✅ Approval email result:', emailResult);
        } else {
          const emailResult = await emailService.sendEmployerRejectionEmail(employerEmail, companyName, reason);
          console.log('✅ Rejection email result:', emailResult);
        }
      } else {
        console.warn('⚠️ No email address found for employer');
      }
    } catch (emailError) {
      console.error('❌ Error sending email notification:', emailError);
      // Don't fail the entire operation if email fails
    }

    console.log('🎯 About to send response - employer verification complete');
    console.log('🔍 DEBUG: Document update section should have executed by now');
    
    res.json({
      success: true,
      message: `Employer ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      employer: {
        _id: employer._id,
        accountStatus: employer.accountStatus,
        canPostJobs: action === 'approve'
      }
    });

  } catch (error) {
    console.error('Employer verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating employer status' 
    });
  }
});

// Get all jobs with management options
router.get('/jobs', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('employerUid', 'companyName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching jobs' 
    });
  }
});

// Update job status (activate/deactivate/remove)
router.put('/jobs/:jobId/status', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, reason } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    job.status = status;
    if (reason) {
      job.adminNotes = reason;
    }
    job.lastModifiedBy = req.user.uid;
    job.updatedAt = new Date();

    await job.save();

    res.json({
      success: true,
      message: `Job status updated to ${status}`
    });

  } catch (error) {
    console.error('Job status update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating job status' 
    });
  }
});

// Get user analytics
router.get('/analytics/users', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Job posting trends
    const jobPostings = await Job.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Application trends
    const applications = await Application.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        userRegistrations,
        jobPostings,
        applications,
        period: days
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics data' 
    });
  }
});

// Super admin only: Manage admin users
router.get('/admins', verifyToken, superAdminMiddleware, async (req, res) => {
  try {
    console.log('🔍 Fetching admin users from Admin collection');
    
    const admins = await Admin.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    console.log('✅ Found admins:', admins.length);

    res.json({
      success: true,
      admins
    });

  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching admin users' 
    });
  }
});

// Super admin only: Create new admin
router.post('/admins', verifyToken, superAdminMiddleware, async (req, res) => {
  try {
    const { email, adminName, department, adminLevel, password } = req.body;
    
    console.log('🔄 Creating admin user:', { email, adminName, department, adminLevel });

    // Validate required fields
    if (!email || !adminName || !adminLevel || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, admin name, admin level, and password are required' 
      });
    }

    // Check if email already exists in Admin collection
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('❌ Admin email already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Admin email already exists' 
      });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ Email already exists in users:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    let firebaseUser;
    try {
      // Create user in Firebase
      console.log('🔥 Creating Firebase user...');
      firebaseUser = await admin.auth().createUser({
        email: email.toLowerCase(),
        password: password,
        displayName: adminName,
        emailVerified: true
      });
      console.log('✅ Firebase user created:', firebaseUser.uid);
    } catch (firebaseError) {
      console.error('❌ Firebase user creation failed:', firebaseError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create Firebase user: ' + firebaseError.message 
      });
    }

    try {
      // Create admin user in MongoDB Admin collection
      console.log('💾 Creating admin in MongoDB...');
      const adminUser = new Admin({
        uid: firebaseUser.uid,
        email: email.toLowerCase(),
        role: adminLevel,
        adminName,
        adminLevel,
        department: department || '',
        emailVerified: true,
        registrationStatus: 'verified',
        canLogin: true,
        isActive: true,
        profileComplete: true,
        createdBy: req.user.uid,
        createdAt: new Date()
      });

      await adminUser.save();
      console.log('✅ Admin user created in MongoDB:', adminUser.uid);

      res.json({
        success: true,
        message: 'Admin user created successfully',
        admin: {
          uid: adminUser.uid,
          email: adminUser.email,
          role: adminUser.role,
          adminName: adminUser.adminName,
          adminLevel: adminUser.adminLevel,
          department: adminUser.department,
          isActive: adminUser.isActive,
          createdAt: adminUser.createdAt
        }
      });

    } catch (mongoError) {
      console.error('❌ MongoDB admin creation failed:', mongoError);
      
      // Rollback: Delete the Firebase user if MongoDB creation fails
      try {
        await admin.auth().deleteUser(firebaseUser.uid);
        console.log('🔄 Rolled back Firebase user creation');
      } catch (rollbackError) {
        console.error('❌ Failed to rollback Firebase user:', rollbackError);
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create admin in database: ' + mongoError.message 
      });
    }

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating admin user: ' + error.message 
    });
  }
});

// Get documents for a specific employer
router.get('/employers/:employerId/documents', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { employerId } = req.params;
    
    const employer = await Employer.findById(employerId);
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    res.json({
      success: true,
      documents: employer.documents || []
    });

  } catch (error) {
    console.error('Employer documents fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching employer documents' 
    });
  }
});

// Verify/reject individual document
router.put('/documents/:documentId/verify', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { action, reason, adminNotes } = req.body; // action: 'approve' or 'reject'

    const document = await EmployerDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Update document status
    document.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
    if (reason) {
      document.rejectionReason = reason;
    }
    if (adminNotes) {
      document.adminNotes = adminNotes;
    }
    document.verifiedAt = new Date();
    document.verifiedBy = req.user.uid;

    await document.save();

    // Check if all required documents are approved for this employer
    const allRequiredApproved = await EmployerDocument.areAllRequiredDocumentsApproved(document.employerId);
    
    // If all required documents are approved, update employer status
    if (allRequiredApproved && action === 'approve') {
      const employer = await Employer.findById(document.employerId);
      if (employer && employer.accountStatus === 'pending') {
        employer.accountStatus = 'verified';
        employer.verifiedAt = new Date();
        // employer.verifiedBy = req.user.uid; // Temporarily disabled
        await employer.save();

        // Update user canLogin status
        await User.findOneAndUpdate(
          { uid: employer.userId },
          { 
            canLogin: true,
            registrationStatus: 'verified'
          }
        );
      }
    }

    res.json({
      success: true,
      message: `Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      allRequiredApproved
    });

  } catch (error) {
    console.error('Document verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating document status' 
    });
  }
});

// Bulk verify documents for an employer
router.put('/employers/:employerId/documents/bulk-verify', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { employerId } = req.params;
    const { documentIds, action, reason } = req.body;

    const updateData = {
      verificationStatus: action === 'approve' ? 'approved' : 'rejected',
      verifiedAt: new Date(),
      // verifiedBy: req.user.uid // Temporarily disabled
    };

    if (reason) {
      updateData.rejectionReason = reason;
    }

    await EmployerDocument.updateMany(
      { 
        _id: { $in: documentIds },
        employerId 
      },
      updateData
    );

    // Check if all required documents are approved
    const allRequiredApproved = await EmployerDocument.areAllRequiredDocumentsApproved(employerId);
    
    if (allRequiredApproved && action === 'approve') {
      const employer = await Employer.findById(employerId);
      if (employer && employer.accountStatus === 'pending') {
        employer.accountStatus = 'verified';
        employer.verifiedAt = new Date();
        // employer.verifiedBy = req.user.uid; // Temporarily disabled
        await employer.save();

        await User.findOneAndUpdate(
          { uid: employer.userId },
          { 
            canLogin: true,
            registrationStatus: 'verified'
          }
        );
      }
    }

    res.json({
      success: true,
      message: `Documents ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      allRequiredApproved
    });

  } catch (error) {
    console.error('Bulk document verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating documents status' 
    });
  }
});

// ===== SUPERADMIN ONLY ROUTES =====

// Get all users (superadmin only)
router.get('/users', verifyToken, superAdminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    
    console.log('🔍 Fetching users with params:', { page, limit, role, status, search });
    
    // If role is 'admin', fetch from Admin collection
    if (role === 'admin') {
      let query = {};
      if (status && status !== 'all') {
        query.registrationStatus = status;
      }
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { adminName: { $regex: search, $options: 'i' } }
        ];
      }

      const admins = await Admin.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Admin.countDocuments(query);

      console.log('✅ Found admins:', admins.length);

      return res.json({
        success: true,
        users: admins.map(admin => ({
          _id: admin._id,
          uid: admin.uid,
          email: admin.email,
          role: admin.role,
          adminName: admin.adminName,
          adminLevel: admin.adminLevel,
          department: admin.department,
          registrationStatus: admin.registrationStatus,
          isActive: admin.isActive,
          canLogin: admin.canLogin,
          emailVerified: admin.emailVerified,
          createdAt: admin.createdAt,
          lastLogin: admin.lastLogin
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
    
    // For other roles, fetch from User collection
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (status && status !== 'all') {
      query.registrationStatus = status;
    }
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    console.log('✅ Found users:', users.length);

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        uid: user.uid,
        email: user.email,
        role: user.role,
        adminName: user.adminName,
        adminLevel: user.adminLevel,
        department: user.department,
        registrationStatus: user.registrationStatus,
        isActive: user.isActive,
        canLogin: user.canLogin,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users' 
    });
  }
});

// Update user status/role (superadmin only)
router.put('/users/:userId', verifyToken, superAdminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive, canLogin, registrationStatus, adminLevel, department, adminName } = req.body;

    console.log('🔄 Updating user:', userId, req.body);

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (canLogin !== undefined) updateData.canLogin = canLogin;
    if (registrationStatus !== undefined) updateData.registrationStatus = registrationStatus;
    if (adminLevel !== undefined) updateData.adminLevel = adminLevel;
    if (department !== undefined) updateData.department = department;
    if (adminName !== undefined) updateData.adminName = adminName;

    // Try to update in Admin collection first
    let user = await Admin.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    // If not found in Admin collection, try User collection
    if (!user) {
      user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User updated successfully');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        uid: user.uid,
        email: user.email,
        role: user.role,
        adminName: user.adminName,
        adminLevel: user.adminLevel,
        department: user.department,
        isActive: user.isActive,
        canLogin: user.canLogin,
        registrationStatus: user.registrationStatus
      }
    });

  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user' 
    });
  }
});

// Delete user (superadmin only)
router.delete('/users/:userId', verifyToken, superAdminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('🗑️ Deleting user:', userId);

    // Try to find in Admin collection first
    let user = await Admin.findById(userId);
    let isAdminCollection = true;

    // If not found in Admin collection, try User collection
    if (!user) {
      user = await User.findById(userId);
      isAdminCollection = false;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the current superadmin
    if (user.uid === req.user.uid) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete from Firebase if it's an admin user
    if (isAdminCollection) {
      try {
        await admin.auth().deleteUser(user.uid);
        console.log('✅ Deleted from Firebase:', user.uid);
      } catch (firebaseError) {
        console.error('⚠️ Firebase deletion failed:', firebaseError.message);
        // Continue with MongoDB deletion even if Firebase fails
      }
    }

    // Delete from MongoDB
    if (isAdminCollection) {
      await Admin.findByIdAndDelete(userId);
    } else {
      await User.findByIdAndDelete(userId);
    }

    console.log('✅ User deleted successfully');

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user' 
    });
  }
});

// Get system analytics (superadmin only)
router.get('/analytics/system', verifyToken, superAdminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      totalApplications,
      pendingDocuments,
      verifiedEmployers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['admin', 'superadmin'] } }),
      Employer.countDocuments(),
      JobSeeker.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      EmployerDocument.countDocuments({ verificationStatus: 'pending' }),
      Employer.countDocuments({ accountStatus: 'verified' })
    ]);

    res.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          employers: totalEmployers,
          jobSeekers: totalJobSeekers
        },
        jobs: {
          total: totalJobs
        },
        applications: {
          total: totalApplications
        },
        documents: {
          pending: pendingDocuments
        },
        employers: {
          verified: verifiedEmployers
        }
      }
    });

  } catch (error) {
    console.error('System analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching system analytics' 
    });
  }
});

module.exports = router;
