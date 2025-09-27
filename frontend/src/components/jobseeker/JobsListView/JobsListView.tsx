import React from 'react';
import { FiMapPin, FiClock, FiBookmark, FiEye, FiBriefcase, FiTag } from 'react-icons/fi';
import { Job } from '../../../types/Job';
import styles from './JobsListView.module.css';

interface JobsListViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onSaveJob?: (jobId: string | number) => void;
  onApplyJob?: (jobId: string | number) => void;
  savedJobs?: Set<string | number>;
  appliedJobs?: Set<string | number>;
  jobseekerSkills?: string[]; // Skills from jobseeker's resume
}

export const JobsListView: React.FC<JobsListViewProps> = ({
  jobs,
  onJobClick,
  onSaveJob,
  onApplyJob,
  savedJobs = new Set(),
  appliedJobs = new Set(),
  jobseekerSkills = [],
}) => {
  // TF-IDF calculation for jobseeker side
  const calculateMatchScore = (job: Job): number => {
    if (!jobseekerSkills || jobseekerSkills.length === 0) return 0;
    if (!job.requirements || job.requirements.length === 0) return 0;
    
    const lowerJobRequirements = job.requirements.map(s => s.toLowerCase());
    const lowerJobseekerSkills = jobseekerSkills.map(s => s.toLowerCase());
    
    // Find matching skills
    const matchingSkills = lowerJobseekerSkills.filter(skill => lowerJobRequirements.includes(skill));
    
    // TF: how many jobseeker skills match job requirements
    const tf = matchingSkills.length / jobseekerSkills.length;
    
    // IDF: give higher weight to matching skills
    const idf = lowerJobseekerSkills.reduce((sum, skill) => {
      const weight = lowerJobRequirements.includes(skill) ? 2 : 0.5;
      return sum + weight;
    }, 0) / jobseekerSkills.length;
    
    const score = (tf * idf) * 100;
    return Math.min(100, Math.round(score));
  };

  const formatSalary = (salary: string | number | undefined) => {
    if (!salary) return 'Salary not specified';
    return String(salary);
  };

  const formatLocation = (location: string | undefined) => {
    if (!location) return 'Location not specified';
    return location;
  };

  const formatJobType = (type: string | undefined) => {
    if (!type) return 'Full-time';
    return type;
  };

  const getCompanyInitials = (company: string) => {
    return company
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };


  if (jobs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {(!jobseekerSkills || jobseekerSkills.length === 0) && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '4px', 
          marginBottom: '16px',
          color: '#856404'
        }}>
          <strong>💡 Tip:</strong> Add skills to your resume to see accurate job matching scores based on your qualifications.
        </div>
      )}
      <div className={styles.listHeader}>
        <div className={styles.headerCell}>#</div>
        <div className={styles.headerCell}>Company Name</div>
        <div className={styles.headerCell}>Required Skills</div>
        <div className={styles.headerCell}>Your Skills</div>
        <div className={styles.headerCell}>
          Match Score
          {(!jobseekerSkills || jobseekerSkills.length === 0) && (
            <span style={{ fontSize: '0.7em', color: '#666', fontWeight: 'normal' }}>
              (No skills in resume)
            </span>
          )}
        </div>
        <div className={styles.headerCell}>Action</div>
      </div>
      
      <div className={styles.listBody}>
        {jobs
          .map(job => ({ ...job, matchScore: calculateMatchScore(job) }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .map((job, index) => {
          const matchScore = job.matchScore;
          // Use the full string ID for MongoDB ObjectIds, or convert to number for numeric IDs
          const jobId = typeof job.id === 'string' && job.id.length > 10 ? job.id : (typeof job.id === 'string' ? parseInt(job.id) : job.id);
          const isSaved = savedJobs.has(jobId);
          const isApplied = appliedJobs.has(jobId);

          return (
            <div key={job.id} className={styles.listRow}>
              <div className={styles.numberCell}>
                <span className={styles.rowNumber}>{index + 1}</span>
              </div>
              
              <div className={styles.companyCell}>
                <div className={styles.avatar}>
                  <span>{getCompanyInitials(job.company)}</span>
                </div>
                <div className={styles.companyInfo}>
                  <div className={styles.companyName}>{job.company}</div>
                  <div className={styles.jobTitle}>{job.title}</div>
                </div>
              </div>
              
              <div className={styles.skillsCell}>
                {job.requirements && job.requirements.length > 0 ? (
                  <div className={styles.skillsList}>
                    {job.requirements.slice(0, 3).map((skill, i) => (
                      <span key={i} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span className={styles.moreSkills}>+{job.requirements.length - 3} more</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.noSkills}>No requirements listed</span>
                )}
              </div>
              
              <div className={styles.skillsCell}>
                {jobseekerSkills && jobseekerSkills.length > 0 ? (
                  <div className={styles.skillsList}>
                    {jobseekerSkills.slice(0, 3).map((skill, i) => (
                      <span key={i} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {jobseekerSkills.length > 3 && (
                      <span className={styles.moreSkills}>+{jobseekerSkills.length - 3} more</span>
                    )}
                  </div>
                ) : (
                  <span className={styles.noSkills}>No skills in resume</span>
                )}
              </div>
              
              <div className={styles.matchCell}>
                <div className={styles.matchScore}>
                  <div className={styles.matchBar}>
                    <div 
                      className={styles.matchFill} 
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  <span className={styles.matchText}>{matchScore}%</span>
                </div>
              </div>
              
              <div className={styles.actionsCell}>
              {onSaveJob && (
                  <button
                    onClick={() => onSaveJob(jobId)}
                    className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                    title={isSaved ? "Remove from saved" : "Save job"}
                  >
                    <FiBookmark className={styles.icon} />
                  </button>
                )}
                
                <button
                  className={styles.viewButton}
                  onClick={() => onJobClick(job)}
                >
                  <FiEye className={styles.icon} />
                  View Details
                </button>
               
                {onApplyJob && (
                  <button
                    onClick={() => !isApplied && onApplyJob(jobId)}
                    className={`${styles.applyButton} ${isApplied ? styles.applied : ''}`}
                    title={isApplied ? "Already applied" : "Apply to this job"}
                    disabled={isApplied}
                  >
                    <FiBriefcase className={styles.icon} />
                    {isApplied ? 'Applied' : 'Apply'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
