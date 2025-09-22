import React from 'react';
import { Job } from '../../types/admin';
import { FiEye, FiEdit2, FiTrash2, FiUsers, FiClock, FiMapPin, FiBriefcase, FiTrendingUp, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import styles from '../employer/dashboard/JobCard.module.css';

interface JobCardProps {
  job: Job;
  onStatusChange?: (jobId: string, status: string) => void;
  onView?: (job: Job) => void;
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onStatusChange, onView, onEdit, onDelete }) => {
  const formatPostedDate = () => {
    if (job.createdAt) {
      const date = new Date(job.createdAt);
      
      if (isNaN(date.getTime())) {
        return 'Recently posted';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Format full date
      const fullDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Format relative time
      let timeAgo;
      if (diffMinutes < 1) {
        timeAgo = 'Just now';
      } else if (diffMinutes < 60) {
        timeAgo = diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        timeAgo = '1 day ago';
      } else if (diffDays < 7) {
        timeAgo = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        timeAgo = `${Math.ceil(diffDays / 7)} weeks ago`;
      } else {
        timeAgo = `${Math.ceil(diffDays / 30)} months ago`;
      }
      
      return `${fullDate} — ${timeAgo}`;
    }
    return 'Recently posted';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'closed': return 'closed';
      case 'pending': return 'pending';
      case 'suspended': return 'suspended';
      default: return 'active';
    }
  };

  const handleStatusToggle = () => {
    const newStatus = job.status === 'active' ? 'inactive' : 'active';
    onStatusChange?.(job._id, newStatus);
  };

  return (
    <div className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <div className={styles.jobHeaderContent}>
          <div className={styles.jobTitleSection}>
            <h3 className={styles.jobTitle}>{job.title}</h3>
            <p className={styles.companyName}>{job.employerUid?.companyName || job.company}</p>
          </div>
          <div className={styles.statusSection}>
            <span className={`${styles.statusBadge} ${styles[getStatusColor(job.status)]}`}>
              {job.status}
            </span>
            <span className={styles.postedDate}>{formatPostedDate()}</span>
          </div>
        </div>
        
        <div className={styles.jobMeta}>
          <div className={styles.metaItem}>
            <FiMapPin className={styles.metaIcon} />
            <span>Location not specified</span>
          </div>
          <div className={styles.metaItem}>
            <FiClock className={styles.metaIcon} />
            <span>Full-time</span>
          </div>
          <div className={styles.metaItem}>
            <FiBriefcase className={styles.metaIcon} />
            <span>Admin View</span>
          </div>
          <div className={styles.metaItem}>
            <FiSettings className={styles.metaIcon} />
            <span>Admin Controls</span>
          </div>
        </div>
      </div>
      
      {/* Job Description */}
      <div className={styles.jobDescription}>
        <p className={styles.descriptionText}>
          Job posted by {job.employerUid?.companyName || 'Unknown Company'}. Contact: {job.employerUid?.email || 'No email provided'}. This job is currently {job.status} and requires admin review for compliance and content moderation.
        </p>
      </div>

      <div className={styles.jobActions}>
        <button 
          className={`${styles.deleteButton} admin-action-btn`}
          onClick={() => onDelete?.(job._id)}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiTrash2 />
          <span>Remove</span>
        </button>
        
        <div className={styles.actionGroup}>
          <button 
            onClick={handleStatusToggle}
            style={{ 
              background: job.status === 'active' ? '#ffc107' : '#28a745', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {job.status === 'active' ? <FiX /> : <FiCheck />}
            <span>{job.status === 'active' ? 'Deactivate' : 'Activate'}</span>
          </button>
          
          <button 
            onClick={() => onView?.(job)}
            style={{ 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiEye />
            <span>View Details</span>
          </button>
          
          <button 
            onClick={() => onEdit?.(job)}
            style={{ 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiUsers />
            <span>Manage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
