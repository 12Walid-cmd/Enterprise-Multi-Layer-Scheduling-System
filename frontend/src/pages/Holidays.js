import React, { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/holidays.css";

function Holidays() {
  // ===============================
  // Main page state
  // ===============================
  const [holidays, setHolidays] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ===============================
  // Modal state
  // ===============================
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState(null);
  const [formError, setFormError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    holiday_date: "",
    holiday_type: "GENERAL",
    group_id: ""
  });

  // ===============================
  // Initial page load
  // ===============================
  useEffect(() => {
    fetchHolidays();
    fetchGroups();
  }, []);

  // ===============================
  // API: Load all holidays
  // ===============================
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await api.get("/holidays");
      const holidaysData = (response.data || []).sort(
        (a, b) =>
          new Date(a.holiday_date).getTime() -
          new Date(b.holiday_date).getTime()
      );

      setHolidays(holidaysData);
      setError("");

      if (holidaysData.length > 0) {
        setSelectedHoliday((prevSelected) => {
          if (!prevSelected) return holidaysData[0];

          const updatedSelected = holidaysData.find(
            (holiday) => holiday.id === prevSelected.id
          );

          return updatedSelected || holidaysData[0];
        });
      } else {
        setSelectedHoliday(null);
      }
    } catch (err) {
      console.error("Error fetching holidays:", err);
      setError("Failed to load holidays.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // API: Load groups
  // ===============================
  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // ===============================
  // Helper functions
  // ===============================
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getScopeLabel = (holiday) => {
    if (!holiday?.group_id) return "Global / General";

    const matchingGroup = groups.find((group) => group.id === holiday.group_id);
    return matchingGroup ? matchingGroup.name : "Group Scoped";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      holiday_date: "",
      holiday_type: "GENERAL",
      group_id: ""
    });
    setFormError("");
    setEditMode(false);
    setSelectedHolidayId(null);
  };

  // ===============================
  // Event handlers
  // ===============================
  const handleSelectHoliday = (holiday) => {
    setSelectedHoliday(holiday);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ===============================
  // Modal helpers
  // ===============================
  const openCreateModal = () => {
    resetForm();
    setError("");
    setShowModal(true);
  };

  const openEditModal = () => {
    if (!selectedHoliday) return;

    setEditMode(true);
    setSelectedHolidayId(selectedHoliday.id);
    setFormError("");
    setError("");

    setFormData({
      name: selectedHoliday.name || "",
      holiday_date: selectedHoliday.holiday_date
        ? selectedHoliday.holiday_date.slice(0, 10)
        : "",
      holiday_type: selectedHoliday.holiday_type || "GENERAL",
      group_id: selectedHoliday.group_id || ""
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ===============================
  // Submit create / edit
  // ===============================
  const handleSubmit = async () => {
    try {
      setSaveLoading(true);
      setFormError("");

      if (!formData.name.trim() || !formData.holiday_date) {
        setFormError("Holiday name and date are required.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        holiday_date: formData.holiday_date,
        holiday_type: formData.holiday_type || "GENERAL",
        group_id: formData.group_id || null
      };

      if (editMode) {
        const response = await api.put(`/holidays/${selectedHolidayId}`, payload);
        const updatedHoliday = response.data;

        setHolidays((prev) =>
          prev
            .map((holiday) =>
              holiday.id === updatedHoliday.id ? updatedHoliday : holiday
            )
            .sort(
              (a, b) =>
                new Date(a.holiday_date).getTime() -
                new Date(b.holiday_date).getTime()
            )
        );

        setSelectedHoliday(updatedHoliday);
      } else {
        const response = await api.post("/holidays", payload);
        const createdHoliday = response.data;

        const updatedList = [...holidays, createdHoliday].sort(
          (a, b) =>
            new Date(a.holiday_date).getTime() -
            new Date(b.holiday_date).getTime()
        );

        setHolidays(updatedList);
        setSelectedHoliday(createdHoliday);
      }

      closeModal();
    } catch (err) {
      console.error("Error saving holiday:", err);
      console.error("Save error response:", err.response);
      console.error("Save error data:", err.response?.data);
      setFormError(err.response?.data?.error || "Failed to save holiday.");
    } finally {
      setSaveLoading(false);
    }
  };

  // ===============================
  // Delete holiday
  // ===============================
  const openDeleteModal = () => {
    if (!selectedHoliday) return;
    setError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setError("");
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!selectedHoliday) return;

    try {
      setDeleteLoading(true);
      setError("");

      await api.delete(`/holidays/${selectedHoliday.id}`);

      const updatedHolidays = holidays.filter(
        (holiday) => holiday.id !== selectedHoliday.id
      );

      setHolidays(updatedHolidays);
      setSelectedHoliday(updatedHolidays[0] || null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting holiday:", err);
      console.error("Delete error response:", err.response);
      console.error("Delete error data:", err.response?.data);
      setError(err.response?.data?.error || "Failed to delete holiday.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ===============================
  // Filtered list
  // ===============================
  const filteredHolidays = holidays.filter((holiday) => {
    const text =
      `${holiday.name} ${holiday.holiday_type} ${holiday.holiday_date}`.toLowerCase();

    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="holidays-page">
      <div className="holidays-shell">
        <div className="holidays-header">
          <div>
            <h1>Holidays</h1>
            <p className="holidays-subtitle">
              Manage global and general holidays in the system
            </p>
          </div>

          <button className="create-holiday-btn" onClick={openCreateModal}>
            + Add Holiday
          </button>
        </div>

        <div className="holidays-container">
          <div className="holidays-sidebar">
            <h3>Holidays</h3>

            <input
              type="text"
              placeholder="Search holidays..."
              className="holiday-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="holiday-list">
              {loading && <p>Loading holidays...</p>}
              {error && <p className="error-text">{error}</p>}

              {!loading &&
                !error &&
                filteredHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className={`holiday-item ${
                      selectedHoliday?.id === holiday.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectHoliday(holiday)}
                  >
                    <div className="holiday-item-content">
                      <div className="holiday-item-text">
                        <span className="holiday-name">{holiday.name}</span>
                        <span className="holiday-date">
                          {formatDate(holiday.holiday_date)}
                        </span>
                      </div>

                      <span className="holiday-type-badge">
                        {holiday.holiday_type || "OTHER"}
                      </span>
                    </div>
                  </div>
                ))}

              {!loading && !error && filteredHolidays.length === 0 && (
                <p className="empty-sidebar-text">No holidays found.</p>
              )}
            </div>
          </div>

          <div className="holiday-details">
            <h2>{selectedHoliday ? selectedHoliday.name : "Select a Holiday"}</h2>

            <p className="holiday-description">
              {selectedHoliday
                ? "View and manage holiday details used in the scheduling system."
                : "Choose a holiday from the left panel to view details."}
            </p>

            {selectedHoliday && (
              <>
                <div className="holiday-info">
                  <div className="info-card">
                    <span>Date</span>
                    <strong>{formatDate(selectedHoliday.holiday_date)}</strong>
                  </div>

                  <div className="info-card">
                    <span>Type</span>
                    <strong>{selectedHoliday.holiday_type || "OTHER"}</strong>
                  </div>

                  <div className="info-card">
                    <span>Scope</span>
                    <strong>{getScopeLabel(selectedHoliday)}</strong>
                  </div>
                </div>

                <div className="holiday-actions">
                  <button className="primary-btn" onClick={openEditModal}>
                    Edit Holiday
                  </button>

                  <button className="danger-btn" onClick={openDeleteModal}>
                    Delete Holiday
                  </button>
                </div>
              </>
            )}

            {!selectedHoliday && !loading && <p>No holiday selected.</p>}
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>{editMode ? "Edit Holiday" : "Add New Holiday"}</h3>

              {formError && <p className="error-text">{formError}</p>}

              <div className="modal-field">
                <label>Holiday Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Holiday name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-field">
                <label>Date</label>
                <input
                  type="date"
                  name="holiday_date"
                  value={formData.holiday_date}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-field">
                <label>Holiday Type</label>
                <select
                  name="holiday_type"
                  value={formData.holiday_type}
                  onChange={handleChange}
                >
                  <option value="GLOBAL">GLOBAL</option>
                  <option value="GENERAL">GENERAL</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Scope</label>
                <select
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleChange}
                >
                  <option value="">Global / General Holiday</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saveLoading}
                >
                  Cancel
                </button>

                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={saveLoading}
                >
                  {saveLoading
                    ? editMode
                      ? "Updating..."
                      : "Creating..."
                    : editMode
                    ? "Update Holiday"
                    : "Create Holiday"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Delete Holiday</h3>
              <p className="holiday-description">
                Are you sure you want to delete{" "}
                <strong>{selectedHoliday?.name}</strong>?
              </p>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>

                <button
                  className="danger-btn"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete Holiday"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Holidays;