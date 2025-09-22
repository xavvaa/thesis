import React from 'react';
import JobsList from '../JobsList/JobsList';
import styles from './JobsPreview.module.css';
import { Job } from '../../../types/Job';

interface JobsPreviewProps {
  matchedJobs: Job[];
  latestJobs: Job[];
  hasResume: boolean;
  onNavigate: (tab: string) => void;
  onSaveJob: (jobId: number) => void;
  onApplyJob: (jobId: number) => void;
  onJobClick: (job: Job) => void;
  savedJobs: Set<number>;
}

const JobsPreview: React.FC<JobsPreviewProps> = ({ 
  matchedJobs, 
  latestJobs,
  hasResume,
  onNavigate,
  onSaveJob,
  onApplyJob,
  onJobClick,
  savedJobs
}) => {
  return (
    <div className={styles.jobsPreview}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {hasResume ? 'Best Matches for You' : 'Latest Job Postings'}
        </h2>
        <button 
          className={styles.viewAllBtn}
          onClick={() => onNavigate('jobs')}
        >
          View All Jobs
        </button>
      </div>
      <JobsList
        jobs={hasResume ? matchedJobs.slice(0, 3) : latestJobs.slice(0, 3)}
        title=""
        onSaveJob={onSaveJob}
        onApplyJob={onApplyJob}
        onJobClick={onJobClick}
        savedJobs={savedJobs}
      />
    </div>
  );
};

export default JobsPreview;
