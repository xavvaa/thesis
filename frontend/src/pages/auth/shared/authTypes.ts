export interface FormErrors {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  middleName?: string
  companyName?: string
  confirmPassword?: string
  resume?: string
  documents?: string
  general?: string
  terms?: string
  privacy?: string
  form?: string
  companyProfile?: string
  businessPermit?: string
  philjobnetRegistration?: string
  doleNoPendingCase?: string
  contactPersonFirstName?: string
  contactPersonLastName?: string
  contactNumber?: string
  companyDescription?: string
  companyAddress?: string
  natureOfBusiness?: string
}

export interface DocumentUpload {
  file: File | null
  uploaded: boolean
}

export interface EmployerDocuments {
  companyProfile: DocumentUpload
  businessPermit: DocumentUpload
  philjobnetRegistration: DocumentUpload
  doleNoPendingCase: DocumentUpload
}

export interface BaseFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface JobseekerFormData extends BaseFormData {
  firstName: string
  lastName: string
  middleName: string
}

export interface EmployerFormData extends BaseFormData {
  companyName: string
}

export interface CompanyDetails {
  contactPersonFirstName: string
  contactPersonLastName: string
  contactNumber: string
  companyDescription: string
  companyAddress: string
  natureOfBusiness: string
}
