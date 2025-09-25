import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiMail, FiCalendar, FiX } from 'react-icons/fi';
import { HiShieldCheck } from 'react-icons/hi';
import { AdminUser } from '../../types/admin';
import './AdminManagementTab.css';

interface AdminManagementTabProps {
  adminUsers: AdminUser[];
  onCreateAdmin: (adminData: any) => void;
  onEditAdmin: (adminId: string, adminData: any) => void;
  onDeleteAdmin: (adminId: string) => void;
}

const AdminManagementTab: React.FC<AdminManagementTabProps> = ({
  adminUsers,
  onCreateAdmin,
  onEditAdmin,
  onDeleteAdmin
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    adminName: '',
    email: '',
    role: 'admin',
    department: '',
    password: ''
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAdmin(formData);
    setFormData({ adminName: '', email: '', role: 'admin', department: '', password: '' });
    setShowCreateForm(false);
  };

  const handleEditAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdmin) {
      onEditAdmin(editingAdmin.uid, formData);
      setEditingAdmin(null);
      setFormData({ adminName: '', email: '', role: 'admin', department: '', password: '' });
    }
  };

  const startEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      adminName: admin.adminName || '',
      email: admin.email,
      role: admin.role,
      department: admin.department || '',
      password: ''
    });
  };

  const cancelEdit = () => {
    setEditingAdmin(null);
    setShowCreateForm(false);
    setFormData({ adminName: '', email: '', role: 'admin', department: '', password: '' });
  };

  return (
    <div className="admin-content">
      <div className="admin-management-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="add-admin-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <FiPlus /> Add New Admin
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingAdmin) && (
        <div className="modal-overlay">
          <div className="admin-form-modal">
            <div className="modal-header">
              <h3>{editingAdmin ? 'Edit Admin User' : 'Create New Admin'}</h3>
              <button className="close-btn" onClick={cancelEdit}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={editingAdmin ? handleEditAdmin : handleCreateAdmin} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="adminName">Full Name</label>
                  <input
                    type="text"
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="admin@peso.gov.ph"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., HR, Operations"
                  />
                </div>

                {!editingAdmin && (
                  <div className="form-group full-width">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="Enter secure password"
                      minLength={6}
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Users List */}
      <div className="admin-users-grid">
        {adminUsers.length === 0 ? (
          <div className="empty-state">
            <FiUserCheck size={48} />
            <h3>No Admin Users</h3>
            <p>Create your first admin user to get started</p>
          </div>
        ) : (
          adminUsers.map((admin) => (
            <div 
              key={admin.uid} 
              className="admin-user-card clickable"
              onClick={() => startEdit(admin)}
              title="Click to edit admin"
            >
              <div className="admin-card-header">
                <div className="admin-avatar">
                  {admin.adminName ? admin.adminName.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()}
                </div>
                <div className="admin-basic-info">
                  <h4>{admin.adminName || 'Unnamed Admin'}</h4>
                  <span className={`role-badge ${admin.role}`}>
                    <HiShieldCheck />
                    {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>

              <div className="admin-card-body">
                <div className="admin-detail">
                  <FiMail className="detail-icon" />
                  <span>{admin.email}</span>
                </div>
                
                {admin.department && (
                  <div className="admin-detail">
                    <FiUserCheck className="detail-icon" />
                    <span>{admin.department}</span>
                  </div>
                )}

                <div className="admin-detail">
                  <FiCalendar className="detail-icon" />
                  <span>Created: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>

                <div className="admin-status">
                  <span className={`status-indicator ${admin.isActive ? 'active' : 'inactive'}`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="admin-card-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="action-btn edit"
                  onClick={() => startEdit(admin)}
                  title="Edit Admin"
                >
                  <FiEdit2 />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${admin.adminName || admin.email}?`)) {
                      onDeleteAdmin(admin.uid);
                    }
                  }}
                  title="Remove Admin"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminManagementTab;
