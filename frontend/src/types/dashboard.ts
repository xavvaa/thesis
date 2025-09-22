export type StatusType = 'info' | 'success' | 'danger' | 'warning';
export type PriorityUrgency = 'high' | 'medium' | 'low';

export interface JobPosting {
  id: number;
  title: string;
  location: string;
  type: string;
  applicants: number;
  posted: string;
  postedDate?: string;
  status: string;
  salary?: string;
  views?: number;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  urgency?: PriorityUrgency;
  matchQuality?: number;
  department: string;
  remote?: boolean;
  applicantCount?: number;
}

export interface Applicant {
  id: number;
  name: string;
  position: string;
  status: string;
  date: string;
  match: number;
  matchPercentage?: number;
  experience: string;
  skills: string[];
  email?: string;
  phone?: string;
  resumeUrl: string;
  statusType?: StatusType;
  priority?: PriorityUrgency;
  jobTitle?: string;
  jobId?: string;
  appliedDate: string;
  matchScore: number;
  lastActivity?: string;
  avatar?: string;
  location?: string;
  salary?: string;
  expectedSalary?: string;
}

export interface Employer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  industry?: string;
  companySize?: string;
}

export interface StatItem {
  id: number;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
}
