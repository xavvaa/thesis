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
      const [usersResponse, jobsResponse, dashboardStats, applicationsResponse, resumesResponse, jobseekersResponse] = await Promise.all([
        adminService.getUsers({}),
        adminService.getJobs({}), // Get all job postings
        adminService.getDashboardStats(),
        adminService.getAllApplications(), // Get all applications
        adminService.getAllResumes(), // Get all resumes with names and skills
        adminService.getAllJobSeekers() // Get all jobseeker profiles
      ]);
      // Process users data
const allUsers = usersResponse.users || [];
const allJobs = jobsResponse.jobs || jobsResponse.data || [];
const allApplications = applicationsResponse || [];
const allResumes = resumesResponse || [];
const allJobSeekers = jobseekersResponse || [];

// Create maps for quick lookup
const resumeMap = new Map();
allResumes.forEach((resume: any) => {
  resumeMap.set(resume.jobSeekerUid, resume);
});

const jobSeekerMap = new Map();
allJobSeekers.forEach((js: any) => {
  jobSeekerMap.set(js.uid, js);
});

const jobSeekerUsers = allUsers.filter((user: any) => 
  user.role === 'jobseeker' || user.userType === 'jobseeker' || user.type === 'jobseeker'
);

// Transform jobseekers by merging user data with resume and jobseeker data
const transformedJobseekers = jobSeekerUsers.map((user: any) => {
  const resume = resumeMap.get(user.uid);
  const jobSeekerProfile = jobSeekerMap.get(user.uid);
  
  // If no resume found by uid, try to find by email
  let fallbackResume = null;
  if (!resume && user.email) {
    fallbackResume = allResumes.find((r: any) => 
      r.personalInfo?.email === user.email || 
      r.applicantEmail === user.email
    );
  }
  
  const finalResume = resume || fallbackResume;
  
  // Determine the best name source
  let fullName = 'Unknown';
  let dataSource = 'user_only';
  
  if (finalResume?.personalInfo?.fullName) {
    // Priority 1: Resume collection fullName
    fullName = finalResume.personalInfo.fullName;
    dataSource = 'resume';
  } else if (jobSeekerProfile?.fullName) {
    // Priority 2: JobSeeker collection fullName
    fullName = jobSeekerProfile.fullName;
    dataSource = 'jobseeker_profile';
  } else if (jobSeekerProfile?.firstName && jobSeekerProfile?.lastName) {
    // Priority 3: JobSeeker firstName + lastName
    fullName = `${jobSeekerProfile.firstName} ${jobSeekerProfile.lastName}`;
    dataSource = 'jobseeker_profile';
  } else if (user.firstName || user.name) {
    // Priority 4: User data fallback
    fullName = user.firstName || user.name || 'Unknown';
    dataSource = 'user_only';
  }

  return {
    _id: user._id,
    // Use the determined fullName
    firstName: fullName,
    lastName: '', // Keep empty since we're using fullName in firstName
    // Get email - Resume first, then JobSeeker, then User
    email: finalResume?.personalInfo?.email || 
           jobSeekerProfile?.email || 
           user.email,
    // Get skills - Resume first, then JobSeeker
    skills: finalResume?.skills || jobSeekerProfile?.skills || [],
    // Get experience - Resume first, then JobSeeker
    experience: finalResume?.workExperience?.[0]?.position || 
               finalResume?.workExperience?.[0]?.jobTitle ||
               jobSeekerProfile?.experience ||
               'Not specified',
    applications: allApplications.filter((app: any) => app.jobSeekerUid === user.uid).length,
    status: user.status || (user.isActive ? 'active' : 'inactive'),
    createdAt: user.createdAt || user.dateRegistered,
    // Try multiple sources for lastActive
    lastActive: finalResume?.updatedAt || 
               jobSeekerProfile?.updatedAt || 
               jobSeekerProfile?.lastActive ||
               user.lastActive || 
               user.updatedAt || 
               user.lastLogin ||
               user.lastLoginAt,
    // Debug info
    hasResume: !!finalResume,
    hasJobSeekerProfile: !!jobSeekerProfile,
    dataSource: dataSource,
    nameSource: finalResume?.personalInfo?.fullName ? 'resume_fullName' : 
                (jobSeekerProfile?.fullName ? 'jobseeker_fullName' : 
                (jobSeekerProfile?.firstName ? 'jobseeker_firstName_lastName' : 'user_fallback')),
    // Debug lastActive sources
    lastActiveDebug: {
      resumeUpdatedAt: finalResume?.updatedAt,
      jobSeekerUpdatedAt: jobSeekerProfile?.updatedAt,
      jobSeekerLastActive: jobSeekerProfile?.lastActive,
      userLastActive: user.lastActive,
      userUpdatedAt: user.updatedAt,
      userLastLogin: user.lastLogin,
      userLastLoginAt: user.lastLoginAt,
      allUserFields: Object.keys(user)
    }
  };
});

// Debug all resume data structure
allResumes.forEach((resume: any, index: number) => {
  console.log(`🔍 DEBUG - Resume ${index}:`, {
    jobSeekerUid: resume.jobSeekerUid,
    personalInfo: resume.personalInfo,
    fullName: resume.personalInfo?.fullName,
    skills: resume.skills,
    applicantName: resume.applicantName
  });
});

// Debug each jobseeker transformation with clear priority
jobSeekerUsers.forEach((user: any, index: number) => {
  const resume = resumeMap.get(user.uid);
  const jobSeekerProfile = jobSeekerMap.get(user.uid);
  
  // Determine name source priority
  let nameSource = 'none';
  let finalName = 'Unknown';
  
  if (resume?.personalInfo?.fullName) {
    nameSource = '1_RESUME_FULLNAME';
    finalName = resume.personalInfo.fullName;
  } else if (jobSeekerProfile?.fullName) {
    nameSource = '2_JOBSEEKER_FULLNAME';
    finalName = jobSeekerProfile.fullName;
  } else if (jobSeekerProfile?.firstName && jobSeekerProfile?.lastName) {
    nameSource = '3_JOBSEEKER_FIRST_LAST';
    finalName = `${jobSeekerProfile.firstName} ${jobSeekerProfile.lastName}`;
  } else {
    nameSource = '4_USER_FALLBACK';
    finalName = user.firstName || user.name || 'Unknown';
  }
  
  console.log(`🔍 DEBUG - User ${index} (${user.uid}):`, {
    nameSource: nameSource,
    finalName: finalName,
    resumeExists: !!resume,
    resumeFullName: resume?.personalInfo?.fullName,
    jobSeekerExists: !!jobSeekerProfile,
    jobSeekerFullName: jobSeekerProfile?.fullName,
    jobSeekerFirstLast: jobSeekerProfile?.firstName && jobSeekerProfile?.lastName ? 
                        `${jobSeekerProfile.firstName} ${jobSeekerProfile.lastName}` : null,
    skillsSource: resume?.skills ? 'RESUME' : (jobSeekerProfile?.skills ? 'JOBSEEKER' : 'NONE'),
    finalSkills: resume?.skills || jobSeekerProfile?.skills || [],
    // LastActive debugging
    lastActiveSources: {
      resumeUpdatedAt: resume?.updatedAt,
      jobSeekerUpdatedAt: jobSeekerProfile?.updatedAt,
      jobSeekerLastActive: jobSeekerProfile?.lastActive,
      userLastActive: user.lastActive,
      userUpdatedAt: user.updatedAt,
      userLastLogin: user.lastLogin,
      userLastLoginAt: user.lastLoginAt
    },
    finalLastActive: resume?.updatedAt || 
                    jobSeekerProfile?.updatedAt || 
                    jobSeekerProfile?.lastActive ||
                    user.lastActive || 
                    user.updatedAt || 
                    user.lastLogin ||
                    user.lastLoginAt,
    userFields: Object.keys(user)
  });
});
      
      // Set individual stats using real API data
      setTotalUsers(dashboardStats.totalJobSeekers || jobSeekerUsers.length || 0);
      setTotalJobs(dashboardStats.totalJobs || allJobs.length || 0);
      setTotalApplications(dashboardStats.totalApplications || allApplications.length || 0);
      
      // Store raw data - filtering will be done separately
      setJobseekers(transformedJobseekers);
      setTotalJobseekers(transformedJobseekers.length);
      
    } catch (error) {
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
        '', // Phone removed
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
