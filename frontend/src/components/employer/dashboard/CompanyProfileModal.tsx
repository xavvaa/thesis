import React, { useState, useEffect } from 'react';
import { FiX, FiHome, FiMail, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';
import styles from './SettingsModal.module.css';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: CompanyProfileData) => void;
  initialData?: CompanyProfileData;
}

export interface CompanyProfileData {
  companyName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logo?: string;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<CompanyProfileData>({
    companyName: '',
    industry: 'Technology',
    website: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Set default values when no initial data
      setFormData({
        companyName: '',
        industry: 'Technology',
        website: '',
        email: '',
        phone: '',
        address: '',
        description: ''
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CompanyProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <FiHome className={styles.headerIcon} />
            <h2 className={styles.title}>Company Profile</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Industry</label>
                <select
                  className={styles.input}
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  required
                >
                  <option value="Technology">Technology & IT</option>
                  <option value="Business Process Outsourcing">Business Process Outsourcing (BPO)</option>
                  <option value="Healthcare">Healthcare & Medical</option>
                  <option value="Finance">Banking & Finance</option>
                  <option value="Education">Education & Training</option>
                  <option value="Manufacturing">Manufacturing & Production</option>
                  <option value="Retail">Retail & E-commerce</option>
                  <option value="Real Estate">Real Estate & Construction</option>
                  <option value="Tourism">Tourism & Hospitality</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Transportation">Transportation & Logistics</option>
                  <option value="Government">Government & Public Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiGlobe className={styles.inputIcon} />
                  Website
                </label>
                <input
                  type="url"
                  className={styles.input}
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourcompany.ph"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiMail className={styles.inputIcon} />
                  Email
                </label>
                <input
                  type="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiPhone className={styles.inputIcon} />
                  Phone
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiMapPin className={styles.inputIcon} />
                  Address
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Company Description</label>
                <textarea
                  className={styles.textarea}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  placeholder="Describe your company, mission, values, and what makes you a great employer in the Philippines..."
                />
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
