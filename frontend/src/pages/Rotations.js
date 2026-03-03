import React, { useState } from "react";
import "../styles/rotations.css";

function Rotations() {
  const [showModal, setShowModal] = useState(false);

  const rotations = [
    {
      id: 1,
      title: "CDO On-Call Rotation",
      type: "On-Call • Weekly",
      team: "CDO FDN Business Services",
      cadence: "Every 1 week",
      minAssignees: 1,
      status: "ACTIVE",
      members: ["SG", "NW", "KM", "DM"],
      more: 4
    },
    {
      id: 2,
      title: "Mountain Shift Rotation",
      type: "Mountain Shift • Weekly",
      team: "CDO FDN Subsurface and Land",
      cadence: "Every 1 week",
      minAssignees: 2,
      status: "ACTIVE",
      members: ["DS", "AH", "JD", "AB"],
      more: 8
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Rotation Management</h1>
          <p className="page-subtitle">
            Create and manage rotation pools for your teams
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowModal(true)}
        >
          <span>➕</span>
          <span>Create Rotation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <div className="filter-label">Search</div>
          <input
            type="text"
            className="search-input"
            placeholder="Search rotations..."
          />
        </div>

        <div className="filter-group">
          <div className="filter-label">Rotation Type</div>
          <select className="filter-select">
            <option>All Types</option>
            <option>On-Call</option>
            <option>Mountain Shift</option>
            <option>Analyst</option>
            <option>Service Desk</option>
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">Team</div>
          <select className="filter-select">
            <option>All Teams</option>
            <option>Platforms</option>
            <option>IT Apps</option>
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">Status</div>
          <select className="filter-select">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Rotations Grid */}
      <div className="rotations-grid">
        {rotations.map((rotation) => (
          <div
            key={rotation.id}
            className={`rotation-card ${
              rotation.status === "INACTIVE" ? "inactive" : ""
            }`}
          >
            <div className="rotation-header">
              <div>
                <div className="rotation-title">{rotation.title}</div>
                <div className="rotation-type">{rotation.type}</div>
              </div>
              <div className="rotation-menu">⋮</div>
            </div>

            <div className="rotation-details">
              <div className="detail-row">
                <span className="detail-icon">🏢</span>
                <span>{rotation.team}</span>
              </div>

              <div className="detail-row">
                <span className="detail-icon">📆</span>
                <span>{rotation.cadence}</span>
              </div>

              <div className="detail-row">
                <span className="detail-icon">👤</span>
                <span>Min {rotation.minAssignees} assignee(s)</span>
              </div>

              <div className="detail-row">
                <span
                  className={`status-badge ${
                    rotation.status === "ACTIVE"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {rotation.status}
                </span>
              </div>
            </div>

            <div className="rotation-members">
              <div className="members-header">
                {rotation.members.length + rotation.more} Members
              </div>

              <div className="members-avatars">
                {rotation.members.map((m, i) => (
                  <div key={i} className="member-avatar">
                    {m}
                  </div>
                ))}

                {rotation.more > 0 && (
                  <div className="more-members">
                    +{rotation.more}
                  </div>
                )}
              </div>
            </div>

            <div className="rotation-actions">
              <button className="action-btn">
                View Details
              </button>
              <button className="action-btn">
                Manage Members
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                Create New Rotation
              </h2>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Rotation Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., CDO On-Call Rotation"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Rotation Type *
                </label>
                <select className="form-select">
                  <option>Select rotation type...</option>
                  <option>On-Call</option>
                  <option>Mountain Shift</option>
                  <option>Analyst</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button">
                Create Rotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rotations;