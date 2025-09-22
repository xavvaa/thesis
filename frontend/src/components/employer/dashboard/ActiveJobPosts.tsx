import React from 'react';
import { FiBriefcase } from 'react-icons/fi';
import { Job } from '../../../types/Job';
import styles from './ActiveJobPosts.module.css';

interface ActiveJobPostsProps {
  jobs: Job[];
  onViewAll: () => void;
  onJobClick: (job: Job) => void;
}

export const ActiveJobPosts: React.FC<ActiveJobPostsProps> = ({
  jobs,
  onViewAll,
  onJobClick
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Active Job Posts</h2>
        <button className={styles.viewAllButton} onClick={onViewAll}>
          View All
        </button>
      </div>

      <div className={styles.jobsGrid}>
        {jobs.slice(0, 4).map((job) => (
          <div 
            key={job.id} 
            className={styles.jobCard}
            onClick={() => onJobClick(job)}
          >
            <div className={styles.jobContent}>
              <h4 className={styles.jobTitle}>{job.title}</h4>
              <div className={styles.jobMeta}>
                <span className={styles.jobType}>
                  <FiBriefcase size={14} />
                  {job.type}
                </span>
                {job.remote && (
                  <span className={styles.remoteBadge}>Remote</span>
                )}
              </div>
              <div className={styles.jobStats}>
                <span className={styles.statItem}>
                  {job.applicants || 0} applicants
                </span>
                <span className={styles.statItem}>
                  {job.views || 0} views
                </span>
              </div>
              <div className={styles.jobFooter}>
                <span className={styles.location}>{job.location}</span>
                <span className={styles.salary}>{job.salary}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
