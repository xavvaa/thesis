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
  AdminManagementTab,
  SystemSettingsTab,
  AnalyticsTab,
  ReportsTab,
  ApplicantsTab,
  ComplianceTab,
  UserAnalyticsTab,
  SkillsAnalyticsTab
} from '../../components/admin';
import adminService from '../../services/adminService';
import './SuperAdminDashboard.css';



const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingEmployers, setPendingEmployers] = useState<PendingEmployer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check if super admin is authenticated
    const storedAdmin = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!storedAdmin || !adminToken) {
      navigate('/admin/auth');
      return;
    }

    const admin = JSON.parse(storedAdmin);
    if (admin.role !== 'superadmin') {
      navigate('/admin/dashboard');
      return;
    }

    setAdminUser(admin);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsData, employersData, jobsData, usersResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllEmployers(), // Changed to get all employers instead of just pending
        adminService.getJobs({ limit: 10 }),
        adminService.getUsers({ role: 'admin' })
      ]);

      setStats(statsData);
      setPendingEmployers(employersData);
      setJobs(jobsData.jobs || []);
      setAdminUsers(usersResponse.users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerAction = async (employerId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      console.log('🚀 SuperAdmin handleEmployerAction called:', { employerId, action, reason });
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

  const handleCreateAdmin = async (adminData: any) => {
    try {
      console.log('🔄 Creating admin with data:', adminData);
      const newAdmin = await adminService.createAdmin(adminData);
      console.log('✅ Admin created successfully:', newAdmin);
      
      // Refresh the dashboard data to show the new admin
      await fetchDashboardData();
      
      // Show success message
      alert('Admin user created successfully!');
    } catch (error) {
      console.error('❌ Error creating admin:', error);
      alert(`Failed to create admin: ${error.message}`);
    }
  };

  const handleEditAdmin = async (adminId: string, adminData: any) => {
    try {
      console.log('🔄 Updating admin:', adminId, adminData);
      await adminService.updateUser(adminId, adminData);
      
      // Refresh the dashboard data to show the updated admin
      await fetchDashboardData();
      
      // Show success message
      alert('Admin user updated successfully!');
    } catch (error) {
      console.error('❌ Error editing admin:', error);
      alert(`Failed to update admin: ${error.message}`);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        console.log('🔄 Deleting admin:', adminId);
        await adminService.deleteUser(adminId);
        
        // Refresh the dashboard data to remove the deleted admin
        await fetchDashboardData();
        
        // Show success message
        alert('Admin user deleted successfully!');
      } catch (error) {
        console.error('❌ Error deleting admin:', error);
        alert(`Failed to delete admin: ${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin/auth');
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
      'applicants': {
        title: 'Applicants',
        subtitle: 'Job seeker applications and profiles'
      },
      'compliance': {
        title: 'Compliance',
        subtitle: 'System compliance and regulatory oversight'
      },
      'user-analytics': {
        title: 'User Analytics',
        subtitle: 'User behavior and engagement insights'
      },
      'skills-analytics': {
        title: 'Skills Analytics',
        subtitle: 'Skills demand and market trends'
      },
      'generate-reports': {
        title: 'Reports',
        subtitle: 'Generate system and performance reports'
      },
      'admin-management': {
        title: 'Admin Management',
        subtitle: 'Manage administrator accounts and permissions'
      },
      'settings': {
        title: 'System Settings',
        subtitle: 'Configure system parameters and preferences'
      },
    };

    return tabMap[tab] || { title: 'Dashboard', subtitle: 'System management' };
  };

  const generateSystemReport = () => {
    // Mock system report generation
    const reportData = {
      timestamp: new Date().toISOString(),
      stats,
      admins: adminUsers.length,
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

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading super admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
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


        {activeTab === 'applicants' && (
          <ApplicantsTab />
        )}

        {activeTab === 'compliance' && (
          <ComplianceTab />
        )}

        {activeTab === 'user-analytics' && (
          <UserAnalyticsTab />
        )}

        {activeTab === 'skills-analytics' && (
          <SkillsAnalyticsTab />
        )}

        {activeTab === 'generate-reports' && (
          <ReportsTab />
        )}

        {activeTab === 'admin-management' && (
          <AdminManagementTab 
            adminUsers={adminUsers}
            onCreateAdmin={handleCreateAdmin}
            onEditAdmin={handleEditAdmin}
            onDeleteAdmin={handleDeleteAdmin}
          />
        )}

        {activeTab === 'settings' && (
          <SystemSettingsTab />
        )}

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
