import React from 'react';
import { FiFileText, FiClock, FiTrendingUp, FiEye } from 'react-icons/fi';
import { HiCheckCircle } from 'react-icons/hi';
import { Job } from '../../types/admin';
import JobCard from './JobCard';
import StatsCard from './StatsCard';

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
      // TODO: Call delete API
    }
  };

  const activeJobs = jobs.filter(job => job.status === 'active' || (job as any).isActive).length;
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  const totalViews = jobs.reduce((sum, job) => sum + ((job as any).views || 0), 0);

  return (
    <div className="admin-content">
      {/* Job Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          icon={FiFileText}
          value={jobs.length}
          label="Total Jobs"
          change={jobs.length - 10}
          changeLabel="from last month"
        />
        <StatsCard
          icon={HiCheckCircle}
          value={activeJobs}
          label="Active Jobs"
          change={activeJobs - 8}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiClock}
          value={pendingJobs}
          label="Pending Jobs"
          changeText="Awaiting approval"
        />
        <StatsCard
          icon={FiEye}
          value={totalViews}
          label="Total Views"
          change={Math.max(0, totalViews - 150)}
          changeLabel="from last month"
        />
      </div>

      <div className="jobs-grid" style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        padding: '20px 0'
      }}>
        {jobs && jobs.length > 0 ? (
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
