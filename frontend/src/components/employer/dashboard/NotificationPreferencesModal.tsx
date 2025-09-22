import React, { useState } from 'react';
import { FiX, FiBell, FiMail, FiSmartphone } from 'react-icons/fi';
import styles from './SettingsModal.module.css';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => void;
  initialData?: NotificationPreferences;
}

export interface NotificationPreferences {
  email: {
    newApplications: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
    weeklyReports: boolean;
  };
  push: {
    newApplications: boolean;
    urgentUpdates: boolean;
    systemAlerts: boolean;
  };
  sms: {
    urgentOnly: boolean;
    interviewReminders: boolean;
  };
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialData || {
      email: {
        newApplications: true,
        applicationUpdates: true,
        interviewReminders: true,
        weeklyReports: false
      },
      push: {
        newApplications: true,
        urgentUpdates: true,
        systemAlerts: false
      },
      sms: {
        urgentOnly: false,
        interviewReminders: true
      }
    }
  );

  if (!isOpen) return null;

  const handleToggle = (category: keyof NotificationPreferences, setting: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(preferences);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <FiBell className={styles.headerIcon} />
            <h2 className={styles.title}>Notification Settings</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Email Notifications */}
            <div className={styles.formGroupFull}>
              <label className={styles.label}>
                <FiMail className={styles.inputIcon} />
                Email Notifications
              </label>
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.email.newApplications ? styles.checked : ''}`}
                    onClick={() => handleToggle('email', 'newApplications')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>New Job Applications</h4>
                    <p className={styles.checkboxDescription}>Receive updates when candidates update their application status</p>
                  </div>
                </div>

                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.email.applicationUpdates ? styles.checked : ''}`}
                    onClick={() => handleToggle('email', 'applicationUpdates')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>Application Updates</h4>
                    <p className={styles.checkboxDescription}>
                      Receive updates when applicants modify their applications
                    </p>
                  </div>
                </div>

                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.email.interviewReminders ? styles.checked : ''}`}
                    onClick={() => handleToggle('email', 'interviewReminders')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>Interview Reminders</h4>
                    <p className={styles.checkboxDescription}>
                      Get reminded about upcoming interviews 24 hours in advance
                    </p>
                  </div>
                </div>

                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.email.weeklyReports ? styles.checked : ''}`}
                    onClick={() => handleToggle('email', 'weeklyReports')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>Weekly Reports</h4>
                    <p className={styles.checkboxDescription}>
                      Receive weekly summaries of your hiring activity
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className={styles.formGroupFull}>
              <label className={styles.label}>
                <FiSmartphone className={styles.inputIcon} />
                Push Notifications
              </label>
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.push.newApplications ? styles.checked : ''}`}
                    onClick={() => handleToggle('push', 'newApplications')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>New Applications</h4>
                    <p className={styles.checkboxDescription}>
                      Instant notifications for new job applications
                    </p>
                  </div>
                </div>

                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.push.urgentUpdates ? styles.checked : ''}`}
                    onClick={() => handleToggle('push', 'urgentUpdates')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>Urgent Updates</h4>
                    <p className={styles.checkboxDescription}>
                      Critical notifications that require immediate attention
                    </p>
                  </div>
                </div>

                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.push.systemAlerts ? styles.checked : ''}`}
                    onClick={() => handleToggle('push', 'systemAlerts')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>System Alerts</h4>
                    <p className={styles.checkboxDescription}>
                      Notifications about system maintenance and updates
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className={styles.formGroupFull}>
              <label className={styles.label}>
                <FiSmartphone className={styles.inputIcon} />
                SMS Notifications
              </label>
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.sms.urgentOnly ? styles.checked : ''}`}
                    onClick={() => handleToggle('sms', 'urgentOnly')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>Urgent Only</h4>
                    <p className={styles.checkboxDescription}>
                      Only receive SMS for critical updates and emergencies
                    </p>
                  </div>
                </div>

                <div className={styles.checkboxItem}>
                  <div 
                    className={`${styles.checkbox} ${preferences.sms.interviewReminders ? styles.checked : ''}`}
                    onClick={() => handleToggle('sms', 'interviewReminders')}
                  />
                  <div className={styles.checkboxContent}>
                    <h4 className={styles.checkboxTitle}>Interview Reminders</h4>
                    <p className={styles.checkboxDescription}>
                      SMS reminders for upcoming interviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
