import React from 'react';

interface StatsCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;
  value: number;
  label: string;
  className?: string;
  iconClassName?: string;
  change?: number;
  changeLabel?: string;
  changeText?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  value,
  label,
  className = '',
  iconClassName = '',
  change,
  changeLabel = 'from last month',
  changeText
}) => {
  const getChangeClass = () => {
    if (change === undefined) return 'positive';
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const formatChange = () => {
    if (changeText) return changeText;
    if (change === undefined || change === null) return '';
    const sign = change > 0 ? '+' : change < 0 ? '-' : '';
    const absValue = Math.abs(change);
    return `${sign}${absValue} ${changeLabel}`;
  };

  return (
    <div className={`stat-card ${className}`}>
      <div className={`stat-icon ${iconClassName}`}>
        <Icon />
      </div>
      <div className="stat-info">
        <p>{label}</p>
        <h3>{value.toLocaleString()}</h3>
        <div className={`stat-change ${getChangeClass()}`}>
          {formatChange()}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
