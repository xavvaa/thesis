import React from 'react';
import { ApplicantListView } from './ApplicantListView';
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
  onViewDetails: (applicant: Applicant) => void;
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
  onViewDetails,
  onExport,
}) => {
  return (
    <div className="p-8">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Applicants</h1>
          <p className="text-gray-600">Review and manage candidate applications</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-12">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onFilterChange={onFilterChange}
            filters={filters}
          />
        </div>

        {/* Applicants List */}
        <ApplicantListView
          applicants={applicants}
          onViewDetails={onViewDetails}
        />
      </div>
    </div>
  );
};