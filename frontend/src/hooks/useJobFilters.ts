import { useState, useMemo } from 'react';
import { JobPosting } from '@/types/dashboard';

interface JobFilters {
  status: string;
  department: string;
  location: string;
}

export const useJobFilters = (jobs: JobPosting[]) => {
  const [filters, setFilters] = useState<JobFilters>({
    status: '',
    department: '',
    location: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesDepartment = !filters.department || job.department === filters.department;
      const matchesLocation = !filters.location || job.location === filters.location;

      return matchesSearch && matchesStatus && matchesDepartment && matchesLocation;
    });
  }, [jobs, searchTerm, filters]);

  const clearFilters = () => {
    setFilters({
      status: '',
      department: '',
      location: '',
    });
    setSearchTerm('');
  };

  return {
    filteredJobs,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilters,
  };
};
