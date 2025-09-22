import React, { useState } from 'react';
import { FiX, FiUsers, FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import styles from './SettingsModal.module.css';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamData: TeamData) => void;
  initialData?: TeamData;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'recruiter' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
}

export interface TeamData {
  members: TeamMember[];
}

const rolePermissions = {
  admin: ['Full access', 'Manage team', 'Billing access', 'All job management'],
  recruiter: ['Create jobs', 'Review applications', 'Schedule interviews', 'Basic reporting'],
  viewer: ['View jobs', 'View applications', 'Basic reporting']
};

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [teamData, setTeamData] = useState<TeamData>(
    initialData || {
      members: [
        {
          id: '1',
          name: 'Maria Santos',
          email: 'maria.santos@company.ph',
          role: 'admin',
          status: 'active',
          joinDate: '2023-01-15'
        },
        {
          id: '2',
          name: 'Juan dela Cruz',
          email: 'juan.delacruz@company.ph',
          role: 'recruiter',
          status: 'active',
          joinDate: '2023-03-20'
        },
        {
          id: '3',
          name: 'Anna Reyes',
          email: 'anna.reyes@company.ph',
          role: 'viewer',
          status: 'pending',
          joinDate: '2024-01-10'
        }
      ]
    }
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'viewer' as TeamMember['role']
  });

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        status: 'pending',
        joinDate: new Date().toISOString().split('T')[0]
      };
      
      setTeamData(prev => ({
        ...prev,
        members: [...prev.members, member]
      }));
      
      setNewMember({ name: '', email: '', role: 'viewer' });
      setShowAddForm(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId)
    }));
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    setTeamData(prev => ({
      ...prev,
      members: prev.members.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(teamData);
    onClose();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'recruiter': return '#3b82f6';
      case 'viewer': return '#059669';
      default: return '#64748b';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <FiUsers className={styles.headerIcon} />
            <h2 className={styles.title}>Team Management</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Add New Member */}
            <div className={styles.formGroupFull}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label className={styles.label}>Team Members ({teamData.members.length})</label>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                >
                  <FiPlus style={{ marginRight: '0.5rem' }} />
                  Add Member
                </button>
              </div>

              {showAddForm && (
                <div style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  marginBottom: '1.5rem',
                  background: '#f8fafc'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Add New Team Member</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                      <label className={styles.label}>Name</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className={styles.label}>Email</label>
                      <input
                        type="email"
                        className={styles.input}
                        value={newMember.email}
                        onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@company.com"
                      />
                    </div>
                    <div>
                      <label className={styles.label}>Role</label>
                      <select
                        className={styles.input}
                        value={newMember.role}
                        onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as TeamMember['role'] }))}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={styles.saveButton}
                        onClick={handleAddMember}
                        style={{ padding: '0.75rem', fontSize: '0.8125rem' }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setShowAddForm(false)}
                        style={{ padding: '0.75rem', fontSize: '0.8125rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members List */}
              <div className={styles.teamGrid}>
                {teamData.members.map((member) => (
                  <div key={member.id} className={styles.teamMemberCard}>
                    <div className={styles.memberHeader}>
                      <div className={styles.memberAvatar}>
                        {getInitials(member.name)}
                      </div>
                      <div className={styles.memberInfo}>
                        <h4 className={styles.memberName}>{member.name}</h4>
                        <p className={styles.memberRole}>{member.email}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span 
                            style={{ 
                              padding: '0.125rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: getRoleColor(member.role) + '20',
                              color: getRoleColor(member.role)
                            }}
                          >
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                          <span 
                            style={{ 
                              padding: '0.125rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: member.status === 'active' ? '#d1fae5' : member.status === 'pending' ? '#fef3c7' : '#fee2e2',
                              color: member.status === 'active' ? '#065f46' : member.status === 'pending' ? '#92400e' : '#991b1b'
                            }}
                          >
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8125rem', fontWeight: '600', color: '#374151' }}>
                        Permissions:
                      </h5>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 0,
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        {rolePermissions[member.role].map((permission, index) => (
                          <li key={index} style={{ marginBottom: '0.25rem' }}>
                            • {permission}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.memberActions}>
                      <select
                        className={styles.memberButton}
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamMember['role'])}
                        style={{ minWidth: '100px' }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        className={`${styles.memberButton} ${styles.danger}`}
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
