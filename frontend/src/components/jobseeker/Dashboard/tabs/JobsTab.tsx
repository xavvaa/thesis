import React from 'react';
import styles from '../../../../pages/jobseeker/Dashboard.module.css';
import { JobsListView } from '../../JobsListView/JobsListView';
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
    <div className={styles.tabContent}>
      <JobsListView
        jobs={getJobsToDisplay()}
        onJobClick={onJobClick}
        onSaveJob={onSaveJob}
        savedJobs={savedJobs}
        jobseekerSkills={resume?.skills || []}
      />
    </div>
  );
};

export default JobsTab;
