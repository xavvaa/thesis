import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminUser, DashboardStats, PendingEmployer, Job, AdminTab } from '../../types/admin';
import { 
  AdminSidebar, 
  AdminHeader, 
  OverviewTab, 
  EmployersTab, 
  JobsTab, 
  SuperAdminJobsTab,
  UsersTab,
  SystemSettingsTab,
  AnalyticsTab,
  ReportsTab,
  JobseekersTab,
  ComplianceTab,
  JobDemandTab
} from '../../components/admin';
import adminService from '../../services/adminService';
import './AdminDashboard.css';


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingEmployers, setPendingEmployers] = useState<PendingEmployer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check if admin is authenticated
    const storedAdmin = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!storedAdmin || !adminToken) {
      navigate('/admin/auth');
      return;
    }

    setAdminUser(JSON.parse(storedAdmin));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    console.log('🔄 Fetching dashboard data...');
    try {
      const [statsData, employersData, jobsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllEmployers(), // Changed to get all employers instead of just pending
        adminService.getJobs({ limit: 10 })
      ]);

      console.log('✅ Dashboard data fetched successfully:', { statsData, employersData, jobsData });
      setStats(statsData);
      setPendingEmployers(employersData);
      setJobs(jobsData.jobs || []);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerAction = async (employerId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      console.log('🚀 Admin handleEmployerAction called:', { employerId, action, reason });
      setLoading(true);
      await adminService.verifyEmployer(employerId, action, reason);
      console.log('✅ Employer verification successful, refreshing data...');
      await fetchDashboardData();
      console.log('✅ Dashboard data refreshed');
    } catch (error) {
      console.error('❌ Error updating employer status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAction = async (documentId: string, action: 'approve' | 'reject', reason?: string, notes?: string) => {
    try {
      await adminService.verifyDocument(documentId, action, reason, notes);
      fetchDashboardData(); // Refresh to get updated document statuses
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const handleBulkDocumentAction = async (documentIds: string[], action: 'approve' | 'reject', reason?: string) => {
    try {
      // Find the employer ID from the first document (all should belong to same employer)
      const firstDoc = pendingEmployers
        .flatMap(emp => emp.documents || [])
        .find(doc => documentIds.includes(doc._id));
      
      if (firstDoc) {
        await adminService.bulkVerifyDocuments(firstDoc.employerId, documentIds, action, reason);
        fetchDashboardData(); // Refresh to get updated document statuses
      }
    } catch (error) {
      console.error('Error bulk updating document status:', error);
    }
  };

  const getTabInfo = (tab: string) => {
    const tabMap: Record<string, { title: string; subtitle: string }> = {
      'overview': {
        title: 'Dashboard',
        subtitle: 'System overview and key metrics'
      },
      'employer-verification': {
        title: 'Employer Verification',
        subtitle: 'Review and approve employer applications'
      },
      'job-postings': {
        title: 'Job Postings',
        subtitle: 'Manage and monitor job listings'
      },
      'jobseekers': {
        title: 'Jobseekers',
        subtitle: 'Job seeker profiles and management'
      },
      'compliance': {
        title: 'Compliance',
        subtitle: 'System compliance and regulatory oversight'
      },
      'skills-analytics': {
        title: 'Job Demand Analytics',
        subtitle: 'Job market demand and competition analysis'
      },
      'generate-reports': {
        title: 'Reports',
        subtitle: 'Generate system and performance reports'
      },
      'settings': {
        title: 'System Settings',
        subtitle: 'Configure system parameters and preferences'
      },
    };

    return tabMap[tab] || { title: 'Dashboard', subtitle: 'System management' };
  };

  const generateSystemReport = () => {
    // System report generation
    const reportData = {
      timestamp: new Date().toISOString(),
      stats,
      systemHealth: 'Good'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peso-system-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin/auth');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!adminUser) {
    console.log('❌ No admin user found, redirecting to auth...');
    return (
      <div className="admin-loading">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  console.log('✅ Admin dashboard rendering with user:', adminUser);
  console.log('✅ Active tab:', activeTab);
  console.log('✅ Stats:', stats);

  return (
    <div className="admin-dashboard">
      <AdminSidebar 
        adminUser={adminUser!}
        activeTab={activeTab as AdminTab}
        onTabChange={(tab: AdminTab) => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      <div className="admin-main">
        <AdminHeader 
          title={getTabInfo(activeTab).title}
          subtitle={getTabInfo(activeTab).subtitle}
          actions={
            <button className="report-btn" onClick={generateSystemReport}>
              Generate Report
            </button>
          }
        />

        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats}
          />
        )}

        {activeTab === 'employer-verification' && (
          <EmployersTab 
            pendingEmployers={pendingEmployers}
            onEmployerAction={handleEmployerAction}
            loading={loading}
          />
        )}

        {activeTab === 'job-postings' && (
          <SuperAdminJobsTab 
            onJobStatusChange={(jobId, status) => {
              console.log('Job status changed:', jobId, status);
              // Refresh dashboard data if needed
              fetchDashboardData();
            }}
          />
        )}

        {activeTab === 'jobseekers' && (
          <JobseekersTab />
        )}

        {activeTab === 'compliance' && (
          <ComplianceTab />
        )}

        {activeTab === 'skills-analytics' && (
          <JobDemandTab />
        )}

        {activeTab === 'generate-reports' && (
          <ReportsTab />
        )}

        {activeTab === 'settings' && (
          <SystemSettingsTab />
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
