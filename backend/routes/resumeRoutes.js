const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
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
      existingResume.originalName = `${resumeData.personalInfo.name || 'Resume'}_Resume.pdf`;
      existingResume.fileSize = pdfBuffer.length;
      existingResume.processingStatus = 'completed';
      existingResume.personalInfo = resumeData.personalInfo;
      existingResume.summary = resumeData.summary;
      existingResume.skills = resumeData.skills;
      existingResume.workExperience = resumeData.experience;
      existingResume.education = {
        tertiary: {
          institution: resumeData.education?.tertiary?.school || '',
          degree: resumeData.education?.tertiary?.major || '',
          year: resumeData.education?.tertiary?.ay || ''
        },
        secondary: {
          institution: resumeData.education?.secondary?.school || '',
          degree: resumeData.education?.secondary?.major || '',
          year: resumeData.education?.secondary?.ay || ''
        },
        primary: {
          institution: resumeData.education?.primary?.school || '',
          degree: resumeData.education?.primary?.major || '',
          year: resumeData.education?.primary?.ay || ''
        }
      };
      existingResume.updatedAt = new Date();
      
      await existingResume.save();
      var resume = existingResume;
    } else {
      // Create new resume record
      const newResume = new Resume({
        jobSeekerUid: uid,
        jobSeekerId: jobSeeker._id,
        filename: filename,
        originalName: `${resumeData.personalInfo.name || 'Resume'}_Resume.pdf`,
        fileUrl: `/uploads/resumes/${filename}`,
        fileSize: pdfBuffer.length,
        mimeType: 'application/pdf',
        processingStatus: 'completed',
        personalInfo: resumeData.personalInfo,
        summary: resumeData.summary,
        skills: resumeData.skills,
        workExperience: resumeData.experience,
        education: {
          tertiary: {
            institution: resumeData.education?.tertiary?.school || '',
            degree: resumeData.education?.tertiary?.major || '',
            year: resumeData.education?.tertiary?.ay || ''
          },
          secondary: {
            institution: resumeData.education?.secondary?.school || '',
            degree: resumeData.education?.secondary?.major || '',
            year: resumeData.education?.secondary?.ay || ''
          },
          primary: {
            institution: resumeData.education?.primary?.school || '',
            degree: resumeData.education?.primary?.major || '',
            year: resumeData.education?.primary?.ay || ''
          }
        },
        isActive: true
      });

      await newResume.save();
      var resume = newResume;
    }

    // Update job seeker's current resume reference
    jobSeeker.currentResumeId = resume._id;
    await jobSeeker.save();

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

module.exports = router;
