import React from 'react';
import { FiPlus, FiUsers } from 'react-icons/fi';
import styles from './WelcomeSection.module.css';
import buttonStyles from './Buttons.module.css';
import { getImageSrc } from '../../../utils/imageUtils';

interface WelcomeSectionProps {
  userName: string;
  subtitle?: string;
  profilePicture?: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  userName, 
  subtitle = "Here's what's happening with your job search today",
  profilePicture
}) => {
  return (
    <div className={styles.welcomeSection}>
      <div className={styles.welcomeContent}>
        <h1 className={styles.welcomeTitle}>Welcome back, {userName}!</h1>
        <p className={styles.welcomeSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.welcomeAvatar}>
        {profilePicture ? (
          <img 
            src={getImageSrc(profilePicture)} 
            alt="Company logo" 
            className={styles.avatarImage}
          />
        ) : (
          userName.charAt(0).toUpperCase()
        )}
      </div>
    </div>
  );
};
