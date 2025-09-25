import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiClock, 
  FiEye, 
  FiDownload, 
  FiFileText, 
  FiEdit3, 
  FiSave,
  FiBriefcase,
  FiMessageCircle,
  FiXCircle,
  FiCheck
} from 'react-icons/fi';
import { Applicant } from '../../../types/dashboard';
import { auth } from '../../../config/firebase';
import styles from './ApplicantDetailsModal.module.css';

interface ApplicationData {
  _id: string;
  jobTitle: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  resumeData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    summary: string;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    education: {
      tertiary?: {
        institution?: string;
        degree?: string;
        year?: string;
      };
      secondary?: {
        institution?: string;
        degree?: string;
        year?: string;
      };
      primary?: {
        institution?: string;
        degree?: string;
        year?: string;
      };
    };
  };
  status: string;
  appliedDate: string;
  coverLetter: string;
  notes: string;
  resumeFile?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadDate: string;
  };
}

interface ApplicantDetailsModalProps {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (applicantId: number) => void;
  onReject: (applicantId: number) => void;
  onViewResume: (applicantId: number) => void;
  onDownloadResume: (applicantId: number) => void;
}

export const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onViewResume,
  onDownloadResume,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'notes'>('overview');
  const [notes, setNotes] = useState('');
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);

  // Fetch detailed application data when modal opens
  useEffect(() => {
    if (isOpen && applicant.id) {
      fetchApplicationDetails();
    }
  }, [isOpen, applicant.id]);

  const fetchApplicationDetails = async () => {
    try {
      setIsLoadingApplication(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:3001/api/applications/employer', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Full applications data:', data);
        const application = data.data.find((app: any) => app._id === applicant.id);
        console.log('Found application:', application);
        console.log('Resume data:', application?.resumeData);
        console.log('Education data:', application?.resumeData?.education);
        if (application) {
          setApplicationData(application);
          setNotes(application.notes || '');
        }
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setIsLoadingApplication(false);
    }
  };

  const handleViewResume = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !applicationData?._id) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:3001/api/applications/${applicationData._id}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResumePreviewUrl(url);
      } else {
        const errorText = await response.text();
        console.error('Resume view error:', errorText);
        alert('Resume not found or unable to view');
      }
    } catch (error) {
      console.error('Error viewing resume:', error);
      alert('Error viewing resume');
    }
  };

  const handleDownloadResume = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !applicationData?._id) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:3001/api/applications/${applicationData._id}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = applicationData.resumeFile?.fileName || `${applicationData.applicant.name}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const errorText = await response.text();
        console.error('Resume download error:', errorText);
        alert('Resume not found or unable to download');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume');
    }
  };

  const saveNotes = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:3001/api/applications/${applicant.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: applicant.status,
          notes: notes
        })
      });

      if (response.ok) {
        alert('Notes saved successfully');
      } else {
        alert('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes');
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return '#10b981';
      case 'interview': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.applicantInfo}>
            <div className={styles.applicantAvatar}>
              {applicant.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={styles.applicantDetails}>
              <h2 className={styles.applicantName}>{applicant.name}</h2>
              <p className={styles.applicantPosition}>{applicant.position}</p>
              <div className={styles.applicantMeta}>
                <span className={styles.location}>
                  <FiMapPin size={14} />
                  {applicant.location}
                </span>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(applicant.status) }}
                >
                  {applicant.status}
                </span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Match Score */}
        <div className={styles.matchSection}>
          <div className={styles.matchScore}>
            <div className={styles.matchCircle}>
              <span className={styles.matchPercentage}>{applicant.matchPercentage}%</span>
            </div>
            <div className={styles.matchInfo}>
              <h3>Match Score</h3>
              <p>Based on skills, experience, and requirements</p>
            </div>
          </div>
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <FiBriefcase size={16} />
              <span>{applicant.experience}</span>
            </div>
            <div className={styles.statItem}>
              <FiClock size={16} />
              <span>Applied {formatDate(applicant.appliedDate)}</span>
            </div>
            <div className={styles.statItem}>
              <span style={{ fontSize: '14px' }}>₱</span>
              <span>{applicant.expectedSalary}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <button 
              className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiUser size={16} />
              Overview
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'resume' ? styles.active : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              <FiFileText size={16} />
              Resume
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'notes' ? styles.active : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <FiMessageCircle size={16} />
              Notes
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div className={styles.overviewContent}>
                <div className={styles.section}>
                  <h4>Contact Information</h4>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <FiMail size={16} />
                      <span>{applicationData?.applicant.email || applicationData?.resumeData?.personalInfo?.email || 'Email not provided'}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiPhone size={16} />
                      <span>{applicationData?.applicant.phone || applicationData?.resumeData?.personalInfo?.phone || 'Phone not provided'}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiMapPin size={16} />
                      <span>{applicationData?.applicant.address || applicationData?.resumeData?.personalInfo?.address || 'Address not provided'}</span>
                    </div>
                    {applicationData?.resumeFile && (
                      <div className={styles.contactItem}>
                        <FiFileText size={16} />
                        <div className={styles.resumeFileInfo}>
                          <span>{applicationData.resumeFile.fileName}</span>
                          <small>({(applicationData.resumeFile.fileSize / 1024).toFixed(1)} KB)</small>
                          <button 
                            className={styles.downloadLink}
                            onClick={handleDownloadResume}
                            title="Download Resume"
                          >
                            <FiDownload size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.section}>
                  <h4>Skills & Expertise</h4>
                  <div className={styles.skillsContainer}>
                    {applicationData?.resumeData?.skills?.length > 0 ? (
                      applicationData.resumeData.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p>No skills listed</p>
                    )}
                  </div>
                </div>

                {applicationData?.resumeData?.summary && (
                  <div className={styles.section}>
                    <h4>Professional Summary</h4>
                    <p className={styles.summaryText}>{applicationData.resumeData.summary}</p>
                  </div>
                )}

                {applicationData?.resumeData?.experience?.length > 0 && (
                  <div className={styles.section}>
                    <h4>Work Experience</h4>
                    <div className={styles.experienceList}>
                      {applicationData.resumeData.experience.map((exp, index) => (
                        <div key={index} className={styles.experienceItem}>
                          <div className={styles.experienceHeader}>
                            <h5>{exp.position}</h5>
                            <span className={styles.experienceDuration}>{exp.duration}</span>
                          </div>
                          <p className={styles.experienceCompany}>{exp.company}</p>
                          {exp.description && (
                            <p className={styles.experienceDescription}>{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {(() => {
                  if (!applicationData?.resumeData?.education) return null;
                  
                  const education = applicationData.resumeData.education;
                  console.log('Education data:', education);
                  
                  // Extract tertiary, secondary, primary directly
                  const tertiary = education.tertiary;
                  const secondary = education.secondary; 
                  const primary = education.primary;
                  
                  // Check if any education level has data
                  if (!tertiary?.institution && !secondary?.institution && !primary?.institution) {
                    return null;
                  }
                  
                  return (
                    <div className={styles.section}>
                      <h4>Education</h4>
                      <div className={styles.educationList}>
                        {tertiary?.institution && (
                          <div className={styles.educationItem}>
                            <div className={styles.educationHeader}>
                              <FiUser size={16} />
                              <div>
                                <h5>{tertiary.degree || 'Tertiary Education'}</h5>
                                <p>{tertiary.institution}</p>
                                <span className={styles.educationYear}>{tertiary.year}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {secondary?.institution && (
                          <div className={styles.educationItem}>
                            <div className={styles.educationHeader}>
                              <FiUser size={16} />
                              <div>
                                <h5>{secondary.degree || 'Secondary Education'}</h5>
                                <p>{secondary.institution}</p>
                                <span className={styles.educationYear}>{secondary.year}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {primary?.institution && (
                          <div className={styles.educationItem}>
                            <div className={styles.educationHeader}>
                              <FiUser size={16} />
                              <div>
                                <h5>{primary.degree || 'Primary Education'}</h5>
                                <p>{primary.institution}</p>
                                <span className={styles.educationYear}>{primary.year}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {applicationData?.coverLetter && (
                  <div className={styles.section}>
                    <h4>Cover Letter</h4>
                    <div className={styles.coverLetterText}>
                      {applicationData.coverLetter}
                    </div>
                  </div>
                )}

                <div className={styles.section}>
                  <h4>Application Timeline</h4>
                  <div className={styles.timeline}>
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <FiCalendar size={14} />
                      </div>
                      <div className={styles.timelineContent}>
                        <h5>Application Submitted</h5>
                        <p>{formatDate(applicant.appliedDate)}</p>
                      </div>
                    </div>
                    {applicant.status !== 'pending' && (
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineIcon}>
                          <FiEye size={14} />
                        </div>
                        <div className={styles.timelineContent}>
                          <h5>Application Reviewed</h5>
                          <p>2 days ago</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div className={styles.resumeContent}>
                <div className={styles.resumeSection}>
                  <div className={styles.resumeInfo}>
                    <div className={styles.resumeHeader}>
                      <div className={styles.resumeIcon}>
                        <FiFileText size={28} />
                      </div>
                      <div className={styles.resumeDetails}>
                        <h3>{applicationData?.resumeFile?.fileName || `${applicant.name}_Resume.pdf`}</h3>
                        <div className={styles.resumeMeta}>
                          <span className={styles.fileSize}>
                            {applicationData?.resumeFile?.fileSize 
                              ? `${(applicationData.resumeFile.fileSize / 1024).toFixed(1)} KB`
                              : 'Size unknown'
                            }
                          </span>
                          <span className={styles.uploadDate}>
                            Uploaded: {formatDate(applicant.appliedDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.resumeActions}>
                      <button 
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        onClick={handleViewResume}
                        disabled={!applicationData?._id}
                      >
                        <FiEye size={18} />
                        <span>View Resume</span>
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.downloadButton}`}
                        onClick={handleDownloadResume}
                        disabled={!applicationData?._id}
                      >
                        <FiDownload size={18} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.resumePreviewSection}>
                  {resumePreviewUrl ? (
                    <div className={styles.resumePreviewContainer}>
                      <div className={styles.previewHeader}>
                        <h4>Resume Preview</h4>
                        <button 
                          className={styles.closePreview}
                          onClick={() => setResumePreviewUrl(null)}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                      <div className={styles.previewFrame}>
                        <iframe 
                          src={resumePreviewUrl} 
                          className={styles.resumeIframe}
                          title="Resume Preview"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.resumePlaceholder}>
                      <div className={styles.placeholderContent}>
                        <FiFileText size={48} />
                        <h4>Resume Preview</h4>
                        <p>Click "View Resume" to preview the candidate's resume in this area</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className={styles.notesContent}>
                <div className={styles.notesHeader}>
                  <h4>Interview Notes & Comments</h4>
                  <p>Add your thoughts about this candidate</p>
                </div>
                <textarea
                  className={styles.notesTextarea}
                  placeholder="Add notes about the candidate's qualifications, interview performance, or any other relevant information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                />
                <button className={styles.saveNotesButton} onClick={saveNotes}>
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {applicant.status !== 'hired' && (
            <>
              <button 
                className={styles.rejectButton}
                onClick={() => onReject(applicant.id)}
              >
                <FiXCircle size={16} />
                Reject Application
              </button>
              <button 
                className={styles.approveButton}
                onClick={() => onApprove(applicant.id)}
              >
                <FiCheck size={16} />
                Move to Interview
              </button>
            </>
          )}
          {applicant.status === 'hired' && (
            <div className={styles.hiredMessage}>
              <FiCheck size={20} />
              <span>This candidate has been hired</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
