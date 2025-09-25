import React from 'react';
import { FiUsers, FiBriefcase, FiFileText, FiTrendingUp, FiClock } from 'react-icons/fi';
import { HiCheckCircle } from 'react-icons/hi';
import { DashboardStats } from '../../types/admin';
import StatsCard from './StatsCard';

interface OverviewTabProps {
  stats: DashboardStats | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  return (
    <div className="admin-content">
      <div className="stats-grid">
        <StatsCard
          icon={FiUsers}
          value={stats?.totalUsers || 0}
          label="Total Users"
          iconClassName="users"
        />
        <StatsCard
          icon={FiBriefcase}
          value={stats?.totalEmployers || 0}
          label="Employers"
          iconClassName="employers"
        />
        <StatsCard
          icon={HiCheckCircle}
          value={stats?.totalJobSeekers || 0}
          label="Jobseekers"
          iconClassName="jobseekers"
        />
        <StatsCard
          icon={FiFileText}
          value={stats?.totalJobs || 0}
          label="Job Postings"
          iconClassName="jobs"
        />
        <StatsCard
          icon={FiClock}
          value={stats?.pendingEmployers || 0}
          label="Pending Verifications"
          className="pending"
          iconClassName="pending-icon"
        />
        <StatsCard
          icon={FiTrendingUp}
          value={stats?.activeJobs || 0}
          label="Active Jobs"
          className="active"
          iconClassName="active-icon"
        />
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <HiCheckCircle className="activity-icon" />
              <div>
                <p>{stats?.recentApplications || 0} new applications this week</p>
                <span>Job applications</span>
              </div>
            </div>
            <div className="activity-item">
              <FiBriefcase className="activity-icon" />
              <div>
                <p>{stats?.pendingEmployers || 0} employers awaiting verification</p>
                <span>Verification queue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
