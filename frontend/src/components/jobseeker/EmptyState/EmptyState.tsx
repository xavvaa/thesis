import React from 'react'
import { FiBell } from 'react-icons/fi'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  message: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FiBell />,
  title,
  message
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        {icon}
      </div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyMessage}>{message}</p>
    </div>
  )
}

export default EmptyState
