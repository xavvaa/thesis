import React from 'react'
import { FiX, FiMapPin } from 'react-icons/fi'
import styles from './FilterModal.module.css'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
}

interface FilterOptions {
  lastUpdate: string
  workplaceType: string
  jobType: string[]
  positionLevel: string[]
  location: {
    withinKm: number
    nearMe: boolean
    withinCountry: boolean
    international: boolean
    remote: boolean
  }
  salary: {
    min: number
    max: number
  }
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [filters, setFilters] = React.useState<FilterOptions>({
    lastUpdate: '',
    workplaceType: '',
    jobType: [],
    positionLevel: [],
    location: {
      withinKm: 10,
      nearMe: false,
      withinCountry: false,
      international: false,
      remote: false
    },
    salary: {
      min: 20000,
      max: 50000
    }
  })

  if (!isOpen) return null

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      lastUpdate: '',
      workplaceType: '',
      jobType: [],
      positionLevel: [],
      location: {
        withinKm: 10,
        nearMe: false,
        withinCountry: false,
        international: false,
        remote: false
      },
      salary: {
        min: 0,
        max: 50000
      }
    })
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onClose}>
            <FiX />
          </button>
          <h2 className={styles.title}>Filter</h2>
          <div></div>
        </div>

        <div className={styles.content}>
          {/* Last Update */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Last update</h3>
            <div className={styles.radioGroup}>
              {['Recent', 'Last week', 'Last month', 'Any time'].map((option) => (
                <label key={option} className={styles.radioOption}>
                  <input
                    type="radio"
                    name="lastUpdate"
                    value={option}
                    checked={filters.lastUpdate === option}
                    onChange={(e) => setFilters({...filters, lastUpdate: e.target.value})}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type of workplace */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Type of workplace</h3>
            <div className={styles.radioGroup}>
              {['On-site', 'Hybrid', 'Remote'].map((option) => (
                <label key={option} className={styles.radioOption}>
                  <input
                    type="radio"
                    name="workplaceType"
                    value={option}
                    checked={filters.workplaceType === option}
                    onChange={(e) => setFilters({...filters, workplaceType: e.target.value})}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Job type */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Job type</h3>
            <div className={styles.chipGroup}>
              {['Internship', 'Part-time', 'Full-time', 'Contract'].map((option) => (
                <button
                  key={option}
                  className={`${styles.chip} ${filters.jobType.includes(option) ? styles.chipActive : ''}`}
                  onClick={() => {
                    const newJobTypes = filters.jobType.includes(option)
                      ? filters.jobType.filter(t => t !== option)
                      : [...filters.jobType, option]
                    setFilters({...filters, jobType: newJobTypes})
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Position level */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Position level</h3>
            <div className={styles.chipGroup}>
              {['Junior', 'Senior', 'Leader', 'Manager'].map((option) => (
                <button
                  key={option}
                  className={`${styles.chip} ${filters.positionLevel.includes(option) ? styles.chipActive : ''}`}
                  onClick={() => {
                    const newLevels = filters.positionLevel.includes(option)
                      ? filters.positionLevel.filter(l => l !== option)
                      : [...filters.positionLevel, option]
                    setFilters({...filters, positionLevel: newLevels})
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.locationOptions}>
              <div className={styles.rangeContainer}>
                <div className={styles.rangeValueDisplay}>
                  <span>Within {filters.location.withinKm}km</span>
                </div>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={filters.location.withinKm}
                    onChange={(e) => setFilters({
                      ...filters,
                      location: {...filters.location, withinKm: parseInt(e.target.value)}
                    })}
                    className={styles.rangeSlider}
                  />
                  <div className={styles.sliderTrack}></div>
                </div>
              </div>
              
              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={filters.location.nearMe}
                  onChange={(e) => setFilters({
                    ...filters, 
                    location: {...filters.location, nearMe: e.target.checked}
                  })}
                />
                <span>Near Me</span>
              </label>

              {['Within the Country', 'International / Global', 'Remote / Work from Home'].map((option, index) => {
                const key = ['withinCountry', 'international', 'remote'][index] as keyof typeof filters.location
                return (
                  <label key={option} className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={filters.location[key] as boolean}
                      onChange={(e) => setFilters({
                        ...filters,
                        location: {...filters.location, [key]: e.target.checked}
                      })}
                    />
                    <span>{option}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Salary */}
          <div className={styles.filterSection}>
            <h3 className={styles.sectionTitle}>Monthly Salary</h3>
            <div className={styles.rangeContainer}>
              <div className={styles.rangeValueDisplay}>
                <div>₱{filters.salary.min.toLocaleString('en-PH')}</div>
                <span>-</span>
                <div>₱{filters.salary.max.toLocaleString('en-PH')}</div>
              </div>
              <div className={styles.dualRangeSlider}>
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="5000"
                  value={filters.salary.min}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin <= filters.salary.max) {
                      setFilters({
                        ...filters,
                        salary: { ...filters.salary, min: newMin }
                      });
                    }
                  }}
                  className={styles.rangeSlider}
                />
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="5000"
                  value={filters.salary.max}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax >= filters.salary.min) {
                      setFilters({
                        ...filters,
                        salary: { ...filters.salary, max: newMax }
                      });
                    }
                  }}
                  className={styles.rangeSlider}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.resetButton} onClick={handleReset}>
            Reset
          </button>
          <button className={styles.applyButton} onClick={handleApply}>
            APPLY CHANGES
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal
