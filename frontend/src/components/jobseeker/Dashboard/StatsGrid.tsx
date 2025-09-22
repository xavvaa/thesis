import React from 'react';
import { FiFileText, FiBookmark, FiUser, FiBriefcase } from 'react-icons/fi';
import styles from './StatsGrid.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, onClick }) => (
  <div 
    className={`${styles.statCard} ${onClick ? styles.clickable : ''}`}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
  >
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}>
      <h3 className={styles.statNumber}>{value}</h3>
      <p className={styles.statLabel}>{label}</p>
    </div>
  </div>
);

interface StatsGridProps {
  applicationsCount: number;
  savedJobsCount: number;
  interviewsCount: number;
  availableJobsCount: number;
  onNavigate?: (tab: string) => void;
}

const StatsGrid: React.FC<StatsGridProps> = ({ 
  applicationsCount,
  savedJobsCount,
  interviewsCount,
  availableJobsCount,
  onNavigate 
}) => {
  return (
    <div className={styles.statsGrid}>
      <StatCard 
        icon={<FiFileText />} 
        label="Applications" 
        value={applicationsCount} 
        onClick={() => onNavigate?.('applications')}
      />
      <StatCard 
        icon={<FiBookmark />} 
        label="Saved Jobs" 
        value={savedJobsCount} 
        onClick={() => onNavigate?.('saved')}
      />
      <StatCard 
        icon={<FiUser />} 
        label="Interviews" 
        value={interviewsCount} 
        onClick={() => onNavigate?.('applications')}
      />
      <StatCard 
        icon={<FiBriefcase />} 
        label="Available Jobs" 
        value={availableJobsCount} 
        onClick={() => onNavigate?.('jobs')}
      />
    </div>
  );
};

export default StatsGrid;
