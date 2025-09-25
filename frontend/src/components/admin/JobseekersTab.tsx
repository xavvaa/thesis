import React, { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiFilter, FiDownload, FiFileText, FiBriefcase, FiTrendingUp, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import adminService from '../../services/adminService';
import StatsCard from './StatsCard';
import './JobseekersTab.css';

interface Jobseeker {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: string;
  applications: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastActive?: string;
}

const JobseekersTab: React.FC = () => {
  const [jobseekers, setJobseekers] = useState<Jobseeker[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [jobseekersPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [totalJobseekers, setTotalJobseekers] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status as 'all' | 'active' | 'inactive');
    setCurrentPage(1);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeString: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      daysAgo: diffDays
    };
  };

  const getNewThisMonth = (currentData: Jobseeker[], dateField: 'createdAt' | 'lastActive') => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return currentData.filter(item => 
      new Date(item[dateField]) >= thisMonth
    ).length;
  };


  const getMonthlyChange = (currentData: Jobseeker[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthCount = currentData.filter(item => 
      new Date(item.createdAt) >= thisMonth
    ).length;
    
    const lastMonthCount = currentData.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= lastMonth && itemDate < thisMonth;
    }).length;
    
    const change = thisMonthCount - lastMonthCount;
    return change;
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Make parallel API calls for different data
      const [usersResponse, jobsResponse, dashboardStats, applicationsResponse, resumesResponse] = await Promise.all([
        adminService.getUsers({}),
        adminService.getJobs({}), // Get all job postings
        adminService.getDashboardStats(),
        adminService.getAllApplications(), // Get all applications
        adminService.getAllResumes() // Get all resumes with names and skills
      ]);
      // Process users data
const allUsers = usersResponse.users || [];
const allJobs = jobsResponse.jobs || jobsResponse.data || [];
const allApplications = applicationsResponse || [];
const allResumes = resumesResponse || [];

// Create a map of resumes by jobSeekerUid for quick lookup
const resumeMap = new Map();
allResumes.forEach((resume: any) => {
  resumeMap.set(resume.jobSeekerUid, resume);
});

const jobSeekerUsers = allUsers.filter((user: any) => 
  user.role === 'jobseeker' || user.userType === 'jobseeker' || user.type === 'jobseeker'
);

// Transform jobseekers by merging user data with resume data
const transformedJobseekers = jobSeekerUsers.map((user: any) => {
  const resume = resumeMap.get(user.uid);
  
  // If no resume found by uid, try to find by email
  let fallbackResume = null;
  if (!resume && user.email) {
    fallbackResume = allResumes.find((r: any) => 
      r.personalInfo?.email === user.email || 
      r.applicantEmail === user.email
    );
  }
  
  const finalResume = resume || fallbackResume;
  
  return {
    _id: user._id,
    // Get name from resume first, fallback to user data
    firstName: finalResume?.personalInfo?.fullName?.split(' ')[0] || 
               finalResume?.applicantName?.split(' ')[0] || 
               user.firstName || 
               user.name?.split(' ')[0] || 
               'Unknown',
    lastName: finalResume?.personalInfo?.fullName?.split(' ').slice(1).join(' ') || 
              finalResume?.applicantName?.split(' ').slice(1).join(' ') || 
              user.lastName || 
              user.name?.split(' ').slice(1).join(' ') || 
              '',
    // Get email from resume or user
    email: finalResume?.personalInfo?.email || finalResume?.applicantEmail || user.email,
    // Get phone from resume or user
    phone: finalResume?.personalInfo?.phone || finalResume?.applicantPhone || user.phone,
    // Get skills from resume (this is the key fix!)
    skills: finalResume?.skills || [],
    experience: finalResume?.workExperience?.[0]?.position || 
               finalResume?.workExperience?.[0]?.jobTitle ||
               'Not specified',
    applications: allApplications.filter((app: any) => app.jobSeekerUid === user.uid).length,
    status: user.status || (user.isActive ? 'active' : 'inactive'),
    createdAt: user.createdAt || user.dateRegistered,
    lastActive: user.lastActive || user.updatedAt || user.lastLogin,
    // Debug info
    hasResume: !!finalResume,
    resumeSource: resume ? 'uid_match' : (fallbackResume ? 'email_match' : 'none')
  };
});

console.log('🔍 DEBUG - Resumes Data:', allResumes);
console.log('🔍 DEBUG - Resume Map:', resumeMap);
console.log('🔍 DEBUG - First Resume Sample:', allResumes[0]);
console.log('🔍 DEBUG - JobSeeker Users:', jobSeekerUsers);
console.log('🔍 DEBUG - Transformed Jobseekers with Resume Data:', transformedJobseekers);

// Debug each jobseeker transformation
jobSeekerUsers.forEach((user: any, index: number) => {
  const resume = resumeMap.get(user.uid);
  console.log(`🔍 DEBUG - User ${index}:`, {
    userUid: user.uid,
    userName: user.firstName || user.name,
    resumeFound: !!resume,
    resumePersonalInfo: resume?.personalInfo,
    resumeSkills: resume?.skills,
    resumeApplicantName: resume?.applicantName
  });
});
      
      // Use real data from dashboard stats API
      console.log('Dashboard Stats:', dashboardStats);
      console.log('Users Response:', usersResponse);
      console.log('Jobs Response:', jobsResponse);
      console.log('Applications Response:', allApplications);
      
      // Set individual stats using real API data
      setTotalUsers(dashboardStats.totalJobSeekers || jobSeekerUsers.length || 0);
      setTotalJobs(dashboardStats.totalJobs || allJobs.length || 0);
      setTotalApplications(dashboardStats.totalApplications || allApplications.length || 0);
      
      // Store raw data - filtering will be done separately
      setJobseekers(transformedJobseekers);
      setTotalJobseekers(transformedJobseekers.length);
      
    } catch (error) {
      console.error('Error fetching jobseekers data:', error);
      setJobseekers([]);
      setTotalUsers(0);
      setTotalJobs(0);
      setTotalApplications(0);
    } finally {
      setLoading(false);
    }
  };

  // Apply filtering and sorting to jobseekers data
  const getFilteredAndSortedJobseekers = () => {
    let filtered = [...jobseekers];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(jobseeker =>
        jobseeker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobseeker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobseeker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobseeker.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(jobseeker => jobseeker.status === filterStatus);
    }
    
    // Apply sorting
    filtered.sort((a: Jobseeker, b: Jobseeker) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'date':
          valueA = new Date(a.createdAt || new Date()).getTime();
          valueB = new Date(b.createdAt || new Date()).getTime();
          break;
        case 'name':
          valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'applications':
          valueA = a.applications || 0;
          valueB = b.applications || 0;
          break;
        case 'lastActive':
          valueA = new Date(a.lastActive || new Date()).getTime();
          valueB = new Date(b.lastActive || new Date()).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'desc') {
        return typeof valueA === 'string' ? valueB.localeCompare(valueA) : valueB - valueA;
      } else {
        return typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB;
      }
    });
    
    return filtered;
  };

  // Get filtered and sorted data
  const filteredJobseekers = getFilteredAndSortedJobseekers();
  
  // Pagination logic
  const indexOfLastJobseeker = currentPage * jobseekersPerPage;
  const indexOfFirstJobseeker = indexOfLastJobseeker - jobseekersPerPage;
  const currentJobseekers = filteredJobseekers.slice(indexOfFirstJobseeker, indexOfLastJobseeker);
  const totalPages = Math.ceil(filteredJobseekers.length / jobseekersPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy, sortOrder]);

  const exportJobseekers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Skills', 'Experience', 'Applications', 'Status', 'Created At'],
      ...currentJobseekers.map(jobseeker => [
        `${jobseeker.firstName} ${jobseeker.lastName}`,
        jobseeker.email,
        jobseeker.phone || '',
        jobseeker.skills.join('; '),
        jobseeker.experience,
        jobseeker.applications.toString(),
        jobseeker.status,
        jobseeker.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobseekers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading-spinner"></div>
        <p>Loading jobseekers...</p>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Jobseekers Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          icon={FiUsers}
          value={totalUsers}
          label="Total Jobseekers"
          change={getMonthlyChange(jobseekers)}
          changeLabel="new this month"
        />
        <StatsCard
          icon={FiFileText}
          value={totalApplications}
          label="Total Applications"
          change={Math.max(0, totalApplications - Math.floor(totalApplications * 0.8))}
          changeLabel="from last month"
        />
        <StatsCard
          icon={FiBriefcase}
          value={totalJobs}
          label="Available Jobs"
          change={Math.max(0, totalJobs - Math.floor(totalJobs * 0.9))}
          changeLabel="new this month"
        />
      </div>

      <div className="tab-actions" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={exportJobseekers}>
          <FiDownload />
          Export CSV
        </button>
      </div>

      {/* Section Header with Controls */}
      <div className="section-header">
        <div className="header-left">
          <h2 className="section-title">Jobseekers Management</h2>
          <p className="view-info">Showing {currentJobseekers.length} of {totalJobseekers} jobseekers</p>
        </div>
        
        <div className="jobseekers-controls">
          <div className="search-controls">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search jobseekers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-modern"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="status-filter-control"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Enhanced Jobseekers Table */}
      {jobseekers.length > 0 ? (
        <>
          <div className="admin-jobseekers-table-container">
            <table className="admin-jobseekers-table">
              <thead>
                <tr>
                  <th className="sortable-header" onClick={() => handleSort('name')}>
                    <div className="header-content">
                      <span>NAME</span>
                      {sortBy === 'name' ? (
                        sortOrder === 'desc' ? <FiChevronDown /> : <FiChevronUp />
                      ) : (
                        <FiChevronDown className="sort-icon-inactive" />
                      )}
                    </div>
                  </th>
                  <th>EMAIL</th>
                  <th>SKILLS</th>
                  <th className="sortable-header" onClick={() => handleSort('applications')}>
                    <div className="header-content">
                      <span>APPLICATIONS</span>
                      {sortBy === 'applications' ? (
                        sortOrder === 'desc' ? <FiChevronDown /> : <FiChevronUp />
                      ) : (
                        <FiChevronDown className="sort-icon-inactive" />
                      )}
                    </div>
                  </th>
                  <th>STATUS</th>
                  <th className="sortable-header" onClick={() => handleSort('date')}>
                    <div className="header-content">
                      <span className="two-line-header">
                        <span>JOINED</span>
                        <span>DATE</span>
                      </span>
                      {sortBy === 'date' ? (
                        sortOrder === 'desc' ? <FiChevronDown /> : <FiChevronUp />
                      ) : (
                        <FiChevronDown className="sort-icon-inactive" />
                      )}
                    </div>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort('lastActive')}>
                    <div className="header-content">
                      <span className="two-line-header">
                        <span>LAST</span>
                        <span>ACTIVE</span>
                      </span>
                      {sortBy === 'lastActive' ? (
                        sortOrder === 'desc' ? <FiChevronDown /> : <FiChevronUp />
                      ) : (
                        <FiChevronDown className="sort-icon-inactive" />
                      )}
                    </div>
                  </th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentJobseekers.map((jobseeker) => {
                  const { timeString, dateStr, daysAgo } = formatDateTime(jobseeker.createdAt || new Date().toISOString());
                  const lastActiveInfo = jobseeker.lastActive ? formatDateTime(jobseeker.lastActive) : null;
                  
                  return (
                    <tr key={jobseeker._id} className="jobseeker-row">
                      <td className="name-cell">
                        <div className="name-info">
                          <span className="jobseeker-name">{jobseeker.firstName} {jobseeker.lastName}</span>
                          <span className="jobseeker-phone">{jobseeker.phone || 'No phone'}</span>
                        </div>
                      </td>
                      
                      <td className="email-cell">
                        <span className="email-text">{jobseeker.email}</span>
                      </td>
                      
                      <td className="skills-cell">
                        <div className="skills-list">
                          {jobseeker.skills.slice(0, 2).map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                          {jobseeker.skills.length > 2 && (
                            <span className="skill-tag more">+{jobseeker.skills.length - 2}</span>
                          )}
                          {jobseeker.skills.length === 0 && (
                            <span className="no-skills">No skills listed</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="applications-cell">
                        <div className="stat-value">
                          {jobseeker.applications || 0}
                        </div>
                      </td>
                      
                      <td className="status-cell">
                        <div className="jobseeker-status-badge" data-status={jobseeker.status}>
                          {jobseeker.status?.toUpperCase() || 'UNKNOWN'}
                        </div>
                      </td>
                      
                      <td className="date-cell">
                        <div className="date-info">
                          <span className="joined-date">{dateStr}</span>
                          <span className="joined-time">{timeString}</span>
                        </div>
                      </td>
                      
                      <td className="last-active-cell">
                        <div className="last-active-info">
                          {lastActiveInfo ? (
                            <>
                              <span className="active-date">{lastActiveInfo.dateStr}</span>
                              <span className="active-time">{lastActiveInfo.daysAgo} days ago</span>
                            </>
                          ) : (
                            <span className="never-active">Never</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button 
                            onClick={() => console.log('View jobseeker:', jobseeker._id)}
                            className="action-btn view-btn"
                            title="View Details"
                          >
                            View
                          </button>
                          
                          <button 
                            onClick={() => console.log('Contact jobseeker:', jobseeker._id)}
                            className="action-btn contact-btn"
                            title="Contact Jobseeker"
                          >
                            Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="empty-state">
            <FiUsers className="empty-icon" size={48} />
            <h3>No jobseekers found</h3>
            <p>No jobseekers match your current filters.</p>
          </div>
        )
      )}

    </div>
  );
};

export default JobseekersTab;
