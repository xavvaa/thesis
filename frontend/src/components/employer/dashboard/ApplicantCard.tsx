import React from 'react';
import { Applicant } from '@/types/dashboard';
import Button from '../ui/Button';
import { FiMail, FiPhone, FiCalendar, FiDownload, FiUser, FiCheck, FiX } from 'react-icons/fi';
import styles from './ApplicantCard.module.css';

interface ApplicantCardProps {
  applicant: Applicant;
  onAccept?: (applicantId: number) => void;
  onReject?: (applicantId: number) => void;
  onViewResume?: (applicantId: number) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onAccept,
  onReject,
  onViewResume,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={styles.applicantCard}>
      <div className={styles.applicantHeader}>
        <div className={styles.avatar}>
          {applicant.avatar ? (
            <img src={applicant.avatar} alt={applicant.name} />
          ) : (
            <span>{getInitials(applicant.name)}</span>
          )}
        </div>
        <div className={styles.applicantInfo}>
          <h3 className={styles.applicantName}>{applicant.name}</h3>
          <p className={styles.applicantPosition}>{applicant.jobTitle}</p>
          <div className={styles.matchScore}>
            <div className={styles.matchBar} style={{ width: `${applicant.matchScore}%` }} />
            <span>Match: {applicant.matchScore}%</span>
          </div>
        </div>
      </div>

      <div className={styles.applicantDetails}>
        <div className={styles.detailItem}>
          <FiMail className={styles.icon} />
          <span>{applicant.email}</span>
        </div>
        <div className={styles.detailItem}>
          <FiPhone className={styles.icon} />
          <span>{applicant.phone}</span>
        </div>
        <div className={styles.detailItem}>
          <FiCalendar className={styles.icon} />
          <span>Applied on {applicant.appliedDate}</span>
        </div>
        <div className={styles.detailItem}>
          <FiUser className={styles.icon} />
          <span>{applicant.experience} of experience</span>
        </div>
      </div>

      {applicant.skills && applicant.skills.length > 0 && (
        <div className={styles.skillsContainer}>
          <h4 className={styles.skillsTitle}>Skills</h4>
          <div className={styles.skillsList}>
            {applicant.skills.slice(0, 5).map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
            {applicant.skills.length > 5 && (
              <span className={styles.moreSkills}>+{applicant.skills.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          variant="outline"
          size="sm"
          className={styles.viewResumeBtn}
          onClick={() => onViewResume?.(applicant.id)}
        >
          <FiDownload className={styles.icon} />
          View Resume
        </Button>
        <div className={styles.decisionButtons}>
          <Button
            variant="success"
            size="sm"
            className={styles.acceptBtn}
            onClick={() => onAccept?.(applicant.id)}
          >
            <FiCheck className={styles.icon} />
            Accept
          </Button>
          <Button
            variant="danger"
            size="sm"
            className={styles.rejectBtn}
            onClick={() => onReject?.(applicant.id)}
          >
            <FiX className={styles.icon} />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};
