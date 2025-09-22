import React from 'react'
import styles from './VerificationPendingModal.module.css'

interface VerificationPendingModalProps {
  isOpen: boolean
  onClose: () => void
  companyName?: string
}

const VerificationPendingModal: React.FC<VerificationPendingModalProps> = ({
  isOpen,
  onClose,
  companyName
}) => {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.pendingIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.clockIcon}>
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
          </svg>
        </div>
        
        <h2 className={styles.title}>Account Verification Pending</h2>
        
        <div className={styles.messageContainer}>
          <p className={styles.message}>
            Thank you for registering{companyName ? ` ${companyName}` : ''}! Your account and documents are currently under review by our administrators.
          </p>
          
          <div className={styles.statusInfo}>
            <div className={styles.statusItem}>
              <div className={styles.statusIcon}>📄</div>
              <span>Documents submitted successfully</span>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusIcon}>⏳</div>
              <span>Verification in progress</span>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusIcon}>📧</div>
              <span>Email notification pending</span>
            </div>
          </div>
          
          <div className={styles.waitingMessage}>
            <h3>What happens next?</h3>
            <ul>
              <li>Our admin team will review your submitted documents</li>
              <li>You will receive an email notification once verification is complete</li>
              <li>Upon approval, you can log in and access your employer dashboard</li>
              <li>If additional information is needed, we'll contact you via email</li>
            </ul>
          </div>
          
          <div className={styles.estimatedTime}>
            <strong>Estimated verification time: 1-3 business days</strong>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className={styles.okButton}
        >
          I Understand
        </button>
      </div>
    </div>
  )
}

export default VerificationPendingModal
