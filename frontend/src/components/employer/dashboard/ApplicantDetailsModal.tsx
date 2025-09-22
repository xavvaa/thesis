import React, { useState } from 'react';
import { 
  FiX, 
  FiDownload, 
  FiEye, 
  FiCheck, 
  FiXCircle, 
  FiMapPin, 
  FiClock, 
  FiBriefcase,
  FiMail,
  FiPhone,
  FiCalendar,
  FiStar,
  FiUser,
  FiFileText,
  FiMessageCircle
} from 'react-icons/fi';
import { Applicant } from '../../../types/dashboard';
import styles from './ApplicantDetailsModal.module.css';

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
                      <span>{applicant.name.toLowerCase().replace(' ', '.')}@email.com</span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiPhone size={16} />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h4>Skills & Expertise</h4>
                  <div className={styles.skillsContainer}>
                    {applicant.skills.map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

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
                <div className={styles.resumePreview}>
                  <div className={styles.resumeHeader}>
                    <FiFileText size={24} />
                    <div>
                      <h4>{applicant.name}_Resume.pdf</h4>
                      <p>Last updated: {formatDate(applicant.appliedDate)}</p>
                    </div>
                  </div>
                  <div className={styles.resumeActions}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => onViewResume(applicant.id)}
                    >
                      <FiEye size={16} />
                      View Resume
                    </button>
                    <button 
                      className={styles.downloadButton}
                      onClick={() => onDownloadResume(applicant.id)}
                    >
                      <FiDownload size={16} />
                      Download
                    </button>
                  </div>
                </div>
                <div className={styles.resumePlaceholder}>
                  <p>Resume preview would appear here in a real application</p>
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
                <button className={styles.saveNotesButton}>
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
