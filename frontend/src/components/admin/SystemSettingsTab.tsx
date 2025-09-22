import React from 'react';
import { FiSettings, FiDownload } from 'react-icons/fi';
import { HiDatabase } from 'react-icons/hi';

interface SystemMetrics {
  serverUptime: string;
  databaseSize: string;
  activeConnections: number;
  memoryUsage: string;
  diskUsage: string;
}

interface SystemSettingsTabProps {
  systemMetrics?: SystemMetrics;
  onBackupDatabase?: () => void;
  onSystemMaintenance?: () => void;
}

const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({
  systemMetrics,
  onBackupDatabase,
  onSystemMaintenance
}) => {
  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>System Settings</h2>
        <p>System configuration and maintenance</p>
      </div>

      <div className="system-sections">
        <div className="system-metrics">
          <h3>System Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <HiDatabase />
              <div>
                <h4>Database Size</h4>
                <p>{systemMetrics?.databaseSize || 'N/A'}</p>
              </div>
            </div>
            <div className="metric-card">
              <FiSettings />
              <div>
                <h4>Server Uptime</h4>
                <p>{systemMetrics?.serverUptime || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="system-actions">
          <h3>System Actions</h3>
          <div className="action-buttons">
            <button 
              className="btn secondary"
              onClick={onBackupDatabase}
            >
              <FiDownload /> Backup Database
            </button>
            <button 
              className="btn warning"
              onClick={onSystemMaintenance}
            >
              <FiSettings /> System Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsTab;
