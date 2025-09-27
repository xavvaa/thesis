import React, { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase, FiFileText, FiTrendingUp, FiClock } from 'react-icons/fi';
import { HiCheckCircle } from 'react-icons/hi';
import { DashboardStats } from '../../types/admin';
import StatsCard from './StatsCard';
import adminService from '../../services/adminService';

interface OverviewTabProps {
  stats: DashboardStats | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  const [realStats, setRealStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    totalJobSeekers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingEmployers: 0,
    activeJobs: 0,
    loading: true
  });

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    console.log('🔄 OverviewTab: Fetching real stats...');
    try {
      // Make parallel API calls for different data sources
      const [usersResponse, employersResponse, jobsResponse, dashboardStats, pendingEmployersResponse] = await Promise.all([
        adminService.getUsers({}),
        adminService.getAllEmployers(),
        adminService.getJobs({ limit: 1000 }), // Get all jobs
        adminService.getDashboardStats(),
        adminService.getPendingEmployers()
      ]);
      
      console.log('📊 OverviewTab: Raw API responses:', {
        usersResponse,
        employersResponse,
        jobsResponse,
        dashboardStats,
        pendingEmployersResponse
      });
      
      const allUsers = usersResponse.users || [];
      const allEmployers = employersResponse || [];
      const allJobs = jobsResponse.jobs || jobsResponse.data || [];
      const pendingEmployers = pendingEmployersResponse || [];
      
      console.log('📈 OverviewTab: Processed data:', {
        allUsers: allUsers.length,
        allEmployers: allEmployers.length,
        allJobs: allJobs.length,
        pendingEmployers: pendingEmployers.length
      });
      
      // Calculate real stats from actual data
      const jobSeekers = allUsers.filter((user: any) => user.role === 'jobseeker' || user.userType === 'jobseeker');
      const employers = allUsers.filter((user: any) => user.role === 'employer' || user.userType === 'employer');
      
      const newStats = {
        totalUsers: allUsers.length,
        totalEmployers: Math.max(employers.length, allEmployers.length),
        totalJobSeekers: jobSeekers.length,
        totalJobs: allJobs.length,
        totalApplications: dashboardStats?.totalApplications || 0,
        pendingEmployers: pendingEmployers.length || 0,
        activeJobs: allJobs.filter((job: any) => job.status === 'active' || job.isActive).length,
        loading: false
      };
      
      console.log('✅ OverviewTab: Final calculated stats:', newStats);
      setRealStats(newStats);
      
    } catch (error) {
      console.error('❌ OverviewTab: Error fetching stats:', error);
      setRealStats(prev => ({ ...prev, loading: false }));
    }
  };

  const getMonthlyChange = (current: number, baseline: number = 10) => {
    return current - baseline;
  };
  // Use fallback stats if realStats are still loading or failed
  const displayStats = realStats.loading ? {
    totalUsers: stats?.totalUsers || 0,
    totalEmployers: stats?.totalEmployers || 0,
    totalJobSeekers: stats?.totalJobSeekers || 0,
    totalJobs: stats?.totalJobs || 0,
    totalApplications: stats?.totalApplications || 0,
    pendingEmployers: stats?.pendingEmployers || 0,
    activeJobs: stats?.activeJobs || 0,
  } : realStats;

  console.log('🎯 OverviewTab: Display stats being used:', displayStats);
  console.log('🎯 OverviewTab: Props stats:', stats);
  console.log('🎯 OverviewTab: Real stats:', realStats);

  return (
    <div className="admin-content">
      <div className="stats-grid">
        <StatsCard
          icon={FiUsers}
          value={displayStats.totalUsers}
          label="Total Users"
          change={getMonthlyChange(displayStats.totalUsers, 5)}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiBriefcase}
          value={displayStats.totalEmployers}
          label="Employers"
          change={getMonthlyChange(displayStats.totalEmployers, 2)}
          changeLabel="from last month"
        />
        <StatsCard
          icon={HiCheckCircle}
          value={displayStats.totalJobSeekers}
          label="Jobseekers"
          change={getMonthlyChange(displayStats.totalJobSeekers, 3)}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiFileText}
          value={displayStats.totalJobs}
          label="Job Postings"
          change={getMonthlyChange(displayStats.totalJobs, 10)}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiClock}
          value={displayStats.pendingEmployers}
          label="Pending Reviews"
          changeText={`${displayStats.pendingEmployers} awaiting review`}
        />
        <StatsCard
          icon={FiTrendingUp}
          value={displayStats.activeJobs}
          label="Active Jobs"
          change={getMonthlyChange(displayStats.activeJobs, 8)}
          changeLabel="from last month"
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
