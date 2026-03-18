import React, { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import "../styles/members.css";

const initialFormData = {
  first_name: "",
  last_name: "",
  email: "",
  working_mode: "LOCAL",
  role_type_id: "",
  country: "",
  province: "",
  city: "",
  is_active: true
};

function Members() {
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const isAdministrator = getCurrentUser().role === "administrator";

  const [stats, setStats] = useState({
    totalEmployees: 0,
    active: 0,
    inactive: 0,
    remote: 0
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [location, setLocation] = useState("All");
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [jobTitleFilter, setJobTitleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState(initialFormData);
  const limit = 10;

  const fetchJobTitles = useCallback(async () => {
    try {
      const res = await api.get("/roles");
      setJobTitles(res.data);
    } catch (error) {
      console.error("Failed to load job titles", error);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await api.get("/location/countries");
      setCountries(res.data);
    } catch (error) {
      console.error("Failed to load countries", error);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await api.get("/members", {
        params: {
          page,
          limit,
          search,
          jobTitle: jobTitleFilter,
          status,
          location
        }
      });

      setMembers(res.data.data);
      setTotal(res.data.total);
      setStats(res.data.stats);
    } catch (error) {
      console.error("Failed to load members", error);
    }
  }, [jobTitleFilter, limit, location, page, search, status]);

  useEffect(() => {
    fetchCountries();
    fetchJobTitles();
  }, [fetchCountries, fetchJobTitles]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    setPage(1);
  }, [search, jobTitleFilter, status, location]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setProvinces([]);
    setCities([]);
    setEditMode(false);
    setSelectedMemberId(null);
  }, []);

  const getInitials = (first = "", last = "") =>
    `${first[0] || ""}${last[0] || ""}`.toUpperCase();

  const statusBadge = (active) =>
    active ? "badge badge-active" : "badge badge-inactive";

  const buildMemberPayload = () => ({
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    email: formData.email.trim(),
    working_mode: formData.working_mode,
    role_type_id: formData.role_type_id || null,
    city: formData.city || null,
    is_active: formData.is_active
  });

  const handleModalClose = () => {
    setShowModal(false);
    setMessage({ type: "", text: "" });
    resetForm();
  };

  const handleOpenCreateModal = () => {
    if (!isAdministrator) {
      setMessage({ type: "error", text: "Only administrators can add members." });
      return;
    }

    resetForm();
    setGeneratedCredentials(null);
    setMessage({ type: "", text: "" });
    setShowModal(true);
  };

  const handleCountryChange = async (event) => {
    const countryId = event.target.value;

    setFormData((prev) => ({
      ...prev,
      country: countryId,
      province: "",
      city: ""
    }));

    if (!countryId) {
      setProvinces([]);
      setCities([]);
      return;
    }

    try {
      const res = await api.get(`/location/provinces/${countryId}`);
      setProvinces(res.data);
      setCities([]);
    } catch (error) {
      console.error("Failed to load provinces", error);
      setMessage({ type: "error", text: "Failed to load provinces." });
    }
  };

  const handleProvinceChange = async (event) => {
    const provinceId = event.target.value;

    setFormData((prev) => ({
      ...prev,
      province: provinceId,
      city: ""
    }));

    if (!provinceId) {
      setCities([]);
      return;
    }

    try {
      const res = await api.get(`/location/cities/${provinceId}`);
      setCities(res.data);
    } catch (error) {
      console.error("Failed to load cities", error);
      setMessage({ type: "error", text: "Failed to load cities." });
    }
  };

  const handleCityChange = (event) => {
    const cityId = event.target.value;
    setFormData((prev) => ({
      ...prev,
      city: cityId
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const payload = buildMemberPayload();

    if (!payload.first_name || !payload.last_name || !payload.email || !payload.working_mode) {
      setMessage({
        type: "error",
        text: "First name, last name, email, and working mode are required."
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (editMode) {
        await api.put(`/members/${selectedMemberId}`, payload);
      } else {
        if (!isAdministrator) {
          setMessage({ type: "error", text: "Only administrators can add members." });
          setIsSubmitting(false);
          return;
        }

        const { data } = await api.post("/admin/users", {
          email: payload.email,
          firstName: payload.first_name,
          lastName: payload.last_name
        });

        await api.put(`/members/${data.userId}`, payload);
        setGeneratedCredentials(data);
        setShowCredentialsModal(true);
      }

      handleModalClose();
      await fetchMembers();
    } catch (error) {
      console.error("Failed to save member", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save member."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (memberId) => {
    if (!isAdministrator) {
      setMessage({ type: "error", text: "Only administrators can delete members." });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      await api.delete(`/members/${memberId}`);
      setOpenDropdown(null);
      await fetchMembers();
    } catch (error) {
      console.error("Failed to delete member", error);
    }
  };

  const handleEdit = async (member) => {
    if (!isAdministrator) {
      setMessage({ type: "error", text: "Only administrators can edit members." });
      return;
    }

    setMessage({ type: "", text: "" });
    setEditMode(true);
    setSelectedMemberId(member.id);
    setOpenDropdown(null);

    try {
      if (member.country_id) {
        const provinceRes = await api.get(`/location/provinces/${member.country_id}`);
        setProvinces(provinceRes.data);
      } else {
        setProvinces([]);
      }

      if (member.province_id) {
        const cityRes = await api.get(`/location/cities/${member.province_id}`);
        setCities(cityRes.data);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Failed to load member location options", error);
    }

    setFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      email: member.email || "",
      working_mode: member.working_mode || "LOCAL",
      role_type_id: member.role_type_id || "",
      country: member.country_id || "",
      province: member.province_id || "",
      city: member.city_id || "",
      is_active: Boolean(member.is_active)
    });

    setShowModal(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
    }
  };

  const locationLabel = (member) =>
    [member.city, member.province, member.country].filter(Boolean).join(", ") || "-";

  return (
    <div className="members-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">Manage all users in the system</p>
        </div>

        {isAdministrator && (
          <button className="add-employee-btn" onClick={handleOpenCreateModal}>
            <span className="btn-icon">+</span>
            Add Member
          </button>
        )}
      </div>

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
          <div className="stat-value">{stats.inactive}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Remote Workers</div>
          <div className="stat-value">{stats.remote}</div>
        </div>
      </div>

      <div className="filters">
        <div>
          <div className="filter-label">Search</div>
          <input
            type="text"
            className="filter-input"
            placeholder="Search employees, email, or username..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div>
          <div className="filter-label">Job Title</div>
          <select
            className="filter-select"
            value={jobTitleFilter}
            onChange={(event) => setJobTitleFilter(event.target.value)}
          >
            <option value="All">All Job Titles</option>
            {jobTitles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="filter-label">Location</div>
          <select
            className="filter-select"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="All">All Locations</option>
            <option value="Calgary">Calgary</option>
            <option value="Vancouver">Vancouver</option>
            <option value="Toronto">Toronto</option>
          </select>
        </div>

        <div>
          <div className="filter-label">Status</div>
          <select
            className="filter-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="employee-section">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Job Title</th>
              <th>Location</th>
              <th>Status</th>
              <th>Teams</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
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
                      {member.username && (
                        <div className="employee-username">@{member.username}</div>
                      )}
                      <div className="employee-email">{member.email}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="badge badge-job">{member.job_title || "-"}</span>
                </td>

                <td>{locationLabel(member)}</td>

                <td>
                  <span className={statusBadge(member.is_active)}>
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>{member.team_count} teams</td>

                <td>
                  {isAdministrator ? (
                    <div className="member-actions">
                      <button
                        type="button"
                        className="btn-three-dots"
                        onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                      >
                        ...
                      </button>

                      {openDropdown === member.id && (
                        <div className="dots-dropdown">
                          <button
                            type="button"
                            className="dots-option dots-option-edit"
                            onClick={() => handleEdit(member)}
                          >
                            Edit Member
                          </button>
                          <button
                            type="button"
                            className="dots-option dots-option-delete"
                            onClick={() => handleDelete(member.id)}
                          >
                            Delete Member
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-container">
          <div className="pagination-info">
            {total === 0
              ? "Showing 0 of 0 members"
              : `Showing ${(page - 1) * limit + 1} - ${Math.min(page * limit, total)} of ${total} members`}
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="page-button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            {totalPages <= 7 ? (
              [...Array(totalPages)].map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`page-button ${page === index + 1 ? "active" : ""}`}
                >
                  {index + 1}
                </button>
              ))
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className={`page-button ${page === 1 ? "active" : ""}`}
                >
                  1
                </button>

                {page > 3 && <span className="page-button">...</span>}

                {[page - 1, page, page + 1]
                  .filter((pageNumber) => pageNumber > 1 && pageNumber < totalPages)
                  .map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`page-button ${page === pageNumber ? "active" : ""}`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                {page < totalPages - 2 && <span className="page-button">...</span>}

                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  className={`page-button ${page === totalPages ? "active" : ""}`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              className="page-button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editMode ? "Edit Member" : "Add New Member"}</h2>
              <button type="button" className="modal-close" onClick={handleModalClose}>
                x
              </button>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                <span>{message.text}</span>
                <button
                  type="button"
                  className="alert-close"
                  onClick={() => setMessage({ type: "", text: "" })}
                >
                  x
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="e.g., John"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="e.g., Smith"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Email Address <span className="required">*</span>
                </label>
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

              <div className="form-group">
                <label>
                  Working Mode <span className="required">*</span>
                </label>
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

              <div className="form-group">
                <label>Job Title</label>
                <select
                  name="role_type_id"
                  value={formData.role_type_id}
                  onChange={handleChange}
                >
                  <option value="">Select Job Title</option>
                  {jobTitles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Country</label>
                <select value={formData.country} onChange={handleCountryChange}>
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Province/State</label>
                  <select value={formData.province} onChange={handleProvinceChange}>
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>City</label>
                  <select value={formData.city} onChange={handleCityChange}>
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Set employee as active</span>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleModalClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editMode ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCredentialsModal && generatedCredentials && (
        <div className="modal-overlay">
          <div className="modal-container credentials-modal">
            <div className="modal-header">
              <h2>Member Created Successfully</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCredentialsModal(false)}
              >
                x
              </button>
            </div>

            <div className="modal-body credentials-body">
              <div className="warning-box">
                <p>Save these credentials securely. They are only shown once.</p>
              </div>

              <div className="credential-field">
                <label>Username</label>
                <div className="credential-display">
                  <span className="credential-value">{generatedCredentials.username}</span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => copyToClipboard(generatedCredentials.username)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="credential-field">
                <label>Temporary Password</label>
                <div className="credential-display">
                  <span className="credential-value password-value">
                    {generatedCredentials.temporaryPassword}
                  </span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => copyToClipboard(generatedCredentials.temporaryPassword)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="credential-field">
                <label>Email</label>
                <p>{generatedCredentials.email}</p>
              </div>

              <div className="instructions-box">
                <h4>Next Steps</h4>
                <ol>
                  <li>Send the username and temporary password to the new member securely.</li>
                  <li>The member signs in with these credentials the first time.</li>
                  <li>The member should change their password after login.</li>
                </ol>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowCredentialsModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;