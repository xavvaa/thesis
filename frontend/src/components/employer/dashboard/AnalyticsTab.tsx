import React from 'react';
import { Stats } from './Stats';

interface AnalyticsTabProps {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    interviewsScheduled: number;
    positionsFilled: number;
    jobsChange: string;
    applicantsChange: string;
    interviewsChange: string;
    filledChange: string;
  };
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
      <Stats {...stats} />
    </div>
  );
};