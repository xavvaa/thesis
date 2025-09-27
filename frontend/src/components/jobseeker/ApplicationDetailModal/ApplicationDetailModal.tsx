import React, { useState } from 'react';
import { FiX, FiHome, FiBriefcase, FiUsers, FiCalendar, FiTrendingUp, FiClock, FiCheck, FiMapPin, FiXCircle, FiEye, FiFileText, FiDownload, FiMail, FiPhone } from 'react-icons/fi';
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
  companyDetails?: {
    name?: string;
    description?: string;
    industry?: string;
    website?: string;
    logo?: string;
    size?: string;
    founded?: number;
    headquarters?: string;
    email?: string;
    phone?: string;
  };
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
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'company'>('overview');
  
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'details', label: 'Job Details', icon: FiBriefcase },
    { id: 'company', label: 'Company', icon: FiUsers }
  ] as const;

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
              <div className={styles.titleRow}>
                <h2 className={styles.jobTitle}>{application.jobTitle}</h2>
                <div className={styles.titleMeta}>
                  <div className={styles.statusBadge}>
                    {getStatusIcon(application.status)}
                    <span>{getStatusText(application.status)}</span>
                  </div>
                  <span className={styles.appliedDate}>Applied {formatDate(application.appliedDate)}</span>
                </div>
              </div>
              <div className={styles.companyRow}>
                <span className={styles.companyName}>{application.company}</span>
                <span className={styles.locationInfo}>
                  <FiMapPin className={styles.locationIcon} />
                  {application.location}
                </span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent className={styles.tabIcon} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className={styles.modalBody}>
          {activeTab === 'overview' && (
            <div className={styles.tabContent}>
              {/* Quick Info Cards */}
              <div className={styles.quickInfoGrid}>
                <div className={styles.infoCard}>
                  <FiBriefcase className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Type</span>
                    <span className={styles.infoValue}>{application.type}</span>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <FiTrendingUp className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Salary</span>
                    <span className={styles.infoValue}>{application.salary}</span>
                  </div>
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
                    <FiClock className={styles.messageIcon} />
                    <p>Your application is currently under review. We'll notify you once there's an update.</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className={styles.quickActions}>
                <button className={styles.primaryButton} onClick={() => onViewJob?.(application.jobId)}>
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
            </div>
          )}

          {activeTab === 'details' && (
            <div className={styles.tabContent}>
              {/* Job Information */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Job Information</h3>
                <div className={styles.tagsContainer}>
                  <div className={styles.tagItem}>
                    <span className={styles.tagLabel}>Department</span>
                    <span className={styles.tag}>{application.department || 'Technology'}</span>
                  </div>
                  <div className={styles.tagItem}>
                    <span className={styles.tagLabel}>Level</span>
                    <span className={styles.tag}>{application.level || 'Mid-level'}</span>
                  </div>
                  <div className={styles.tagItem}>
                    <span className={styles.tagLabel}>Workplace Type</span>
                    <span className={styles.tag}>{application.workplaceType || 'Hybrid'}</span>
                  </div>
                  <div className={styles.tagItem}>
                    <span className={styles.tagLabel}>Job Type</span>
                    <span className={styles.tag}>{application.type}</span>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              {application.description && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Job Description</h3>
                  <div className={styles.jobDescription}>
                    <p>{application.description}</p>
                  </div>
                </div>
              )}

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
            </div>
          )}

          {activeTab === 'company' && (
            <div className={styles.tabContent}>
              {/* Company Overview */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>About {application.company}</h3>
                <p className={styles.companyDescription}>
                  {application.companyDetails?.description || 
                   `We are ${application.company}, a leading company in our industry committed to excellence and innovation. Join our team and be part of our growth story.`}
                </p>
              </div>

              {/* Company Details */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Company Details</h3>
                <div className={styles.tagsContainer}>
                  <div className={styles.tagItem}>
                    <span className={styles.tagLabel}>Industry</span>
                    <span className={styles.tag}>{application.companyDetails?.industry || application.department || 'Technology & Services'}</span>
                  </div>
                  <div className={styles.tagItem}>
                    <span className={styles.tagLabel}>Headquarters</span>
                    <span className={styles.tag}>{application.companyDetails?.headquarters || application.location}</span>
                  </div>
                  {application.companyDetails?.size && (
                    <div className={styles.tagItem}>
                      <span className={styles.tagLabel}>Company Size</span>
                      <span className={styles.tag}>{application.companyDetails.size}</span>
                    </div>
                  )}
                  {application.companyDetails?.founded && (
                    <div className={styles.tagItem}>
                      <span className={styles.tagLabel}>Founded</span>
                      <span className={styles.tag}>{application.companyDetails.founded}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Contact Information</h3>
                <div className={styles.contactGrid}>
                  <div className={styles.contactItem}>
                    <FiMail className={styles.contactIcon} />
                    <div>
                      <span className={styles.contactLabel}>Email</span>
                      <span className={styles.contactValue}>{application.companyDetails?.email || `careers@${application.company.toLowerCase().replace(/\s+/g, '')}.com`}</span>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <FiPhone className={styles.contactIcon} />
                    <div>
                      <span className={styles.contactLabel}>Phone</span>
                      <span className={styles.contactValue}>{application.companyDetails?.phone || '+63 2 8123 4567'}</span>
                    </div>
                  </div>
                </div>
                <button className={styles.contactButton}>
                  <FiMail />
                  <span>Contact Recruiter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
