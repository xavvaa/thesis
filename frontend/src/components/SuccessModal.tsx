import React from 'react'
import styles from './SuccessModal.module.css'

interface SuccessModalProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
  buttonText?: string
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  buttonText = "Continue"
}) => {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 20 20" fill="currentColor" className={styles.checkIcon}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        
        <button 
          onClick={onClose}
          className={styles.continueButton}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default SuccessModal
