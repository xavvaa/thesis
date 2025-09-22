import React from 'react';
import { ApplicantCard } from './ApplicantCard';
import { SearchAndFilter } from './SearchAndFilter';
import Button from '../ui/Button';
import { FiDownload } from 'react-icons/fi';
import { Applicant } from '@/types/dashboard';

interface ApplicantsTabProps {
  applicants: Applicant[];
  searchTerm: string;
  filters: {
    status: string;
    department: string;
    location: string;
  };
  onSearchChange: (term: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onAcceptApplicant: (applicantId: number) => void;
  onRejectApplicant: (applicantId: number) => void;
  onViewResume: (resumeUrl: string) => void;
  onExport?: () => void;
}

export const ApplicantsTab: React.FC<ApplicantsTabProps> = ({
  applicants,
  searchTerm,
  filters,
  onSearchChange,
  onFilterChange,
  onAcceptApplicant,
  onRejectApplicant,
  onViewResume,
  onExport,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Applicants</h2>
        <Button variant="outline" onClick={onExport}>
          <FiDownload className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        filters={filters}
      />

      <div className="space-y-4">
        {applicants.length > 0 ? (
          applicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onAccept={onAcceptApplicant}
              onReject={onRejectApplicant}
              onViewResume={onViewResume}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No applicants found.</p>
          </div>
        )}
      </div>
    </div>
  );
};