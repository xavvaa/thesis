const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const MLResume = require('../models/MLResume');
const JobSeeker = require('../models/JobSeeker');

// @route   GET /api/resumes
// @desc    Get job seeker's resumes
// @access  Private (Job Seeker)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const resumes = await Resume.find({ jobSeekerUid: uid })
      .sort({ uploadedAt: -1 });

    const formattedResumes = resumes.map(resume => ({
      id: resume._id,
      filename: resume.originalName,
      fileUrl: resume.fileUrl,
      fileSize: resume.fileSize,
      processingStatus: resume.processingStatus,
      isActive: resume.isActive,
      uploadedAt: resume.uploadedAt,
      processedAt: resume.processedAt,
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      skills: resume.skills,
      workExperience: resume.workExperience,
      education: resume.education
    }));

    res.json({
      success: true,
      data: formattedResumes
    });

  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resumes'
    });
  }
});

// @route   GET /api/resumes/current
// @desc    Get job seeker's current active resume
// @access  Private (Job Seeker)
router.get('/current', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const resume = await Resume.getActiveResumeForJobSeeker(uid);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'No active resume found'
      });
    }

    res.json({
      success: true,
      data: {
        id: resume._id,
        filename: resume.originalName,
        fileUrl: resume.fileUrl,
        processingStatus: resume.processingStatus,
        uploadedAt: resume.uploadedAt,
        processedAt: resume.processedAt,
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        skills: resume.skills,
        workExperience: resume.workExperience,
        education: resume.education
      }
    });

  } catch (error) {
    console.error('Error fetching current resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current resume'
    });
  }
});

// @route   POST /api/resumes/create
// @desc    Create a new resume with form data and PDF
// @access  Private (Job Seeker)
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { resumeData, pdfData } = req.body;

    if (!resumeData || !pdfData) {
      return res.status(400).json({
        success: false,
        error: 'Resume data and PDF data are required'
      });
    }

    // Find the job seeker
    const jobSeeker = await JobSeeker.findOne({ uid });
    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        error: 'Job seeker profile not found'
      });
    }

    // Check if user already has an active resume
    let existingResume = await Resume.findOne({ jobSeekerUid: uid, isActive: true });

    // Convert base64 PDF data to buffer
    const pdfBuffer = Buffer.from(pdfData, 'base64');
    
    let filename, filePath;
    
    // Helper function to construct full name
    const constructFullName = (personalInfo) => {
      const { firstName, lastName } = personalInfo;
      return `${firstName || ''} ${lastName || ''}`.trim() || 'Resume';
    };

    // Helper function to convert education dates to years only
    const processEducationDates = (education) => {
      return education.map(edu => ({
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate + '-01').getFullYear().toString() : '',
        endDate: edu.endDate === 'present' ? 'present' : (edu.endDate ? new Date(edu.endDate + '-01').getFullYear().toString() : '')
      }));
    };

    // Helper function to process work experience (remove duration field)
    const processWorkExperience = (experience) => {
      return experience.map(exp => {
        const { duration, ...expWithoutDuration } = exp;
        return expWithoutDuration;
      });
    };

    if (existingResume) {
      // Update existing resume - reuse the same filename
      filename = existingResume.filename;
      filePath = path.join(__dirname, '..', 'uploads', 'resumes', filename);
    } else {
      // Create new resume - generate new filename
      filename = `resume-${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`;
      filePath = path.join(__dirname, '..', 'uploads', 'resumes', filename);
    }
    
    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save PDF file (overwrite if updating)
    fs.writeFileSync(filePath, pdfBuffer);

    if (existingResume) {
      // Update existing resume
      const fullName = constructFullName(resumeData.personalInfo);
      existingResume.originalName = `${fullName}_Resume.pdf`;
      existingResume.fileSize = pdfBuffer.length;
      existingResume.processingStatus = 'completed';
      existingResume.personalInfo = {
        fullName: fullName,
        email: resumeData.personalInfo.email,
        phone: resumeData.personalInfo.phone,
        age: resumeData.personalInfo.age,
        birthday: resumeData.personalInfo.birthday,
        photo: resumeData.personalInfo.photo || '',
        // Store address and PSGC codes in grouped location object
        address: resumeData.personalInfo.address,
        zipCode: resumeData.personalInfo.zipCode,
        location: {
          region: resumeData.personalInfo.region || '',
          province: resumeData.personalInfo.province || '',
          city: resumeData.personalInfo.city || '',
          barangay: resumeData.personalInfo.barangay || ''
        },
        readableLocation: {
          region: resumeData.personalInfo.regionName || '',
          province: resumeData.personalInfo.provinceName || '',
          city: resumeData.personalInfo.cityName || '',
          barangay: resumeData.personalInfo.barangayName || ''
        }
      };
      
      // Debug: Log what's being stored
      console.log('🔍 BACKEND BARANGAY DEBUG:');
      console.log('  - Received barangay PSGC:', resumeData.personalInfo.barangay, '(type:', typeof resumeData.personalInfo.barangay, ')');
      console.log('  - Received barangay name:', resumeData.personalInfo.barangayName, '(type:', typeof resumeData.personalInfo.barangayName, ')');
      console.log('Storing location data:', {
        psgcCodes: {
          region: resumeData.personalInfo.region,
          province: resumeData.personalInfo.province,
          city: resumeData.personalInfo.city,
          barangay: resumeData.personalInfo.barangay
        },
        readableNames: {
          region: resumeData.personalInfo.regionName,
          province: resumeData.personalInfo.provinceName,
          city: resumeData.personalInfo.cityName,
          barangay: resumeData.personalInfo.barangayName
        }
      });
      
      existingResume.summary = resumeData.summary;
      existingResume.skills = resumeData.skills;
      existingResume.workExperience = processWorkExperience(resumeData.experience);
      existingResume.education = processEducationDates(resumeData.education);
      existingResume.updatedAt = new Date();
      // Increment version on update
      existingResume.version = (existingResume.version || 1) + 1;
      
      await existingResume.save();
      var resume = existingResume;
    } else {
      // Create new resume record
      const fullName = constructFullName(resumeData.personalInfo);
      const newResume = new Resume({
        jobSeekerUid: uid,
        jobSeekerId: jobSeeker._id,
        filename: filename,
        originalName: `${fullName}_Resume.pdf`,
        fileUrl: `/uploads/resumes/${filename}`,
        fileSize: pdfBuffer.length,
        mimeType: 'application/pdf',
        processingStatus: 'completed',
        personalInfo: {
          fullName: fullName,
          email: resumeData.personalInfo.email,
          phone: resumeData.personalInfo.phone,
          age: resumeData.personalInfo.age,
          birthday: resumeData.personalInfo.birthday,
          photo: resumeData.personalInfo.photo || '',
          // Store address and PSGC codes in grouped location object
          address: resumeData.personalInfo.address,
          zipCode: resumeData.personalInfo.zipCode,
          location: {
            region: resumeData.personalInfo.region || '',
            province: resumeData.personalInfo.province || '',
            city: resumeData.personalInfo.city || '',
            barangay: resumeData.personalInfo.barangay || ''
          },
          readableLocation: {
            region: resumeData.personalInfo.regionName || '',
            province: resumeData.personalInfo.provinceName || '',
            city: resumeData.personalInfo.cityName || '',
            barangay: resumeData.personalInfo.barangayName || ''
          }
        },
        summary: resumeData.summary,
        skills: resumeData.skills,
        workExperience: processWorkExperience(resumeData.experience),
        education: processEducationDates(resumeData.education),
        version: 1, // Start new resumes at version 1
        isActive: true
      });

      // Debug: Log what's being stored for new resume
      console.log('Storing NEW resume location data:', {
        psgcCodes: {
          region: resumeData.personalInfo.region,
          province: resumeData.personalInfo.province,
          city: resumeData.personalInfo.city,
          barangay: resumeData.personalInfo.barangay
        },
        readableNames: {
          region: resumeData.personalInfo.regionName,
          province: resumeData.personalInfo.provinceName,
          city: resumeData.personalInfo.cityName,
          barangay: resumeData.personalInfo.barangayName
        }
      });

      await newResume.save();
      var resume = newResume;
    }

    // Update job seeker's current resume reference
    jobSeeker.currentResumeId = resume._id;
    await jobSeeker.save();

    // Sync to ML Resume collection
    try {
      await MLResume.createOrUpdateFromResume(resume);
    } catch (mlError) {
      console.error('Error syncing to ML Resume collection:', mlError);
      // Don't fail the main operation if ML sync fails
    }

    res.status(201).json({
      success: true,
      message: existingResume ? 'Resume updated successfully' : 'Resume created successfully',
      data: {
        resumeId: resume._id,
        filename: resume.originalName,
        fileUrl: resume.fileUrl,
        uploadedAt: resume.uploadedAt,
        processingStatus: resume.processingStatus
      }
    });

  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create resume',
      details: error.message
    });
  }
});

// @route   GET /api/resumes/:id/download
// @desc    Download a resume file
// @access  Private (Job Seeker)
router.get('/:id/download', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Find the resume
    const resume = await Resume.findOne({ _id: id, jobSeekerUid: uid });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const filePath = path.join(__dirname, '..', resume.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.download(filePath, resume.originalName);

  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download resume'
    });
  }
});

// @route   GET /api/resumes/view/:applicationId
// @desc    View resume PDF for an application
// @access  Private (Employer)
router.get('/view/:applicationId', verifyToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { uid } = req.user;

    // Find the application and verify employer access
    const Application = require('../models/Application');
    const application = await Application.findOne({
      _id: applicationId,
      employerUid: uid
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or access denied'
      });
    }

    // Get the job seeker's current resume
    const JobSeeker = require('../models/JobSeeker');
    const jobSeeker = await JobSeeker.findOne({ uid: application.jobSeekerUid });
    
    if (!jobSeeker || !jobSeeker.currentResumeId) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const resume = await Resume.findById(jobSeeker.currentResumeId);
    if (!resume || !resume.pdfPath) {
      return res.status(404).json({
        success: false,
        error: 'Resume PDF not found'
      });
    }

    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.resolve(resume.pdfPath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Resume file not found on server'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resume.fileName || 'resume.pdf'}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error viewing resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to view resume'
    });
  }
});

// @route   GET /api/resumes/download/:applicationId
// @desc    Download resume PDF for an application
// @access  Private (Employer)
router.get('/download/:applicationId', verifyToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { uid } = req.user;

    // Find the application and verify employer access
    const Application = require('../models/Application');
    const application = await Application.findOne({
      _id: applicationId,
      employerUid: uid
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or access denied'
      });
    }

    // Get the job seeker's current resume
    const JobSeeker = require('../models/JobSeeker');
    const jobSeeker = await JobSeeker.findOne({ uid: application.jobSeekerUid });
    
    if (!jobSeeker || !jobSeeker.currentResumeId) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const resume = await Resume.findById(jobSeeker.currentResumeId);
    if (!resume || !resume.pdfPath) {
      return res.status(404).json({
        success: false,
        error: 'Resume PDF not found'
      });
    }

    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.resolve(resume.pdfPath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Resume file not found on server'
      });
    }

    const applicantName = application.applicant?.name || application.resumeData?.personalInfo?.name || 'applicant';
    const fileName = `${applicantName.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download resume'
    });
  }
});

module.exports = router;
