import React, { useState } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title, subtitle }) => {
  const [notifications, setNotifications] = useState(3);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.menuButton} onClick={onMenuClick}>
          <span>☰</span>
        </button>
        <div className={styles.pageInfo}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <button className={styles.notificationButton}>
          <span>🔔</span>
          {notifications > 0 && (
            <span className={styles.notificationBadge}>{notifications}</span>
          )}
        </button>
        
        <div className={styles.userMenu}>
          <div className={styles.avatar}>👤</div>
          <span className={styles.userName}>Employer Name</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
