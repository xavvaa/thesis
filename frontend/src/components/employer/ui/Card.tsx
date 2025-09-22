import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
  padding = 'md',
}) => {
  const paddingClass = {
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
  }[padding];

  return (
    <div 
      className={`${styles.card} ${paddingClass} ${hoverEffect ? styles.hoverEffect : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
