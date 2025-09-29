import React from 'react'
import { FiBookmark, FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiTrendingUp, FiCheck, FiX } from 'react-icons/fi'
import styles from './JobCard.module.css'
import { Job } from '../../../types/Job'

interface JobCardProps {
  job: Job
  onSave?: (jobId: string | number) => void
  onApply?: (jobId: string | number) => void
  onJobClick?: (job: Job) => void
  onViewApplication?: (job: Job) => void
  isSaved?: boolean
  companyLogo?: string
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onSave,
  onApply,
  onJobClick,
  onViewApplication,
  isSaved = false,
  companyLogo
}) => {
  const formatPostedDate = () => {
    // For applications, show applied date instead of posted date
    if (job.applied && job.appliedDate) {
      const date = new Date(job.appliedDate);
      if (!isNaN(date.getTime())) {
        return `Applied: ${date.toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}`;
      }
    }
    
    if (job.postedDate || job.posted) {
      let date;
      if (typeof (job.postedDate || job.posted) === 'string') {
        date = new Date(job.postedDate || job.posted);
      } else {
        date = new Date(job.postedDate || job.posted);
      }
      
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
  const getCompanyLogo = (company: string) => {
    return (
      <div className={styles.companyLogo}>
        {companyLogo ? (
          <img 
            src={`http://localhost:3001/${companyLogo}`} 
            alt={`${company} logo`} 
            className={styles.companyLogoImage}
          />
        ) : (
          company.charAt(0)
        )}
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className={styles.statusIcon} />;
      case 'approved':
        return <FiCheck className={styles.statusIcon} />;
      case 'rejected':
        return <FiX className={styles.statusIcon} />;
      default:
        return <FiClock className={styles.statusIcon} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Not Selected';
      default:
        return 'Under Review';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if clicking on the card itself, not buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    console.log(' JobCard clicked:', job.title);
    onJobClick?.(job);
  };

  return (
    <div 
      className={styles.jobCard}
      onClick={handleCardClick}
    >
      <div className={styles.jobCardHeader}>
        <div className={styles.jobTitleRow}>
          {getCompanyLogo(job.company)}
          <div className={styles.jobInfo}>
            <h4 className={styles.jobTitle}>{job.title}</h4>
            <p className={styles.companyName}>{job.company}</p>
          </div>
          {job.applied && job.status ? (
            <div 
              className={`${styles.statusBadge} ${styles[`status${job.status.charAt(0).toUpperCase() + job.status.slice(1)}`]}`}
              aria-label={`Application status: ${job.status}`}
            >
              <span className={styles.buttonContent}>
                {getStatusIcon(job.status)}
                <span className={styles.statusText}>{getStatusText(job.status)}</span>
              </span>
            </div>
          ) : (
            <button 
              className={`${styles.saveJobButton} ${isSaved ? styles.saved : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSave?.(job.id);
              }}
              aria-label={isSaved ? 'Unsave job' : 'Save job'}
            >
              <span className={styles.buttonContent}>
                <FiBookmark className={styles.icon} />
              </span>
            </button>
          )}
        </div>
        
        <div className={styles.jobDetails}>
          <div className={styles.detailItem}>
            <FiMapPin className={styles.detailIcon} />
            <span>{job.location}</span>
          </div>
          <div className={styles.detailItem}>
            <FiClock className={styles.detailIcon} />
            <span>{job.type}</span>
          </div>
          <div className={styles.detailItem}>
            <FiTrendingUp className={styles.detailIcon} />
            <span>{job.level || 'Mid-level'}</span>
          </div>
          <div className={styles.detailItem}>
            <FiBriefcase className={styles.detailIcon} />
            <span>{job.department || 'Engineering'}</span>
          </div>
          <div className={styles.detailItem}>
            <span>{job.salary || '₱10,000+'}</span>
          </div>
          <div className={styles.detailItem}>
            <span>{job.workplaceType || (job.remote ? 'Remote' : 'On-site')}</span>
          </div>
        </div>
        
        
        <div className={styles.jobDescription}>
          <p className={styles.descriptionText}>
            {job.description && job.description.length > 180 ? 
              `${job.description.substring(0, 180)}...` : 
              job.description || 'asdfghjkl'
            }
          </p>
        </div>
        
        <div className={styles.jobFooter}>
          <span className={styles.postedDate}>{formatPostedDate()}</span>
          {job.applied && job.status ? (
            <button 
              className={styles.applyButton}
              onClick={(e) => {
                e.stopPropagation();
                onViewApplication?.(job);
              }}
            >
              <span className={styles.buttonContent}>
                <span>View Application</span>
              </span>
            </button>
          ) : (
            <button 
              className={`${styles.applyButton} ${job.applied ? styles.applied : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!job.applied) {
                  onApply?.(job.id);
                }
              }}
              disabled={job.applied}
            >
              <span className={styles.buttonContent}>
                {job.applied ? (
                  <span>Applied ✓</span>
                ) : (
                  <span>Apply Now</span>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobCard
