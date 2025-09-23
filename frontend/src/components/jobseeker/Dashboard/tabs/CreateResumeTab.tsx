import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiFileText, FiStar, FiPlus, FiTrash2, FiSave, FiDownload, FiUpload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import styles from './CreateResumeTab.module.css';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
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
  onResumeFormDataChange?: (data: ResumeData) => void;
}

const CreateResumeTab: React.FC<CreateResumeTabProps> = ({ 
  resumeFormData, 
  onResumeFormDataChange 
}) => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
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
  const [hasExistingResume, setHasExistingResume] = useState(false);

  // Load existing resume data on component mount or from props
  useEffect(() => {
    if (resumeFormData) {
      // Use data from parent component (persisted across tab switches)
      setResumeData(resumeFormData);
      setHasExistingResume(true);
    } else {
      // Load from localStorage if no parent data
      const savedResume = localStorage.getItem('resumeData');
      if (savedResume) {
        try {
          const parsedData = JSON.parse(savedResume);
          setResumeData(parsedData);
          setHasExistingResume(true);
          // Update parent component with loaded data
          if (onResumeFormDataChange) {
            onResumeFormDataChange(parsedData);
          }
        } catch (error) {
          console.error('Error loading saved resume:', error);
        }
      }
    }
  }, [resumeFormData, onResumeFormDataChange]);

  // Check if all required fields are filled
  const isFormValid = () => {
    const { personalInfo, summary, experience, education, skills } = resumeData;
    
    // Check personal info
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone || !personalInfo.address) {
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
    // Update parent component to persist data across tab switches
    if (onResumeFormDataChange) {
      onResumeFormDataChange(newData);
    }
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    updateResumeData('personalInfo', {
      ...resumeData.personalInfo,
      [field]: value
    });
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const { personalInfo, summary, experience, education, skills } = resumeData;
    
    // Set up fonts and colors
    doc.setFont('helvetica');
    
    // Header - Personal Information
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(personalInfo.name, 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${personalInfo.email} | ${personalInfo.phone}`, 20, 32);
    doc.text(personalInfo.address, 20, 38);
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    let yPosition = 55;
    
    // Professional Summary
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('PROFESSIONAL SUMMARY', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(summary, 170);
    doc.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 5 + 10;
    
    // Work Experience
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('WORK EXPERIENCE', 20, yPosition);
    yPosition += 10;
    
    experience.filter(exp => exp.company && exp.position).forEach((exp) => {
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`${exp.position} - ${exp.company}`, 20, yPosition);
      yPosition += 6;
      
      if (exp.duration) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(exp.duration, 20, yPosition);
        yPosition += 6;
      }
      
      if (exp.description) {
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(exp.description, 170);
        doc.text(descLines, 20, yPosition);
        yPosition += descLines.length * 4 + 8;
      }
    });
    
    // Education
    yPosition += 5;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('EDUCATIONAL BACKGROUND', 20, yPosition);
    yPosition += 10;
    
    // Tertiary
    if (education.tertiary.major || education.tertiary.school) {
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Tertiary', 20, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      if (education.tertiary.major) {
        doc.text(`Major: ${education.tertiary.major}`, 25, yPosition);
        yPosition += 5;
      }
      if (education.tertiary.school) {
        doc.text(`School: ${education.tertiary.school}`, 25, yPosition);
        yPosition += 5;
      }
      if (education.tertiary.ay) {
        doc.text(`AY: ${education.tertiary.ay}`, 25, yPosition);
        yPosition += 8;
      }
    }
    
    // Secondary
    if (education.secondary.major || education.secondary.school) {
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Secondary', 20, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      if (education.secondary.major) {
        doc.text(`Major: ${education.secondary.major}`, 25, yPosition);
        yPosition += 5;
      }
      if (education.secondary.school) {
        doc.text(`School: ${education.secondary.school}`, 25, yPosition);
        yPosition += 5;
      }
      if (education.secondary.ay) {
        doc.text(`AY: ${education.secondary.ay}`, 25, yPosition);
        yPosition += 8;
      }
    }
    
    // Primary
    if (education.primary.major || education.primary.school) {
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Primary', 20, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      if (education.primary.major) {
        doc.text(`Major: ${education.primary.major}`, 25, yPosition);
        yPosition += 5;
      }
      if (education.primary.school) {
        doc.text(`School: ${education.primary.school}`, 25, yPosition);
        yPosition += 5;
      }
      if (education.primary.ay) {
        doc.text(`AY: ${education.primary.ay}`, 25, yPosition);
        yPosition += 8;
      }
    }
    
    // Skills
    const validSkills = skills.filter(skill => skill.trim());
    if (validSkills.length > 0) {
      yPosition += 5;
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('SKILLS', 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const skillsText = validSkills.join(' • ');
      const skillsLines = doc.splitTextToSize(skillsText, 170);
      doc.text(skillsLines, 20, yPosition);
    }
    
    // Generate filename with name and date
    const fileName = `${personalInfo.name.replace(/\s+/g, '_')}_Resume_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Download the PDF
    doc.save(fileName);
  };

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const cleanedData = {
        ...resumeData,
        experience: resumeData.experience.filter(exp => exp.company || exp.position),
        skills: resumeData.skills.filter(skill => skill.trim() !== ''),
        certifications: resumeData.certifications.filter(cert => cert.trim() !== '')
      };

      // Save to localStorage
      localStorage.setItem('userResume', JSON.stringify(cleanedData));
      
      // Generate and download PDF
      generatePDF();
      
      console.log('Resume saved:', cleanedData);
      alert('Resume saved and downloaded successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearResumeData = () => {
    const emptyData = {
      personalInfo: { name: '', email: '', phone: '', address: '' },
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
    // Clear parent component data as well
    if (onResumeFormDataChange) {
      onResumeFormDataChange(emptyData);
    }
  };


  return (
    <div className={styles.fullPageContainer}>
      <div className={styles.contentWrapper}>
      
      {/* Resume Status Banner */}
      {hasExistingResume && (
        <div className={styles.statusBanner}>
          <div className={styles.statusContent}>
            <FiFileText className={styles.statusIcon} />
            <span>You have a saved resume that you can continue editing</span>
            <button 
              onClick={clearResumeData}
              className={styles.clearButton}
            >
              Start New Resume
            </button>
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
            placeholder="Enter your address"
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
          {isSaving ? 'Generating...' : 'Save & Download Resume'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default CreateResumeTab;
