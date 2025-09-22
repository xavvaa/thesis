import React from 'react';
import { FiX, FiClock, FiCheck, FiXCircle, FiCalendar, FiFileText, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiTrendingUp, FiDownload, FiEye } from 'react-icons/fi';
import styles from './ApplicationDetailModal.module.css';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  type: string;
  level?: string;
  department?: string;
  workplaceType?: string;
  salary: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  updatedAt: string;
}

interface ApplicationDetailModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onViewJob?: (jobId: string) => void;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onViewJob
}) => {
  if (!isOpen || !application) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className={styles.statusIcon} />;
      case 'approved':
        return <FiCheck className={styles.statusIcon} />;
      case 'rejected':
        return <FiXCircle className={styles.statusIcon} />;
      default:
        return <FiClock className={styles.statusIcon} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Selected';
      default:
        return 'Under Review';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
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
          <div className={styles.headerContent}>
            <div className={styles.companyLogo}>
              {application.company.charAt(0)}
            </div>
            <div className={styles.headerInfo}>
              <h2 className={styles.jobTitle}>{application.jobTitle}</h2>
              <div className={styles.headerMeta}>
                <span className={styles.companyName}>{application.company}</span>
                <span className={styles.headerDate}>
                  {formatDate(application.appliedDate)} — Applied {(() => {
                    const date = new Date(application.appliedDate);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - date.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) return '1 day ago';
                    if (diffDays < 7) return `${diffDays} days ago`;
                    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
                    return `${Math.ceil(diffDays / 30)} months ago`;
                  })()}
                </span>
                <button 
                  className={styles.viewJobLink}
                  onClick={() => onViewJob?.(application.jobId)}
                >
                  View all jobs
                </button>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Left Content */}
          <div className={styles.leftContent}>
            {/* Application Overview Card */}
            <div className={styles.overviewCard}>
              <div className={styles.statusContainer}>
                <div className={`${styles.statusBadge} ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span>{getStatusText(application.status)}</span>
                </div>
                <div className={styles.statusTimeline}>
                  <div className={styles.timelineItem}>
                    <FiCalendar className={styles.timelineIcon} />
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineLabel}>Applied</span>
                      <span className={styles.timelineDate}>{formatDate(application.appliedDate)}</span>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <FiClock className={styles.timelineIcon} />
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineLabel}>Last Updated</span>
                      <span className={styles.timelineDate}>{formatDate(application.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Metadata */}
            <div className={styles.metadataSection}>
              <div className={styles.metadataItem}>
                <FiMapPin className={styles.metadataIcon} />
                <span>{application.location}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>{application.department || 'Technology'}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>{application.type}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>{application.level || 'Mid-level'}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>{application.salary}</span>
              </div>
            </div>

            {/* Application Progress */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Application Progress</h3>
              <div className={styles.progressContainer}>
                <div className={styles.progressStep}>
                  <div className={`${styles.progressDot} ${styles.completed}`}>
                    <FiCheck />
                  </div>
                  <div className={styles.progressContent}>
                    <span className={styles.progressLabel}>Application Submitted</span>
                    <span className={styles.progressDate}>{formatDate(application.appliedDate)}</span>
                  </div>
                </div>
                <div className={styles.progressLine}></div>
                <div className={styles.progressStep}>
                  <div className={`${styles.progressDot} ${application.status !== 'pending' ? styles.completed : styles.current}`}>
                    {application.status === 'approved' ? <FiCheck /> : application.status === 'rejected' ? <FiX /> : <FiClock />}
                  </div>
                  <div className={styles.progressContent}>
                    <span className={styles.progressLabel}>{getStatusText(application.status)}</span>
                    <span className={styles.progressDate}>{formatDate(application.updatedAt)}</span>
                  </div>
                </div>
              </div>
              {application.status === 'pending' && (
                <div className={styles.statusMessage}>
                  <div className={styles.messageIcon}>
                    <FiClock />
                  </div>
                  <div className={styles.messageContent}>
                    <p>Your application is currently under review. We'll notify you once there's an update.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Application Materials */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Application Materials</h3>
              <div className={styles.materialsGrid}>
                <div className={styles.materialItem}>
                  <FiFileText className={styles.materialIcon} />
                  <div className={styles.materialInfo}>
                    <span className={styles.materialName}>Resume</span>
                    <span className={styles.materialSize}>PDF • 245 KB</span>
                  </div>
                  <button className={styles.downloadButton}>
                    <FiDownload />
                  </button>
                </div>
                <div className={styles.materialItem}>
                  <FiFileText className={styles.materialIcon} />
                  <div className={styles.materialInfo}>
                    <span className={styles.materialName}>Cover Letter</span>
                    <span className={styles.materialSize}>PDF • 128 KB</span>
                  </div>
                  <button className={styles.downloadButton}>
                    <FiDownload />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionSection}>
              <div className={styles.primaryActions}>
                <button className={styles.primaryButton}>
                  <FiEye />
                  <span>View Job Details</span>
                </button>
                {application.status === 'pending' && (
                  <button className={styles.secondaryButton}>
                    <FiX />
                    <span>Withdraw Application</span>
                  </button>
                )}
              </div>
              <div className={styles.secondaryActions}>
                <button className={styles.contactButton}>
                  <FiMail />
                  <span>Contact Recruiter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className={styles.rightSidebar}>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>About {application.company}</h3>
              <p className={styles.sidebarText}>
                We are {application.company}, a leading company in our industry committed to excellence and innovation. Join our team and be part of our growth story.
              </p>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>INDUSTRY</span>
                <span className={styles.sidebarValue}>{application.department || 'Technology & Services'}</span>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>JOB TYPE</span>
                <span className={styles.sidebarValue}>{application.type}</span>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>HEADQUARTERS</span>
                <span className={styles.sidebarValue}>{application.location}</span>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Contact Information</h3>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <FiUser className={styles.contactIcon} />
                  <div>
                    <span className={styles.contactLabel}>Hiring Manager</span>
                    <span className={styles.contactValue}>Sarah Johnson</span>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <FiMail className={styles.contactIcon} />
                  <div>
                    <span className={styles.contactLabel}>Email</span>
                    <span className={styles.contactValue}>careers@{application.company.toLowerCase().replace(/\s+/g, '')}.com</span>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <FiPhone className={styles.contactIcon} />
                  <div>
                    <span className={styles.contactLabel}>Phone</span>
                    <span className={styles.contactValue}>+63 2 8123 4567</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
