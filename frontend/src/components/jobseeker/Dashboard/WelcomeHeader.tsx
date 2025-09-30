import React from 'react';
import styles from './WelcomeHeader.module.css';
import { getImageSrc } from '../../../utils/imageUtils';

interface WelcomeHeaderProps {
  userName: string | undefined;
  profilePicture?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, profilePicture }) => {
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
        {profilePicture ? (
          <img 
            src={getImageSrc(profilePicture)} 
            alt="Profile" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          avatarInitial
        )}
      </div>
    </div>
  );
};

export default WelcomeHeader;
