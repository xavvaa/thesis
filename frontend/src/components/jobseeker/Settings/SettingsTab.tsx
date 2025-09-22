import React, { useState, useEffect } from 'react';
import { FiUser, FiFileText, FiSave, FiX, FiUpload, FiDownload, FiTrash2, FiEye, FiMail, FiPhone, FiMapPin, FiGlobe, FiDollarSign, FiStar, FiPlus, FiMinus, FiLogOut, FiBell, FiSettings, FiEdit2, FiCheck } from 'react-icons/fi';
import styles from './SettingsTab.module.css';
import firebaseAuthService from '../../../services/firebaseAuthService';
import { apiService } from '../../../services/apiService';
import ResumeEditModal from '../../ResumeEditModal/ResumeEditModal';
import { useNavigate } from 'react-router-dom';
import PDFPreview from '../../shared/PDFPreview';

interface JobseekerProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
  } | string;
  jobTitle?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  salaryExpectation?: {
    min: number;
    max: number;
  };
  skills?: Array<{
    name: string;
    level: string;
  }>;
  experience?: string;
  education?: string;
  resumeUrl?: string;
  profilePicture?: string;
  preferredJobTypes?: string[];
  preferredLocations?: string;
  remoteWork?: boolean;
  privacySettings?: {
    profileVisibility: string;
    allowEmployerContact: boolean;
  };
  completionPercentage?: number;
  createdAt?: string;
  isActive?: boolean;
}

const SettingsTab: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<JobseekerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [editedProfile, setEditedProfile] = useState<JobseekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'resume' | 'preferences' | 'privacy' | 'account'>('profile');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' });
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    inAppAlerts: true,
    jobMatches: true,
    applicationUpdates: true
  });
  const [jobPreferences, setJobPreferences] = useState({
    jobTypes: [] as string[],
    locations: '',
    remoteWork: false,
    jobAlerts: true
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showResumeEditModal, setShowResumeEditModal] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [userAuthMethods, setUserAuthMethods] = useState<{hasPassword: boolean; providers: string[]}>({
    hasPassword: true,
    providers: []
  });
  const [checkingAuthMethods, setCheckingAuthMethods] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkUserAuthMethods();
  }, []);

  const checkUserAuthMethods = async () => {
    try {
      setCheckingAuthMethods(true);
      console.log('SettingsTab: Checking user auth methods...');
      const methods = await firebaseAuthService.checkUserAuthMethods();
      console.log('SettingsTab: Auth methods result:', methods);
      setUserAuthMethods(methods);
    } catch (error) {
      console.error('SettingsTab: Error checking user auth methods:', error);
      // Default to showing password form if there's an error
      setUserAuthMethods({ hasPassword: true, providers: [] });
    } finally {
      setCheckingAuthMethods(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseAuthService.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const currentUser = firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        setError('Please sign in to access your profile');
        navigate('/auth');
        return;
      }
      
      const response = await apiService.get('/jobseekers/profile');
      if (response.success && response.data) {
        let profileData = response.data;
        
        // Fetch current resume from the Resume collection
        try {
          const resumeResponse = await apiService.getCurrentResume();
          if (resumeResponse.success && resumeResponse.data) {
            // Add resume URL to profile data
            profileData = {
              ...profileData,
              resumeUrl: resumeResponse.data.fileUrl
            };
          }
        } catch (resumeErr) {
          console.log('No resume found in Resume collection');
        }
        
        setProfile(profileData);
        setEditedProfile(profileData);
      } else {
        // If 401 error, redirect to auth
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          setError('Session expired. Please sign in again.');
          navigate('/auth');
          return;
        }
        setError(response.error || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await apiService.put('/jobseekers/profile', editedProfile);
      if (response.success && response.data) {
        setProfile(response.data);
        setEditedProfile(response.data);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedProfile) return;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedProfile({
        ...editedProfile,
        [parent]: {
          ...(editedProfile[parent as keyof JobseekerProfile] as any),
          [child]: value
        }
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        [field]: value
      });
    }
  };

  const handleResumeUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const response = await apiService.uploadResume(file);

      if (response.success && response.data) {
        // If resume data was parsed, show edit modal
        if (response.data.resumeData) {
          setParsedResumeData(response.data.resumeData);
          setShowResumeEditModal(true);
          setSuccess('Resume uploaded! Please review the extracted information.');
        } else {
          setSuccess('Resume uploaded successfully!');
        }
        
        // Update profile to reflect new resume
        const updatedProfile = { ...profile, resumeUrl: response.data.fileUrl };
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to upload resume');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      setResumeFile(null);
    }
  };

  const handleResumeDelete = async () => {
    try {
      setError(null);
      
      // First get the current resume to get its ID
      const currentResumeResponse = await apiService.getCurrentResume();
      if (!currentResumeResponse.success || !currentResumeResponse.data) {
        setError('No resume found to delete');
        return;
      }
      
      const resumeId = currentResumeResponse.data.id;
      const response = await apiService.deleteResume(resumeId);
      
      if (response.success) {
        setProfile(prev => prev ? { ...prev, resumeUrl: undefined } : null);
        setSuccess('Resume deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.error || 'Failed to delete resume');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload only PDF files.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setResumeFile(file);
      handleResumeUpload(file);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    setUpdatingPassword(true);
    setError(null); // Clear any previous errors
    
    try {
      // Update password via Firebase Auth
      const result = await firebaseAuthService.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        setSuccess('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        setShowPasswords({ current: false, new: false, confirm: false });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleResumeEditSave = async (editedResumeData: any) => {
    try {
      // Save the edited resume data to backend
      const response = await apiService.post('/jobseekers/resume-data', {
        resumeData: editedResumeData
      });
      
      if (response.success) {
        setShowResumeEditModal(false);
        setSuccess('Resume data saved successfully!');
        setParsedResumeData(editedResumeData);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || 'Failed to save resume data');
      }
    } catch (error: any) {
      console.error('Failed to save resume data:', error);
      setError(error.message || 'Failed to save resume data. Please try again.');
    }
  };

  const handleResumeEditClose = () => {
    setShowResumeEditModal(false);
    // Keep the original parsed data if user cancels
  };

  if (loading) {
    return (
      <div className={styles.settingsTab}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className={styles.settingsTab}>
        <div className={styles.error}>
          <FiX className={styles.messageIcon} />
          <p>{error}</p>
          <button onClick={fetchProfile} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className={styles.settingsTab}>
        <div className={styles.error}>
          <FiX className={styles.messageIcon} />
          <p>No profile data available. Please try refreshing the page.</p>
          <button onClick={fetchProfile} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsTab}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your profile and account preferences</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <FiX className={styles.messageIcon} />
          {error}
          <button onClick={() => setError(null)} className={styles.closeButton}>
            <FiX />
          </button>
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          <FiSave className={styles.messageIcon} />
          {success}
        </div>
      )}

      <div className={styles.settingsContent}>
        <div className={styles.settingsNav}>
          <button
            className={`${styles.navButton} ${activeSection === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <FiUser />
            Profile & Account
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'resume' ? styles.active : ''}`}
            onClick={() => setActiveSection('resume')}
          >
            <FiFileText />
            Resume & Documents
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'preferences' ? styles.active : ''}`}
            onClick={() => setActiveSection('preferences')}
          >
            <FiStar />
            Job Preferences
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'privacy' ? styles.active : ''}`}
            onClick={() => setActiveSection('privacy')}
          >
            <FiBell />
            Privacy & Notifications
          </button>
          <button
            className={`${styles.navButton} ${activeSection === 'account' ? styles.active : ''}`}
            onClick={() => setActiveSection('account')}
          >
            <FiSettings />
            Account Management
          </button>
        </div>

        <div className={styles.settingsMain}>
          {activeSection === 'profile' && (
            <div className={styles.profileSection}>
              <div className={styles.sectionHeader}>
                <h2>Profile Information</h2>
                <div className={styles.profileCompletion}>
                  <span>Profile Completion: {profile.completionPercentage || 0}%</span>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${profile.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                {!isEditing ? (
                  <button 
                    className={styles.editButton}
                    onClick={() => setIsEditing(true)}
                  >
                    <FiEdit2 />
                    Edit Profile
                  </button>
                ) : (
                  <div className={styles.editActions}>
                    <button 
                      className={styles.saveButton}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <FiSave />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      className={styles.cancelButton}
                      onClick={handleCancel}
                    >
                      <FiX />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={styles.input}
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiUser className={styles.fieldIcon} />
                        {profile.firstName || 'Not specified'}
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={styles.input}
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiUser className={styles.fieldIcon} />
                        {profile.lastName || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Middle Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.middleName || ''}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        className={styles.input}
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiUser className={styles.fieldIcon} />
                        {profile.middleName || 'Not specified'}
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <div className={styles.displayValue}>
                      <FiMail className={styles.fieldIcon} />
                      {profile.email}
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={styles.input}
                        placeholder="+63 XXX XXX XXXX"
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiPhone className={styles.fieldIcon} />
                        {profile.phone || 'Not specified'}
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Job Title</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.jobTitle || ''}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        className={styles.input}
                        placeholder="e.g., Software Developer"
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiStar className={styles.fieldIcon} />
                        {profile?.jobTitle || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={typeof editedProfile?.address === 'string' ? editedProfile.address : 
                          editedProfile?.address ? 
                            `${editedProfile.address.street || ''} ${editedProfile.address.city || ''} ${editedProfile.address.province || ''} ${editedProfile.address.zipCode || ''}`.trim() 
                            : ''
                        }
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={styles.input}
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiMapPin className={styles.fieldIcon} />
                        {profile.address ? 
                          (typeof profile.address === 'string' ? profile.address :
                            `${profile.address.street || ''} ${profile.address.city || ''} ${profile.address.province || ''} ${profile.address.zipCode || ''}`.trim() || 'Not specified')
                          : 'Not specified'
                        }
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Portfolio URL</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedProfile?.portfolioUrl || ''}
                        onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                        className={styles.input}
                        placeholder="https://your-portfolio.com"
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiGlobe className={styles.fieldIcon} />
                        {profile.portfolioUrl ? (
                          <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            {profile.portfolioUrl}
                          </a>
                        ) : 'Not specified'}
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>LinkedIn URL</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedProfile?.linkedinUrl || ''}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        className={styles.input}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <div className={styles.displayValue}>
                        <FiGlobe className={styles.fieldIcon} />
                        {profile.linkedinUrl ? (
                          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            {profile.linkedinUrl}
                          </a>
                        ) : 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Salary Expectation (₱)</label>
                    {isEditing ? (
                      <div className={styles.salaryInputs}>
                        <input
                          type="number"
                          value={editedProfile?.salaryExpectation?.min || ''}
                          onChange={(e) => handleInputChange('salaryExpectation.min', parseInt(e.target.value))}
                          className={styles.input}
                          placeholder="Min salary"
                        />
                        <span>to</span>
                        <input
                          type="number"
                          value={editedProfile?.salaryExpectation?.max || ''}
                          onChange={(e) => handleInputChange('salaryExpectation.max', parseInt(e.target.value))}
                          className={styles.input}
                          placeholder="Max salary"
                        />
                      </div>
                    ) : (
                      <div className={styles.displayValue}>
                        <FiDollarSign className={styles.fieldIcon} />
                        {profile.salaryExpectation ? 
                          `₱${profile.salaryExpectation.min.toLocaleString()} - ₱${profile.salaryExpectation.max.toLocaleString()}`
                          : 'Not specified'
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'resume' && (
            <div className={styles.resumeSection}>
              <div className={styles.sectionHeader}>
                <h2>Resume & Documents</h2>
              </div>

              <div className={styles.resumeContent}>
                <div className={styles.resumeCard}>
                <div className={styles.resumeInfo}>
                  <FiFileText className={styles.resumeIcon} />
                  <div>
                    <h3>Resume</h3>
                    <p>{profile.resumeUrl ? 'Resume uploaded' : 'No resume uploaded'}</p>
                  </div>
                </div>
                
                <div className={styles.resumeActions}>
                  {profile.resumeUrl && (
                    <>
                      <a 
                        href={`http://localhost:3001${profile.resumeUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.viewButton}
                      >
                        <FiEye />
                        View
                      </a>
                      <button 
                        onClick={handleResumeDelete}
                        className={styles.deleteButton}
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </>
                  )}
                  
                  <label className={styles.uploadButton}>
                    <FiUpload />
                    {profile.resumeUrl ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* PDF Preview */}
              {profile.resumeUrl && (
                <div className={styles.pdfPreviewSection}>
                  <PDFPreview 
                    resumeUrl={profile.resumeUrl} 
                    className={styles.resumePreview}
                  />
                </div>
              )}

                {uploading && (
                  <div className={styles.uploadProgress}>
                    <div className={styles.spinner}></div>
                    <p>Uploading resume...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className={styles.privacySection}>
              <div className={styles.sectionHeader}>
                <h2>Privacy & Notifications</h2>
                <p className={styles.sectionDescription}>Manage your privacy settings and notification preferences</p>
              </div>

              <div className={styles.preferencesContent}>
                {/* Privacy Settings */}
                <div className={styles.preferenceGroup}>
                  <div className={styles.groupHeader}>
                    <FiEye className={styles.groupIcon} />
                    <h3>Privacy Settings</h3>
                  </div>
                  
                  <div className={styles.alertsGrid}>
                    <div className={styles.alertCard}>
                      <div className={styles.alertInfo}>
                        <h4 className={styles.alertTitle}>Profile Visibility</h4>
                        <p className={styles.alertDescription}>Control who can view your profile and personal information</p>
                        <select
                          value={editedProfile?.privacySettings?.profileVisibility || 'employers_only'}
                          onChange={(e) => handleInputChange('privacySettings.profileVisibility', e.target.value)}
                          className={styles.select}
                          style={{ marginTop: '8px', width: '100%' }}
                        >
                          <option value="public">🌐 Public - Visible to everyone</option>
                          <option value="employers_only">🏢 Employers Only - Only verified employers</option>
                          <option value="private">🔒 Private - Only you can see</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.alertCard}>
                      <div className={styles.alertInfo}>
                        <h4 className={styles.alertTitle}>Direct Contact</h4>
                        <p className={styles.alertDescription}>Allow employers to contact you directly about opportunities</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={editedProfile?.privacySettings?.allowEmployerContact ?? true}
                          onChange={(e) => handleInputChange('privacySettings.allowEmployerContact', e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Job Alerts & Notifications */}
                <div className={styles.preferenceGroup}>
                  <div className={styles.groupHeader}>
                    <FiBell className={styles.groupIcon} />
                    <h3>Job Alerts & Notifications</h3>
                  </div>
                  
                  <div className={styles.alertsGrid}>
                    <div className={styles.alertCard}>
                      <div className={styles.alertInfo}>
                        <h4 className={styles.alertTitle}>Job Match Alerts</h4>
                        <p className={styles.alertDescription}>Get notified when jobs match your skills and preferences</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notifications.jobMatches}
                          onChange={(e) => setNotifications({...notifications, jobMatches: e.target.checked})}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div className={styles.alertCard}>
                      <div className={styles.alertInfo}>
                        <h4 className={styles.alertTitle}>Application Updates</h4>
                        <p className={styles.alertDescription}>Receive updates on your job applications</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notifications.applicationUpdates}
                          onChange={(e) => setNotifications({...notifications, applicationUpdates: e.target.checked})}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div className={styles.alertCard}>
                      <div className={styles.alertInfo}>
                        <h4 className={styles.alertTitle}>Email Notifications</h4>
                        <p className={styles.alertDescription}>Receive job alerts via email</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notifications.emailAlerts}
                          onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div className={styles.alertCard}>
                      <div className={styles.alertInfo}>
                        <h4 className={styles.alertTitle}>SMS Alerts</h4>
                        <p className={styles.alertDescription}>Get urgent job notifications via SMS</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notifications.smsAlerts}
                          onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    <div className={styles.alertCard}>
                      <div className={styles.alertInfo}>
                        <h4 className={styles.alertTitle}>In-App Notifications</h4>
                        <p className={styles.alertDescription}>Show notifications within the app</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notifications.inAppAlerts}
                          onChange={(e) => setNotifications({...notifications, inAppAlerts: e.target.checked})}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save functionality is handled by the main save button in the header */}
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className={styles.preferencesSection}>
              <div className={styles.sectionHeader}>
                <h2>Job Preferences</h2>
                <p className={styles.sectionDescription}>Customize your job search preferences to receive better matches</p>
                <div className={styles.sectionActions}>
                  {!isEditingPreferences ? (
                    <button 
                      className={styles.editButton}
                      onClick={() => setIsEditingPreferences(true)}
                    >
                      <FiEdit2 />
                      Edit Preferences
                    </button>
                  ) : (
                    <div className={styles.editActions}>
                      <button 
                        className={styles.saveButton}
                        onClick={async () => {
                          await handleSave();
                          setIsEditingPreferences(false);
                        }}
                        disabled={saving}
                      >
                        <FiSave />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        className={styles.cancelButton}
                        onClick={() => {
                          setEditedProfile(profile);
                          setIsEditingPreferences(false);
                        }}
                      >
                        <FiX />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.preferencesContent}>
                {/* Job Search Criteria */}
                <div className={styles.preferenceGroup}>
                  <div className={styles.groupHeader}>
                    <FiStar className={styles.groupIcon} />
                    <h3>Job Search Criteria</h3>
                  </div>
                  
                  <div className={styles.preferenceGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.boldLabel}>
                        <FiStar className={styles.labelIcon} />
                        Desired Job Title
                      </label>
                      {isEditingPreferences ? (
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g., Software Developer, Marketing Manager"
                          value={editedProfile?.jobTitle || ''}
                          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        />
                      ) : (
                        <div className={styles.displayValue}>
                          <FiStar className={styles.fieldIcon} />
                          {profile?.jobTitle || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.boldLabel}>
                        <FiMapPin className={styles.labelIcon} />
                        Preferred Locations
                      </label>
                      {isEditingPreferences ? (
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g., Manila, Cebu, Davao, Remote"
                          value={editedProfile?.preferredLocations || ''}
                          onChange={(e) => handleInputChange('preferredLocations', e.target.value)}
                        />
                      ) : (
                        <div className={styles.displayValue}>
                          <FiMapPin className={styles.fieldIcon} />
                          {profile?.preferredLocations || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.boldLabel}>
                        <FiDollarSign className={styles.labelIcon} />
                        Salary Range (₱)
                      </label>
                      {isEditingPreferences ? (
                        <div className={styles.salaryInputs}>
                          <input
                            type="number"
                            value={editedProfile?.salaryExpectation?.min || ''}
                            onChange={(e) => handleInputChange('salaryExpectation.min', parseInt(e.target.value) || 0)}
                            className={styles.input}
                            placeholder="Minimum"
                          />
                          <span className={styles.salaryDivider}>to</span>
                          <input
                            type="number"
                            value={editedProfile?.salaryExpectation?.max || ''}
                            onChange={(e) => handleInputChange('salaryExpectation.max', parseInt(e.target.value) || 0)}
                            className={styles.input}
                            placeholder="Maximum"
                          />
                        </div>
                      ) : (
                        <div className={styles.displayValue}>
                          <FiDollarSign className={styles.fieldIcon} />
                          {profile?.salaryExpectation ? 
                            `₱${profile.salaryExpectation.min?.toLocaleString()} - ₱${profile.salaryExpectation.max?.toLocaleString()}`
                            : 'Not specified'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employment Preferences */}
                <div className={styles.preferenceGroup}>
                  <div className={styles.groupHeader}>
                    <FiSettings className={styles.groupIcon} />
                    <h3>Employment Preferences</h3>
                  </div>
                  
                  <div className={styles.preferenceGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.boldLabel}>
                        <FiSettings className={styles.labelIcon} />
                        Job Types
                      </label>
                      {isEditingPreferences ? (
                        <div className={styles.checkboxGrid}>
                          {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map(type => (
                            <label key={type} className={styles.checkboxItem}>
                              <input
                                type="checkbox"
                                checked={editedProfile?.preferredJobTypes?.includes(type) || false}
                                onChange={(e) => {
                                  const currentTypes = editedProfile?.preferredJobTypes || [];
                                  if (e.target.checked) {
                                    handleInputChange('preferredJobTypes', [...currentTypes, type]);
                                  } else {
                                    handleInputChange('preferredJobTypes', currentTypes.filter(t => t !== type));
                                  }
                                }}
                                className={styles.checkbox}
                              />
                              <span className={styles.checkboxLabel}>{type}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.displayValue}>
                          <FiSettings className={styles.fieldIcon} />
                          {profile?.preferredJobTypes?.length > 0 ? 
                            profile.preferredJobTypes.join(', ') : 'Not specified'
                          }
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.boldLabel}>
                        <FiGlobe className={styles.labelIcon} />
                        Work Arrangement
                      </label>
                      {isEditingPreferences ? (
                        <div className={styles.toggleGroup}>
                          <div className={styles.toggleItem}>
                            <span className={styles.toggleText}>Open to Remote Work</span>
                            <label className={styles.toggle}>
                              <input
                                type="checkbox"
                                checked={editedProfile?.remoteWork || false}
                                onChange={(e) => handleInputChange('remoteWork', e.target.checked)}
                              />
                              <span className={styles.slider}></span>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.displayValue}>
                          <FiGlobe className={styles.fieldIcon} />
                          {profile?.remoteWork ? 'Yes, open to remote work' : 'Prefers office-based work'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills & Expertise */}
                <div className={styles.preferenceGroup}>
                  <div className={styles.groupHeader}>
                    <FiUser className={styles.groupIcon} />
                    <h3>Skills & Expertise</h3>
                  </div>
                  
                  <div className={styles.skillsSection}>
                    {isEditingPreferences && (
                      <div className={styles.addSkillForm}>
                        <div className={styles.skillInputs}>
                          <input
                            type="text"
                            value={newSkill.name}
                            onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                            className={styles.input}
                            placeholder="Add a skill (e.g., JavaScript, Project Management)"
                          />
                          <select
                            value={newSkill.level}
                            onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                            className={styles.select}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                          <button 
                            type="button"
                            className={styles.addSkillButton}
                            onClick={() => {
                              if (newSkill.name.trim()) {
                                const currentSkills = editedProfile?.skills || [];
                                handleInputChange('skills', [...currentSkills, newSkill]);
                                setNewSkill({ name: '', level: 'beginner' });
                              }
                            }}
                          >
                            <FiPlus />
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className={styles.skillsList}>
                      {(profile?.skills || []).map((skill, index) => (
                        <div key={index} className={styles.skillTag}>
                          <span className={styles.skillName}>{skill.name}</span>
                          <span className={styles.skillLevel}>{skill.level}</span>
                          {isEditingPreferences && (
                            <button
                              type="button"
                              className={styles.removeSkillButton}
                              onClick={() => {
                                const updatedSkills = (editedProfile?.skills || []).filter((_, i) => i !== index);
                                handleInputChange('skills', updatedSkills);
                              }}
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                      ))}
                      {(!profile?.skills || profile.skills.length === 0) && (
                        <div className={styles.displayValue}>
                          <FiUser className={styles.fieldIcon} />
                          No skills added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className={styles.accountSection}>
              <div className={styles.sectionHeader}>
                <h2>Account Management</h2>
              </div>

              <div className={styles.accountContent}>
                <div className={styles.accountInfo}>
                  <h3>Account Information</h3>
                  <div className={styles.accountGrid}>
                    <div className={styles.accountCard}>
                      <div className={styles.cardHeader}>
                        <FiMail className={styles.cardIcon} />
                        <h4>Email Address</h4>
                      </div>
                      <p className={styles.cardValue}>{profile?.email}</p>
                    </div>
                    
                    <div className={styles.accountCard}>
                      <div className={styles.cardHeader}>
                        <FiUser className={styles.cardIcon} />
                        <h4>Account Status</h4>
                      </div>
                      <div className={styles.statusBadge}>
                        <FiCheck className={styles.statusIcon} />
                        <span>Active</span>
                      </div>
                    </div>
                    
                    <div className={styles.accountCard}>
                      <div className={styles.cardHeader}>
                        <FiSettings className={styles.cardIcon} />
                        <h4>Member Since</h4>
                      </div>
                      <p className={styles.cardValue}>
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.passwordSection}>
                  <div className={styles.passwordHeader}>
                    <h3>Password & Security</h3>
                    {checkingAuthMethods ? (
                      <div className={styles.loadingText}>Checking account type...</div>
                    ) : !userAuthMethods.hasPassword ? (
                      <div className={styles.googleAuthInfo}>
                        <div className={styles.infoCard}>
                          <FiSettings className={styles.infoIcon} />
                          <div>
                            <h4>Google Account</h4>
                            <p>Your account uses Google sign-in. To change your password, please visit your Google Account settings.</p>
                            <a 
                              href="https://myaccount.google.com/security" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.googleLink}
                            >
                              Manage Google Account →
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : !showPasswordForm ? (
                      <button 
                        className={styles.changePasswordButton}
                        onClick={() => setShowPasswordForm(true)}
                      >
                        <FiEdit2 />
                        Change Password
                      </button>
                    ) : null}
                  </div>
                  
                  {showPasswordForm && userAuthMethods.hasPassword && (
                    <form onSubmit={handlePasswordUpdate} className={styles.passwordForm}>
                      <div className={styles.formGroup}>
                        <label>Current Password</label>
                        <div className={styles.passwordInputWrapper}>
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className={styles.passwordInput}
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPasswords.current ? <FiEye /> : <FiEye style={{opacity: 0.5}} />}
                          </button>
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label>New Password</label>
                        <div className={styles.passwordInputWrapper}>
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className={styles.passwordInput}
                            placeholder="Enter new password (min 6 characters)"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPasswords.new ? <FiEye /> : <FiEye style={{opacity: 0.5}} />}
                          </button>
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Confirm New Password</label>
                        <div className={styles.passwordInputWrapper}>
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className={styles.passwordInput}
                            placeholder="Confirm your new password"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPasswords.confirm ? <FiEye /> : <FiEye style={{opacity: 0.5}} />}
                          </button>
                        </div>
                      </div>
                      {error && (
                        <div className={styles.passwordError}>
                          <FiX className={styles.errorIcon} />
                          {error}
                        </div>
                      )}
                      <div className={styles.passwordActions}>
                        <button type="submit" className={styles.updateButton} disabled={updatingPassword}>
                          <FiSave />
                          {updatingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                        <button 
                          type="button" 
                          className={styles.cancelButton}
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setError(null);
                          }}
                        >
                          <FiX />
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className={styles.sessionManagement}>
                  <h3>Session Management</h3>
                  <div className={styles.sessionCard}>
                    <div className={styles.sessionInfo}>
                      <FiLogOut className={styles.sessionIcon} />
                      <div>
                        <h4>Sign Out</h4>
                        <p>Sign out of your current session and return to the login page</p>
                      </div>
                    </div>
                    <button className={styles.signOutButton} onClick={handleLogout}>
                      <FiLogOut />
                      Sign Out
                    </button>
                  </div>
                </div>

                <div className={styles.dangerZone}>
                  <h3>⚠️ Danger Zone</h3>
                  <div className={styles.dangerActions}>
                    <div className={styles.dangerCard}>
                      <div className={styles.dangerInfo}>
                        <div className={styles.dangerHeader}>
                          <FiEye className={styles.dangerIcon} />
                          <h4>Deactivate Account</h4>
                        </div>
                        <p>Temporarily disable your account. You can reactivate it anytime by signing back in.</p>
                      </div>
                      <button className={styles.deactivateButton}>
                        <FiEye />
                        Deactivate
                      </button>
                    </div>
                    
                    <div className={styles.dangerCard}>
                      <div className={styles.dangerInfo}>
                        <div className={styles.dangerHeader}>
                          <FiTrash2 className={styles.dangerIcon} />
                          <h4>Delete Account</h4>
                        </div>
                        <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                      </div>
                      <button className={styles.deleteButton}>
                        <FiTrash2 />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showResumeEditModal && parsedResumeData && (
        <ResumeEditModal
          isOpen={showResumeEditModal}
          onClose={handleResumeEditClose}
          onSave={handleResumeEditSave}
          initialData={parsedResumeData}
          fileName={resumeFile?.name || 'resume.pdf'}
        />
      )}
    </div>
  );
};

export default SettingsTab;
