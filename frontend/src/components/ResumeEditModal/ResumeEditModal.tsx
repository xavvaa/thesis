import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiPlus, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiEdit3 } from 'react-icons/fi';
import styles from './ResumeEditModal.module.css';

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

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface ParsedResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
}

interface ResumeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resumeData: ParsedResumeData) => void;
  initialData: ParsedResumeData;
  fileName: string;
}

const ResumeEditModal: React.FC<ResumeEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  fileName
}) => {
  const [resumeData, setResumeData] = useState<ParsedResumeData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('personal');

  useEffect(() => {
    setResumeData(initialData);
  }, [initialData]);

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSkillAdd = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const handleSkillRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleExperienceAdd = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }]
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleExperienceRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationAdd = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', year: '' }]
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleEducationRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationAdd = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const handleCertificationChange = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const handleCertificationRemove = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clean up empty entries
      const cleanedData = {
        ...resumeData,
        skills: resumeData.skills.filter(skill => skill.trim() !== ''),
        experience: resumeData.experience.filter(exp => 
          exp.company.trim() !== '' || exp.position.trim() !== ''
        ),
        education: resumeData.education.filter(edu => 
          edu.institution.trim() !== '' || edu.degree.trim() !== ''
        ),
        certifications: resumeData.certifications.filter(cert => cert.trim() !== '')
      };
      
      await onSave(cleanedData);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'summary', label: 'Summary', icon: FiEdit3 },
    { id: 'skills', label: 'Skills', icon: FiEdit3 },
    { id: 'experience', label: 'Experience', icon: FiEdit3 },
    { id: 'education', label: 'Education', icon: FiEdit3 },
    { id: 'certifications', label: 'Certifications', icon: FiEdit3 }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>Review & Edit Resume Data</h2>
            <p className={styles.modalSubtitle}>
              Please review the extracted information from <strong>{fileName}</strong> and make any necessary corrections.
            </p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.sidebar}>
            <nav className={styles.sectionNav}>
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`${styles.navButton} ${activeSection === section.id ? styles.active : ''}`}
                  >
                    <Icon className={styles.navIcon} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={styles.content}>
            {activeSection === 'personal' && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Personal Information</h3>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FiUser className={styles.labelIcon} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                      className={styles.input}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FiMail className={styles.labelIcon} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      className={styles.input}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FiPhone className={styles.labelIcon} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      className={styles.input}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FiMapPin className={styles.labelIcon} />
                      Address
                    </label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.address}
                      onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                      className={styles.input}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'summary' && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Professional Summary</h3>
                <div className={styles.inputGroup}>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    className={styles.textarea}
                    rows={6}
                    placeholder="Enter a brief professional summary..."
                  />
                </div>
              </div>
            )}

            {activeSection === 'skills' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Skills</h3>
                  <button onClick={handleSkillAdd} className={styles.addButton}>
                    <FiPlus /> Add Skill
                  </button>
                </div>
                <div className={styles.skillsGrid}>
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} className={styles.skillItem}>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        className={styles.skillInput}
                        placeholder="Enter skill"
                      />
                      <button
                        onClick={() => handleSkillRemove(index)}
                        className={styles.removeButton}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'experience' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Work Experience</h3>
                  <button onClick={handleExperienceAdd} className={styles.addButton}>
                    <FiPlus /> Add Experience
                  </button>
                </div>
                <div className={styles.experienceList}>
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className={styles.experienceItem}>
                      <div className={styles.experienceHeader}>
                        <h4>Experience {index + 1}</h4>
                        <button
                          onClick={() => handleExperienceRemove(index)}
                          className={styles.removeButton}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className={styles.experienceForm}>
                        <div className={styles.formRow}>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            className={styles.input}
                            placeholder="Company name"
                          />
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            className={styles.input}
                            placeholder="Job title/position"
                          />
                        </div>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                          className={styles.input}
                          placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                        />
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          className={styles.textarea}
                          rows={3}
                          placeholder="Job description and achievements..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'education' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Education</h3>
                  <button onClick={handleEducationAdd} className={styles.addButton}>
                    <FiPlus /> Add Education
                  </button>
                </div>
                <div className={styles.educationList}>
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className={styles.educationItem}>
                      <div className={styles.educationHeader}>
                        <h4>Education {index + 1}</h4>
                        <button
                          onClick={() => handleEducationRemove(index)}
                          className={styles.removeButton}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <div className={styles.educationForm}>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          className={styles.input}
                          placeholder="Institution name"
                        />
                        <div className={styles.formRow}>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className={styles.input}
                            placeholder="Degree/Program"
                          />
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                            className={styles.input}
                            placeholder="Year (e.g., 2020)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'certifications' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Certifications</h3>
                  <button onClick={handleCertificationAdd} className={styles.addButton}>
                    <FiPlus /> Add Certification
                  </button>
                </div>
                <div className={styles.certificationsGrid}>
                  {resumeData.certifications.map((cert, index) => (
                    <div key={index} className={styles.certificationItem}>
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => handleCertificationChange(index, e.target.value)}
                        className={styles.certificationInput}
                        placeholder="Enter certification name"
                      />
                      <button
                        onClick={() => handleCertificationRemove(index)}
                        className={styles.removeButton}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveButton} disabled={isSaving}>
            <FiSave className={styles.buttonIcon} />
            {isSaving ? 'Saving...' : 'Save Resume Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditModal;
