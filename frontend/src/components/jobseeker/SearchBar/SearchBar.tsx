import React, { forwardRef } from 'react'
import { FiSearch } from 'react-icons/fi'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  value,
  onChange,
  placeholder = "Search Jobs, Companies",
  ...props
}, ref) => {
  return (
    <div className={styles.searchBar}>
      <FiSearch className={styles.searchIcon} aria-hidden="true" />
      <input 
        ref={ref}
        type="search" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.searchInput}
        aria-label={placeholder}
        {...props}
      />
    </div>
  )
})

SearchBar.displayName = 'SearchBar';

export default SearchBar
