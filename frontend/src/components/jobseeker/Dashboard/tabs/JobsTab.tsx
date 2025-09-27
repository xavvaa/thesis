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
  appliedJobs,
  onOpenFilters,
}) => {

  return (
    <div className={styles.pageContent}>
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Find Jobs</h1>
          <p className="text-gray-600">Discover opportunities that match your skills and preferences</p>
        </div>

        <JobsListView
          jobs={getJobsToDisplay()}
          onJobClick={onJobClick}
          onSaveJob={onSaveJob}
          onApplyJob={onApplyJob}
          savedJobs={savedJobs}
          appliedJobs={appliedJobs}
          jobseekerSkills={resume?.skills || []}
        />
      </div>
    </div>
  );
};

export default JobsTab;
