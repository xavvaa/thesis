import React from 'react';
import { 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiTrendingUp, 
  FiLogOut,
  FiSettings,
  FiUserCheck,
  FiBarChart2
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
  
    { id: 'employers' as AdminTab, icon: FiBriefcase, label: 'Employer Verification' },
    { id: 'jobs' as AdminTab, icon: FiFileText, label: 'Job Listings' },
    { id: 'analytics' as AdminTab, icon: FiBarChart2, label: 'User Analytics' },
  ];

  if (adminUser.role === 'superadmin') {
    navItems.push(
      { id: 'admins' as AdminTab, icon: HiShieldCheck, label: 'Admin Management' }
    );
  }

  navItems.push(
    { id: 'settings' as AdminTab, icon: FiSettings, label: 'System Settings' }
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
          const IconComponent = item.icon;
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
