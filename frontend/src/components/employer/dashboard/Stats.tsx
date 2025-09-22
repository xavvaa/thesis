import React from 'react';
import { FiBriefcase, FiUsers, FiDollarSign, FiClock } from 'react-icons/fi';
import StatsCard from './StatsCard';
import styles from './Stats.module.css';

interface StatsProps {
  activeJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  positionsFilled: number;
  jobsChange: string;
  applicantsChange: string;
  interviewsChange: string;
  filledChange: string;
}

export const Stats: React.FC<StatsProps> = ({
  activeJobs,
  totalApplicants,
  interviewsScheduled,
  positionsFilled,
  jobsChange,
  applicantsChange,
  interviewsChange,
  filledChange,
}) => {
  return (
    <div className={styles.statsGrid}>
      <StatsCard
        icon={<FiBriefcase />}
        title="Active Jobs"
        value={activeJobs}
        change={parseInt(jobsChange.replace(/[^0-9-]/g, ''))}
        trend={jobsChange.startsWith('+') ? 'up' : 'down'}
      />
      <StatsCard
        icon={<FiUsers />}
        title="Total Applicants"
        value={totalApplicants}
        change={parseInt(applicantsChange.replace(/[^0-9-]/g, ''))}
        trend={applicantsChange.startsWith('+') ? 'up' : 'down'}
      />
      <StatsCard
        icon={<FiClock />}
        title="Interviews"
        value={interviewsScheduled}
        change={parseInt(interviewsChange.replace(/[^0-9-]/g, ''))}
        trend={interviewsChange.startsWith('+') ? 'up' : 'down'}
      />
      <StatsCard
        icon={<FiDollarSign />}
        title="Positions Filled"
        value={positionsFilled}
        change={parseInt(filledChange.replace(/[^0-9-]/g, ''))}
        trend={filledChange.startsWith('+') ? 'up' : 'down'}
      />
    </div>
  );
};
