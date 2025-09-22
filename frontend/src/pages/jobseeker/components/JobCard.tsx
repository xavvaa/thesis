import React from 'react';
import { FiBookmark as BookmarkIcon, FiMapPin as LocationIcon, FiDollarSign as SalaryIcon, FiClock as ClockIcon } from 'react-icons/fi';
import styles from '../Dashboard.module.css';

type JobCardProps = {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    posted: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    saved?: boolean;
    matchPercentage?: number;
  };
  onSave: (id: string) => void;
};

const JobCard: React.FC<JobCardProps> = ({ job, onSave }) => {
  return (
    <div className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <div>
          <h3>{job.title}</h3>
          <p className={styles.company}>{job.company}</p>
        </div>
        <button 
          className={`${styles.saveButton} ${job.saved ? styles.saved : ''}`}
          onClick={() => onSave(job.id)}
          aria-label={job.saved ? 'Unsave job' : 'Save job'}
        >
          <BookmarkIcon filled={!!job.saved} />
        </button>
      </div>
      
      <div className={styles.jobMeta}>
        <span><LocationIcon /> {job.location}</span>
        <span><SalaryIcon /> {job.salary}</span>
        <span><ClockIcon /> {job.posted}</span>
      </div>
      
      <p className={styles.jobDescription}>
        {job.description.length > 150 
          ? `${job.description.substring(0, 150)}...` 
          : job.description}
      </p>
      
      {job.matchPercentage && (
        <div className={styles.matchBadge}>
          {job.matchPercentage}% Match
        </div>
      )}
      
      <div className={styles.jobFooter}>
        <button className={styles.viewDetailsButton}>
          View Details
        </button>
      </div>
      
      <div className={styles.jobActions}>
        <button className={styles.applyButton}>
          Apply Now
        </button>
        <button className={styles.viewButton}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;
