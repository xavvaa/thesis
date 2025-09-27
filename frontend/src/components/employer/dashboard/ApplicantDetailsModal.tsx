import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiClock, 
  FiEye, 
  FiDownload, 
  FiFileText, 
  FiCheck, 
  FiArrowLeft
} from 'react-icons/fi';
import { Applicant } from '../../../types/dashboard';
import { auth } from '../../../config/firebase';
import styles from './ApplicantDetailsModal.module.css';

interface ApplicationData {
  _id: string;
  jobTitle: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  resumeData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    summary: string;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    education: {
      tertiary?: {
        institution?: string;
        degree?: string;
        year?: string;
      };
      secondary?: {
        institution?: string;
        degree?: string;
        year?: string;
      };
      primary?: {
        institution?: string;
        degree?: string;
        year?: string;
      };
    };
  };
  status: string;
  appliedDate: string;
  coverLetter: string;
  notes: string;
  resumeFile?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadDate: string;
  };
}

interface ApplicantDetailsModalProps {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (applicantId: number) => void;
  onReject: (applicantId: number) => void;
  onViewResume: (applicantId: number) => void;
  onDownloadResume: (applicantId: number) => void;
}

export const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onViewResume,
  onDownloadResume,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'notes'>('resume');
  const [notes, setNotes] = useState('');
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);

  // Fetch detailed application data when modal opens
  useEffect(() => {
    if (isOpen && applicant.id) {
      fetchApplicationDetails();
    }
  }, [isOpen, applicant.id]);

  // Auto-load resume preview when application data is available
  useEffect(() => {
    if (applicationData?._id && !resumePreviewUrl) {
      handleViewResume();
    }
  }, [applicationData]);

  const fetchApplicationDetails = async () => {
    try {
      setIsLoadingApplication(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:3001/api/applications/employer', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Try to find by applicant ID first, then by application ID
        let application = data.data.find((app: any) => app.applicant?.id === applicant.id);
        if (!application) {
          application = data.data.find((app: any) => app._id === applicant.id);
        }
        
        
        if (application) {
          setApplicationData(application);
          setNotes(application.notes || '');
        } else {
          console.error('No application found for applicant:', applicant.id);
        }
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setIsLoadingApplication(false);
    }
  };

  const handleViewResume = async () => {
    if (!applicationData?._id) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:3001/api/applications/${applicationData._id}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResumePreviewUrl(url);
        setIsFullScreenPreview(true);
      } else {
        console.error('Failed to fetch resume');
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  const handleBackToDetails = () => {
    setIsFullScreenPreview(false);
  };

  const handleDownloadResume = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !applicationData?._id) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:3001/api/applications/${applicationData._id}/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = applicationData.resumeFile?.fileName || `${applicationData.applicant.name}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const errorText = await response.text();
        console.error('Resume download error:', errorText);
        alert('Resume not found or unable to download');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume');
    }
  };

  const saveNotes = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:3001/api/applications/${applicant.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: applicant.status,
          notes: notes
        })
      });

      if (response.ok) {
        alert('Notes saved successfully');
      } else {
        alert('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes');
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return '#10b981';
      case 'interview': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Remove full screen preview logic since modal now shows PDF directly

  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`}>
      <div className={styles.modalContent}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.applicantInfo}>
            <h2>{applicant.name} - Resume</h2>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.downloadResumeButton}
              onClick={handleDownloadResume}
              disabled={!applicationData?._id}
              title="Download Resume"
            >
              <FiDownload size={20} />
              <span>Download</span>
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* PDF Resume Content */}
        <div className={styles.pdfContent}>
          {resumePreviewUrl ? (
            <iframe 
              src={resumePreviewUrl} 
              className={styles.pdfIframe}
              title="Resume Preview"
            />
          ) : (
            <div className={styles.loadingPlaceholder}>
              <div className={styles.loadingContent}>
                <FiFileText size={64} />
                <h3>Loading Resume...</h3>
                <p>Please wait while we load {applicant.name}'s resume</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.modalActions}>
          <button 
            className={`${styles.primaryActionButton} ${styles.rejectButton}`}
            onClick={() => onReject(applicant.id)}
          >
            <FiX size={20} />
            <span>Reject Application</span>
          </button>
          <button 
            className={`${styles.primaryActionButton} ${styles.approveButton}`}
            onClick={() => onApprove(applicant.id)}
          >
            <FiCheck size={20} />
            <span>Move to Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
