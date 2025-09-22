import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminUser, DashboardStats, PendingEmployer, Job, AdminTab } from '../../types/admin';
import { 
  AdminSidebar, 
  AdminHeader, 
  OverviewTab, 
  EmployersTab, 
  JobsTab, 
  UsersTab,
  AnalyticsTab
} from '../../components/admin';
import adminService from '../../services/adminService';
import './AdminDashboard.css';


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingEmployers, setPendingEmployers] = useState<PendingEmployer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
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
    setLoading(true);
    try {
      const [statsData, employersData, jobsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllEmployers(),
        adminService.getJobs({ limit: 10 })
      ]);

      setStats(statsData);
      setPendingEmployers(employersData);
      setJobs(jobsData.jobs || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerAction = async (employerId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await adminService.verifyEmployer(employerId, action, reason);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating employer status:', error);
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
    return null;
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        adminUser={adminUser}
        activeTab={activeTab as AdminTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="admin-main">
        <AdminHeader title="Admin Dashboard" />

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}

        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        
        {activeTab === 'employers' && (
          <EmployersTab
            pendingEmployers={pendingEmployers}
            onEmployerAction={handleEmployerAction}
            loading={loading}
          />
        )}
        
        {activeTab === 'jobs' && <JobsTab jobs={jobs} />}
        
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
