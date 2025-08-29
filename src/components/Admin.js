import React, { useState } from 'react';
import { FiUsers, FiSettings, FiDatabase, FiActivity, FiShield } from 'react-icons/fi';

const Admin = () => {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <p>Manage your application settings and monitor system activity</p>
      </div>

      <div className="admin-navigation">
        <button
          className={`admin-nav-button ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          <FiActivity size={18} />
          Overview
        </button>
        <button
          className={`admin-nav-button ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          <FiUsers size={18} />
          Users
        </button>
        <button
          className={`admin-nav-button ${activeSection === 'database' ? 'active' : ''}`}
          onClick={() => setActiveSection('database')}
        >
          <FiDatabase size={18} />
          Database
        </button>
        <button
          className={`admin-nav-button ${activeSection === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSection('security')}
        >
          <FiShield size={18} />
          Security
        </button>
        <button
          className={`admin-nav-button ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSection('settings')}
        >
          <FiSettings size={18} />
          Settings
        </button>
      </div>

      <div className="admin-content">
        {activeSection === 'overview' && (
          <div className="admin-section">
            <h3>System Overview</h3>
            <div className="admin-stats">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p className="stat-number">1,234</p>
              </div>
              <div className="stat-card">
                <h4>Active Sessions</h4>
                <p className="stat-number">56</p>
              </div>
              <div className="stat-card">
                <h4>Storage Used</h4>
                <p className="stat-number">2.3 GB</p>
              </div>
              <div className="stat-card">
                <h4>Uptime</h4>
                <p className="stat-number">99.9%</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="admin-section">
            <h3>User Management</h3>
            <div className="user-management">
              <div className="user-actions">
                <button className="admin-action-button">Add User</button>
                <button className="admin-action-button">Export Users</button>
                <button className="admin-action-button">Send Notifications</button>
              </div>
              <div className="user-table-placeholder">
                <p>User management table would be displayed here</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'database' && (
          <div className="admin-section">
            <h3>Database Management</h3>
            <div className="database-management">
              <div className="database-actions">
                <button className="admin-action-button">Backup Database</button>
                <button className="admin-action-button">View Logs</button>
                <button className="admin-action-button">Optimize Tables</button>
              </div>
              <div className="database-info">
                <p>Database status: Connected</p>
                <p>Last backup: 2 hours ago</p>
                <p>Total tables: 15</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="admin-section">
            <h3>Security Settings</h3>
            <div className="security-settings">
              <div className="security-option">
                <label>
                  <input type="checkbox" defaultChecked />
                  Enable two-factor authentication
                </label>
              </div>
              <div className="security-option">
                <label>
                  <input type="checkbox" defaultChecked />
                  Require strong passwords
                </label>
              </div>
              <div className="security-option">
                <label>
                  <input type="checkbox" />
                  Enable login notifications
                </label>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="admin-section">
            <h3>Application Settings</h3>
            <div className="app-settings">
              <div className="setting-group">
                <label>Application Name</label>
                <input type="text" defaultValue="BØY" />
              </div>
              <div className="setting-group">
                <label>Default Theme</label>
                <select defaultValue="light">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="setting-group">
                <label>Max Upload Size (MB)</label>
                <input type="number" defaultValue="10" />
              </div>
              <button className="admin-action-button save-settings">Save Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
