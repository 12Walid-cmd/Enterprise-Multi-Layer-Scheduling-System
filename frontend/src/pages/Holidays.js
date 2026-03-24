import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/api';

const HOLIDAY_TYPES = ['PUBLIC', 'REGIONAL', 'COMPANY', 'OTHER'];

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function Holidays() {
  const currentUser = getCurrentUser();
  const isAdministrator = currentUser.role === 'administrator';

  const [holidays, setHolidays] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    holiday_date: '',
    holiday_type: 'OTHER',
    scope: 'global',
    group_id: '',
  });

  const loadHolidays = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/holidays');
      setHolidays(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load holidays',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGroups = useCallback(async () => {
    if (!isAdministrator) return;

    try {
      const res = await api.get('/groups');
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Keep form functional for company-wide scope even if groups fail.
    }
  }, [isAdministrator]);

  useEffect(() => {
    loadHolidays();
    loadGroups();
  }, [loadHolidays, loadGroups]);

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date)),
    [holidays]
  );

  function resetForm() {
    setEditingId(null);
    setForm({
      name: '',
      holiday_date: '',
      holiday_type: 'OTHER',
      scope: 'global',
      group_id: '',
    });
  }

  function startEdit(holiday) {
    setEditingId(holiday.id);
    setForm({
      name: holiday.name || '',
      holiday_date: holiday.holiday_date ? String(holiday.holiday_date).slice(0, 10) : '',
      holiday_type: holiday.holiday_type || 'OTHER',
      scope: holiday.group_id ? 'group' : 'global',
      group_id: holiday.group_id || '',
    });
    setMessage({ type: '', text: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.name.trim() || !form.holiday_date) {
      setMessage({ type: 'error', text: 'Name and date are required.' });
      return;
    }

    if (form.scope === 'group' && !form.group_id) {
      setMessage({ type: 'error', text: 'Please select a group for group-scoped holidays.' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      holiday_date: form.holiday_date,
      holiday_type: form.holiday_type,
      group_id: form.scope === 'group' ? form.group_id : null,
    };

    try {
      setIsSaving(true);
      if (editingId) {
        await api.patch(`/holidays/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Holiday updated successfully.' });
      } else {
        await api.post('/holidays', payload);
        setMessage({ type: 'success', text: 'Holiday created successfully.' });
      }

      resetForm();
      await loadHolidays();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save holiday.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(holidayId) {
    if (!window.confirm('Delete this holiday?')) {
      return;
    }

    try {
      setMessage({ type: '', text: '' });
      await api.delete(`/holidays/${holidayId}`);
      setMessage({ type: 'success', text: 'Holiday deleted successfully.' });

      if (editingId === holidayId) {
        resetForm();
      }

      await loadHolidays();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete holiday.',
      });
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Holiday Management</h3>
          <div className="text-muted" style={{ fontSize: '0.95rem' }}>
            {isAdministrator
              ? 'Create company-wide or group-specific holidays.'
              : 'You can only see holidays that apply to your group or company-wide.'}
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {isAdministrator && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">{editingId ? 'Edit Holiday' : 'Add Holiday'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Holiday Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Family Day"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.holiday_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, holiday_date: e.target.value }))}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={form.holiday_type}
                    onChange={(e) => setForm((prev) => ({ ...prev, holiday_type: e.target.value }))}
                  >
                    {HOLIDAY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Scope</label>
                  <select
                    className="form-select"
                    value={form.scope}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        scope: e.target.value,
                        group_id: e.target.value === 'global' ? '' : prev.group_id,
                      }))
                    }
                  >
                    <option value="global">Company-wide</option>
                    <option value="group">Specific Group</option>
                  </select>
                </div>

                {form.scope === 'group' && (
                  <div className="col-md-4">
                    <label className="form-label">Group</label>
                    <select
                      className="form-select"
                      value={form.group_id}
                      onChange={(e) => setForm((prev) => ({ ...prev, group_id: e.target.value }))}
                    >
                      <option value="">Select group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingId ? 'Update Holiday' : 'Create Holiday'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">Holidays</h5>
          {isLoading ? (
            <p className="text-muted mb-0">Loading holidays...</p>
          ) : sortedHolidays.length === 0 ? (
            <p className="text-muted mb-0">No holidays found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Scope</th>
                    {isAdministrator && <th style={{ width: '190px' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedHolidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td>{holiday.name}</td>
                      <td>{new Date(holiday.holiday_date).toLocaleDateString()}</td>
                      <td>{holiday.holiday_type || 'OTHER'}</td>
                      <td>{holiday.group_name || 'Company-wide'}</td>
                      {isAdministrator && (
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => startEdit(holiday)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(holiday.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Holidays;