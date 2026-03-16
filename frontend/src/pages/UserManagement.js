import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import '../styles/userManagement.css';

/**
 * User Management Page
 * Displays and manages existing user accounts
 */
const ROLES = [
  { value: 'individual', label: 'Individual' },
  { value: 'team_lead', label: 'Team Lead / Supervisor' },
  { value: 'rotation_owner', label: 'Rotation Owner' },
  { value: 'administrator', label: 'Administrator' },
];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [resetCredentials, setResetCredentials] = useState(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Fetch users from admin API
   */
  async function loadUsers() {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');

      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            limit: 50,
            offset: 0,
            ...(search ? { search } : {}),
          },
        });
        const data = response.data;
        setUsers(data.users || []);
        setMessage({ type: '', text: '' });
      } catch (err) {
        if (err.response && err.response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            return loadUsers();
          }
          window.location.href = '/login';
          return;
        }
        throw err;
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          'Failed to load users',
      });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Refresh access token
   */
  async function refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response || !response.data || !response.data.accessToken) {
        return false;
      }

      const data = response.data;
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return true;
    } catch {
      return false;
    }
  }



  /**
   * Deactivate a user
   */
  async function handleDeactivateUser(userId) {
    if (!window.confirm('Deactivate this user account?')) {
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');

      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({
        type: 'success',
        text: 'User deactivated successfully',
      });

      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to deactivate user',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReactivateUser(userId) {
    if (!window.confirm('Reactivate this user account?')) {
      return;
    }

    try {
      setIsLoading(true);
      let token = localStorage.getItem('accessToken');

      const doReactivate = (accessToken) => axios.patch(
        `http://localhost:5000/api/admin/users/${userId}`,
        { isActive: true },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      try {
        await doReactivate(token);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            window.location.href = '/login';
            return;
          }
          token = localStorage.getItem('accessToken');
          await doReactivate(token);
        } else {
          throw error;
        }
      }

      setMessage({
        type: 'success',
        text: 'User reactivated successfully',
      });
      await loadUsers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: (error.response && error.response.data && error.response.data.message) || error.message || 'Failed to reactivate user',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateRole(userId, role) {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setUsers((prev) => prev.map((user) => (
        user.id === userId ? { ...user, role } : user
      )));
      setMessage({ type: 'success', text: 'Role updated successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: (error.response && error.response.data && error.response.data.message) || error.message || 'Failed to update role',
      });
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      setMessage({
        type: 'success',
        text: 'Copied to clipboard!',
      });
    });
  }

  async function handleResetPassword(userId) {
    if (!window.confirm('Are you sure you want to reset this user\'s password and generate a temporary password?')) {
      return;
    }

    try {
      setIsLoading(true);
      let token = localStorage.getItem('accessToken');

      const doReset = (accessToken) => axios.post(
        `http://localhost:5000/api/admin/users/${userId}/reset-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let resp;
      try {
        resp = await doReset(token);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            window.location.href = '/login';
            return;
          }
          token = localStorage.getItem('accessToken');
          resp = await doReset(token);
        } else {
          throw error;
        }
      }

      setResetCredentials(resp.data);
      setMessage({
        type: 'success',
        text: 'Password reset successfully. Temporary password is shown below.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: (error.response && error.response.data && error.response.data.message) || error.message || 'Failed to reset password',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="user-management">
      <PageHeader title="User Management" subtitle="Manage user roles, password resets, and account status" />

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button className="alert-close" onClick={() => setMessage({ type: '', text: '' })}>
            ×
          </button>
        </div>
      )}

      {resetCredentials && (
        <Card className="credentials-modal">
          <div className="modal-header">
            <h2>Password Reset Successfully</h2>
            <button className="modal-close" onClick={() => setResetCredentials(null)}>
              ×
            </button>
          </div>

          <div className="modal-content">
            <p className="warning-text">
              Save this temporary password now. It will not be shown again.
            </p>

            <div className="credential-field">
              <label>Email:</label>
              <p>{resetCredentials.email}</p>
            </div>

            <div className="credential-field">
              <label>Temporary Password:</label>
              <div className="credential-value">
                <span className="password">{resetCredentials.temporaryPassword}</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(resetCredentials.temporaryPassword)}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setResetCredentials(null)}>
                Close
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="user-management-content">
        {/* Users List Section */}
        <Card className="users-list-card">
          <div className="card-header">
            <h3>Users ({users.length})</h3>
            <input
              type="text"
              placeholder="Search by email, name, or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                // Debounce search
                setTimeout(() => loadUsers(), 300);
              }}
              className="search-input"
            />
          </div>

          {isLoading && users.length === 0 ? (
            <p className="loading">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="no-users">No users found</p>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={user.is_active ? '' : 'inactive'}>
                      <td>{user.email}</td>
                      <td>
                        {user.first_name} {user.last_name}
                      </td>
                      <td>{user.username}</td>
                      <td>
                        <select
                          className="filter-select"
                          value={user.role || 'individual'}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleResetPassword(user.id)}
                          title="Reset password"
                        >
                          Reset Password
                        </button>
                        {user.is_active ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeactivateUser(user.id)}
                            title="Deactivate user"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleReactivateUser(user.id)}
                            title="Reactivate user"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default UserManagement;
