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
