import React, { useMemo, useCallback } from 'react';
import { Applicant } from '@/types/dashboard';
import { Job } from '@/types/Job';
import { FiEye } from 'react-icons/fi';
// import { formatImageSrc, getInitials } from '@/utils/imageUtils';
import styles from './ApplicantListView.module.css';

interface ApplicantListViewProps {
  applicants: Applicant[];
  onViewDetails: (applicant: Applicant) => void;
  jobPostings: Job[]; // All job postings to match applicants to their specific jobs
  selectedJobId?: string; // ID of the selected job for filtering
}

export const ApplicantListView: React.FC<ApplicantListViewProps> = ({
  applicants,
  onViewDetails,
  jobPostings,
  selectedJobId
}) => {
 
  // Temporary inline functions
  const formatImageSrc = (imageData: string | null | undefined): string | undefined => {
    if (!imageData) return undefined;
    if (imageData.startsWith('data:')) return imageData;
    return `data:image/jpeg;base64,${imageData}`;
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  // TF-IDF calculation based on the specific job each applicant applied to
  const calculateTfidfScore = useCallback((applicant: Applicant): number => {
    const applicantSkills = applicant.skills || [];
    if (!applicantSkills || applicantSkills.length === 0) return 0;
    
    // Find the job this applicant applied to
    const appliedJob = jobPostings.find(job => job.id?.toString() === applicant.jobId?.toString());
    if (!appliedJob || !appliedJob.requirements || appliedJob.requirements.length === 0) return 0;
 
    const lowerTarget = appliedJob.requirements.map(s => s.toLowerCase());
    const lowerSkills = applicantSkills.map(s => s.toLowerCase());
 
    // TF: how many applicant skills match the job they applied to
    const matchingSkills = lowerSkills.filter(skill => lowerTarget.includes(skill));
    const tf = matchingSkills.length / applicantSkills.length;
 
    // IDF: give higher weight to matching skills
    const idf = lowerSkills.reduce((sum, skill) => {
      const weight = lowerTarget.includes(skill) ? 2 : 0.5; // Higher weight for matches
      return sum + weight;
    }, 0) / applicantSkills.length;
 
    const score = (tf * idf) * 100;
    return Math.min(100, Math.round(score));
  }, [jobPostings]);
 
  // Precompute TF-IDF scores based on the job each applicant applied to
  const processedApplicants = useMemo(() =>
    applicants.map(applicant => ({
      ...applicant,
      tfidfScore: calculateTfidfScore(applicant)
    }))
    .sort((a, b) => b.tfidfScore - a.tfidfScore)
  , [applicants, jobPostings, calculateTfidfScore]);


  return (
    <div className={styles.listContainer}>
      {jobPostings.length > 0 && (
        <div className={styles.infoBanner}>
          <div className={styles.infoText}>
            <strong>Info:</strong> TF-IDF scores calculated based on the specific job each applicant applied to.
          </div>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: '#10b981' }}></div>
              <span>Matching skills</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Required skills</span>
            </div>
          </div>
        </div>
      )}
      <div className={styles.listHeader}>
        <div className={styles.headerCell}>#</div>
        <div className={styles.headerCell}>Applicant</div>
        <div className={styles.headerCell}>Job Applied For</div>
        <div className={styles.headerCell}>Applicant Skills</div>
        <div className={styles.headerCell}>Required Skills</div>
        <div className={styles.headerCell}>
          Match Score
          <span style={{ fontSize: '0.7em', color: '#666', fontWeight: 'normal' }}>
            (Job-specific match)
          </span>
        </div>
        <div className={styles.headerCell}>View</div>
      </div>

      <div className={styles.listBody}>
        {processedApplicants.length > 0 ? (
          processedApplicants.map((applicant, index) => (
            <div key={applicant.id} className={styles.listRow}>
              <div className={styles.numberCell}>
                <span className={styles.rowNumber}>{index + 1}</span>
              </div>

              <div className={styles.applicantCell}>
                <div className={styles.avatar}>
                  {applicant.avatar ? (
                    <img 
                      src={formatImageSrc(applicant.avatar)} 
                      alt={applicant.name} 
                    />
                  ) : (
                    <span>{getInitials(applicant.name)}</span>
                  )}
                </div>
                <div className={styles.applicantInfo}>
                  <div className={styles.applicantName}>{applicant.name}</div>
                  <div className={styles.applicantPosition}>{applicant.position}</div>
                </div>
              </div>

              <div className={styles.jobCell}>
                {(() => {
                  // Find the job this applicant applied to
                  const appliedJob = jobPostings.find(job => job.id?.toString() === applicant.jobId?.toString());
                  return (
                    <div className={styles.jobInfo}>
                      <div className={styles.jobTitle}>{appliedJob?.title || applicant.jobTitle || 'Unknown Position'}</div>
                      <div className={styles.jobDepartment}>{appliedJob?.department || 'General'}</div>
                    </div>
                  );
                })()}
              </div>

              <div className={styles.skillsCell}>
                {(() => {
                  // Find the job this applicant applied to for skill matching
                  const appliedJob = jobPostings.find(job => job.id?.toString() === applicant.jobId?.toString());
                  const requiredSkills = appliedJob?.requirements || [];
                  const applicantSkills = applicant.skills || [];
                  
                  // Find matching skills for highlighting
                  const lowerRequiredSkills = requiredSkills.map(s => s.toLowerCase());
                  const isSkillMatching = (skill: string) => lowerRequiredSkills.includes(skill.toLowerCase());
                  
                  return applicantSkills.length ? (
                    <div className={styles.skillsList}>
                      {applicantSkills.slice(0, 3).map((skill, i) => (
                        <span 
                          key={i} 
                          className={`${styles.skillTag} ${isSkillMatching(skill) ? styles.matchingSkillTag : ''}`}
                          title={isSkillMatching(skill) ? 'Matches job requirement' : ''}
                        >
                          {skill}
                        </span>
                      ))}
                      {applicantSkills.length > 3 && (
                        <span className={styles.moreSkills}>+{applicantSkills.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <span className={styles.noSkills}>No skills listed</span>
                  );
                })()}
              </div>

              <div className={styles.skillsCell}>
                {(() => {
                  // Find the job this applicant applied to
                  const appliedJob = jobPostings.find(job => job.id?.toString() === applicant.jobId?.toString());
                  const requiredSkills = appliedJob?.requirements || [];
                  const applicantSkills = applicant.skills || [];
                  
                  // Find matching skills for highlighting
                  const lowerApplicantSkills = applicantSkills.map(s => s.toLowerCase());
                  const isRequirementMet = (skill: string) => lowerApplicantSkills.includes(skill.toLowerCase());
                  
                  return requiredSkills.length ? (
                    <div className={styles.skillsList}>
                      {requiredSkills.slice(0, 3).map((skill, i) => (
                        <span 
                          key={i} 
                          className={`${styles.skillTag} ${styles.requiredSkillTag} ${isRequirementMet(skill) ? styles.metRequirementTag : ''}`}
                          title={isRequirementMet(skill) ? 'Applicant has this skill' : 'Applicant missing this skill'}
                        >
                          {skill}
                        </span>
                      ))}
                      {requiredSkills.length > 3 && (
                        <span className={styles.moreSkills}>+{requiredSkills.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <span className={styles.noSkills}>No requirements listed</span>
                  );
                })()}
              </div>

              <div className={styles.matchCell}>
                <div className={styles.matchScore}>
                  <div className={styles.matchBar}>
                    <div className={styles.matchFill} style={{ width: `${applicant.tfidfScore}%` }} />
                  </div>
                  <span className={styles.matchText}>{applicant.tfidfScore}%</span>
                </div>
              </div>

              <div className={styles.actionsCell}>
                <button className={styles.viewButton} onClick={() => onViewDetails(applicant)}>
                  <FiEye className={styles.icon} />
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No applicants found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
