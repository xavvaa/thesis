import React from 'react';
import { FiHome, FiUsers, FiBriefcase, FiSettings } from 'react-icons/fi';
import sidebarStyles from './Sidebar.module.css';

type TabType = 'overview' | 'applicants' | 'jobs' | 'settings';

interface DashboardSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  sidebarOpen: boolean;
  pendingReviews: number;
  openPositions: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  sidebarOpen,
  pendingReviews,
  openPositions
}) => {
  return (
    <div className={`${sidebarStyles.sidebar} ${sidebarOpen ? sidebarStyles.open : ''}`}>
      <div className={sidebarStyles.sidebarHeader}>
        <div className={sidebarStyles.logo}>
          JobPortal
        </div>
      </div>
      
      <nav className={sidebarStyles.sidebarNav}>
        <a 
          href="#" 
          className={`${sidebarStyles.navItem} ${activeTab === 'overview' ? sidebarStyles.active : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange('overview');
          }}
        >
          <FiHome className={sidebarStyles.navIcon} size={20} />
          Dashboard
        </a>
        <a 
          href="#" 
          className={`${sidebarStyles.navItem} ${activeTab === 'applicants' ? sidebarStyles.active : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange('applicants');
          }}
        >
          <FiUsers className={sidebarStyles.navIcon} size={20} />
          Applicants
          {pendingReviews > 0 && (
            <span className={sidebarStyles.badge}>{pendingReviews}</span>
          )}
        </a>
        <a 
          href="#" 
          className={`${sidebarStyles.navItem} ${activeTab === 'jobs' ? sidebarStyles.active : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange('jobs');
          }}
        >
          <FiBriefcase className={sidebarStyles.navIcon} size={20} />
          Job Posts
          {openPositions > 0 && (
            <span className={sidebarStyles.badge}>{openPositions}</span>
          )}
        </a>
        <a 
          href="#" 
          className={`${sidebarStyles.navItem} ${activeTab === 'settings' ? sidebarStyles.active : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange('settings');
          }}
        >
          <FiSettings className={sidebarStyles.navIcon} size={20} />
          Settings
        </a>
      </nav>
      
      <div className={sidebarStyles.sidebarFooter}>
        <p className={sidebarStyles.footerText}>© 2024 HireHub</p>
      </div>
    </div>
  );
};
