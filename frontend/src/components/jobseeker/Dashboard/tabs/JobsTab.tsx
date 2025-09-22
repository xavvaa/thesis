import React from 'react';
import styles from '../../../../pages/jobseeker/Dashboard.module.css';
import JobsList from '../../JobsList/JobsList';
import { Job } from '../../../../types/Job';

const JobsTab: React.FC<any> = ({
  resume,
  hasSkippedResume,
  getJobsToDisplay,
  onSaveJob,
  onApplyJob,
  onJobClick,
  savedJobs,
  onOpenFilters,
}) => {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Find Jobs</h1>
        <p className={styles.pageSubtitle}>
          {resume && !hasSkippedResume
            ? 'Jobs matched to your skills and experience'
            : 'Discover opportunities that match your interests'}
        </p>
      </div>
      <JobsList
        jobs={getJobsToDisplay()}
        title=""
        onSaveJob={onSaveJob}
        onApplyJob={onApplyJob}
        onJobClick={onJobClick}
        savedJobs={savedJobs}
        onOpenFilters={onOpenFilters}
      />
    </div>
  );
};

export default JobsTab;
