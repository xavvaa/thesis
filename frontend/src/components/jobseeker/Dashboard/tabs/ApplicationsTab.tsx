import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { auth } from '../../../../config/firebase';
import styles from '../../../../pages/jobseeker/Dashboard.module.css';
import JobsList from '../../JobsList/JobsList';
import ApplicationDetailModal from '../../ApplicationDetailModal/ApplicationDetailModal';
import { Job } from '../../../../types/Job';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  type: string;
  level?: string;
  department?: string;
  workplaceType?: string;
  salary: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  updatedAt: string;
}

const ApplicationsTab: React.FC<any> = ({
  onSaveJob,
  onApplyJob,
  onJobClick,
  savedJobs,
  onOpenFilters,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3001/api/applications/jobseeker', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      if (data.success) {
        setApplications(data.data);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (job: Job) => {
    // Find the corresponding application data
    const application = applications.find(app => app.jobId === job.id);
    if (application) {
      setSelectedApplication(application);
      setIsModalOpen(true);
    }
  };

  // Convert applications to Job format for JobsList component
  const convertApplicationsToJobs = (): Job[] => {
    return applications.map(app => ({
      id: app.jobId,
      title: app.jobTitle,
      company: app.company,
      location: app.location,
      description: app.description || '',
      type: app.type,
      level: app.level || '',
      department: app.department,
      workplaceType: app.workplaceType as 'On-site' | 'Hybrid' | 'Remote' | undefined,
      salary: app.salary || '₱10,000+',
      applied: true, // All applications are already applied
      status: app.status,
      appliedDate: app.appliedDate,
      postedDate: app.appliedDate // Use applied date as posted date for display
    }));
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loadingState}>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.errorState}>
          <p>Error: {error}</p>
          <button onClick={fetchApplications} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <JobsList
        jobs={convertApplicationsToJobs()}
        title=""
        onSaveJob={onSaveJob}
        onApplyJob={onApplyJob}
        onJobClick={onJobClick}
        onViewApplication={handleViewApplication}
        savedJobs={savedJobs}
        onOpenFilters={onOpenFilters}
      />
      
      {selectedApplication && isModalOpen && createPortal(
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedApplication(null);
          }}
          onViewJob={(jobId) => {
            // Close the application modal first
            setIsModalOpen(false);
            setSelectedApplication(null);
            
            // Find the job and trigger the job click handler
            const job = convertApplicationsToJobs().find(j => j.id === jobId);
            if (job && onJobClick) {
              onJobClick(job);
            }
          }}
        />,
        document.body
      )}
    </div>
  );
};

export default ApplicationsTab;
