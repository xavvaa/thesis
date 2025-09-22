import React, { useState } from 'react';
import { EmployerDocument } from '../../types/admin';
import { 
  HiDocumentText, 
  HiCheck, 
  HiX, 
  HiEye, 
  HiDownload,
  HiExclamation,
  HiClock
} from 'react-icons/hi';
import './DocumentViewer.css';

interface DocumentViewerProps {
  documents: EmployerDocument[];
  loading?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  loading = false
}) => {

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'companyProfile': 'Company Profile',
      'businessPermit': 'Business Permit',
      'philjobnetRegistration': 'PhilJobNet Registration',
      'doleNoPendingCase': 'DOLE No Pending Case Certificate',
      'other': 'Other Document'
    };
    return labels[type] || (type ? type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : 'Unknown Document');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <HiCheck className="status-icon approved" />;
      case 'rejected':
        return <HiX className="status-icon rejected" />;
      case 'requires_resubmission':
        return <HiExclamation className="status-icon resubmission" />;
      default:
        return <HiClock className="status-icon pending" />;
    }
  };

  const getStatusClass = (status: string) => {
    return `status-badge ${status}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  const openDocument = (url: string) => {
    console.log('🔗 Original URL from backend:', url);
    
    // Check if URL already has protocol
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = `http://localhost:3001/${url}`;
    }
    
    console.log('🔗 Final URL being opened:', fullUrl);
    
    // Test the URL first
    fetch(fullUrl, { method: 'HEAD' })
      .then(response => {
        console.log('📡 Document check status:', response.status);
        console.log('📡 Response headers:', response.headers);
        if (response.ok) {
          console.log('✅ Document accessible, opening...');
          window.open(fullUrl, '_blank');
        } else {
          console.error('❌ Document not accessible:', response.status);
          alert(`Document not accessible (Status: ${response.status}). Check console for details.`);
        }
      })
      .catch(error => {
        console.error('❌ Error checking document:', error);
        console.log('🔄 Trying to open anyway...');
        window.open(fullUrl, '_blank');
      });
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="no-documents">
        <HiDocumentText className="no-docs-icon" />
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <div className="document-header">
        <h3>Document Status Overview</h3>
        <p>View document verification status and details</p>
      </div>

      <div className="documents-grid">
        {documents.map((document, index) => (
          <div key={document._id || index} className={`document-card ${document.verificationStatus || 'pending'}`}>
            <div className="document-card-header">
              <div className="document-status">
                {getStatusIcon(document.verificationStatus || 'pending')}
                <span className={getStatusClass(document.verificationStatus || 'pending')}>
                  {(document.verificationStatus || 'pending').replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="document-info">
              <h4 className="document-type">{getDocumentTypeLabel(document.documentType || '')}</h4>
              <p className="document-name">{document.documentName || 'Unknown Document'}</p>
              <div className="document-meta">
                <span className="file-size">{formatFileSize(document.fileSize || 0)}</span>
                <span className="upload-date">
                  Uploaded: {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              
              {document.documentNumber && (
                <p className="document-number">Ref: {document.documentNumber}</p>
              )}
              
              {document.expiryDate && (
                <p className="expiry-date">
                  Expires: {new Date(document.expiryDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="document-actions">
              <button
                className="action-btn view"
                onClick={() => openDocument(document.documentUrl || '')}
                title="View Document"
                disabled={!document.documentUrl}
              >
                <HiEye />
              </button>
              
              <button
                className="action-btn download"
                onClick={() => {
                  console.log('📥 Original download URL:', document.documentUrl);
                  
                  if (!document.documentUrl) {
                    alert('Document URL not available');
                    return;
                  }
                  
                  // Fix URL format same as view function
                  let fullUrl = document.documentUrl;
                  if (!document.documentUrl.startsWith('http')) {
                    fullUrl = `http://localhost:3001/${document.documentUrl}`;
                  }
                  
                  console.log('📥 Final download URL:', fullUrl);
                  
                  const link = window.document.createElement('a');
                  link.href = fullUrl;
                  link.download = document.documentName || 'document';
                  link.setAttribute('target', '_blank');
                  window.document.body.appendChild(link);
                  link.click();
                  window.document.body.removeChild(link);
                }}
                title="Download Document"
                disabled={!document.documentUrl}
              >
                <HiDownload />
              </button>
            </div>

            {document.rejectionReason && (
              <div className="rejection-reason">
                <strong>Rejection Reason:</strong> {document.rejectionReason}
              </div>
            )}

            {document.adminNotes && (
              <div className="admin-notes">
                <strong>Admin Notes:</strong> {document.adminNotes}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default DocumentViewer;
