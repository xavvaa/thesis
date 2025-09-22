import React from 'react'
import styles from './VerificationModal.module.css'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.iconContainer}>
          <div className={styles.verificationIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.documentIcon}>
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <div className={styles.decorativeElements}>
              <div className={styles.element1}></div>
              <div className={styles.element2}></div>
              <div className={styles.element3}></div>
              <div className={styles.element4}></div>
              <div className={styles.element5}></div>
            </div>
          </div>
        </div>
        
        <h2 className={styles.title}>Verification in progress.</h2>
        <p className={styles.subtitle}>Check your email for updates from PESO.</p>
        
        <p className={styles.description}>
          Your documents have been submitted and are currently under review by PESO. Once approved, you'll be able to start posting jobs. We'll notify you via email as soon as your verification is complete!
        </p>
        
        <button 
          onClick={onClose}
          className={styles.continueButton}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  )
}

export default VerificationModal
