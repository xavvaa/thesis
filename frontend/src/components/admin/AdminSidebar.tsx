import React from 'react';
import { 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiTrendingUp, 
  FiLogOut,
  FiSettings,
  FiUserCheck,
  FiBarChart2,
  FiDownload,
  FiCheck,
  FiAlertCircle,
  FiStar
} from 'react-icons/fi';
import { HiShieldCheck } from 'react-icons/hi2';
import { HiSparkles } from 'react-icons/hi';
import { AdminUser, AdminTab } from '../../types/admin';

interface AdminSidebarProps {
  adminUser: AdminUser;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminUser,
  activeTab,
  onTabChange,
  onLogout
}) => {
  const navItems = [
    { id: 'overview' as AdminTab, icon: FiTrendingUp, label: 'Overview' },
    { id: 'employer-verification' as AdminTab, icon: FiCheck, label: 'Employer Verification' },
    { id: 'job-postings' as AdminTab, icon: FiFileText, label: 'Job Postings' },
    { id: 'applicants' as AdminTab, icon: FiUsers, label: 'Applicants' },
    { id: 'compliance' as AdminTab, icon: FiAlertCircle, label: 'Compliance' },
    { id: 'user-analytics' as AdminTab, icon: FiBarChart2, label: 'User Analytics' },
    { id: 'skills-analytics' as AdminTab, icon: FiStar, label: 'Skills Analytics' },
    { id: 'generate-reports' as AdminTab, icon: FiDownload, label: 'Generate Reports' },
  ];

  if (adminUser.role === 'superadmin') {
    navItems.push(
      { id: 'admin-management' as AdminTab, icon: HiShieldCheck, label: 'Admin Management' }
    );
  }

  navItems.push(
    { id: 'settings' as AdminTab, icon: FiSettings, label: 'Settings' }
  );

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo-section">
          <img 
            src="/peso-logo.png" 
            alt="PESO Logo" 
            className="sidebar-peso-logo"
          />
          <h2>PESO Admin</h2>
        </div>
        {adminUser.role === 'superadmin' && (
          <div className="admin-role-badge">
            <HiSparkles className="role-icon" />
            SUPERADMIN
          </div>
        )}
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon as React.ComponentType<{ className?: string }>;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <IconComponent />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
