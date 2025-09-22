import React, { useState, useEffect } from "react";
import "./AnalyticsTab.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";

// Mock data - replace with real API calls
const fetchAnalyticsData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        applicants: {
          active: 1250,
          inactive: 320,
          growth: 12.5
        },
        employers: {
          verified: 180,
          pending: 45,
          growth: 8.3
        },
        jobs: {
          active: 230,
          closed: 145,
          growth: 15.2
        },
        aiMatching: 78, // percentage
        totalUsers: 1795,
        monthlyGrowth: 11.8,
        skillsDemand: [
          { name: "Jan", "IT/Software": 120, "Healthcare": 80, "Engineering": 95, "BPO": 110 },
          { name: "Feb", "IT/Software": 150, "Healthcare": 85, "Engineering": 100, "BPO": 125 },
          { name: "Mar", "IT/Software": 180, "Healthcare": 90, "Engineering": 110, "BPO": 140 },
          { name: "Apr", "IT/Software": 210, "Healthcare": 95, "Engineering": 120, "BPO": 155 },
          { name: "May", "IT/Software": 240, "Healthcare": 100, "Engineering": 130, "BPO": 170 },
          { name: "Jun", "IT/Software": 265, "Healthcare": 105, "Engineering": 135, "BPO": 185 }
        ],
        userActivity: [
          { name: "Mon", logins: 450, applications: 120, matches: 85 },
          { name: "Tue", logins: 520, applications: 140, matches: 95 },
          { name: "Wed", logins: 480, applications: 135, matches: 90 },
          { name: "Thu", logins: 610, applications: 160, matches: 110 },
          { name: "Fri", logins: 580, applications: 155, matches: 105 },
          { name: "Sat", logins: 320, applications: 80, matches: 55 },
          { name: "Sun", logins: 280, applications: 65, matches: 45 }
        ]
      });
    }, 500);
  });
};

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe"];
const GRADIENT_COLORS = {
  primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  warning: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  info: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
};

const AnalyticsTab: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData().then((res: any) => setData(res));
  }, []);

  if (!data) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2 className="analytics-title">System Analytics Dashboard</h2>
        <div className="analytics-summary">
          <div className="summary-item">
            <span className="summary-label">Total Users</span>
            <span className="summary-value">{data.totalUsers.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Monthly Growth</span>
            <span className="summary-value growth-positive">+{data.monthlyGrowth}%</span>
          </div>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        {/* Applicants */}
        <div className="metric-card gradient-primary">
          <div className="metric-header">
            <h3>Applicants</h3>
            <div className="growth-indicator positive">+{data.applicants.growth}%</div>
          </div>
          <div className="metric-content">
            <div className="metric-main-number">{data.applicants.active.toLocaleString()}</div>
            <div className="metric-subtitle">Active Users</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: data.applicants.active },
                      { name: 'Inactive', value: data.applicants.inactive }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#ffffff" fillOpacity={0.9} />
                    <Cell fill="#ffffff" fillOpacity={0.3} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="metric-stats">
              <div className="stat-item">
                <span>Active:</span> <strong>{data.applicants.active}</strong>
              </div>
              <div className="stat-item">
                <span>Inactive:</span> <strong>{data.applicants.inactive}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Employers */}
        <div className="metric-card gradient-success">
          <div className="metric-header">
            <h3>Employers</h3>
            <div className="growth-indicator positive">+{data.employers.growth}%</div>
          </div>
          <div className="metric-content">
            <div className="metric-main-number">{data.employers.verified}</div>
            <div className="metric-subtitle">Verified Companies</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Verified', value: data.employers.verified },
                      { name: 'Pending', value: data.employers.pending }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#ffffff" fillOpacity={0.9} />
                    <Cell fill="#ffffff" fillOpacity={0.4} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="metric-stats">
              <div className="stat-item">
                <span>Verified:</span> <strong>{data.employers.verified}</strong>
              </div>
              <div className="stat-item">
                <span>Pending:</span> <strong>{data.employers.pending}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Job Postings */}
        <div className="metric-card gradient-warning">
          <div className="metric-header">
            <h3>Job Postings</h3>
            <div className="growth-indicator positive">+{data.jobs.growth}%</div>
          </div>
          <div className="metric-content">
            <div className="metric-main-number">{data.jobs.active}</div>
            <div className="metric-subtitle">Active Jobs</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={[
                  { name: 'Active', value: data.jobs.active, fill: '#10b981' },
                  { name: 'Closed', value: data.jobs.closed, fill: '#6b7280' }
                ]}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    onMouseEnter={(data, index) => {
                      // Add hover effect
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: '#374151'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value, name) => [value, name === 'value' ? 'Jobs' : name]}
                    labelFormatter={(label) => `${label} Jobs`}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="metric-stats">
              <div className="stat-item">
                <span>Active:</span> <strong>{data.jobs.active}</strong>
              </div>
              <div className="stat-item">
                <span>Closed:</span> <strong>{data.jobs.closed}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* AI Matching Success Rate */}
        <div className="metric-card gradient-info">
          <div className="metric-header">
            <h3>AI Matching</h3>
            <div className="growth-indicator positive">Optimized</div>
          </div>
          <div className="metric-content">
            <div className="metric-main-number">{data.aiMatching}%</div>
            <div className="metric-subtitle">Success Rate</div>
            <div className="gauge-container">
              <div className="circular-progress">
                <svg className="progress-ring" width="100" height="100">
                  <circle
                    className="progress-ring-circle-bg"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="8"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="#ffffff"
                    strokeWidth="8"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.aiMatching / 100)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="progress-text">{data.aiMatching}%</div>
              </div>
            </div>
            <div className="metric-note">Based on successful job matches</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Skills Demand Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Skills Demand Trends</h3>
            <div className="chart-subtitle">Monthly job posting trends by industry</div>
          </div>
          <div className="chart-container" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.skillsDemand}>
                <defs>
                  <linearGradient id="colorIT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorHealthcare" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4facfe" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorEngineering" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorBPO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5576c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f5576c" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="IT/Software" stackId="1" stroke="#667eea" fill="url(#colorIT)" strokeWidth={2} />
                <Area type="monotone" dataKey="BPO" stackId="1" stroke="#f5576c" fill="url(#colorBPO)" strokeWidth={2} />
                <Area type="monotone" dataKey="Healthcare" stackId="1" stroke="#4facfe" fill="url(#colorHealthcare)" strokeWidth={2} />
                <Area type="monotone" dataKey="Engineering" stackId="1" stroke="#f093fb" fill="url(#colorEngineering)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Weekly User Activity</h3>
            <div className="chart-subtitle">Daily user engagement metrics</div>
          </div>
          <div className="chart-container" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#667eea" strokeWidth={3} dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="applications" stroke="#4facfe" strokeWidth={3} dot={{ fill: '#4facfe', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="matches" stroke="#f093fb" strokeWidth={3} dot={{ fill: '#f093fb', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;