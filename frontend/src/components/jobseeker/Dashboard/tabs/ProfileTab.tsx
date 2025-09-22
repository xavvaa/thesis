import React from 'react';
import styles from '../../../../pages/jobseeker/Dashboard.module.css';
import { FiUser } from 'react-icons/fi';

const ProfileTab: React.FC = () => {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageSubtitle}>Manage your personal information</p>
      </div>
      <div className={styles.emptyState}>
        <FiUser size={48} className={styles.emptyIcon} />
        <h3>Complete your profile</h3>
        <p>Upload your resume to get started</p>
      </div>
    </div>
  );
};

export default ProfileTab;
