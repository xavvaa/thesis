import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiUsers, FiTrendingUp, FiCalendar, FiDownload } from 'react-icons/fi';
import StatsCard from './StatsCard';

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  usersByType: {
    jobSeekers: number;
    employers: number;
    admins: number;
  };
  userActivity: {
    date: string;
    activeUsers: number;
    newRegistrations: number;
    jobApplications: number;
  }[];
  demographics: {
    ageGroups: { range: string; count: number }[];
    locations: { city: string; count: number }[];
    educationLevels: { level: string; count: number }[];
  };
}

const UserAnalyticsTab: React.FC = () => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchUserMetrics();
  }, [dateRange]);

  const fetchUserMetrics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockMetrics: UserMetrics = {
        totalUsers: 1250,
        activeUsers: 890,
        newUsersThisMonth: 125,
        userGrowthRate: 12.5,
        usersByType: {
          jobSeekers: 980,
          employers: 245,
          admins: 25
        },
        userActivity: [
          { date: '2024-01-15', activeUsers: 450, newRegistrations: 12, jobApplications: 89 },
          { date: '2024-01-16', activeUsers: 520, newRegistrations: 18, jobApplications: 102 },
          { date: '2024-01-17', activeUsers: 480, newRegistrations: 15, jobApplications: 95 },
          { date: '2024-01-18', activeUsers: 610, newRegistrations: 22, jobApplications: 134 },
          { date: '2024-01-19', activeUsers: 590, newRegistrations: 19, jobApplications: 128 },
          { date: '2024-01-20', activeUsers: 670, newRegistrations: 25, jobApplications: 156 },
          { date: '2024-01-21', activeUsers: 720, newRegistrations: 28, jobApplications: 178 }
        ],
        demographics: {
          ageGroups: [
            { range: '18-24', count: 320 },
            { range: '25-34', count: 450 },
            { range: '35-44', count: 280 },
            { range: '45-54', count: 150 },
            { range: '55+', count: 50 }
          ],
          locations: [
            { city: 'Manila', count: 380 },
            { city: 'Cebu', count: 220 },
            { city: 'Davao', count: 180 },
            { city: 'Quezon City', count: 160 },
            { city: 'Others', count: 310 }
          ],
          educationLevels: [
            { level: 'High School', count: 180 },
            { level: 'College Graduate', count: 520 },
            { level: 'Vocational', count: 280 },
            { level: 'Post Graduate', count: 190 },
            { level: 'Others', count: 80 }
          ]
        }
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error fetching user metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!metrics) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', metrics.totalUsers.toString()],
      ['Active Users', metrics.activeUsers.toString()],
      ['New Users This Month', metrics.newUsersThisMonth.toString()],
      ['User Growth Rate', `${metrics.userGrowthRate}%`],
      ['Job Seekers', metrics.usersByType.jobSeekers.toString()],
      ['Employers', metrics.usersByType.employers.toString()],
      ['Admins', metrics.usersByType.admins.toString()],
      [''],
      ['Daily Activity'],
      ['Date', 'Active Users', 'New Registrations', 'Job Applications'],
      ...metrics.userActivity.map(activity => [
        activity.date,
        activity.activeUsers.toString(),
        activity.newRegistrations.toString(),
        activity.jobApplications.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading-spinner"></div>
        <p>Loading user analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="tab-content">
        <p>Failed to load user analytics data.</p>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-title">
          <FiBarChart2 className="tab-icon" />
          <h2>User Analytics</h2>
        </div>
        <div className="tab-actions">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn btn-secondary" onClick={exportAnalytics}>
            <FiDownload />
            Export Data
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          icon={FiUsers}
          value={metrics.totalUsers}
          label="Total Users"
          iconClassName="users"
        />
        <StatsCard
          icon={FiTrendingUp}
          value={metrics.activeUsers}
          label="Active Users"
          iconClassName="active-icon"
        />
        <StatsCard
          icon={FiCalendar}
          value={metrics.newUsersThisMonth}
          label="New This Month"
          iconClassName="jobs"
        />
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>User Types Distribution</h3>
          <div className="user-types-chart">
            <div className="chart-item">
              <div className="chart-bar">
                <div 
                  className="bar job-seekers" 
                  style={{ width: `${(metrics.usersByType.jobSeekers / metrics.totalUsers) * 100}%` }}
                ></div>
              </div>
              <div className="chart-label">
                <span>Job Seekers</span>
                <span>{metrics.usersByType.jobSeekers}</span>
              </div>
            </div>
            
            <div className="chart-item">
              <div className="chart-bar">
                <div 
                  className="bar employers" 
                  style={{ width: `${(metrics.usersByType.employers / metrics.totalUsers) * 100}%` }}
                ></div>
              </div>
              <div className="chart-label">
                <span>Employers</span>
                <span>{metrics.usersByType.employers}</span>
              </div>
            </div>
            
            <div className="chart-item">
              <div className="chart-bar">
                <div 
                  className="bar admins" 
                  style={{ width: `${(metrics.usersByType.admins / metrics.totalUsers) * 100}%` }}
                ></div>
              </div>
              <div className="chart-label">
                <span>Admins</span>
                <span>{metrics.usersByType.admins}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Daily Activity Trend</h3>
          <div className="activity-chart">
            {metrics.userActivity.map((activity, index) => (
              <div key={index} className="activity-day">
                <div className="activity-bars">
                  <div 
                    className="activity-bar active-users"
                    style={{ height: `${(activity.activeUsers / 800) * 100}%` }}
                    title={`Active Users: ${activity.activeUsers}`}
                  ></div>
                  <div 
                    className="activity-bar new-registrations"
                    style={{ height: `${(activity.newRegistrations / 30) * 100}%` }}
                    title={`New Registrations: ${activity.newRegistrations}`}
                  ></div>
                </div>
                <div className="activity-date">
                  {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color active-users"></div>
              <span>Active Users</span>
            </div>
            <div className="legend-item">
              <div className="legend-color new-registrations"></div>
              <span>New Registrations</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Age Demographics</h3>
          <div className="demographics-chart">
            {metrics.demographics.ageGroups.map((group, index) => (
              <div key={index} className="demo-item">
                <span className="demo-label">{group.range}</span>
                <div className="demo-bar">
                  <div 
                    className="demo-fill"
                    style={{ width: `${(group.count / metrics.totalUsers) * 100}%` }}
                  ></div>
                </div>
                <span className="demo-count">{group.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Top Locations</h3>
          <div className="demographics-chart">
            {metrics.demographics.locations.map((location, index) => (
              <div key={index} className="demo-item">
                <span className="demo-label">{location.city}</span>
                <div className="demo-bar">
                  <div 
                    className="demo-fill location"
                    style={{ width: `${(location.count / metrics.totalUsers) * 100}%` }}
                  ></div>
                </div>
                <span className="demo-count">{location.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsTab;
