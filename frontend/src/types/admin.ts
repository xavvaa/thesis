export interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;
  totalJobs: number;
  totalApplications: number;
  pendingEmployers: number;
  activeJobs: number;
  recentApplications: number;
}

export interface AdminUser {
  _id?: string;
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  adminName: string;
  adminLevel?: string;
  department?: string;
  permissions?: string[];
  isActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface EmployerDocument {
  _id: string;
  employerId: string;
  employerUid: string;
  documentType: 'business_permit' | 'dti_registration' | 'bir_certificate' | 'sec_certificate' | 'mayor_permit' | 'barangay_clearance' | 'other';
  documentName: string;
  cloudUrl: string; // Cloud storage URL (Cloudinary)
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'requires_resubmission';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  isRequired: boolean;
  expiryDate?: string;
  documentNumber?: string;
  // Employer info for pending documents
  employerInfo?: {
    _id: string;
    companyName: string;
    email: string;
    profilePicture?: string;
  };
}

export interface CompanyDetails {
  companyName: string;
  companyDescription?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
}

export interface ContactPerson {
  firstName?: string;
  lastName?: string;
  position?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Address {
  street?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  country?: string;
}

export interface SocialMedia {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

export interface PendingEmployer {
  _id: string;
  userId: {
    email: string;
    companyName: string;
    createdAt: string;
    profilePicture?: string;
  };
  accountStatus: string;
  verificationNotes?: string;
  verifiedAt?: string;
  // Full company information
  companyDetails: CompanyDetails;
  contactPerson: ContactPerson;
  address: Address;
  socialMedia: SocialMedia;
  benefits: string[];
  companyValues: string[];
  workEnvironment?: string;
  // Documents and verification
  documents: EmployerDocument[];
  documentVerificationStatus: string;
  documentVerifiedAt?: string;
  documentRejectionReason?: string;
  // Profile status
  profileComplete: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  businessPermitUrl?: string;
  dtiRegistrationUrl?: string;
  profilePicture?: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  status: string;
  createdAt: string;
  employerUid: {
    companyName: string;
    email: string;
  };
}

export interface AdminFormData {
  email: string;
  password: string;
  adminLevel?: string;
}

export type AdminTab = 'overview' | 'employer-verification' | 'job-postings' | 'employers' | 'jobseekers' | 'compliance' | 'skills-analytics' | 'generate-reports' | 'admin-management' | 'settings' | 'analytics' | 'jobs' | 'users' | 'admins' | 'reports';
