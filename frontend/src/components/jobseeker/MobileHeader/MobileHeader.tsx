import React from 'react'
import { FiSliders } from 'react-icons/fi'
import styles from './MobileHeader.module.css'

interface MobileHeaderProps {
  userName?: string
  userInitial?: string
  onFilterClick: () => void
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  userName = 'Juan De La Cruz',
  userInitial = 'U',
  onFilterClick
}) => {
  return (
    <header className={styles.appHeader}>
      <div className={styles.userGreeting}>
        <div className={styles.userAvatar}>
          {userInitial}
        </div>
        <div className={styles.greetingText}>
          <h1>Hello</h1>
          <h2>{userName}</h2>
        </div>
      </div>
      <button className={styles.filterButton} onClick={onFilterClick}>
        <FiSliders />
      </button>
    </header>
  )
}

export default MobileHeader
