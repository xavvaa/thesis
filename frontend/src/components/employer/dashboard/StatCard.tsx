import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  changeText: string;
  iconBg?: string;
  iconColor?: string;
  changeColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  changeText,
  iconBg = "#dbeafe",
  iconColor = "#2563eb",
  changeColor = "#10b981",
}) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: iconBg }}>
        {React.cloneElement(icon as React.ReactElement, { style: { color: iconColor } })}
      </div>
      <div className={styles.statInfo}>
        <h3 className={styles.statTitle}>{title}</h3>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statChange} style={{ color: changeColor }}>
          {changeText}
        </div>
      </div>
    </div>
  );
};
