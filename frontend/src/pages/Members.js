import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import "../styles/members.css";

function Members() {

  const [stats, setStats] = useState({
    totalEmployees: 0,
    active: 0,
    inactive: 0,
    remote: 0
  });
  const [search, setSearch] = useState("");
  const [workingMode, setWorkingMode] = useState("All");
  const [status, setStatus] = useState("All");
  const [location, setLocation] = useState("All");
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch employees from backend
  const fetchMembers = useCallback(async () => {
    try {
      const res = await api.get("/members", {
        params: {
          page,
          limit,
          search,
          workingMode,
          status,
          location
        }
      });

      setMembers(res.data.data);
      setTotal(res.data.total);
      setStats(res.data.stats);

    } catch (err) {
      console.error(err);
    }
  }, [page, search, workingMode, status, location]);

    useEffect(() => {
      fetchMembers();
    }, [fetchMembers]);

    useEffect(() => {
      setPage(1);
    }, [search, workingMode, status, location]);

  // Pagination calculations
  const totalPages = Math.ceil(total / limit);

  const getInitials = (first, last) =>
    first?.[0] + last?.[0];

  const workingBadge = (mode) => {
    if (mode === "LOCAL") return "badge badge-local";
    if (mode === "REMOTE") return "badge badge-remote";
    if (mode === "HYBRID") return "badge badge-hybrid";
    return "badge";
  };

  const statusBadge = (active) =>
    active
      ? "badge badge-active"
      : "badge badge-inactive";

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    working_mode: "LOCAL",
    city: "",
    province: "",
    country: "",
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">
            Manage all users in the system
          </p>
        </div>

        <button
          className="add-employee-btn"
          onClick={() => setShowModal(true)}
        >
          <span className="btn-icon">＋</span>
          Add Member
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{stats.totalEmployees}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value">{stats.active}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Inactive</div>
          <div className="stat-value"> {stats.inactive} </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Remote Workers</div>
          <div className="stat-value">{stats.remote}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div>
          <div className="filter-label">Search</div>
          <input
            type="text"
            className="filter-input"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <div className="filter-label">Working Mode</div>
          <select
            className="filter-select"
            value={workingMode}
            onChange={(e) => setWorkingMode(e.target.value)}
          >
            <option value="All">All Modes</option>
            <option value="LOCAL">LOCAL</option>
            <option value="REMOTE">REMOTE</option>
            <option value="HYBRID">HYBRID</option>
          </select>
        </div>

        <div>
          <div className="filter-label">Location</div>
          <select className="filter-select">
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            <option>All Locations</option>
            <option>Calgary</option>
            <option>Vancouver</option>
            <option>Toronto</option>
          </select>
        </div>

        <div>
          <div className="filter-label">Status</div>
          <select className="filter-select">
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="employee-section">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Working Mode</th>
              <th>Location</th>
              <th>Status</th>
              <th>Teams</th>
            </tr>
          </thead>

          <tbody>
            {members.map(member => (
              <tr key={member.id} className="employee-row">
                <td>
                  <div className="employee-cell">
                    <div className="employee-avatar">
                      {getInitials(member.first_name, member.last_name)}
                    </div>
                    <div>
                      <div className="employee-name">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="employee-email">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className={workingBadge(member.working_mode)}>
                    {member.working_mode}
                  </span>
                </td>

                <td>
                  {member.city}, {member.province}, {member.country}
                </td>

                <td>
                  <span className={statusBadge(member.is_active)}>
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  {member.team_count} teams
                </td>
              </tr>
            ))}
          </tbody>
        </table>

          <div className="pagination-container">
            <div className="pagination-info">
              Showing {(page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, total)} of {total} employees
            </div>

            <div className="pagination-controls">

              {/* Previous */}
              <button
                className="page-button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>

              {/* Page Numbers with Ellipsis */}
              {totalPages <= 7 ? (
                [...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`page-button ${page === i + 1 ? "active" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))
              ) : (
                <>
                  {/* First Page */}
                  <button
                    onClick={() => setPage(1)}
                    className={`page-button ${page === 1 ? "active" : ""}`}
                  >
                    1
                  </button>

                  {page > 3 && <span className="page-button">...</span>}

                  {[page - 1, page, page + 1]
                    .filter(p => p > 1 && p < totalPages)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`page-button ${page === p ? "active" : ""}`}
                      >
                        {p}
                      </button>
                    ))}

                  {page < totalPages - 2 && (
                    <span className="page-button">...</span>
                  )}

                  {/* Last Page */}
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`page-button ${page === totalPages ? "active" : ""}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next */}
              <button
                className="page-button"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-container">

                {/* Header */}
                <div className="modal-header">
                  <h2>Add New Member</h2>
                  <button
                    className="modal-close"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body">

                  {/* First + Last Name */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="e.g., John"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="e.g., Smith"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label>Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g., john.smith@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <small className="helper-text">
                      Must be unique across the organization
                    </small>
                  </div>

                  {/* Working Mode */}
                  <div className="form-group">
                    <label>Working Mode <span className="required">*</span></label>
                    <select
                      name="working_mode"
                      value={formData.working_mode}
                      onChange={handleChange}
                    >
                      <option value="">Select working mode...</option>
                      <option value="LOCAL">Local</option>
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>

                  {/* City + Province */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="e.g., Calgary"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Province/State</label>
                      <input
                        type="text"
                        name="province"
                        placeholder="e.g., Alberta"
                        value={formData.province}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="e.g., Canada"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Checkbox */}
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <span>Set employee as active</span>
                  </div>

                </div>

                {/* Footer */}
                <div className="modal-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button className="btn-primary">
                    Add Employee
                  </button>
                </div>

              </div>
            </div>
          )}

      </div>
    </div>
  );
}

export default Members;