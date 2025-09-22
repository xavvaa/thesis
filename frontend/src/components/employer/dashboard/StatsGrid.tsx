import React from 'react';
import { FiUsers, FiBriefcase, FiCalendar, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import cardStyles from './Cards.module.css';

interface StatsGridProps {
  stats: {
    totalApplicants: number;
    pendingReviews: number;
    openPositions: number;
    hiredThisMonth: number;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      <div className={cardStyles.statCard}>
        <div className={`${cardStyles.statIcon} ${cardStyles.primary}`}>
          <FiUsers size={28} />
        </div>
        <div className={cardStyles.statContent}>
          <h3>{stats.totalApplicants}</h3>
          <p>Total Applicants</p>
          <div className={cardStyles.statTrend}>
            <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
            <span className={`${cardStyles.trendText} ${cardStyles.up}`}>+12% this month</span>
          </div>
        </div>
      </div>

      <div className={cardStyles.statCard}>
        <div className={`${cardStyles.statIcon} ${cardStyles.success}`}>
          <FiUserCheck size={28} />
        </div>
        <div className={cardStyles.statContent}>
          <h3>{stats.pendingReviews}</h3>
          <p>Pending Reviews</p>
          <div className={cardStyles.statTrend}>
            <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
            <span className={`${cardStyles.trendText} ${cardStyles.up}`}>+5 new today</span>
          </div>
        </div>
      </div>

      <div className={cardStyles.statCard}>
        <div className={`${cardStyles.statIcon} ${cardStyles.warning}`}>
          <FiBriefcase size={28} />
        </div>
        <div className={cardStyles.statContent}>
          <h3>{stats.openPositions}</h3>
          <p>Open Positions</p>
          <div className={cardStyles.statTrend}>
            <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
            <span className={`${cardStyles.trendText} ${cardStyles.up}`}>3 active</span>
          </div>
        </div>
      </div>

      <div className={cardStyles.statCard}>
        <div className={`${cardStyles.statIcon} ${cardStyles.info}`}>
          <FiCalendar size={28} />
        </div>
        <div className={cardStyles.statContent}>
          <h3>{stats.hiredThisMonth}</h3>
          <p>Interviews This Week</p>
          <div className={cardStyles.statTrend}>
            <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
            <span className={`${cardStyles.trendText} ${cardStyles.up}`}>2 upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
};
