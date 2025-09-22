import React from 'react';
import { FiMenu, FiX, FiBell } from 'react-icons/fi';
import layoutStyles from './Layout.module.css';

interface MobileHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  notificationCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  notificationCount = 1
}) => {
  return (
    <div className={layoutStyles.mobileHeaderContainer}>
      <div className={layoutStyles.mobileHeader}>
        <button 
          className={layoutStyles.menuButton}
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <h1 className={layoutStyles.pageTitle}>Dashboard</h1>
        <div className={layoutStyles.headerRight}>
          <button className={layoutStyles.notificationButton}>
            <FiBell />
            {notificationCount > 0 && (
              <span className={layoutStyles.notificationBadge}>{notificationCount}</span>
            )}
          </button>
          <div className={layoutStyles.profileAvatar}>
            U
          </div>
        </div>
      </div>
    </div>
  );
};
