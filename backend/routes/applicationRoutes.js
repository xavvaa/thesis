const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/applications
// @desc    Submit job application
// @access  Private (Job Seeker)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { jobId, resumeData, coverLetter } = req.body;
    const { uid } = req.user;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    if (!uid) {
      console.error('Missing uid in token');
      return res.status(401).json({
        success: false,
        error: 'User authentication failed'
      });
    }

    // Get job details to find employer
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    };

    // Check if user already applied to this job
    const existingApplication = await Application.findOne({
      jobId,
      jobSeekerUid: uid
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this job'
      });
    }

    // Create application
    // Handle missing employerUid field in existing jobs
    let employerIdentifier = 'unknown';
    if (job.employerUid) {
      employerIdentifier = job.employerUid;
    } else if (job.employerId) {
      employerIdentifier = job.employerId;
    }
    
    // Get job seeker profile to ensure we have the correct name
    const JobSeeker = require('../models/JobSeeker');
    const jobSeekerProfile = await JobSeeker.findOne({ uid });
    
    // Enhance resume data with profile information
    const enhancedResumeData = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        // Use profile name if resume parsing failed
        name: resumeData.personalInfo?.name || 
              (jobSeekerProfile ? `${jobSeekerProfile.firstName} ${jobSeekerProfile.lastName}` : 'Unknown Applicant'),
        email: resumeData.personalInfo?.email || jobSeekerProfile?.email || ''
      }
    };
    
    
    const applicationData = {
      jobId,
      jobSeekerUid: uid,
      employerUid: employerIdentifier,
      resumeData: enhancedResumeData,
      coverLetter,
      status: 'pending',
      // Store applicant info for easy access
      applicantName: enhancedResumeData.personalInfo.name,
      applicantEmail: enhancedResumeData.personalInfo.email,
      applicantPhone: enhancedResumeData.personalInfo.phone || jobSeekerProfile?.phone || '',
      applicantAddress: enhancedResumeData.personalInfo.address || jobSeekerProfile?.address || ''
    };
    
    const application = new Application(applicationData);
    await application.save();

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        status: application.status,
        appliedDate: application.appliedDate
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      jobId,
      uid,
      resumeData: resumeData ? 'present' : 'missing'
    });
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// @route   GET /api/applications/employer
// @desc    Get applications for employer's jobs
// @access  Private (Employer)
router.get('/employer', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { status, jobId } = req.query;


    // Build query using clean employerUid field
    const query = {
      employerUid: uid
    };
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;


    const applications = await Application.find(query)
      .populate('jobId', 'title location type salary companyName')
      .sort({ appliedDate: -1 });


    // Format applications for frontend
    const formattedApplications = applications.map(app => {

      return {
        _id: app._id, // Add _id for compatibility
        id: app._id,
        jobId: app.jobId?._id,
        jobTitle: app.jobId?.title,
        jobLocation: app.jobId?.location,
        jobType: app.jobId?.type,
        jobSalary: app.jobId?.salary,
        applicant: {
          name: app.resumeData?.personalInfo?.name || app.applicantName || 'Unknown Applicant',
          email: app.resumeData?.personalInfo?.email || app.applicantEmail || '',
          phone: app.resumeData?.personalInfo?.phone || app.applicantPhone || '',
          address: app.resumeData?.personalInfo?.address || app.applicantAddress || ''
        },
        resumeData: app.resumeData,
        status: app.status,
        appliedDate: app.appliedDate,
        coverLetter: app.coverLetter || '',
        notes: app.notes || ''
      };
    });

    res.json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const { uid } = req.user;

    const application = await Application.findOne({
      _id: id,
      employerUid: uid
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    application.status = status;
    if (notes) application.notes = notes;
    application.updatedAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated',
      data: {
        applicationId: application._id,
        status: application.status,
        updatedAt: application.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status'
    });
  }
});

// @route   GET /api/applications/jobseeker
// @desc    Get job seeker's applications
// @access  Private (Job Seeker)
router.get('/jobseeker', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const applications = await Application.find({ jobSeekerUid: uid })
      .populate('jobId', 'title companyName location type salary')
      .sort({ appliedDate: -1 });

    const formattedApplications = applications.map(app => ({
      id: app._id,
      jobId: app.jobId._id,
      jobTitle: app.jobId.title,
      company: app.jobId.companyName,
      location: app.jobId.location,
      type: app.jobId.type,
      salary: app.jobId.salary,
      status: app.status,
      appliedDate: app.appliedDate,
      updatedAt: app.updatedAt
    }));

    res.json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    console.error('Error fetching job seeker applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// @route   GET /api/applications/user
// @desc    Get user's job applications
// @access  Private (Job Seeker)
router.get('/user', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    if (!uid) {
      return res.status(401).json({
        success: false,
        error: 'User authentication failed'
      });
    }

    // Find all applications by this user
    const applications = await Application.find({ jobSeekerUid: uid })
      .sort({ appliedDate: -1 }); // Most recent first

    console.log(`Found ${applications.length} applications for user ${uid}`);

    res.status(200).json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

module.exports = router;
