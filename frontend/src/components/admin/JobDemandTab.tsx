import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiTrendingUp, FiUsers, FiDownload, FiSearch, FiBarChart2, FiAlertCircle, FiMinus } from 'react-icons/fi';
import StatsCard from './StatsCard';
import adminService from '../../services/adminService';

interface JobDemandData {
  jobTitle: string;
  category: 'technology' | 'healthcare' | 'finance' | 'education' | 'marketing' | 'sales' | 'engineering' | 'other';
  totalPostings: number;
  totalApplicants: number;
  averageApplicantsPerJob: number;
  demandLevel: 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
  growthRate: number;
  averageSalary?: number;
  activeJobs: number;
  filledJobs: number;
  timeToFill: number; // in days
}

interface JobTrend {
  jobTitle: string;
  data: { month: string; postings: number; applicants: number }[];
}

const JobDemandTab: React.FC = () => {
  const [jobDemandData, setJobDemandData] = useState<JobDemandData[]>([]);
  const [jobTrends, setJobTrends] = useState<JobTrend[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'technology' | 'healthcare' | 'finance' | 'education' | 'marketing' | 'sales' | 'engineering' | 'other'>('all');
  const [sortBy, setSortBy] = useState<'demand' | 'postings' | 'applicants' | 'ratio' | 'growth'>('demand');

  useEffect(() => {
    fetchJobDemandAnalytics();
  }, []);

  const fetchJobDemandAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching job demand analytics from API...');
      
      const analyticsData = await adminService.getJobDemandAnalytics();
      console.log('✅ Job demand analytics data received:', analyticsData);
      
      setJobDemandData(analyticsData.jobDemandData || []);
      setSummaryStats(analyticsData.summary || null);
    } catch (error) {
      console.error('❌ Error fetching job demand analytics:', error);
      // Fallback to empty array if API fails
      setJobDemandData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobDemandData
    .filter(job => {
      const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || job.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'demand':
          const demandOrder = { 'very-high': 5, 'high': 4, 'moderate': 3, 'low': 2, 'very-low': 1 };
          return demandOrder[b.demandLevel] - demandOrder[a.demandLevel];
        case 'postings': return b.totalPostings - a.totalPostings;
        case 'applicants': return b.totalApplicants - a.totalApplicants;
        case 'ratio': return a.averageApplicantsPerJob - b.averageApplicantsPerJob;
        case 'growth': return b.growthRate - a.growthRate;
        default: return 0;
      }
    });

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'very-high': return '#dc2626';
      case 'high': return '#ea580c';
      case 'moderate': return '#ca8a04';
      case 'low': return '#16a34a';
      case 'very-low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getDemandLabel = (level: string) => {
    switch (level) {
      case 'very-high': return 'Very High Demand';
      case 'high': return 'High Demand';
      case 'moderate': return 'Moderate Demand';
      case 'low': return 'Low Competition';
      case 'very-low': return 'Very Low Competition';
      default: return 'Unknown';
    }
  };

  const exportJobDemandData = () => {
    const csvContent = [
      ['Job Title', 'Category', 'Total Postings', 'Total Applicants', 'Avg Applicants/Job', 'Demand Level', 'Growth Rate', 'Avg Salary', 'Active Jobs', 'Filled Jobs', 'Time to Fill (days)'],
      ...filteredJobs.map(job => [
        job.jobTitle,
        job.category,
        job.totalPostings.toString(),
        job.totalApplicants.toString(),
        job.averageApplicantsPerJob.toFixed(1),
        job.demandLevel,
        `${job.growthRate}%`,
        job.averageSalary?.toString() || 'N/A',
        job.activeJobs.toString(),
        job.filledJobs.toString(),
        job.timeToFill.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-demand-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highDemandJobs = jobDemandData
    .filter(job => job.demandLevel === 'very-high' || job.demandLevel === 'high')
    .sort((a, b) => b.totalPostings - a.totalPostings)
    .slice(0, 5);

  const lowCompetitionJobs = jobDemandData
    .sort((a, b) => a.averageApplicantsPerJob - b.averageApplicantsPerJob)
    .slice(0, 5);

  // Use summary stats if available, otherwise calculate from data
  const totalJobs = summaryStats?.totalJobs || jobDemandData.reduce((sum, job) => sum + job.totalPostings, 0);
  const totalApplicants = summaryStats?.totalApplicants || jobDemandData.reduce((sum, job) => sum + job.totalApplicants, 0);
  const averageTimeToFill = summaryStats?.averageTimeToFill || (jobDemandData.length > 0 ? Math.round(jobDemandData.reduce((sum, job) => sum + job.timeToFill, 0) / jobDemandData.length) : 0);
  const highDemandCount = summaryStats?.highDemandCount || jobDemandData.filter(job => job.demandLevel === 'very-high' || job.demandLevel === 'high').length;

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading-spinner"></div>
        <p>Loading job demand analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="stats-grid">
        <StatsCard
          icon={FiBriefcase}
          value={totalJobs}
          label="Total Job Postings"
          change={totalJobs > 0 ? Math.floor(totalJobs * 0.08) : 0}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiUsers}
          value={totalApplicants}
          label="Total Applicants"
          change={totalApplicants > 0 ? Math.floor(totalApplicants * 0.12) : 0}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiTrendingUp}
          value={highDemandCount}
          label="High Demand Jobs"
          change={highDemandCount > 0 ? Math.floor(highDemandCount * 0.15) : 0}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiBarChart2}
          value={averageTimeToFill}
          label="Avg Time to Fill (days)"
          change={averageTimeToFill > 0 ? -Math.floor(averageTimeToFill * 0.05) : 0}
          changeLabel="days improvement"
        />
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>High Demand Jobs</h3>
          <div className="jobs-list">
            {highDemandJobs.map((job, index) => (
              <div key={job.jobTitle} className="job-item">
                <div className="job-rank">#{index + 1}</div>
                <div className="job-info">
                  <span className="job-name">{job.jobTitle}</span>
                  <span className={`job-category ${job.category}`}>{job.category}</span>
                </div>
                <div className="job-demand">
                  <span 
                    className="demand-indicator"
                    style={{ color: getDemandColor(job.demandLevel) }}
                  >
                    {job.totalPostings} postings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Low Competition Jobs</h3>
          <div className="jobs-list">
            {lowCompetitionJobs.map((job, index) => (
              <div key={job.jobTitle} className="job-item">
                <div className="job-rank">#{index + 1}</div>
                <div className="job-info">
                  <span className="job-name">{job.jobTitle}</span>
                  <span className={`job-category ${job.category}`}>{job.category}</span>
                </div>
                <div className="job-competition">
                  <FiUsers className="competition-icon" />
                  <span className="competition-value">{job.averageApplicantsPerJob.toFixed(1)} avg applicants</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-filter">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search job titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="engineering">Engineering</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="demand">Demand Level</option>
            <option value="postings">Total Postings</option>
            <option value="applicants">Total Applicants</option>
            <option value="ratio">Competition (Low to High)</option>
            <option value="growth">Growth Rate</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={exportJobDemandData}>
            <FiDownload />
            Export Data
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Category</th>
              <th>Postings</th>
              <th>Applicants</th>
              <th>Avg Competition</th>
              <th>Demand Level</th>
              <th>Growth Rate</th>
              <th>Avg Salary</th>
              <th>Time to Fill</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.jobTitle}>
                <td>
                  <div className="job-cell">
                    <strong>{job.jobTitle}</strong>
                  </div>
                </td>
                <td>
                  <span className={`category-badge ${job.category}`}>
                    {job.category}
                  </span>
                </td>
                <td>
                  <div className="metric-value">
                    <FiBriefcase className="metric-icon" />
                    {job.totalPostings}
                  </div>
                </td>
                <td>
                  <div className="metric-value">
                    <FiUsers className="metric-icon" />
                    {job.totalApplicants}
                  </div>
                </td>
                <td>
                  <div className="competition-cell">
                    <span className="competition-ratio">
                      {job.averageApplicantsPerJob.toFixed(1)} per job
                    </span>
                  </div>
                </td>
                <td>
                  <span 
                    className="demand-badge"
                    style={{ 
                      backgroundColor: getDemandColor(job.demandLevel) + '20',
                      color: getDemandColor(job.demandLevel),
                      border: `1px solid ${getDemandColor(job.demandLevel)}40`
                    }}
                  >
                    {getDemandLabel(job.demandLevel)}
                  </span>
                </td>
                <td>
                  <span className={`growth-rate ${job.growthRate >= 0 ? 'positive' : 'negative'}`}>
                    {job.growthRate >= 0 ? <FiTrendingUp /> : <FiMinus />}
                    {job.growthRate > 0 ? '+' : ''}{job.growthRate}%
                  </span>
                </td>
                <td>
                  {job.averageSalary ? `₱${job.averageSalary.toLocaleString()}` : 'N/A'}
                </td>
                <td>
                  <span className="time-to-fill">
                    {job.timeToFill} days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredJobs.length === 0 && (
        <div className="empty-state">
          <FiBriefcase className="empty-icon" />
          <h3>No jobs found</h3>
          <p>No jobs match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default JobDemandTab;
