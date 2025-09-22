import React from 'react';
import { FiFileText } from 'react-icons/fi';
import styles from './RecentActivity.module.css';
import { Job } from '../../../types/Job';

interface Application {
  id: number;
  jobId: number;
  status: 'pending' | 'review' | 'interview' | 'rejected' | 'accepted';
  appliedDate: string;
}

interface RecentActivityProps {
  applications: Application[];
  jobs: Job[];
  onNavigate: (tab: string) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ applications, jobs, onNavigate }) => {
  return (
    <div className={styles.recentActivity}>
      <h2 className={styles.sectionTitle}>Recent Activity</h2>
      {applications.length > 0 ? (
        <div className={styles.activityList}>
          {applications.slice(0, 3).map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            if (!job) return null;
            
            return (
              <div key={app.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <FiFileText />
                </div>
                <div className={styles.activityContent}>
                  <h4 className={styles.activityTitle}>
                    Applied to {job.title}
                  </h4>
                  <p className={styles.activityCompany}>{job.company}</p>
                  <span className={styles.activityDate}>
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className={`${styles.activityStatus} ${styles[`status-${app.status}`]}`}>
                  {app.status}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyActivity}>
          <FiFileText className={styles.emptyIcon} />
          <p className={styles.emptyText}>No recent activity</p>
          <button 
            className={styles.emptyAction}
            onClick={() => onNavigate('jobs')}
          >
            Start applying to jobs
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
