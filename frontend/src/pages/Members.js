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

  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const [editMode, setEditMode] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filterCities, setFilterCities]         = useState([]);
  const [selectedCities, setSelectedCities]     = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [cityDropOpen, setCityDropOpen]         = useState(false);
  const [statusDropOpen, setStatusDropOpen]     = useState(false);
  const [jobDropOpen, setJobDropOpen]           = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    working_mode: "",
    role_type_id: "",
    city_id: "",
    is_active: true
  });

  useEffect(() => {
    const fetchFilterCities = async () => {
      const res = await api.get("/location/cities");
      setFilterCities(res.data);
    };
    fetchFilterCities();
  }, []);


  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    const res = await api.get("/roles");
    setJobTitles(res.data);
  };

  // ================================
  // Fetch Members
  // ================================
  const fetchMembers = useCallback(async () => {
    try {

      const res = await api.get("/members", {
        params: {
          page,
          limit,
          search,
          jobTitle: selectedJobTitles.join(","),   // comma-separated IDs
          status: selectedStatuses.join(","),      // "true,false" or single
          location: selectedCities.join(","),      // comma-separated city names
        }
      });

      setMembers(res.data.data);
      setTotal(res.data.total);
      setStats(res.data.stats);

    } catch (err) {
      console.error(err);
    }
  }, [page, search, selectedJobTitles, selectedStatuses, selectedCities]);

    useEffect(() => {
      fetchMembers();
    }, [fetchMembers]);

    useEffect(() => {
      setPage(1);
    }, [search, selectedJobTitles, selectedStatuses, selectedCities]);

  // Pagination calculations
  const totalPages = Math.ceil(total / limit);

  // ================================
  // Load Countries
  // ================================
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    const res = await api.get("/location/countries");
    setCountries(res.data);
  };

  // ================================
  // Country Change
  // ================================
  const handleCountryChange = async (e) => {

    const countryId = e.target.value;

    setFormData(prev => ({
      ...prev,
      country: countryId,
      province: "",
      city: ""
    }));

    const res = await api.get(`/location/provinces/${countryId}`);

    setProvinces(res.data);
    setCities([]);

  };

  // ================================
  // Province Change
  // ================================
  const handleProvinceChange = async (e) => {

    const provinceId = e.target.value;

    setFormData(prev => ({
      ...prev,
      province: provinceId,
      city: ""
    }));

    const res = await api.get(`/location/cities/${provinceId}`);

    setCities(res.data);

  };

  // ================================
  // City Change
  // ================================
  const handleCityChange = (e) => {

    const cityId = e.target.value;

    setFormData(prev => ({
      ...prev,
      city: cityId
    }));

  };

  // ================================
  // Normal Inputs
  // ================================
  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

  };

  // ================================
  // Submit Member
  // ================================
  const handleSubmit = async () => {
    console.log("submit-->", formData);
    try {

      if (editMode) {
      await api.put(`/members/${selectedMemberId}`, formData);
    } else {
      await api.post("/members", formData);
    }

      setShowModal(false);
      setEditMode(false);
      fetchMembers();

    } catch (err) {
      console.error("FRONT ERROR", err.response?.data);
      alert(err.response?.data?.message || "Failed to create member");
    }

  };

  // ================================
  // Delete Member
  // ================================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmDelete) return;
    try {
      await api.delete(`/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error(error);
    }

  };

  // ================================
  // Edit Member
  // ================================
  const handleEdit = async (member) => {

    setEditMode(true);
    setSelectedMemberId(member.id);

    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      working_mode: member.working_mode,
      role_type_id: member.role_type_id || "",
      city: member.city_id,
      province: member.province_id,
      country: member.country_id,
      is_active: member.is_active
    });

    setShowModal(true);

  };

  const getInitials = (first, last) => first?.[0] + last?.[0];

  const statusBadge = (active) =>
    active ? "badge badge-active" : "badge badge-inactive";
  
  useEffect(() => {
    const close = () => {
      setCityDropOpen(false);
      setStatusDropOpen(false);
      setJobDropOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (

    
    <div className="members-container">
    

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
      
       <div className="filters-bar">

          {/* ── Row 1: Search + 3 Filters ── */}
          <div className="fb-top-row">

            {/* Search — takes 2 parts */}
            <div className="fb-search-wrap">
              <input
                type="text"
                className="fb-search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="fb-clear-x" onClick={() => setSearch("")}>×</button>
              )}
            </div>

            {/* Job Title */}
            <div className="fb-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
              <div className="fb-drop-label">Job Title</div>
              <button
                className={`fb-drop-btn${selectedJobTitles.length ? " active" : ""}`}
                onClick={() => { setJobDropOpen(p => !p); setCityDropOpen(false); setStatusDropOpen(false); }}
              >
                {selectedJobTitles.length ? `Job Title (${selectedJobTitles.length})` : "All Job Titles"}
                <span className="fb-chevron">{jobDropOpen ? "▴" : "▾"}</span>
              </button>
              {jobDropOpen && (
                <div className="fb-drop-panel">
                  <label className="fb-option fb-option-all">
                    <input
                      type="checkbox"
                      checked={selectedJobTitles.length === jobTitles.length && jobTitles.length > 0}
                      onChange={() =>
                        setSelectedJobTitles(
                          selectedJobTitles.length === jobTitles.length ? [] : jobTitles.map(r => r.id)
                        )
                      }
                    />
                    <span>Select All</span>
                  </label>
                  <div className="fb-divider" />
                  {jobTitles.map(role => (
                    <label key={role.id} className="fb-option">
                      <input
                        type="checkbox"
                        checked={selectedJobTitles.includes(role.id)}
                        onChange={() =>
                          setSelectedJobTitles(prev =>
                            prev.includes(role.id) ? prev.filter(id => id !== role.id) : [...prev, role.id]
                          )
                        }
                      />
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="fb-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
              <div className="fb-drop-label">Location</div>
              <button
                className={`fb-drop-btn${selectedCities.length ? " active" : ""}`}
                onClick={() => { setCityDropOpen(p => !p); setJobDropOpen(false); setStatusDropOpen(false); }}
              >
                {selectedCities.length ? `Location (${selectedCities.length})` : "All Locations"}
                <span className="fb-chevron">{cityDropOpen ? "▴" : "▾"}</span>
              </button>
              {cityDropOpen && (
                <div className="fb-drop-panel">
                  <label className="fb-option fb-option-all">
                    <input
                      type="checkbox"
                      checked={selectedCities.length === filterCities.length && filterCities.length > 0}
                      onChange={() =>
                        setSelectedCities(
                          selectedCities.length === filterCities.length ? [] : filterCities.map(c => c.name)
                        )
                      }
                    />
                    <span>Select All</span>
                  </label>
                  <div className="fb-divider" />
                  {filterCities.map(city => (
                    <label key={city.id} className="fb-option">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city.name)}
                        onChange={() =>
                          setSelectedCities(prev =>
                            prev.includes(city.name) ? prev.filter(n => n !== city.name) : [...prev, city.name]
                          )
                        }
                      />
                      <span>{city.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="fb-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
              <div className="fb-drop-label">Status</div>
              <button
                className={`fb-drop-btn${selectedStatuses.length ? " active" : ""}`}
                onClick={() => { setStatusDropOpen(p => !p); setJobDropOpen(false); setCityDropOpen(false); }}
              >
                {selectedStatuses.length ? `Status (${selectedStatuses.length})` : "All Status"}
                <span className="fb-chevron">{statusDropOpen ? "▴" : "▾"}</span>
              </button>
              {statusDropOpen && (
                <div className="fb-drop-panel">
                  {[{ val:"true", label:"Active" }, { val:"false", label:"Inactive" }].map(s => (
                    <label key={s.val} className="fb-option">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(s.val)}
                        onChange={() =>
                          setSelectedStatuses(prev =>
                            prev.includes(s.val) ? prev.filter(v => v !== s.val) : [...prev, s.val]
                          )
                        }
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Row 2: Active chips + Clear All (only shown when filters active) ── */}
          {(selectedJobTitles.length > 0 || selectedCities.length > 0 || selectedStatuses.length > 0) && (
            <div className="fb-bottom-row">
              <div className="fb-chips">

                {selectedJobTitles.map(id => {
                  const role = jobTitles.find(r => r.id === id);
                  return role ? (
                    <span key={id} className="fb-chip">
                      <span className="fb-chip-cat">Role</span>
                      {role.name}
                      <button onClick={() => setSelectedJobTitles(prev => prev.filter(x => x !== id))}>×</button>
                    </span>
                  ) : null;
                })}

                {selectedCities.map(name => (
                  <span key={name} className="fb-chip">
                    <span className="fb-chip-cat">City</span>
                    {name}
                    <button onClick={() => setSelectedCities(prev => prev.filter(x => x !== name))}>×</button>
                  </span>
                ))}

                {selectedStatuses.map(val => (
                  <span key={val} className="fb-chip">
                    <span className="fb-chip-cat">Status</span>
                    {val === "true" ? "Active" : "Inactive"}
                    <button onClick={() => setSelectedStatuses(prev => prev.filter(x => x !== val))}>×</button>
                  </span>
                ))}

              </div>

              <button
                className="fb-clear-all"
                onClick={() => {
                  setSelectedJobTitles([]);
                  setSelectedCities([]);
                  setSelectedStatuses([]);
                  setSearch("");
                }}
              >
                ✕ Clear All
              </button>
            </div>
          )}

        </div>

      {/* Employee Table */}
      <div className="employee-section">

        <table className="employee-table">

          <thead>
            <tr>
              <th>Employee</th>
              <th>Job Title</th>
              <th>Location</th>
              <th>Status</th>
              <th>Teams</th>
              <th> </th>
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
                  <span className="badge badge-job">
                    {member.job_title || "—"}
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

                <td>
                  
                  <div style={{ position: "relative", display: "inline-block" }}>
                      <button
                        className="btn-three-dots"
                        onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                      >
                        ⋮
                      </button>

                      {openDropdown === member.id && (
                        <div className="dots-dropdown">
                          <button
                            className="dots-option dots-option-edit"
                            onClick={() => { handleEdit(member); setOpenDropdown(null); }}
                          >
                            ✏️ Edit Member
                          </button>
                          <button
                            className="dots-option dots-option-delete"
                            onClick={() => { handleDelete(member.id); setOpenDropdown(null); }}
                          >
                            🚫 Delete Member
                          </button>
                        </div>
                      )}
                    </div>
                    

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
      
      </div>

      {/* ============================= */}
      {/* ADD MEMBER MODAL */}
      {/* ============================= */}
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

                  <div className="form-group">
                    <label>Job Title</label>
                    <select
                      name="role_type_id"
                      value={formData.role_type_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Job Title</option>
                      {jobTitles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}

                    </select>
                  </div>

                  {/* Country */}
                  <div className="form-group">

                    <label>Country</label>
                    <select
                      value={formData.country}
                      onChange={handleCountryChange}
                    >

                      <option value="">Select Country</option>

                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}

                    </select>
                  </div>

                  {/* City + Province */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Province/State</label>
                      <select
                        value={formData.province}
                        onChange={handleProvinceChange}
                      >
                        <option value="">Select Province</option>

                        {provinces.map(province => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}

                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>City</label>
                      <select
                        value={formData.city}
                        onChange={handleCityChange}
                      >
                        <option value="">Select City</option>

                        {cities.map(city => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}

                      </select>
                    </div>
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

                  <button
                    className="btn-primary"
                    onClick={handleSubmit}
                  >
                    {editMode ? "Update Member" : "Add Member"}
                  </button>
                </div>

              </div>

            </div>
      )}
    </div>
  );
}

export default Members;