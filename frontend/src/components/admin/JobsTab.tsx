import React from 'react';
import { Job } from '../../types/admin';
import JobCard from './JobCard';

interface JobsTabProps {
  jobs: Job[];
  onJobStatusChange?: (jobId: string, status: string) => void;
}

const JobsTab: React.FC<JobsTabProps> = ({ jobs, onJobStatusChange }) => {
  const handleViewJob = (job: Job) => {
    console.log('View job details:', job);
    // TODO: Implement job details modal or navigation
  };

  const handleEditJob = (job: Job) => {
    console.log('Edit job:', job);
    // TODO: Implement job editing functionality
  };

  const handleDeleteJob = (jobId: string) => {
    console.log('Delete job:', jobId);
    // TODO: Implement job deletion with confirmation
    if (window.confirm('Are you sure you want to remove this job posting?')) {
      // Call API to delete job
    }
  };

  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>Job Management</h2>
        <p>Monitor and manage job postings from all employers</p>
      </div>

      <div className="jobs-grid" style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        padding: '20px 0'
      }}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onStatusChange={onJobStatusChange}
              onView={handleViewJob}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
            />
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            gridColumn: '1 / -1'
          }}>
            <p>No job postings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsTab;
