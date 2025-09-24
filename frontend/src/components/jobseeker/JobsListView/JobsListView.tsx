import React from 'react';
import { FiMapPin, FiClock, FiBookmark, FiEye, FiBriefcase, FiTag } from 'react-icons/fi';
import { Job } from '../../../types/Job';
import styles from './JobsListView.module.css';

interface JobsListViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onSaveJob?: (jobId: string | number) => void;
  savedJobs?: Set<string | number>;
}

export const JobsListView: React.FC<JobsListViewProps> = ({
  jobs,
  onJobClick,
  onSaveJob,
  savedJobs = new Set(),
}) => {
  const calculateMatchScore = (job: Job) => {
    // Placeholder match score - will be replaced with actual ML-based calculation
    // Using job ID to create varied scores for sorting demonstration
    const jobId = typeof job.id === 'string' ? job.id : job.id.toString();
    const hash = jobId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 40) + 60; // Score between 60-100
  };

  const formatSalary = (salary: string | number | undefined) => {
    if (!salary) return 'Salary not specified';
    return String(salary);
  };

  const formatLocation = (location: string | undefined) => {
    if (!location) return 'Location not specified';
    return location;
  };

  const formatJobType = (type: string | undefined) => {
    if (!type) return 'Full-time';
    return type;
  };

  const getCompanyInitials = (company: string) => {
    return company
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };


  if (jobs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <div className={styles.headerCell}>#</div>
        <div className={styles.headerCell}>Company</div>
        <div className={styles.headerCell}>Job Title</div>
        <div className={styles.headerCell}>Match Score</div>
        <div className={styles.headerCell}>Actions</div>
      </div>
      
      <div className={styles.listBody}>
        {jobs
          .map(job => ({ ...job, matchScore: calculateMatchScore(job) }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .map((job, index) => {
          const matchScore = job.matchScore;
          // Use the full string ID for MongoDB ObjectIds, or convert to number for numeric IDs
          const jobId = typeof job.id === 'string' && job.id.length > 10 ? job.id : (typeof job.id === 'string' ? parseInt(job.id) : job.id);
          const isSaved = savedJobs.has(jobId);

          return (
            <div key={job.id} className={styles.listRow}>
              <div className={styles.numberCell}>
                <span className={styles.rowNumber}>{index + 1}</span>
              </div>
              
              <div className={styles.companyCell}>
                <div className={styles.avatar}>
                  <span>{getCompanyInitials(job.company)}</span>
                </div>
                <div className={styles.companyInfo}>
                  <div className={styles.companyName}>{job.company}</div>
                  <div className={styles.companyMeta}>
                    <span className={styles.location}>
                      <FiMapPin className={styles.icon} />
                      {formatLocation(job.location)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={styles.jobTitleCell}>
                <div className={styles.jobTitleInfo}>
                  <div className={styles.jobTitle}>{job.title}</div>
                  <div className={styles.jobMeta}>
                    <span className={styles.salary}>
                      <FiTag className={styles.icon} />
                      {formatSalary(job.salary)}
                    </span>
                    <span className={styles.jobType}>
                      <FiClock className={styles.icon} />
                      {formatJobType(job.type)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={styles.matchCell}>
                <div className={styles.matchScore}>
                  <div className={styles.matchBar}>
                    <div 
                      className={styles.matchFill} 
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  <span className={styles.matchText}>{matchScore}%</span>
                </div>
              </div>
              
              <div className={styles.actionsCell}>
                <button
                  className={styles.viewButton}
                  onClick={() => onJobClick(job)}
                >
                  <FiEye className={styles.icon} />
                  View Details
                </button>
                {onSaveJob && (
                  <button
                    onClick={() => onSaveJob(jobId)}
                    className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                    title={isSaved ? "Remove from saved" : "Save job"}
                  >
                    <FiBookmark className={styles.icon} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
