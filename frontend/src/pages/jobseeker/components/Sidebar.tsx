import React from 'react';
import styles from '../Dashboard.module.css';

// Import icons directly
const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const JobsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ApplicationsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  notifications?: number;
};

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isSidebarOpen, 
  onToggleSidebar,
  notifications = 0
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'jobs', label: 'Jobs', icon: <JobsIcon /> },
    { id: 'applications', label: 'Applications', icon: <ApplicationsIcon /> },
    { id: 'profile', label: 'My Profile', icon: <ProfileIcon /> },
  ];

  return (
    <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        <h2>Menu</h2>
        <button 
          className={styles.closeButton} 
          onClick={onToggleSidebar}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>
      <nav>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                <span className={styles.menuIcon}>
                  <span className={styles.iconWrapper}>
                    {item.icon}
                    {item.id === 'applications' && notifications > 0 && (
                      <span className={styles.notificationBadge}>
                        {notifications > 9 ? '9+' : notifications}
                      </span>
                    )}
                  </span>
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
