import React from 'react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-text">
          <h1>{title}</h1>
          {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="admin-header-actions">
        {actions || <span className="last-updated">Last updated: {new Date().toLocaleTimeString()}</span>}
      </div>
    </div>
  );
};

export default AdminHeader;
