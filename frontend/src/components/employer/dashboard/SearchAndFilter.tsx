import React from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
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

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
  showFilters = false,
  onClearFilters,
  activeFiltersCount = 0,
  placeholder = 'Search...',
}) => {
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
      <div className={styles.filterContainer}>
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterClick}
          className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
        >
          <FiFilter className={styles.filterIcon} />
          Filters
          {activeFiltersCount > 0 && (
            <span className={styles.filterBadge}>{activeFiltersCount}</span>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};
