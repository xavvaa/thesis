import React from 'react'
import { FiHome, FiBell, FiFileText, FiBookmark, FiUser, FiEdit3 } from 'react-icons/fi'
import styles from './BottomNavigation.module.css'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: FiHome },
    { id: 'applications', label: 'Applications', icon: FiFileText },
    { id: 'create-resume', label: 'Resume', icon: FiEdit3 },
    { id: 'saved', label: 'Saved', icon: FiBookmark },
    { id: 'profile', label: 'Profile', icon: FiUser }
  ]

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const IconComponent = item.icon
        return (
          <button
            key={item.id}
            className={`${styles.navButton} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <IconComponent className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNavigation
