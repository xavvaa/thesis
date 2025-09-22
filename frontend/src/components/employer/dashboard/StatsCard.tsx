import React from 'react';
import styles from './StatsCard.module.css';
import { IconType } from 'react-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  className = '',
}) => {
  const trendClass = {
    up: styles.trendUp,
    down: styles.trendDown,
    neutral: '',
  }[trend];

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '',
  }[trend];

  return (
    <div className={`${styles.statsCard} ${className}`}>
      <div className={styles.statsIcon}>
        {icon}
      </div>
      <div className={styles.statsContent}>
        <h3 className={styles.statsTitle}>{title}</h3>
        <p className={styles.statsValue}>{value}</p>
        {change !== undefined && (
          <div className={`${styles.statsChange} ${trendClass}`}>
            {trendIcon} {Math.abs(change)}% from last month
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
