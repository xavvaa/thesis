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

  const calculateMatchScore = (applicant: Applicant) => {
    // Placeholder match score - will be replaced with actual ML-based calculation
    // Using applicant ID to create varied scores for sorting demonstration
    const applicantId = applicant.id.toString();
    const hash = applicantId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 40) + 60; // Score between 60-100
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
          applicants
            .map(applicant => ({ ...applicant, calculatedMatchScore: calculateMatchScore(applicant) }))
            .sort((a, b) => b.calculatedMatchScore - a.calculatedMatchScore)
            .map((applicant, index) => (
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
                      style={{ width: `${applicant.calculatedMatchScore}%` }}
                    />
                  </div>
                  <span className={styles.matchText}>{applicant.calculatedMatchScore}%</span>
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
