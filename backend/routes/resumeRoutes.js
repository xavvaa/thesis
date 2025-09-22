const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const JobSeeker = require('../models/JobSeeker');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept PDF files only
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/resumes/upload
// @desc    Upload a new resume
// @access  Private (Job Seeker)
router.post('/upload', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const { uid } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
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

    // Deactivate previous resumes
    await Resume.updateMany(
      { jobSeekerUid: uid, isActive: true },
      { isActive: false }
    );

    // Create new resume record
    const resumeData = {
      jobSeekerUid: uid,
      jobSeekerId: jobSeeker._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      processingStatus: 'pending'
    };

    const resume = new Resume(resumeData);
    await resume.save();

    // Update job seeker's current resume reference
    jobSeeker.currentResumeId = resume._id;
    await jobSeeker.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeId: resume._id,
        filename: resume.originalName,
        fileUrl: resume.fileUrl,
        uploadedAt: resume.uploadedAt,
        processingStatus: resume.processingStatus
      }
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload resume',
      details: error.message
    });
  }
});

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
      parsedData: resume.parsedData
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
        parsedData: resume.parsedData
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

// @route   PUT /api/resumes/:id/activate
// @desc    Set a resume as active
// @access  Private (Job Seeker)
router.put('/:id/activate', verifyToken, async (req, res) => {
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

    // Deactivate all other resumes
    await Resume.updateMany(
      { jobSeekerUid: uid, isActive: true },
      { isActive: false }
    );

    // Activate this resume
    resume.isActive = true;
    await resume.save();

    // Update job seeker's current resume reference
    const jobSeeker = await JobSeeker.findOne({ uid });
    if (jobSeeker) {
      jobSeeker.currentResumeId = resume._id;
      await jobSeeker.save();
    }

    res.json({
      success: true,
      message: 'Resume activated successfully',
      data: {
        resumeId: resume._id,
        isActive: resume.isActive
      }
    });

  } catch (error) {
    console.error('Error activating resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate resume'
    });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume
// @access  Private (Job Seeker)
router.delete('/:id', verifyToken, async (req, res) => {
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

    // Delete the file from filesystem
    const filePath = path.join(__dirname, '..', resume.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the resume record
    await Resume.findByIdAndDelete(id);

    // If this was the current resume, update job seeker
    const jobSeeker = await JobSeeker.findOne({ uid });
    if (jobSeeker && jobSeeker.currentResumeId?.toString() === id) {
      // Find the most recent active resume
      const latestResume = await Resume.getActiveResumeForJobSeeker(uid);
      jobSeeker.currentResumeId = latestResume?._id || null;
      await jobSeeker.save();
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resume'
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
