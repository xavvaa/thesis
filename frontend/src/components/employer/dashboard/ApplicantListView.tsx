import React from 'react';
import { Applicant } from '@/types/dashboard';
import { FiEye } from 'react-icons/fi';
import styles from './ApplicantListView.module.css';

interface ApplicantListViewProps {
  applicants: Applicant[];
  onViewDetails: (applicant: Applicant) => void;
}

export const ApplicantListView: React.FC<ApplicantListViewProps> = ({
  applicants,
  onViewDetails,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <div className={styles.headerCell}>#</div>
        <div className={styles.headerCell}>Applicant</div>
        <div className={styles.headerCell}>Skills</div>
        <div className={styles.headerCell}>Match Score</div>
        <div className={styles.headerCell}>Actions</div>
      </div>
      
      <div className={styles.listBody}>
        {applicants.length > 0 ? (
          applicants.map((applicant, index) => (
            <div key={applicant.id} className={styles.listRow}>
              <div className={styles.numberCell}>
                <span className={styles.rowNumber}>{index + 1}</span>
              </div>
              <div className={styles.applicantCell}>
                <div className={styles.avatar}>
                  {applicant.avatar ? (
                    <img src={applicant.avatar} alt={applicant.name} />
                  ) : (
                    <span>{getInitials(applicant.name)}</span>
                  )}
                </div>
                <div className={styles.applicantInfo}>
                  <div className={styles.applicantName}>{applicant.name}</div>
                  <div className={styles.applicantPosition}>{applicant.jobTitle}</div>
                </div>
              </div>
              
              <div className={styles.skillsCell}>
                {applicant.skills && applicant.skills.length > 0 ? (
                  <div className={styles.skillsList}>
                    {applicant.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {applicant.skills.length > 3 && (
                      <span className={styles.moreSkills}>+{applicant.skills.length - 3} more</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.noSkills}>No skills listed</span>
                )}
              </div>
              
              <div className={styles.matchCell}>
                <div className={styles.matchScore}>
                  <div className={styles.matchBar}>
                    <div 
                      className={styles.matchFill} 
                      style={{ width: `${applicant.matchScore}%` }}
                    />
                  </div>
                  <span className={styles.matchText}>{applicant.matchScore}%</span>
                </div>
              </div>
              
              <div className={styles.actionsCell}>
                <button
                  className={styles.viewButton}
                  onClick={() => onViewDetails(applicant)}
                >
                  <FiEye className={styles.icon} />
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No applicants found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
