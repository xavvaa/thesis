import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiStar, FiPlus, FiTrash2, FiDownload, FiClock, FiCalendar, FiEdit3, FiSave, FiX, FiFileText } from 'react-icons/fi';
import jsPDF from 'jspdf';
import styles from './CreateResumeTab.module.css';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  age: string;
  birthday: string;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface EducationLevel {
  major: string;
  school: string;
  ay: string;
}

interface Education {
  tertiary: EducationLevel;
  secondary: EducationLevel;
  primary: EducationLevel;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: {
    tertiary: EducationLevel;
    secondary: EducationLevel;
    primary: EducationLevel;
  };
  skills: string[];
  certifications: string[];
}

interface CreateResumeTabProps {
  resumeFormData?: ResumeData | null;
  onResumeDataChange?: (data: ResumeData) => void;
}

const CreateResumeTab: React.FC<CreateResumeTabProps> = ({ 
  resumeFormData, 
  onResumeDataChange 
}) => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      age: '',
      birthday: ''
    },
    summary: '',
    experience: [{
      company: '',
      position: '',
      duration: '',
      description: ''
    }],
    education: {
      tertiary: {
        major: '',
        school: '',
        ay: ''
      },
      secondary: {
        major: '',
        school: '',
        ay: ''
      },
      primary: {
        major: '',
        school: '',
        ay: ''
      }
    },
    skills: [''],
    certifications: ['']
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isResumeGenerated, setIsResumeGenerated] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [generationStep, setGenerationStep] = useState<'generating' | 'success'>('generating');
  const [isPDFReady, setIsPDFReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasExistingResume, setHasExistingResume] = useState(false);

  // Load existing resume data on component mount or from props
  useEffect(() => {
    console.log('Loading resume data...', { resumeFormData, hasLocalStorage: !!localStorage.getItem('resumeData') });
    
    // Always check localStorage first for saved data
    const savedResume = localStorage.getItem('resumeData');
    console.log('Checking localStorage:', savedResume ? 'Found data' : 'No data');
    
    if (savedResume) {
      try {
        const parsedData = JSON.parse(savedResume);
        console.log('Parsed localStorage data:', parsedData);
        
        // Ensure the parsed data has all required fields with defaults
        const completeData = {
          personalInfo: {
            name: '',
            email: '',
            phone: '',
            address: '',
            age: '',
            birthday: '',
            ...parsedData.personalInfo
          },
          summary: parsedData.summary || '',
          experience: parsedData.experience || [{
            company: '',
            position: '',
            duration: '',
            description: ''
          }],
          education: {
            tertiary: { major: '', school: '', ay: '', ...parsedData.education?.tertiary },
            secondary: { major: '', school: '', ay: '', ...parsedData.education?.secondary },
            primary: { major: '', school: '', ay: '', ...parsedData.education?.primary }
          },
          skills: parsedData.skills || [''],
          certifications: parsedData.certifications || ['']
        };
        
        console.log('Setting complete data:', completeData);
        setResumeData(completeData);
        setHasExistingResume(true);
        
        // Update parent component with loaded data
        if (onResumeDataChange) {
          onResumeDataChange(completeData);
        }
      } catch (error) {
        console.error('Error loading saved resume:', error);
      }
    } else if (resumeFormData) {
      // Fallback to parent props if no localStorage
      console.log('Loading from parent props:', resumeFormData);
      setResumeData(resumeFormData);
      setHasExistingResume(true);
    }
  }, []);

  // Check if all required fields are filled
  const isFormValid = () => {
    const { personalInfo, summary, experience, education, skills } = resumeData;
    
    // Check personal info
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone || !personalInfo.address || !personalInfo.age || !personalInfo.birthday) {
      return false;
    }
    
    // Check summary
    if (!summary.trim()) {
      return false;
    }
    
    // Check at least one experience with company and position
    const hasValidExperience = experience.some(exp => exp.company.trim() && exp.position.trim());
    if (!hasValidExperience) {
      return false;
    }
    
    // Check at least tertiary education
    if (!education.tertiary.major || !education.tertiary.school || !education.tertiary.ay) {
      return false;
    }
    
    // Check at least one skill
    const hasValidSkills = skills.some(skill => skill.trim());
    if (!hasValidSkills) {
      return false;
    }
    
    return true;
  };

  const updateResumeData = (field: keyof ResumeData, value: any) => {
    const newData = { ...resumeData, [field]: value };
    setResumeData(newData);
    setHasUnsavedChanges(true);
    setIsPDFReady(false);
    // Update parent component to persist data across tab switches
    if (onResumeDataChange) {
      onResumeDataChange(newData);
    }
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
    setIsPDFReady(false);
  };

  const updateSummary = (value: string) => {
    updateResumeData('summary', value);
  };

  const addExperience = () => {
    const newExperience = [...resumeData.experience, {
      company: '',
      position: '',
      duration: '',
      description: ''
    }];
    updateResumeData('experience', newExperience);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperience = resumeData.experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    updateResumeData('experience', newExperience);
  };

  const removeExperience = (index: number) => {
    const newExperience = resumeData.experience.filter((_, i) => i !== index);
    updateResumeData('experience', newExperience);
  };

  const updateEducation = (level: 'tertiary' | 'secondary' | 'primary', field: keyof EducationLevel, value: string) => {
    const newEducation = {
      ...resumeData.education,
      [level]: {
        ...resumeData.education[level],
        [field]: value
      }
    };
    updateResumeData('education', newEducation);
  };

  const addSkill = () => {
    const newSkills = [...resumeData.skills, ''];
    updateResumeData('skills', newSkills);
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = resumeData.skills.map((skill, i) => i === index ? value : skill);
    updateResumeData('skills', newSkills);
  };

  const removeSkill = (index: number) => {
    const newSkills = resumeData.skills.filter((_, i) => i !== index);
    updateResumeData('skills', newSkills);
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const updateCertification = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const removeCertification = (index: number) => {
    if (resumeData.certifications.length > 1) {
      setResumeData(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }));
    }
  };

  const generatePDF = (filename?: string, returnBlob = false) => {
    const doc = new jsPDF();
    const { personalInfo, summary, experience, education, skills } = resumeData;
    
    // Page margins and layout
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = 30;
    
    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };
    
    // Name - Large and centered
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const nameWidth = doc.getTextWidth(personalInfo.name || 'Your Name');
    const nameX = (pageWidth - nameWidth) / 2;
    doc.text(personalInfo.name || 'Your Name', nameX, yPosition);
    yPosition += 10;
    
    // Contact Information - Centered
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [];
    
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);
    if (personalInfo.address) contactInfo.push(personalInfo.address);
    if (personalInfo.age) contactInfo.push(`Age: ${personalInfo.age}`);
    if (personalInfo.birthday) {
      const formattedDate = new Date(personalInfo.birthday).toLocaleDateString();
      contactInfo.push(`Birthday: ${formattedDate}`);
    }
    
    // Display contact info centered, separated by bullets
    if (contactInfo.length > 0) {
      const contactText = contactInfo.join(' • ');
      const contactWidth = doc.getTextWidth(contactText);
      const contactX = (pageWidth - contactWidth) / 2;
      doc.text(contactText, contactX, yPosition);
      yPosition += 15;
    }
    
    // Add a simple line separator
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Helper function to add section headers with consistent spacing
    const addSectionHeader = (title: string) => {
      checkPageBreak(25); // Reserve space for section header and spacing
      
      // Add moderate spacing before each section (except first one)
      if (yPosition > 60) { // Skip spacing for first section after header
        yPosition += 8; // Reduced space before section
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title, margin, yPosition);
      yPosition += 3;
      
      // Simple underline
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, margin + doc.getTextWidth(title), yPosition);
      yPosition += 8; // Reduced space after header
    };
    
    // Professional Summary
    if (summary) {
      addSectionHeader('PROFESSIONAL SUMMARY');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const summaryLines = doc.splitTextToSize(summary, contentWidth);
      checkPageBreak(summaryLines.length * 5 + 10);
      doc.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 5;
    }
    
    // Work Experience
    const validExperience = experience.filter(exp => exp.company && exp.position);
    if (validExperience.length > 0) {
      addSectionHeader('WORK EXPERIENCE');
      
      validExperience.forEach((exp, index) => {
        // Calculate space needed for this experience entry
        const descLines = exp.description ? doc.splitTextToSize(exp.description, contentWidth - 10) : [];
        const spaceNeeded = 6 + (exp.duration ? 6 : 0) + (descLines.length * 5) + 8 + 5;
        checkPageBreak(spaceNeeded);
        
        // Job title and company
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`${exp.position}`, margin, yPosition);
        
        // Company name
        doc.setFont('helvetica', 'normal');
        doc.text(`    - ${exp.company}`, margin + doc.getTextWidth(`${exp.position}`), yPosition);
        yPosition += 6;
        
        // Duration
        if (exp.duration) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text(exp.duration, margin, yPosition);
          yPosition += 6;
        }
        
        // Description
        if (exp.description) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(descLines, margin + 5, yPosition);
          yPosition += descLines.length * 5 + 8;
        }
        
        // Add spacing between experiences
        if (index < validExperience.length - 1) {
          yPosition += 5;
        }
      });
    }
    
    // Educational Background
    const hasEducation = education.tertiary.major || education.tertiary.school || 
                         education.secondary.major || education.secondary.school ||
                         education.primary.major || education.primary.school;
    
    if (hasEducation) {
      addSectionHeader('EDUCATION');
      
      const educationLevels = [
        { level: 'Tertiary Education', data: education.tertiary },
        { level: 'Secondary Education', data: education.secondary },
        { level: 'Primary Education', data: education.primary }
      ];
      
      educationLevels.forEach(({ level, data }) => {
        if (data.major || data.school) {
          // Calculate space needed for this education entry
          const spaceNeeded = 6 + (data.major ? 5 : 0) + (data.school ? 5 : 0) + (data.ay ? 5 : 0) + 5;
          checkPageBreak(spaceNeeded);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(level, margin, yPosition);
          yPosition += 6;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          if (data.major) {
            doc.text(data.major, margin + 5, yPosition);
            yPosition += 5;
          }
          if (data.school) {
            doc.text(data.school, margin + 5, yPosition);
            yPosition += 5;
          }
          if (data.ay) {
            doc.text(data.ay, margin + 5, yPosition);
            yPosition += 5;
          }
          yPosition += 5;
        }
      });
    }
    
    // Skills
    const validSkills = skills.filter(skill => skill && skill.trim() !== '');
    console.log('Skills data for PDF:', skills);
    console.log('Valid skills for PDF:', validSkills);
    
    if (validSkills.length > 0) {
      addSectionHeader('SKILLS');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Display skills as comma-separated list
      const skillsText = validSkills.join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
      
      // Check if we need a new page for skills
      checkPageBreak(skillsLines.length * 5 + 10);
      
      doc.text(skillsLines, margin, yPosition);
      yPosition += skillsLines.length * 5;
    } else {
      console.log('No valid skills found for PDF generation');
    }
    
    // Return blob for database storage or save file for download
    if (returnBlob) {
      return doc.output('blob');
    } else {
      // Use provided filename or generate a consistent one
      const defaultFileName = `${personalInfo.name?.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
      const fileName = filename || defaultFileName;
      doc.save(fileName);
    }
  };

  const handleSaveResume = async () => {
    setIsSaving(true);
    setShowGeneratingModal(true);
    setGenerationStep('generating');
    
    try {
      const cleanedData = {
        ...resumeData,
        experience: resumeData.experience.filter(exp => exp.company || exp.position),
        skills: resumeData.skills.filter(skill => skill.trim() !== ''),
        certifications: resumeData.certifications.filter(cert => cert.trim() !== '')
      };

      // Save to localStorage (keeps data editable)
      localStorage.setItem('resumeData', JSON.stringify(cleanedData));
      
      // Update parent state
      if (onResumeDataChange) {
        onResumeDataChange(cleanedData);
      }
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setGenerationStep('success');
      
      // Generate PDF blob for database storage (without downloading)
      const pdfBlob = generatePDF(undefined, true);
      
      // Here you can save the pdfBlob to your database
      // Example: await savePDFToDatabase(pdfBlob, cleanedData);
      console.log('PDF blob created for database storage:', pdfBlob);
      
      // Set PDF ready state immediately after success
      setIsPDFReady(true);
      setHasUnsavedChanges(false);
      
    } catch (error) {
      console.error('Error saving resume:', error);
      setShowGeneratingModal(false);
      alert('Error saving resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSection = (section: string) => {
    setEditingSection(section);
  };

  const handleSaveSection = () => {
    // Save current data to localStorage
    const cleanedData = {
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.company || exp.position),
      skills: resumeData.skills.filter(skill => skill.trim() !== ''),
      certifications: resumeData.certifications.filter(cert => cert.trim() !== '')
    };
    localStorage.setItem('resumeData', JSON.stringify(cleanedData));
    
    if (onResumeDataChange) {
      onResumeDataChange(cleanedData);
    }
    
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleBackToForm = () => {
    setIsResumeGenerated(false);
    setEditingSection(null);
  };

  const handleDownloadPDF = () => {
    generatePDF();
  };

  const handleCloseModal = () => {
    setShowGeneratingModal(false);
    setGenerationStep('generating');
    // Scroll to top to show the PDF ready banner
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const clearResumeData = () => {
    const emptyData = {
      personalInfo: { name: '', email: '', phone: '', address: '', age: '', birthday: '' },
      summary: '',
      experience: [{ company: '', position: '', duration: '', description: '' }],
      education: {
        tertiary: { major: '', school: '', ay: '' },
        secondary: { major: '', school: '', ay: '' },
        primary: { major: '', school: '', ay: '' }
      },
      skills: [''],
      certifications: ['']
    };
    setResumeData(emptyData);
    localStorage.removeItem('resumeData');
    setHasExistingResume(false);
    setIsPDFReady(false);
    // Clear parent component data as well
    if (onResumeDataChange) {
      onResumeDataChange(emptyData);
    }
  };


  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.contentWrapper}>
      
      {/* Generation Modal */}
      {showGeneratingModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button 
              onClick={handleCloseModal}
              className={styles.modalCloseButton}
            >
              <FiX />
            </button>
            <div className={styles.modalIcon}>
              {generationStep === 'generating' ? (
                <div className={styles.spinner}></div>
              ) : (
                <div className={styles.successIcon}>✓</div>
              )}
            </div>
            <h3 className={styles.modalTitle}>
              {generationStep === 'generating' ? 'Generating Resume' : 'Successfully Generated!'}
            </h3>
            <p className={styles.modalMessage}>
              {generationStep === 'generating' 
                ? 'Please wait while we prepare your resume...' 
                : 'Your resume has been generated successfully!'
              }
            </p>
            {generationStep === 'success' && (
              <div className={styles.modalActions}>
                <button 
                  onClick={handleDownloadPDF}
                  className={styles.modalDownloadButton}
                >
                  <FiDownload /> Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      
      {/* Download PDF Section - Show when PDF is ready */}
      {isPDFReady && (
        <div className={styles.pdfReadyBanner}>
          <div className={styles.pdfReadyContent}>
            <div className={styles.pdfReadyMessage}>
              <FiDownload className={styles.pdfReadyIcon} />
              <span>Your resume is ready for download! Use the Download Resume PDF button below.</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Personal Information */}
      <div className={styles.sectionHeader}>
        <FiUser className={styles.sectionIcon} />
        <h2 className={styles.sectionTitle}>Personal Information</h2>
      </div>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>
            <FiUser className={styles.labelIcon} />
            Full Name
          </label>
          <input
            type="text"
            value={resumeData.personalInfo.name}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            placeholder="Enter your full name"
            className={styles.formInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <FiMail className={styles.labelIcon} />
            Email Address
          </label>
          <input
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            placeholder="Enter your email"
            className={styles.formInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <FiPhone className={styles.labelIcon} />
            Phone Number
          </label>
          <input
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            placeholder="Enter your phone number"
            className={styles.formInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <FiMapPin className={styles.labelIcon} />
            Address
          </label>
          <input
            type="text"
            value={resumeData.personalInfo.address}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            className={styles.formInput}
            placeholder="Enter your address"
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <FiClock className={styles.labelIcon} />
            Age
          </label>
          <input
            type="number"
            value={resumeData.personalInfo.age}
            onChange={(e) => updatePersonalInfo('age', e.target.value)}
            className={styles.formInput}
            placeholder="Enter your age"
            min="16"
            max="100"
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <FiCalendar className={styles.labelIcon} />
            Birthday
          </label>
          <input
            type="date"
            value={resumeData.personalInfo.birthday}
            onChange={(e) => updatePersonalInfo('birthday', e.target.value)}
            className={styles.formInput}
          />
        </div>
      </div>

      {/* Professional Summary */}
      <div className={styles.sectionHeader}>
        <FiFileText className={styles.sectionIcon} />
        <h2 className={styles.sectionTitle}>Professional Summary</h2>
      </div>
      <div className={styles.formGroup}>
        <label>Summary</label>
        <textarea
          value={resumeData.summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="Write a brief professional summary about yourself..."
          className={styles.formTextarea}
        />
      </div>

      {/* Work Experience */}
      <div className={styles.sectionHeader}>
        <FiBriefcase className={styles.sectionIcon} />
        <h2 className={styles.sectionTitle}>Work Experience</h2>
      </div>
      {resumeData.experience.map((exp, index) => (
        <div key={index} className={styles.itemContainer}>
          <div className={styles.itemHeader}>
            <h3 className={styles.itemTitle}>Experience {index + 1}</h3>
            {resumeData.experience.length > 1 && (
              <button 
                onClick={() => removeExperience(index)}
                className={styles.removeButton}
              >
                <FiTrash2 />
              </button>
            )}
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                placeholder="Company name"
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Position</label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => updateExperience(index, 'position', e.target.value)}
                placeholder="Job title"
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Years of Experience</label>
              <input
                type="text"
                value={exp.duration}
                onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                placeholder="e.g., Jan 2020 - Present"
                className={styles.formInput}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              placeholder="Describe your responsibilities and achievements..."
              className={styles.formTextarea}
            />
          </div>
        </div>
      ))}
      <button 
        onClick={addExperience}
        className={styles.addButton}
      >
        <FiPlus /> Add Experience
      </button>

      {/* Educational Background */}
      <div className={styles.sectionHeader}>
        <FiFileText className={styles.sectionIcon} />
        <h2 className={styles.sectionTitle}>Educational Background</h2>
      </div>
      
      {/* Tertiary */}
      <div className={styles.itemContainer}>
        <div className={styles.itemHeader}>
          <h3 className={styles.itemTitle}>Tertiary</h3>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Major</label>
            <input
              type="text"
              value={resumeData.education.tertiary.major}
              onChange={(e) => updateEducation('tertiary', 'major', e.target.value)}
              placeholder="e.g., Bachelor of Science in Computer Science"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>School</label>
            <input
              type="text"
              value={resumeData.education.tertiary.school}
              onChange={(e) => updateEducation('tertiary', 'school', e.target.value)}
              placeholder="e.g., De La Salle Lipa"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Academic Year</label>
            <input
              type="text"
              value={resumeData.education.tertiary.ay}
              onChange={(e) => updateEducation('tertiary', 'ay', e.target.value)}
              placeholder="e.g., 2018-2023"
              className={styles.formInput}
            />
          </div>
        </div>
      </div>

      {/* Secondary */}
      <div className={styles.itemContainer}>
        <div className={styles.itemHeader}>
          <h3 className={styles.itemTitle}>Secondary</h3>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Major</label>
            <input
              type="text"
              value={resumeData.education.secondary.major}
              onChange={(e) => updateEducation('secondary', 'major', e.target.value)}
              placeholder="e.g., Bachelor of Science in Computer Science"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>School</label>
            <input
              type="text"
              value={resumeData.education.secondary.school}
              onChange={(e) => updateEducation('secondary', 'school', e.target.value)}
              placeholder="e.g., De La Salle Lipa"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>AY</label>
            <input
              type="text"
              value={resumeData.education.secondary.ay}
              onChange={(e) => updateEducation('secondary', 'ay', e.target.value)}
              placeholder="e.g., 2018-2023"
              className={styles.formInput}
            />
          </div>
        </div>
      </div>

      {/* Primary */}
      <div className={styles.itemContainer}>
        <div className={styles.itemHeader}>
          <h3 className={styles.itemTitle}>Primary</h3>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Major</label>
            <input
              type="text"
              value={resumeData.education.primary.major}
              onChange={(e) => updateEducation('primary', 'major', e.target.value)}
              placeholder="e.g., Bachelor of Science in Computer Science"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>School</label>
            <input
              type="text"
              value={resumeData.education.primary.school}
              onChange={(e) => updateEducation('primary', 'school', e.target.value)}
              placeholder="e.g., De La Salle Lipa"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>AY</label>
            <input
              type="text"
              value={resumeData.education.primary.ay}
              onChange={(e) => updateEducation('primary', 'ay', e.target.value)}
              placeholder="e.g., 2018-2023"
              className={styles.formInput}
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className={styles.sectionHeader}>
        <FiStar className={styles.sectionIcon} />
        <h2 className={styles.sectionTitle}>Skills</h2>
      </div>
      <div className={styles.skillsList}>
        {resumeData.skills.map((skill, index) => (
          <div key={index} className={styles.skillItem}>
            <input
              type="text"
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              placeholder="Enter a skill"
              className={styles.formInput}
            />
            {resumeData.skills.length > 1 && (
              <button 
                onClick={() => removeSkill(index)}
                className={styles.removeButton}
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
      </div>
      <button 
        onClick={addSkill}
        className={styles.addButton}
      >
        <FiPlus /> Add Skill
      </button>


      {/* Action Buttons */}
      <div className={styles.actionSection}>
        <button 
          onClick={handleSaveResume}
          disabled={isSaving || !isFormValid()}
          className={styles.saveButton}
        >
          <FiDownload className={styles.buttonIcon} />
          {isSaving ? 'Generating...' : 'Save & Generate Resume'}
        </button>
        
        <button 
          onClick={handleDownloadPDF}
          disabled={!isPDFReady || hasUnsavedChanges || !isFormValid()}
          className={`${styles.downloadButton} ${(!isPDFReady || hasUnsavedChanges || !isFormValid()) ? styles.disabledButton : ''}`}
        >
          <FiDownload className={styles.buttonIcon} />
          Download Resume PDF
        </button>
      </div>
      </div>
    </div>
  );
};

export default CreateResumeTab;
