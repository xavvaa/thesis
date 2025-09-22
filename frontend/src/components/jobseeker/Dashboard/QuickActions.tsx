import React from 'react';
import { FiSearch, FiFileText, FiBriefcase, FiUser } from 'react-icons/fi';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  onNavigate: (tab: string) => void;
  onShowResumeUpload: () => void;
  userProfile?: any;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate, onShowResumeUpload, userProfile }) => {
  return (
    <div className={styles.quickActions}>
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.actionGrid}>
        <button 
          className={styles.actionCard}
          onClick={() => onNavigate('jobs')}
        >
          <FiSearch className={styles.actionIcon} />
          <span className={styles.actionLabel}>Find Jobs</span>
        </button>
        
        <button 
          className={styles.actionCard}
          onClick={onShowResumeUpload}
        >
          <FiFileText className={styles.actionIcon} />
          <span className={styles.actionLabel}>
            {userProfile?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
          </span>
        </button>
        
        <button 
          className={styles.actionCard}
          onClick={() => onNavigate('applications')}
        >
          <FiBriefcase className={styles.actionIcon} />
          <span className={styles.actionLabel}>View Applications</span>
        </button>
        
        <button 
          className={styles.actionCard}
          onClick={() => onNavigate('profile')}
        >
          <FiUser className={styles.actionIcon} />
          <span className={styles.actionLabel}>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
