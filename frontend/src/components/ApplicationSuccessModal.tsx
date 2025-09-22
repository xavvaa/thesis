import React from 'react';
import { FiCheck, FiX, FiClock, FiMail } from 'react-icons/fi';
import styles from './ApplicationSuccessModal.module.css';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
}

const ApplicationSuccessModal: React.FC<ApplicationSuccessModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  companyName
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX size={20} />
        </button>
        
        <div className={styles.successIcon}>
          <FiCheck size={48} />
        </div>
        
        <h2 className={styles.title}>Application Submitted!</h2>
        
        <div className={styles.content}>
          <p className={styles.message}>
            Your application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> has been successfully submitted.
          </p>
          
          <div className={styles.statusInfo}>
            <div className={styles.statusItem}>
              <FiClock className={styles.statusIcon} />
              <span>Status: <strong>Under Review</strong></span>
            </div>
            <div className={styles.statusItem}>
              <FiMail className={styles.statusIcon} />
              <span>You'll receive email updates on your application progress</span>
            </div>
          </div>
          
          <div className={styles.nextSteps}>
            <h3>What happens next?</h3>
            <ul>
              <li>The employer will review your application</li>
              <li>You'll receive notifications about status updates</li>
              <li>Check your Applications tab to track progress</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onClose}>
            Continue Browsing Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccessModal;
