import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/rotations.css";

function Rotations() {
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedRotation, setSelectedRotation] = useState(null);
  const [rotationMembers, setRotationMembers] = useState([]);
  const [addMemberMode, setAddMemberMode] = useState("individual");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rotations, setRotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);

  // Fetch rotations on component mount
  useEffect(() => {
    fetchRotations();
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchRotations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rotations');
      setRotations(response.data);
    } catch (error) {
      console.error("Error fetching rotations:", error);
      alert("Failed to load rotations");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const formattedUsers = response.data.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        initials: `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`,
        workingMode: user.working_mode || 'Local'
      }));
      setAvailableUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setAvailableTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleManageMembers = async (rotation) => {
    setSelectedRotation(rotation);
    setShowMembersModal(true);
    
    try {
      const response = await api.get(`/rotations/${rotation.id}/members`);
      setRotationMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
      setRotationMembers([]);
    }
  };

  const handleAddMembers = async () => {
    if (addMemberMode === "individual" && selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }
    if (addMemberMode === "team" && !selectedTeam) {
      alert("Please select a team");
      return;
    }

    try {
      await api.post(`/rotations/${selectedRotation.id}/members`, {
        type: addMemberMode,
        userIds: addMemberMode === "individual" ? selectedUsers : undefined,
        teamId: addMemberMode === "team" ? selectedTeam : undefined
      });
      
      // Refresh members list
      const response = await api.get(`/rotations/${selectedRotation.id}/members`);
      setRotationMembers(response.data);
      
      setSelectedUsers([]);
      setSelectedTeam("");
      alert(`Successfully added ${addMemberMode === "individual" ? selectedUsers.length + " member(s)" : "team"}!`);
    } catch (error) {
      console.error("Error adding members:", error);
      alert(error.response?.data?.error || "Failed to add members");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/rotations/${selectedRotation.id}/members/${memberId}`);
      setRotationMembers(rotationMembers.filter(m => m.id !== memberId));
      alert("Member removed successfully!");
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = availableUsers.filter(user =>
    !rotationMembers.some(m => m.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTeams = availableTeams.filter(team =>
    !rotationMembers.some(m => m.id === team.id) &&
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="rotations-page">
        <h2 style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading rotations...</h2>
      </div>
    );
  }

  return (
    <div className="rotations-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Rotation Management</h1>
          <p className="page-subtitle">
            Create and manage rotation pools for your teams
          </p>
        </div>

        <button className="primary-button" onClick={() => setShowModal(true)}>
          <span>➕</span>
          <span>Create Rotation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <div className="filter-label">Search</div>
          <input type="text" className="search-input" placeholder="Search rotations..." />
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
            <option>CDO FDN Business Services</option>
            <option>CDO FDN Subsurface and Land</option>
            <option>CDO FDN Ops App Support</option>
            <option>IT Apps</option>
            <option>Service Desk</option>
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
          <div key={rotation.id} className={`rotation-card ${rotation.is_active === false ? "inactive" : ""}`}>
            <div className="rotation-header">
              <div>
                <div className="rotation-title">{rotation.name}</div>
                <div className="rotation-type">{rotation.rotation_type} • {rotation.cadence_type}</div>
              </div>
              <div className="rotation-menu">⋮</div>
            </div>

            <div className="rotation-details">
              <div className="detail-row">
                <span className="detail-icon">📆</span>
                <span>Every {rotation.cadence_interval} {rotation.cadence_type.toLowerCase()}</span>
              </div>

              <div className="detail-row">
                <span className="detail-icon">👤</span>
                <span>Min {rotation.min_assignees} assignee(s)</span>
              </div>

              <div className="detail-row">
                <span className={`status-badge ${rotation.is_active ? "status-active" : "status-inactive"}`}>
                  {rotation.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>

            <div className="rotation-actions">
              <button className="action-btn" onClick={(e) => { e.stopPropagation(); alert("View Details - Coming soon!"); }}>
                View Details
              </button>
              <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleManageMembers(rotation); }}>
                Manage Members
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rotation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Rotation</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Rotation Name *</label>
                <input type="text" className="form-input" placeholder="e.g., CDO On-Call Rotation" />
              </div>

              <div className="form-group">
                <label className="form-label">Rotation Type *</label>
                <select className="form-select">
                  <option>Select rotation type...</option>
                  <option>On-Call</option>
                  <option>Mountain Shift</option>
                  <option>Analyst</option>
                  <option>Service Desk</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button">Create Rotation</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && (
        <div className="members-modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="members-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="members-modal-header">
              <div>
                <h2 className="members-modal-title">Manage Rotation Members</h2>
                <p className="members-modal-subtitle">{selectedRotation?.name}</p>
              </div>
              <button className="members-modal-close" onClick={() => setShowMembersModal(false)}>×</button>
            </div>

            {/* Body */}
            <div className="members-modal-body">
              
              {/* Current Members Section */}
              <div className="current-members-section">
                <h3 className="members-section-title">Current Members ({rotationMembers.length})</h3>
                
                {rotationMembers.length === 0 ? (
                  <div className="members-empty-state">
                    <div className="members-empty-icon">👥</div>
                    <p className="members-empty-text">No members assigned yet</p>
                  </div>
                ) : (
                  <div className="current-members-list">
                    {rotationMembers.map((member) => (
                      <div key={member.id} className="current-member-item">
                        <div className="member-info-wrapper">
                          <div className="member-avatar-circle">{member.initials}</div>
                          <div className="member-info-text">
                            <div className="member-name-text">
                              {member.name}
                              {member.type === "team" && (
                                <span className="member-team-badge">Team ({member.memberCount})</span>
                              )}
                            </div>
                            {member.email && (
                              <div className="member-email-display">{member.email}</div>
                            )}
                          </div>
                        </div>
                        <button className="remove-member-btn" onClick={() => handleRemoveMember(member.id)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Members Section */}
              <div className="add-members-area">
                <h3 className="members-section-title">Add Members</h3>

                {/* Toggle Individual vs Team */}
                <div className="member-mode-toggle">
                  <button
                    className={`mode-toggle-btn ${addMemberMode === "individual" ? "active" : ""}`}
                    onClick={() => { setAddMemberMode("individual"); setSearchQuery(""); }}
                  >
                    👤 Add Individuals
                  </button>
                  <button
                    className={`mode-toggle-btn ${addMemberMode === "team" ? "active" : ""}`}
                    onClick={() => { setAddMemberMode("team"); setSearchQuery(""); }}
                  >
                    👥 Add Entire Team
                  </button>
                </div>

                {/* Search Box */}
                <div className="member-search-wrapper">
                  <input
                    type="text"
                    placeholder={addMemberMode === "individual" ? "Search users..." : "Search teams..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="member-search-input"
                  />
                </div>

                {/* Selection List */}
                <div className="member-selection-list">
                  {addMemberMode === "individual" ? (
                    filteredUsers.length === 0 ? (
                      <p className="no-members-text">No users available</p>
                    ) : (
                      filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className={`member-select-item ${selectedUsers.includes(user.id) ? "selected" : ""}`}
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => {}}
                            className="member-select-checkbox"
                          />
                          <div className="member-select-info">
                            <div className="member-select-name">{user.name}</div>
                            <div className="member-select-detail">{user.email}</div>
                          </div>
                          <span className="member-mode-badge">{user.workingMode}</span>
                        </div>
                      ))
                    )
                  ) : (
                    filteredTeams.length === 0 ? (
                      <p className="no-members-text">No teams available</p>
                    ) : (
                      filteredTeams.map(team => (
                        <div
                          key={team.id}
                          className={`member-select-item ${selectedTeam === team.id ? "selected" : ""}`}
                          onClick={() => setSelectedTeam(team.id)}
                        >
                          <input
                            type="radio"
                            name="team"
                            checked={selectedTeam === team.id}
                            onChange={() => {}}
                            className="member-select-radio"
                          />
                          <div className="member-select-info">
                            <div className="member-select-name">👥 {team.name}</div>
                            <div className="member-select-detail">{team.member_count || 0} members</div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>

                <button
                  className="add-members-btn"
                  onClick={handleAddMembers}
                  disabled={
                    (addMemberMode === "individual" && selectedUsers.length === 0) ||
                    (addMemberMode === "team" && !selectedTeam)
                  }
                >
                  {addMemberMode === "individual"
                    ? `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? "s" : ""}`
                    : "Add Team"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="members-modal-footer">
              <button className="members-close-btn" onClick={() => setShowMembersModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rotations;