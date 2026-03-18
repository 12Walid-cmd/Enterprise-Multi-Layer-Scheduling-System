import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import '../styles/userManagement.css';

const ROLES = [
  { value: 'individual', label: 'Individual' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'rotation_owner', label: 'Rotation Owner' },
  { value: 'administrator', label: 'Administrator' },
];

function getInitials(first = '', last = '') {
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [resetCredentials, setResetCredentials] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/users', {
        params: { limit: 500, offset: 0, ...(search ? { search } : {}) },
      });
      setUsers(res.data.users || []);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load users',
      });
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleUpdateRole(userId, role) {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      setMessage({ type: 'success', text: 'Role updated successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update role',
      });
    }
  }

  async function handleResetPassword(userId) {
    if (!window.confirm("Reset this user's password and generate a temporary one?")) return;
    try {
      setIsLoading(true);
      const res = await api.post(`/admin/users/${userId}/reset-password`, {});
      setResetCredentials(res.data);
      setMessage({ type: 'success', text: 'Password reset successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reset password',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'Copied to clipboard!' });
    } catch {
      // ignore
    }
  }

  return (
    <div className="user-management-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user roles and reset passwords</p>
        </div>
      </div>

      {message.text && (
        <div className={`um-alert um-alert-${message.type}`}>
          <span>{message.text}</span>
          <button className="um-alert-close" onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="um-filters">
        <div className="um-filter-group">
          <div className="um-filter-label">Search</div>
          <input
            type="text"
            className="um-filter-input"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="um-table-section">
        <table className="um-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && users.length === 0 ? (
              <tr><td colSpan={4} className="um-table-empty">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="um-table-empty">No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="um-row">
                  <td>
                    <div className="um-user-cell">
                      <div className="um-avatar">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <div>
                        <div className="um-user-name">{user.first_name} {user.last_name}</div>
                        <div className="um-user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="um-username">@{user.username}</span>
                  </td>
                  <td>
                    <select
                      className="um-role-select"
                      value={user.role || 'individual'}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="um-reset-btn"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {resetCredentials && (
        <div className="um-modal-overlay">
          <div className="um-modal">
            <div className="um-modal-header">
              <h2>Password Reset Successfully</h2>
              <button className="um-modal-close" onClick={() => setResetCredentials(null)}>×</button>
            </div>
            <div className="um-modal-body">
              <div className="um-warning-box">
                <p>Save this temporary password now. It will not be shown again.</p>
              </div>
              <div className="um-credential-field">
                <label>Email</label>
                <p className="um-credential-text">{resetCredentials.email}</p>
              </div>
              <div className="um-credential-field">
                <label>Temporary Password</label>
                <div className="um-credential-display">
                  <span className="um-credential-value">{resetCredentials.temporaryPassword}</span>
                  <button className="um-copy-btn" onClick={() => copyToClipboard(resetCredentials.temporaryPassword)}>Copy</button>
                </div>
              </div>
            </div>
            <div className="um-modal-footer">
              <button className="um-btn-primary" onClick={() => setResetCredentials(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
