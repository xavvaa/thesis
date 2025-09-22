import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiFileText, FiCheck, FiAlertCircle, FiBriefcase } from 'react-icons/fi';
import styles from './SettingsModal.module.css';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DocumentsData) => void;
}

interface DocumentsData {
  companyProfile: File | null;
  businessPermit: File | null;
  philjobnetRegistration: File | null;
  doleNoPendingCase: File | null;
}

interface ExistingDocument {
  name: string;
  uploadDate: string;
  size: string;
  url: string;
  verificationStatus?: string;
}

interface BackendDocument {
  documentType: string;
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
  verificationStatus?: string;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [documents, setDocuments] = useState<DocumentsData>({
    companyProfile: null,
    businessPermit: null,
    philjobnetRegistration: null,
    doleNoPendingCase: null
  });

  const [uploadStatus, setUploadStatus] = useState<{[key: string]: 'idle' | 'uploading' | 'success' | 'error'}>({});
  const [existingDocuments, setExistingDocuments] = useState<{[key: string]: ExistingDocument}>({});
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Load existing documents from backend
  useEffect(() => {
    if (isOpen) {
      loadExistingDocuments();
    }
  }, [isOpen]);

  const loadExistingDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const { auth } = require('../../../config/firebase');
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        const response = await fetch('http://localhost:3001/api/employers/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const employer = data.data;
          
          // Convert backend documents to frontend format
          const documentsMap: {[key: string]: ExistingDocument} = {};
          
          if (employer.documents && employer.documents.length > 0) {
            employer.documents.forEach((doc: BackendDocument) => {
              documentsMap[doc.documentType] = {
                name: doc.documentName,
                uploadDate: doc.uploadedAt,
                size: 'Unknown', // Backend doesn't store file size
                url: `http://localhost:3001/${doc.documentUrl}`,
                verificationStatus: doc.verificationStatus || employer.documentVerificationStatus
              };
            });
          }
          
          setExistingDocuments(documentsMap);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const documentTypes = [
    {
      key: 'companyProfile',
      label: 'Company Profile',
      description: 'Comprehensive company profile including business overview and operations',
      required: true
    },
    {
      key: 'businessPermit',
      label: 'Business Permit',
      description: 'Valid business permit from your local government unit',
      required: true
    },
    {
      key: 'philjobnetRegistration',
      label: 'PhilJobNet Registration',
      description: 'Official registration certificate from PhilJobNet (DOLE online job portal)',
      required: true
    },
    {
      key: 'doleNoPendingCase',
      label: 'DOLE No Pending Case Certificate',
      description: 'Certificate from Department of Labor and Employment confirming no pending labor cases',
      required: true
    }
  ];

  const handleFileUpload = (key: string, file: File) => {
    setUploadStatus(prev => ({ ...prev, [key]: 'uploading' }));
    
    // Simulate upload process
    setTimeout(() => {
      setDocuments(prev => ({ ...prev, [key]: file }));
      setUploadStatus(prev => ({ ...prev, [key]: 'success' }));
    }, 1500);
  };

  const handleFileChange = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - PDF only
      if (file.type !== 'application/pdf') {
        setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
        return;
      }
      
      // Validate file size (max 10MB for PDFs)
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
        return;
      }
      
      handleFileUpload(key, file);
    }
  };

  const handleSave = () => {
    onSave(documents);
    onClose();
  };

  const getStatusIcon = (key: string) => {
    const status = uploadStatus[key];
    switch (status) {
      case 'uploading':
        return <div className={styles.spinner} />;
      case 'success':
        return <FiCheck className={styles.successIcon} />;
      case 'error':
        return <FiAlertCircle className={styles.errorIcon} />;
      default:
        return <FiUpload />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContainer} ${styles.documentsModalContainer}`}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <FiBriefcase className={styles.headerIcon} />
            <h2 className={styles.title}>Company Documents</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDescription}>
            Update your company's legal documents and certificates. These documents are required for account verification and compliance with Philippine business regulations.
          </p>

          <div className={styles.uploadNotes}>
            <h4>Upload Requirements:</h4>
            <ul>
              <li>Accepted format: PDF files only</li>
              <li>Maximum file size: 10MB per document</li>
              <li>Documents must be clear and readable</li>
              <li>You can view existing documents before updating them</li>
            </ul>
          </div>

          <div className={styles.documentsGrid}>
            {documentTypes.map((docType) => (
              <div key={docType.key} className={styles.documentCard}>
                <div className={styles.documentHeader}>
                  <h3 className={styles.documentTitle}>
                    {docType.label}
                    {docType.required && <span className={styles.required}>*</span>}
                  </h3>
                  <div className={styles.documentStatus}>
                    {getStatusIcon(docType.key)}
                  </div>
                </div>
                
                <p className={styles.documentDescription}>{docType.description}</p>
                
                {/* Existing Document Preview */}
                {isLoadingDocuments ? (
                  <div className={styles.loadingDocument}>
                    <div className={styles.spinner} />
                    <span>Loading documents...</span>
                  </div>
                ) : existingDocuments[docType.key] && !documents[docType.key as keyof DocumentsData] ? (
                  <div className={styles.existingDocument}>
                    <div className={styles.documentPreview}>
                      <FiFileText className={styles.pdfIcon} />
                      <div className={styles.documentInfo}>
                        <div className={styles.documentName}>{existingDocuments[docType.key].name}</div>
                        <div className={styles.documentMeta}>
                          Uploaded: {new Date(existingDocuments[docType.key].uploadDate).toLocaleDateString('en-PH')}
                          {existingDocuments[docType.key].verificationStatus && (
                            <span className={`${styles.verificationStatus} ${styles[existingDocuments[docType.key].verificationStatus || '']}`}>
                              • {existingDocuments[docType.key].verificationStatus?.charAt(0).toUpperCase() + existingDocuments[docType.key].verificationStatus?.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <a 
                        href={existingDocuments[docType.key].url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.viewButton}
                      >
                        View PDF
                      </a>
                    </div>
                  </div>
                ) : !isLoadingDocuments && (
                  <div className={styles.noDocument}>
                    <FiFileText className={styles.noDocIcon} />
                    <span>No document uploaded yet</span>
                  </div>
                )}

                <div className={styles.uploadArea}>
                  <input
                    type="file"
                    id={`file-${docType.key}`}
                    accept=".pdf"
                    onChange={(e) => handleFileChange(docType.key, e)}
                    className={styles.fileInput}
                  />
                  <label htmlFor={`file-${docType.key}`} className={styles.uploadButton}>
                    <FiUpload />
                    {documents[docType.key as keyof DocumentsData] 
                      ? 'Replace Document' 
                      : existingDocuments[docType.key]
                        ? 'Update Document'
                        : 'Upload Document'
                    }
                  </label>
                  
                  {documents[docType.key as keyof DocumentsData] && (
                    <div className={styles.fileName}>
                      {(documents[docType.key as keyof DocumentsData] as File)?.name}
                    </div>
                  )}
                </div>

                {uploadStatus[docType.key] === 'error' && (
                  <div className={styles.errorMessage}>
                    Invalid file type or size. Please upload PDF files under 10MB only.
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            Save Documents
          </button>
        </div>
      </div>
    </div>
  );
};
