import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/api';
import '../styles/userManagement.css';

const AUDIT_PAGE_SIZE = 15;

const ROLES = [
  { value: 'individual', label: 'Individual' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'rotation_owner', label: 'Rotation Owner' },
  { value: 'administrator', label: 'Administrator' },
];

function getInitials(first = '', last = '') {
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase();
}

function formatRole(value) {
  if (!value) return 'Unknown';
  return String(value)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatName(first = '', last = '', username = '') {
  const full = `${first || ''} ${last || ''}`.trim();
  if (full) return full;
  if (username) return `@${username}`;
  return 'System';
}

function safeRole(state) {
  if (!state || typeof state !== 'object') return null;
  return state.role || null;
}

function UserManagement() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [resetCredentials, setResetCredentials] = useState(null);
  const [lastRoleChangedUserId, setLastRoleChangedUserId] = useState('');
  const [roleAuditLogs, setRoleAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditOffset, setAuditOffset] = useState(0);
  const [auditActorSearch, setAuditActorSearch] = useState('');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const [auditTargetUserId, setAuditTargetUserId] = useState('');
  const tabsRef = useRef(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { limit: 500, offset: 0 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/admin/users', { params });
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
  }, [search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadRoleAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      setAuditError('');

      const params = {
        action: 'USER_ROLE_UPDATED',
        entityType: 'user',
        limit: AUDIT_PAGE_SIZE,
        offset: auditOffset,
      };

      if (auditActorSearch.trim()) {
        params.actorSearch = auditActorSearch.trim();
      }

      if (auditTargetUserId.trim()) {
        params.entityId = auditTargetUserId.trim();
      }

      if (auditStartDate) {
        params.startDate = new Date(`${auditStartDate}T00:00:00`).toISOString();
      }

      if (auditEndDate) {
        params.endDate = new Date(`${auditEndDate}T23:59:59.999`).toISOString();
      }

      const res = await api.get('/admin/audit-logs', { params });

      setRoleAuditLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
      setAuditTotal(Number(res.data.total || 0));
    } catch (error) {
      setAuditError(error.response?.data?.message || 'Failed to load history');
    } finally {
      setAuditLoading(false);
    }
  }, [auditActorSearch, auditEndDate, auditOffset, auditStartDate, auditTargetUserId]);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadRoleAuditLogs();
    }
  }, [activeTab, loadRoleAuditLogs]);

  useEffect(() => {
    setAuditOffset(0);
  }, [auditActorSearch, auditStartDate, auditEndDate, auditTargetUserId]);

  async function handleUpdateRole(userId, role) {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      setMessage({ type: 'success', text: 'Role updated successfully' });
      setLastRoleChangedUserId(userId);
      setAuditTargetUserId(userId);
      setAuditOffset(0);
      setActiveTab('audit');
      window.setTimeout(() => {
        if (tabsRef.current) {
          tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update role',
      });
      setLastRoleChangedUserId('');
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

  function clearAuditFilters() {
    setAuditActorSearch('');
    setAuditStartDate('');
    setAuditEndDate('');
    setAuditTargetUserId('');
  }

  function goToPrevAuditPage() {
    setAuditOffset((prev) => Math.max(prev - AUDIT_PAGE_SIZE, 0));
  }

  function goToNextAuditPage() {
    setAuditOffset((prev) => prev + AUDIT_PAGE_SIZE);
  }

  const auditCurrentPage = Math.floor(auditOffset / AUDIT_PAGE_SIZE) + 1;
  const auditTotalPages = Math.max(Math.ceil(auditTotal / AUDIT_PAGE_SIZE), 1);

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
          <div className="um-alert-actions">
            {message.type === 'success' && lastRoleChangedUserId && (
              <button
                className="um-alert-link-btn"
                onClick={() => {
                  setAuditTargetUserId(lastRoleChangedUserId);
                  setAuditOffset(0);
                  setActiveTab('audit');
                  if (tabsRef.current) {
                    tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Jump to History
              </button>
            )}
            <button
              className="um-alert-close"
              onClick={() => {
                setMessage({ type: '', text: '' });
                setLastRoleChangedUserId('');
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="um-tabs" ref={tabsRef}>
        <button
          type="button"
          className={`um-tab-btn ${activeTab === 'users' ? 'um-tab-btn-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          type="button"
          className={`um-tab-btn ${activeTab === 'audit' ? 'um-tab-btn-active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          History
        </button>
      </div>

      {activeTab === 'users' && (
        <>
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
            <div className="um-filter-group">
              <div className="um-filter-label">Role</div>
              <select
                className="um-filter-input"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
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
        </>
      )}

      {activeTab === 'audit' && (
        <div className="um-audit-section">
          <div className="um-audit-header">
            <div>
              <h2 className="um-audit-title">History</h2>
              <p className="um-audit-subtitle">Who changed roles, what changed, and when.</p>
            </div>
            <button
              className="um-audit-refresh"
              type="button"
              onClick={loadRoleAuditLogs}
              disabled={auditLoading}
            >
              {auditLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="um-audit-filters">
            <div className="um-audit-filter-group">
              <label>Changed By</label>
              <input
                type="text"
                placeholder="Name, username, or email"
                value={auditActorSearch}
                onChange={(e) => setAuditActorSearch(e.target.value)}
              />
            </div>

            <div className="um-audit-filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={auditStartDate}
                onChange={(e) => setAuditStartDate(e.target.value)}
              />
            </div>

            <div className="um-audit-filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={auditEndDate}
                onChange={(e) => setAuditEndDate(e.target.value)}
              />
            </div>

            <div className="um-audit-filter-group">
              <label>Target User Id</label>
              <input
                type="text"
                placeholder="UUID"
                value={auditTargetUserId}
                onChange={(e) => setAuditTargetUserId(e.target.value)}
              />
            </div>

            <button
              className="um-audit-clear-btn"
              type="button"
              onClick={clearAuditFilters}
              disabled={auditLoading}
            >
              Clear
            </button>
          </div>

          {auditError && (
            <div className="um-alert um-alert-error">
              <span>{auditError}</span>
              <button className="um-alert-close" onClick={() => setAuditError('')}>×</button>
            </div>
          )}

          <div className="um-audit-table-wrap">
            <table className="um-table um-audit-table">
              <thead>
                <tr>
                  <th>Changed At</th>
                  <th>Changed By</th>
                  <th>User</th>
                  <th>From Role</th>
                  <th>To Role</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr><td colSpan={5} className="um-table-empty">Loading role audit entries...</td></tr>
                ) : roleAuditLogs.length === 0 ? (
                  <tr><td colSpan={5} className="um-table-empty">No role audit entries found</td></tr>
                ) : (
                  roleAuditLogs.map((log) => {
                    const fromRole = formatRole(safeRole(log.before_state));
                    const toRole = formatRole(safeRole(log.after_state));
                    return (
                      <tr key={log.id} className="um-row">
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td>
                          <div className="um-user-name">
                            {formatName(log.actor_first_name, log.actor_last_name, log.actor_username)}
                          </div>
                          {log.actor_email && <div className="um-user-email">{log.actor_email}</div>}
                        </td>
                        <td>
                          <div className="um-user-name">
                            {formatName(log.target_first_name, log.target_last_name, log.target_username)}
                          </div>
                          {log.target_email && <div className="um-user-email">{log.target_email}</div>}
                        </td>
                        <td><span className="um-role-chip um-role-chip-old">{fromRole}</span></td>
                        <td><span className="um-role-chip um-role-chip-new">{toRole}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="um-audit-pagination">
            <button type="button" onClick={goToPrevAuditPage} disabled={auditOffset === 0 || auditLoading}>Previous</button>
            <span>Page {auditCurrentPage} of {auditTotalPages}</span>
            <button
              type="button"
              onClick={goToNextAuditPage}
              disabled={auditLoading || auditOffset + AUDIT_PAGE_SIZE >= auditTotal}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
