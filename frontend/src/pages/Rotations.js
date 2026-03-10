import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/rotations.css";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Member Item Component
function SortableMemberItem({ member, onRemove, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="current-member-item"
    >
      <div className="member-info-wrapper">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="drag-handle"
          style={{ cursor: 'grab', padding: '0 8px', fontSize: '18px', color: '#6b7280' }}
        >
          ⋮⋮
        </div>
        
        {/* Position Number */}
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '16px', 
          color: '#374151',
          minWidth: '35px',
          marginRight: '8px'
        }}>
          {index + 1}.
        </div>
        
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
      <button className="remove-member-btn" onClick={() => onRemove(member.id)}>
        Remove
      </button>
    </div>
  );
}

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
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableRotationTypes, setAvailableRotationTypes] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const [newRotation, setNewRotation] = useState({
    name: '',
    rotation_type: '',
    group_id: '',
    team_id: '',
    cadence_type: '',
    cadence_interval: 1,
    min_assignees: 1
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch rotations on component mount
  useEffect(() => {
    fetchRotations();
    fetchUsers();
    fetchTeams();
    fetchGroups();
    fetchRotationTypes();
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
    const response = await api.get('/members?limit=1000');
    const formattedUsers = response.data.data.map(user => ({  
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      initials: `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`,
      jobTitle: user.job_title || 'Staff' 
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

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setAvailableGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchRotationTypes = async () => {
    try {
      const response = await api.get('/rotations/types');
      setAvailableRotationTypes(response.data);
    } catch (error) {
      console.error("Error fetching rotation types:", error);
    }
  };

  const handleCreateRotation = async () => {
    // Validation
    if (!newRotation.name || !newRotation.rotation_type || !newRotation.cadence_type) {
      alert("Please fill in all required fields (marked with *)");
      return;
    }

    try {
      await api.post('/rotations', {
        name: newRotation.name,
        rotation_type: newRotation.rotation_type,
        group_id: newRotation.group_id || null,
        team_id: newRotation.team_id || null,
        cadence_type: newRotation.cadence_type,
        cadence_interval: newRotation.cadence_interval,
        min_assignees: newRotation.min_assignees
      });

      // Close modal
      setShowModal(false);
      
      // Reset form
      setNewRotation({
        name: '',
        rotation_type: '',
        group_id: '',
        team_id: '',
        cadence_type: '',
        cadence_interval: 1,
        min_assignees: 1
      });

      // Refresh rotations list
      await fetchRotations();
      
      alert("Rotation created successfully!");
    } catch (error) {
      console.error("Error creating rotation:", error);
      alert(error.response?.data?.error || "Failed to create rotation");
    }
  };

  const handleToggleRotationStatus = async (rotation) => {
    const action = rotation.is_active ? 'deactivate' : 'activate';
    const newStatus = !rotation.is_active;
    
    if (!window.confirm(`Are you sure you want to ${action} this rotation?${rotation.is_active ? ' Members will be preserved but the rotation will be marked as inactive.' : ''}`)) {
      return;
    }

    try {
      await api.patch(`/rotations/${rotation.id}`, {
        is_active: newStatus
      });
      
      await fetchRotations();
      setOpenMenuId(null);
      alert(`Rotation ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing rotation:`, error);
      alert(`Failed to ${action} rotation`);
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

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = rotationMembers.findIndex((m) => m.id === active.id);
      const newIndex = rotationMembers.findIndex((m) => m.id === over.id);

      const reorderedMembers = arrayMove(rotationMembers, oldIndex, newIndex);
      
      // Update UI immediately
      setRotationMembers(reorderedMembers);

      // Update database
      try {
        await api.patch(`/rotations/${selectedRotation.id}/members/reorder`, {
          memberIds: reorderedMembers.map(m => m.id)
        });
      } catch (error) {
        console.error("Error updating member order:", error);
        alert("Failed to update member order");
        // Revert on error
        await handleManageMembers(selectedRotation);
      }
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
          <p className="page-subtitle" style={{color: '#ffffff'}}>
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
              <div style={{position: 'relative'}}>
                <div 
                  className="rotation-menu" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setOpenMenuId(openMenuId === rotation.id ? null : rotation.id);
                  }}
                >
                  ⋮
                </div>
                
                {openMenuId === rotation.id && (
                  <div className="rotation-dropdown-menu">
                    <button 
                      className="dropdown-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRotationStatus(rotation);
                      }}
                    >
                      {rotation.is_active ? '🚫 Deactivate Rotation' : '✅ Activate Rotation'}
                    </button>
                    <button 
                      className="dropdown-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Edit - Coming soon!");
                        setOpenMenuId(null);
                      }}
                    >
                      ✏️ Edit Rotation
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rotation-details">
              {rotation.group_name && (
                <div className="detail-row">
                  <span className="detail-icon">🏢</span>
                  <span>{rotation.group_name}</span>
                </div>
              )}
              
              {rotation.team_name && (
                <div className="detail-row">
                  <span className="detail-icon">👥</span>
                  <span>{rotation.team_name}</span>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-icon">📆</span>
                <span>
                  Every {rotation.cadence_interval}{' '}
                  {rotation.cadence_type === 'DAILY' ? (rotation.cadence_interval === 1 ? 'day' : 'days') :
                   rotation.cadence_type === 'WEEKLY' ? (rotation.cadence_interval === 1 ? 'week' : 'weeks') :
                   rotation.cadence_type === 'BI_WEEKLY' ? (rotation.cadence_interval === 1 ? 'bi-week' : 'bi-weeks') :
                   rotation.cadence_type === 'MONTHLY' ? (rotation.cadence_interval === 1 ? 'month' : 'months') :
                   rotation.cadence_type.toLowerCase()}
                </span>
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
        <div className="create-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="create-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="create-modal-header">
              <h2 className="create-modal-title">Create New Rotation</h2>
              <button className="create-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* Body */}
            <div className="create-modal-body">
              <div className="form-group">
                <label className="form-label">Rotation Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., CDO On-Call Rotation"
                  value={newRotation.name}
                  onChange={(e) => setNewRotation({...newRotation, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rotation Type *</label>
                <select 
                  className="form-select"
                  value={newRotation.rotation_type}
                  onChange={(e) => setNewRotation({...newRotation, rotation_type: e.target.value})}
                >
                  <option value="">Select rotation type...</option>
                  {availableRotationTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Group</label>
                <select 
                  className="form-select"
                  value={newRotation.group_id}
                  onChange={(e) => setNewRotation({...newRotation, group_id: e.target.value})}
                >
                  <option value="">Select group (optional)...</option>
                  {availableGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Team</label>
                <select 
                  className="form-select"
                  value={newRotation.team_id}
                  onChange={(e) => setNewRotation({...newRotation, team_id: e.target.value})}
                >
                  <option value="">Select team (optional)...</option>
                  {availableTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cadence Type *</label>
                <select 
                  className="form-select"
                  value={newRotation.cadence_type}
                  onChange={(e) => setNewRotation({...newRotation, cadence_type: e.target.value})}
                >
                  <option value="">Select cadence...</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cadence Interval *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g., 1"
                  min="1"
                  value={newRotation.cadence_interval}
                  onChange={(e) => setNewRotation({...newRotation, cadence_interval: parseInt(e.target.value) || 1})}
                />
                <small style={{color: '#6b7280', fontSize: '12px'}}>
                  Every {newRotation.cadence_interval || 1} {newRotation.cadence_type?.toLowerCase() || 'period'}(s)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Assignees *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g., 1"
                  min="1"
                  value={newRotation.min_assignees}
                  onChange={(e) => setNewRotation({...newRotation, min_assignees: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="create-modal-footer">
              <button className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" onClick={handleCreateRotation}>Create Rotation</button>
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={rotationMembers.map(m => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="current-members-list">
                        {rotationMembers.map((member, index) => (
                          <SortableMemberItem
                            key={member.id}
                            index={index}
                            member={member}
                            onRemove={handleRemoveMember}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
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
                          <span className="member-mode-badge">{user.jobTitle}</span>
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