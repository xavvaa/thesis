import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUsers, FiSearch, FiFilter, FiFileText, FiBriefcase, FiTrendingUp, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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
  applications: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastActive?: string;
  resume?: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      age?: string;
      birthday?: string;
    };
  };
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
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: () => void;
    actionText: string;
    icon: string;
  }>({
    show: false,
    title: '',
    message: '',
    action: () => {},
    actionText: '',
    icon: ''
  });
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    icon: string;
  }>({
    show: false,
    title: '',
    message: '',
    icon: ''
  });
  const [viewModal, setViewModal] = useState<{
    show: boolean;
    jobseeker: Jobseeker | null;
    loading: boolean;
  }>({
    show: false,
    jobseeker: null,
    loading: false
  });
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

  // Admin action handlers
  const handleRemoveJobseeker = (jobseekerId: string) => {
    setConfirmModal({
      show: true,
      title: 'Remove Jobseeker',
      message: `This action will permanently remove the jobseeker from the system. This is typically done when:

• The account has been inactive for an extended period and has not responded to reactivation requests.
• The account shows clear evidence of fraudulent, misleading, or suspicious activity.
• The account repeatedly violates platform policies despite prior warnings.
• The account was identified as a duplicate and merged or removed for consistency.

Once removed, the jobseeker account cannot be recovered and all associated data will be lost. The user will be notified of this action.`,
      action: async () => {
        try {
          await adminService.updateUser(jobseekerId, { status: 'removed' });
          await fetchAllData();
          setConfirmModal(prev => ({ ...prev, show: false }));
          
          // Show success message
          setSuccessModal({
            show: true,
            title: 'Jobseeker Removed Successfully',
            message: 'The jobseeker has been permanently removed from the system. The user has been notified of this action.',
            icon: '✅'
          });
        } catch (error) {
          console.error('Error removing jobseeker:', error);
          alert('❌ Failed to remove jobseeker. Please try again.');
        }
      },
      actionText: 'Remove Permanently',
      icon: '🗑️'
    });
  };

  const handleSuspendJobseeker = (jobseekerId: string) => {
    setConfirmModal({
      show: true,
      title: 'Suspend Jobseeker Account',
      message: `This action will temporarily suspend the jobseeker's account and notify them to reactivate. This is typically done when:

• The account has been inactive for an extended period and requires reactivation
• The account shows suspicious or fraudulent activity and needs review
• The account needs to be reviewed for policy compliance
• The profile requires verification of information or credentials

The jobseeker will receive an email notification with instructions to reactivate their account. They will have 30 days to reactivate before the account is permanently removed.`,
      action: async () => {
        try {
          await adminService.updateUser(jobseekerId, { status: 'inactive' });
          await fetchAllData();
          setConfirmModal(prev => ({ ...prev, show: false }));
          
          // Show success message
          setSuccessModal({
            show: true,
            title: 'Account Suspended Successfully',
            message: 'The jobseeker account has been suspended. The user will receive notification with reactivation instructions.',
            icon: '⏸️'
          });
        } catch (error) {
          console.error('Error suspending jobseeker:', error);
          alert('❌ Failed to suspend jobseeker account. Please try again.');
        }
      },
      actionText: 'Suspend Account',
      icon: '⏸️'
    });
  };

  const handleViewJobseeker = async (jobseeker: Jobseeker) => {
    setViewModal({
      show: true,
      jobseeker: jobseeker,
      loading: true
    });

    try {
      // Try different API endpoints to fetch resume data
      let enhancedJobseeker = { ...jobseeker };
      
      // Try the resume API endpoint
      try {
        const response = await fetch(`/api/resumes/user/${jobseeker._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const resumeData = await response.json();
          
          if (resumeData.success && resumeData.resume) {
            enhancedJobseeker.resume = resumeData.resume;
          } else if (resumeData.personalInfo) {
            // Maybe the structure is different
            enhancedJobseeker.resume = { personalInfo: resumeData.personalInfo };
          }
        }
      } catch (resumeError) {
        // Resume API not available, use existing data
      }
      
      setViewModal({
        show: true,
        jobseeker: enhancedJobseeker,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching jobseeker details:', error);
      setViewModal({
        show: true,
        jobseeker: jobseeker,
        loading: false
      });
    }
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
const transformedJobseekers: Jobseeker[] = [];

jobSeekerUsers.forEach((user: any) => {
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

  const jobseekerData: Jobseeker = {
    _id: user.uid || user._id,
    firstName: jobSeekerProfile?.firstName || user.firstName || 'Unknown',
    lastName: jobSeekerProfile?.lastName || user.lastName || '',
    email: finalResume?.personalInfo?.email || 
           jobSeekerProfile?.email || 
           user.email,
    phone: finalResume?.personalInfo?.phone || jobSeekerProfile?.phone || user.phone,
    skills: finalResume?.skills || jobSeekerProfile?.skills || [],
    applications: allApplications.filter((app: any) => app.jobSeekerUid === user.uid).length,
    status: user.disabled ? 'inactive' : (user.status || 'active'),
    createdAt: user.createdAt || user.dateRegistered || user.metadata?.creationTime,
    lastActive: finalResume?.updatedAt || 
               jobSeekerProfile?.updatedAt || 
               jobSeekerProfile?.lastActive ||
               user.lastActive || 
               user.updatedAt || 
               user.lastLogin ||
               user.lastLoginAt,
    resume: finalResume ? {
      personalInfo: {
        phone: finalResume.personalInfo?.phone,
        birthday: finalResume.personalInfo?.birthday,
        age: finalResume.personalInfo?.age,
        name: finalResume.personalInfo?.name,
        email: finalResume.personalInfo?.email,
        address: finalResume.personalInfo?.address
      }
    } : undefined
  };
  
  transformedJobseekers.push(jobseekerData);
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


      {/* Jobseekers Management Container */}
      <div className="jobseekers-management-container">
        {/* Header Container */}
        <div className="jobseekers-header-container">
          <div className="jobseekers-header">
          <div className="header-left">
            <h2 className="section-title">Jobseekers ({totalJobseekers} total)</h2>
            <p className="view-info">Showing {indexOfFirstJobseeker + 1}-{Math.min(indexOfLastJobseeker, filteredJobseekers.length)} of {filteredJobseekers.length} jobseekers</p>
          </div>
          
          <div className="jobseekers-controls">
            <div className="search-controls">
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search jobseekers and companies..."
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
        </div>

        {/* Table Section */}
        {jobseekers.length > 0 ? (
          <div className="admin-jobseekers-table-container">
            <div className="admin-jobseekers-table-wrapper">
              <table className="admin-jobseekers-table">
              <thead>
                <tr>
                  <th className="number-column">#</th>
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
                {currentJobseekers.map((jobseeker, index) => {
                  const { timeString, dateStr, daysAgo } = formatDateTime(jobseeker.createdAt || new Date().toISOString());
                  const lastActiveInfo = jobseeker.lastActive ? formatDateTime(jobseeker.lastActive) : null;
                  const rowNumber = (currentPage - 1) * jobseekersPerPage + index + 1;
                  
                  return (
                    <tr key={jobseeker._id} className="jobseeker-row">
                      <td className="number-cell">
                        <span className="row-number">{rowNumber}</span>
                      </td>
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
                            onClick={() => handleRemoveJobseeker(jobseeker._id)}
                            className="action-btn remove-btn"
                            title="Remove Jobseeker"
                          >
                            Remove
                          </button>
                          
                          <button 
                            onClick={() => handleSuspendJobseeker(jobseeker._id)}
                            className="action-btn pause-btn"
                            title="Suspend Jobseeker"
                            disabled={jobseeker.status === 'inactive'}
                          >
                            Suspend
                          </button>
                          
                          <button 
                            onClick={() => handleViewJobseeker(jobseeker)}
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
            </div>
          </div>
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

      {/* Custom Confirmation Modal */}
      {confirmModal.show && createPortal(
        <div className="confirm-modal-overlay" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">{confirmModal.icon}</div>
              <h2 className="confirm-modal-title">{confirmModal.title}</h2>
            </div>
            
            <div className="confirm-modal-body">
              <p className="confirm-modal-message">{confirmModal.message}</p>
            </div>
            
            <div className="confirm-modal-footer">
              <button 
                className="confirm-modal-btn secondary"
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
              >
                Cancel
              </button>
              <button 
                className="confirm-modal-btn primary"
                onClick={confirmModal.action}
              >
                {confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Success Modal */}
      {successModal.show && createPortal(
        <div className="success-modal-overlay" onClick={() => setSuccessModal(prev => ({ ...prev, show: false }))}>
          <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-header">
              <div className="success-modal-icon">{successModal.icon}</div>
              <h2 className="success-modal-title">{successModal.title}</h2>
            </div>
            
            <div className="success-modal-body">
              <p className="success-modal-message">{successModal.message}</p>
            </div>
            
            <div className="success-modal-footer">
              <button 
                className="success-modal-btn"
                onClick={() => setSuccessModal(prev => ({ ...prev, show: false }))}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* View Jobseeker Modal */}
      {viewModal.show && viewModal.jobseeker && createPortal(
        <div className="view-modal-overlay" onClick={() => setViewModal({ show: false, jobseeker: null, loading: false })}>
          <div className="view-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="view-modal-header">
              <h2 className="view-modal-title">Jobseeker Details</h2>
              <button 
                className="view-modal-close"
                onClick={() => setViewModal({ show: false, jobseeker: null, loading: false })}
              >
                ×
              </button>
            </div>
            
            <div className="view-modal-body">
              {viewModal.loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading jobseeker details...</p>
                </div>
              ) : (
                <>
                  {/* Top Row - Three Column Layout */}
                  <div className="modal-row">
                    <div className="modal-column">
                      <h3 className="section-title-compact">Personal Details</h3>
                      <div className="compact-details">
                        <div className="compact-item">
                          <strong>{viewModal.jobseeker.firstName} {viewModal.jobseeker.lastName}</strong>
                        </div>
                        <div className="compact-item">
                          <strong>Email:</strong> {viewModal.jobseeker.email}
                        </div>
                        <div className="compact-item">
                          <strong>Phone:</strong> {
                            viewModal.jobseeker.resume?.personalInfo?.phone || 
                            viewModal.jobseeker.phone || 
                            'No phone provided'
                          }
                        </div>
                        {viewModal.jobseeker.resume?.personalInfo?.birthday && (
                          <div className="compact-item">
                            <strong>Birthday:</strong> {viewModal.jobseeker.resume.personalInfo.birthday}
                          </div>
                        )}
                        {viewModal.jobseeker.resume?.personalInfo?.age && (
                          <div className="compact-item">
                            <strong>Age:</strong> {viewModal.jobseeker.resume.personalInfo.age}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="modal-column">
                      <h3 className="section-title-compact">Account Status</h3>
                      <div className="compact-details">
                        <div className="compact-item">
                          <strong>Status:</strong> 
                          <span className={`status-badge ${viewModal.jobseeker.status}`} style={{marginLeft: '0.5rem'}}>
                            {viewModal.jobseeker.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="compact-item">
                          <strong>Applications:</strong> {viewModal.jobseeker.applications || 0}
                        </div>
                        <div className="compact-item">
                          <strong>Skills:</strong> {viewModal.jobseeker.skills?.length || 0}
                        </div>
                        <div className="compact-item">
                          <strong>Profile:</strong> 
                          <span className={viewModal.jobseeker.skills && viewModal.jobseeker.skills.length > 0 ? 'complete' : 'incomplete'} style={{marginLeft: '0.5rem'}}>
                            {viewModal.jobseeker.skills && viewModal.jobseeker.skills.length > 0 ? 'Complete' : 'Incomplete'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="modal-column">
                      <h3 className="section-title-compact">Activity Timeline</h3>
                      <div className="compact-details">
                        <div className="compact-item">
                          <strong>Registered:</strong> {formatDateTime(viewModal.jobseeker.createdAt).dateStr}
                          <div className="compact-meta">({formatDateTime(viewModal.jobseeker.createdAt).daysAgo} days ago)</div>
                        </div>
                        <div className="compact-item">
                          <strong>Last Activity:</strong> {viewModal.jobseeker.lastActive ? (
                            <>
                              {formatDateTime(viewModal.jobseeker.lastActive).dateStr}
                              <div className="compact-meta">({formatDateTime(viewModal.jobseeker.lastActive).daysAgo} days ago)</div>
                            </>
                          ) : (
                            <span className="inactive">Never active</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Skills Row */}
              {!viewModal.loading && viewModal.jobseeker.skills && viewModal.jobseeker.skills.length > 0 && (
                <div className="modal-row">
                  <div className="modal-column-full">
                    <h3 className="section-title-compact">Skills</h3>
                    <div className="skills-display-compact">
                      {viewModal.jobseeker.skills.slice(0, 12).map((skill, index) => (
                        <span key={index} className="skill-badge-compact">{skill}</span>
                      ))}
                      {viewModal.jobseeker.skills.length > 12 && (
                        <span className="skill-badge-compact more">+{viewModal.jobseeker.skills.length - 12} more</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            {/* Fixed Action Buttons Footer */}
            <div className="view-modal-footer">
              <p className="action-note">
                <strong>Note:</strong> Suspended accounts will receive notification to reactivate. 
                Users have 30 days to reactivate before permanent removal.
              </p>
              <div className="modal-action-buttons">
                <button 
                  onClick={() => {
                    setViewModal({ show: false, jobseeker: null, loading: false });
                    handleRemoveJobseeker(viewModal.jobseeker._id);
                  }}
                  className="modal-action-btn remove-btn"
                  title="Permanently Remove Account"
                >
                  Remove Account
                </button>
                
                <button 
                  onClick={() => {
                    setViewModal({ show: false, jobseeker: null, loading: false });
                    handleSuspendJobseeker(viewModal.jobseeker._id);
                  }}
                  className="modal-action-btn suspend-btn"
                  title="Suspend Account - User will be notified to reactivate"
                  disabled={viewModal.jobseeker.status === 'inactive'}
                >
                  Suspend Account
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default JobseekersTab;
