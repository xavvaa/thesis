import React from 'react';
import styles from './WelcomeHeader.module.css';

interface WelcomeHeaderProps {
  userName: string | undefined;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName }) => {
  const firstName = userName?.split(' ')[0] || 'User';
  const avatarInitial = userName?.charAt(0) || 'U';

  return (
    <div className={styles.welcomeSection}>
      <div className={styles.welcomeContent}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {firstName}!
        </h1>
        <p className={styles.welcomeSubtitle}>
          Here's what's happening with your job search today
        </p>
      </div>
      <div className={styles.welcomeAvatar}>
        {avatarInitial}
      </div>
    </div>
  );
};

export default WelcomeHeader;
