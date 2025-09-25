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
    
    // Map resume education data to application format
    const mapEducationData = (educationLevel) => {
      if (!educationLevel) return {};
      return {
        institution: educationLevel.school || educationLevel.institution || '',
        degree: educationLevel.major || educationLevel.degree || '',
        year: educationLevel.ay || educationLevel.year || ''
      };
    };

    // Enhance resume data with profile information and proper field mapping
    const enhancedResumeData = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        // Use profile name if resume parsing failed
        name: resumeData.personalInfo?.name || 
              (jobSeekerProfile ? `${jobSeekerProfile.firstName} ${jobSeekerProfile.lastName}` : 'Unknown Applicant'),
        email: resumeData.personalInfo?.email || jobSeekerProfile?.email || ''
      },
      // Map education from resume format to application format
      education: {
        tertiary: mapEducationData(resumeData.education?.tertiary),
        secondary: mapEducationData(resumeData.education?.secondary),
        primary: mapEducationData(resumeData.education?.primary)
      }
    };
    
    
    // Get the job seeker's current resume file information
    const Resume = require('../models/Resume');
    let resumeFileInfo = null;
    
    console.log('=== RESUME FILE DEBUG ===');
    console.log('jobSeekerProfile exists:', !!jobSeekerProfile);
    console.log('currentResumeId:', jobSeekerProfile?.currentResumeId);
    
    if (jobSeekerProfile?.currentResumeId) {
      const resume = await Resume.findById(jobSeekerProfile.currentResumeId);
      console.log('Resume found:', !!resume);
      console.log('Resume fileUrl:', resume?.fileUrl);
      console.log('Resume filename:', resume?.filename);
      console.log('Resume originalName:', resume?.originalName);
      
      if (resume && resume.fileUrl) {
        resumeFileInfo = {
          fileName: resume.originalName || resume.filename,
          filePath: resume.fileUrl,
          fileSize: resume.fileSize
        };
        console.log('Resume file info created:', resumeFileInfo);
      } else {
        console.log('No resume or fileUrl found');
      }
    } else {
      // Try to find the most recent resume for this user
      console.log('No currentResumeId, searching for recent resume...');
      const recentResume = await Resume.findOne({ 
        $or: [
          { jobSeekerUid: uid },
          { uid: uid }
        ],
        isActive: true 
      }).sort({ uploadedAt: -1 });
      console.log('Recent resume found:', !!recentResume);
      console.log('Recent resume fileUrl:', recentResume?.fileUrl);
      
      if (recentResume && recentResume.fileUrl) {
        resumeFileInfo = {
          fileName: recentResume.originalName || recentResume.filename,
          filePath: recentResume.fileUrl,
          fileSize: recentResume.fileSize
        };
        console.log('Resume file info from recent resume:', resumeFileInfo);
      }
    }

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
      applicantAddress: enhancedResumeData.personalInfo.address || jobSeekerProfile?.address || '',
      // Include resume file information
      resumeFile: resumeFileInfo
    };
    
    console.log('Final resumeFileInfo being saved:', resumeFileInfo);
    console.log('Application data resumeFile field:', applicationData.resumeFile);
    
    const application = new Application(applicationData);
    await application.save();
    
    console.log('Application saved with resumeFile:', application.resumeFile);

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

    if (!uid) {
      return res.status(401).json({
        success: false,
        error: 'User authentication failed'
      });
    }

    const applications = await Application.find({ jobSeekerUid: uid })
      .populate('jobId', 'title companyName location type salary employerUid')
      .sort({ appliedDate: -1 });

    // Filter out applications where the job was deleted and get employer details
    const formattedApplications = await Promise.all(
      applications
        .filter(app => app.jobId) // Only include applications where job still exists
        .map(async (app) => {
          const job = app.jobId;
          
          // Fetch employer details directly from Employers collection
          const Employer = require('../models/Employer');
          const employer = await Employer.findOne({ uid: job.employerUid })
            .select('companyName companyDescription industry address contactPerson website email');
          
          return {
            id: app._id,
            jobId: job._id,
            jobTitle: job.title,
            company: job.companyName || 'Company Name Not Available',
            location: job.location || 'Location Not Available',
            type: job.type || 'Type Not Available',
            salary: job.salary || 'Salary Not Available',
            status: app.status,
            appliedDate: app.appliedDate,
            updatedAt: app.updatedAt,
            companyDetails: {
              name: employer?.companyName || job.companyName,
              description: employer?.companyDescription || `We are ${job.companyName}, a leading company in our industry.`,
              industry: employer?.industry || 'Technology & Services',
              website: employer?.website,
              headquarters: employer?.address ? 
                `${employer.address.city || ''}, ${employer.address.province || ''}`.trim().replace(/^,|,$/, '') || job.location :
                job.location,
              email: employer?.email || `careers@${job.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
              phone: employer?.contactPerson?.phoneNumber || '+63 2 8123 4567'
            }
          };
        })
    );

    console.log(`Found ${applications.length} applications for user ${uid}, ${formattedApplications.length} with valid jobs`);

    res.json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    console.error('Error fetching job seeker applications:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      uid: req.user?.uid
    });
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

// Route to download resume PDF
router.get('/:applicationId/resume', verifyToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    console.log('=== RESUME DOWNLOAD DEBUG ===');
    console.log('Application ID:', applicationId);
    
    const application = await Application.findById(applicationId);
    if (!application) {
      console.log('Application not found');
      return res.status(404).json({ message: 'Application not found' });
    }
    
    console.log('Application found, resumeFile:', application.resumeFile);
    console.log('Application employerUid:', application.employerUid);
    
    // Check if user has permission to access this resume
    const { uid, role } = req.user;
    console.log('User role:', role);
    console.log('User uid:', uid);
    console.log('Application jobSeekerUid:', application.jobSeekerUid);
    console.log('Access check: role === employer?', role === 'employer');
    console.log('Access check: jobSeekerUid matches?', application.jobSeekerUid === uid);
    console.log('Access check: employerUid matches?', application.employerUid === uid);
    
    // Allow access if user is the employer who posted the job OR the job seeker who applied
    // Handle case where role might be undefined but UID matches
    const isEmployer = (role === 'employer' || application.employerUid === uid) && application.employerUid === uid;
    const isJobSeeker = application.jobSeekerUid === uid;
    
    console.log('Final access check - isEmployer:', isEmployer, 'isJobSeeker:', isJobSeeker);
    
    if (!isEmployer && !isJobSeeker) {
      console.log('Access denied - user is not the employer or job seeker for this application');
      return res.status(403).json({ message: 'Access denied' });
    }
    
    console.log('Access granted!');
    
    // Try to get resume file URL - check application first, then Resume collection
    let resumeFileUrl = application.resumeFile?.filePath;
    
    if (!resumeFileUrl) {
      console.log('No resumeFile in application, looking up Resume collection');
      
      const Resume = require('../models/Resume');
      const resume = await Resume.findOne({ 
        $or: [
          { jobSeekerUid: application.jobSeekerUid },
          { uid: application.jobSeekerUid }
        ],
        isActive: true 
      }).sort({ uploadedAt: -1 });
      
      if (resume?.fileUrl) {
        resumeFileUrl = resume.fileUrl;
        console.log('Found resume fileUrl from Resume collection:', resumeFileUrl);
      }
    }
    
    if (!resumeFileUrl) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    // Check if it's a URL (production) or local path (development)
    if (resumeFileUrl.startsWith('http')) {
      console.log('Redirecting to URL:', resumeFileUrl);
      return res.redirect(resumeFileUrl);
    } else {
      // Development: serve local file via static middleware URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      const staticUrl = resumeFileUrl.startsWith('/uploads') 
        ? `${baseUrl}${resumeFileUrl}`
        : `${baseUrl}/uploads/resumes/${path.basename(resumeFileUrl)}`;
      
      console.log('Redirecting to static URL:', staticUrl);
      return res.redirect(staticUrl);
    }
    
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ message: 'Error downloading resume file' });
  }
});

module.exports = router;
