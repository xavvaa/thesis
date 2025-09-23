import React from 'react';

interface StatsCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;
  value: number;
  label: string;
  className?: string;
  iconClassName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  value,
  label,
  className = '',
  iconClassName = ''
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className={`stat-icon ${iconClassName}`}>
        <Icon />
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
