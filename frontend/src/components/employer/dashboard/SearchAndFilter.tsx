import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import Button from '../ui/Button';
import styles from './SearchAndFilter.module.css';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterChange?: (filterType: string, value: string) => void;
  filters?: {
    status: string;
    department: string;
    location: string;
  };
  onFilterClick?: () => void;
  showFilters?: boolean;
  onClearFilters?: () => void;
  activeFiltersCount?: number;
  placeholder?: string;
}

const filterOptions = {
  status: [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ],
  department: [
    { value: '', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' }
  ],
  location: [
    { value: '', label: 'All Locations' },
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
  ]
};

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  onFilterChange,
  filters = { status: '', department: '', location: '' },
  placeholder = 'Search applicants...',
}) => {

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  const handleFilterChange = (filterType: string, value: string) => {
    if (onFilterChange) {
      onFilterChange(filterType, value);
    }
  };

  const clearAllFilters = () => {
    if (onFilterChange) {
      onFilterChange('status', '');
      onFilterChange('department', '');
      onFilterChange('location', '');
    }
  };

  return (
    <div className={styles.searchAndFilter}>
      <div className={styles.searchContainer}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder={placeholder}
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button className={styles.clearButton} onClick={() => onSearchChange('')}>
            <FiX />
          </button>
        )}
      </div>
      
      <div className={styles.filtersRow}>
        {/* Status Filter */}
        <div className={styles.filterDropdown}>
          <select
            className={`${styles.filterSelect} ${filters.status ? styles.hasValue : ''}`}
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {filterOptions.status.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div className={styles.filterDropdown}>
          <select
            className={`${styles.filterSelect} ${filters.department ? styles.hasValue : ''}`}
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            {filterOptions.department.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className={styles.filterDropdown}>
          <select
            className={`${styles.filterSelect} ${filters.location ? styles.hasValue : ''}`}
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            {filterOptions.location.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear All Button */}
        {activeFiltersCount > 0 && (
          <button className={styles.clearAllButton} onClick={clearAllFilters}>
            <FiX className={styles.clearIcon} />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};
