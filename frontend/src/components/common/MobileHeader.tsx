import React from 'react';
import styles from './MobileHeader.module.css';

interface MobileHeaderProps {
  title: string;
  onMenuToggle: () => void;
  showMenuButton?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuToggle,
  showMenuButton = true,
  rightContent,
  className = ''
}) => {
  return (
    <header className={`${styles.mobileHeader} ${className}`}>
      <div className={styles.headerLeft}>
        {showMenuButton && (
          <button
            className={styles.menuButton}
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      {rightContent && (
        <div className={styles.headerRight}>
          {rightContent}
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
