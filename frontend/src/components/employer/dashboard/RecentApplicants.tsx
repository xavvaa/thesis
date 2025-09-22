import React from 'react';
import { FiUsers } from 'react-icons/fi';
import { Applicant } from '../../../types/dashboard';
import styles from './RecentApplicants.module.css';

interface RecentApplicantsProps {
  applicants: Applicant[];
  onViewAll: () => void;
  onViewApplicantDetails: (applicant: Applicant) => void;
}

export const RecentApplicants: React.FC<RecentApplicantsProps> = ({
  applicants,
  onViewAll,
  onViewApplicantDetails
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'hired': return styles.statusHired;
      case 'interview': return styles.statusInterview;
      case 'pending': return styles.statusPending;
      default: return styles.statusRejected;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'interview': return 'Interview';
      case 'hired': return 'Hired';
      case 'pending': return 'Review';
      default: return status;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Applicants</h2>
        <button className={styles.viewAllButton} onClick={onViewAll}>
          View All
        </button>
      </div>
      <div className={styles.applicantsList}>
        {applicants.map((applicant, index) => (
          <div 
            key={applicant.id} 
            className={`${styles.applicantItem} ${index < applicants.length - 1 ? styles.withBorder : ''}`}
            onClick={() => onViewApplicantDetails(applicant)}
          >
            <div className={styles.applicantContent}>
              <div className={styles.avatar}>
                <FiUsers size={20} />
              </div>
              <div className={styles.applicantInfo}>
                <h3 className={styles.position}>Applied to {applicant.position}</h3>
                <p className={styles.name}>{applicant.name}</p>
                <p className={styles.date}>
                  {new Date(applicant.appliedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className={styles.statusContainer}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(applicant.status)}`}>
                {getStatusText(applicant.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
