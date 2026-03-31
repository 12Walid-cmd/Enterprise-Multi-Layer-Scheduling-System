import React, { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/teams.css";

function Teams() {
  // ===============================
  // Main page state
  // ===============================
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ===============================
  // Create Team / Subteam modal state
  // ===============================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newTeamGroupId, setNewTeamGroupId] = useState("");
  const [newTeamTimezone, setNewTeamTimezone] = useState("");
  const [modalMode, setModalMode] = useState("team"); // "team" or "subteam"
  const [parentTeam, setParentTeam] = useState(null);

  // ===============================
  // Add Member modal state
  // ===============================
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleTypeId, setSelectedRoleTypeId] = useState("");
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");

  // ===============================
  // Reassign Parent modal state
  // ===============================
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newParentTeamId, setNewParentTeamId] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignError, setReassignError] = useState("");

  // ===============================
  // Initial page load
  // ===============================
  useEffect(() => {
    fetchTeams();
    fetchGroups();
  }, []);

  // ===============================
  // API: Load all teams
  // ===============================
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teams");
      const teamsData = response.data;

      setTeams(teamsData);
      setError("");

      if (teamsData.length > 0 && !selectedTeam) {
        const firstTeam = teamsData[0];
        setSelectedTeam(firstTeam);
        fetchTeamMembers(firstTeam.id);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // API: Load members for selected team
  // ===============================
  const fetchTeamMembers = async (teamId) => {
    try {
      setMembersLoading(true);
      const response = await api.get(`/teams/${teamId}/members`);
      setMembers(response.data);
      setMembersError("");
    } catch (err) {
      console.error("Error fetching team members:", err);
      setMembers([]);
      setMembersError("Failed to load team members.");
    } finally {
      setMembersLoading(false);
    }
  };

  // ===============================
  // API: Load groups
  // ===============================
  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // ===============================
  // API: Load all members for Add Member modal
  // ===============================
  const fetchAllMembers = async () => {
    try {
      const response = await api.get("/members?limit=1000");
      setAllMembers(response.data.data || []);
    } catch (err) {
      console.error("Error fetching all members:", err);
      setAllMembers([]);
    }
  };

  // ===============================
  // API: Load roles for Add Member modal
  // ===============================
  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      setRoles(response.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    }
  };

  // ===============================
  // Event handlers
  // ===============================
  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    fetchTeamMembers(team.id);
  };

  // ===============================
  // Create Team / Subteam modal helpers
  // ===============================
  const openCreateTeamModal = () => {
    setModalMode("team");
    setParentTeam(null);
    setNewTeamName("");
    setNewTeamDescription("");
    setNewTeamGroupId("");
    setNewTeamTimezone("");
    setCreateError("");
    setShowCreateModal(true);
  };

  const openCreateSubteamModal = () => {
    if (!selectedTeam) return;

    setModalMode("subteam");
    setParentTeam(selectedTeam);
    setNewTeamName("");
    setNewTeamDescription("");
    setNewTeamGroupId(selectedTeam.group_id);
    setNewTeamTimezone(selectedTeam.timezone || "");
    setCreateError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setModalMode("team");
    setParentTeam(null);
    setNewTeamName("");
    setNewTeamDescription("");
    setNewTeamGroupId("");
    setNewTeamTimezone("");
    setCreateError("");
  };

  // ===============================
  // Create Team / Subteam submit
  // ===============================
  const handleCreateTeam = async () => {
    try {
      setCreateLoading(true);
      setCreateError("");

      const resolvedGroupId =
        modalMode === "subteam" ? parentTeam?.group_id : newTeamGroupId;

      if (!newTeamName.trim() || !resolvedGroupId) {
        setCreateError("Team name and group are required.");
        return;
      }

      const payload = {
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || null,
        group_id: resolvedGroupId,
        timezone: newTeamTimezone || null,
        parent_team_id: modalMode === "subteam" ? parentTeam?.id : null,
        is_active: true,
      };

      const response = await api.post("/teams", payload);
      const createdTeam = response.data;

      await fetchTeams();
      setSelectedTeam(createdTeam);
      fetchTeamMembers(createdTeam.id);

      closeCreateModal();
    } catch (err) {
      console.error("Error creating team:", err);
      setCreateError(err.response?.data?.error || "Failed to create team.");
    } finally {
      setCreateLoading(false);
    }
  };

  // ===============================
  // Add Member modal helpers
  // ===============================
  const openAddMemberModal = async () => {
    if (!selectedTeam) return;

    setSelectedUserId("");
    setSelectedRoleTypeId("");
    setAddMemberError("");

    await Promise.all([fetchAllMembers(), fetchRoles()]);
    setShowAddMemberModal(true);
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSelectedUserId("");
    setSelectedRoleTypeId("");
    setAddMemberError("");
  };

  // ===============================
  // Add Member submit
  // ===============================
  const handleAddMember = async () => {
    try {
      if (!selectedTeam) {
        setAddMemberError("Please select a team first.");
        return;
      }

      if (!selectedUserId) {
        setAddMemberError("Please select a member.");
        return;
      }

      setAddMemberLoading(true);
      setAddMemberError("");

      await api.post(`/teams/${selectedTeam.id}/members`, {
        user_id: selectedUserId,
        role_type_id: selectedRoleTypeId || null,
      });

      await fetchTeamMembers(selectedTeam.id);
      closeAddMemberModal();
    } catch (err) {
      console.error("Error adding member:", err);
      setAddMemberError(
        err.response?.data?.error || "Failed to add member."
      );
    } finally {
      setAddMemberLoading(false);
    }
  };

  // ===============================
  // Reassign parent modal helpers
  // ===============================
  const openReassignModal = () => {
    if (!selectedTeam) return;

    setNewParentTeamId(selectedTeam.parent_team_id || "");
    setReassignError("");
    setShowReassignModal(true);
  };

  const closeReassignModal = () => {
    setShowReassignModal(false);
    setNewParentTeamId("");
    setReassignError("");
  };

  // ===============================
  // Reassign parent submit
  // ===============================
  const handleReassignParent = async () => {
    try {
      if (!selectedTeam) return;

      setReassignLoading(true);
      setReassignError("");

      const response = await api.put(`/teams/${selectedTeam.id}/parent`, {
        parent_team_id: newParentTeamId || null,
      });

      const updatedTeam = response.data;

      await fetchTeams();

      setSelectedTeam((prev) => ({
        ...prev,
        ...updatedTeam,
        parent_team_name:
          teams.find((team) => team.id === updatedTeam.parent_team_id)?.name ||
          null,
      }));

      closeReassignModal();
    } catch (err) {
      console.error("Error reassigning parent team:", err);
      setReassignError(
        err.response?.data?.error || "Failed to reassign parent team."
      );
    } finally {
      setReassignLoading(false);
    }
  };

  // ===============================
  // Status toggle
  // ===============================
  const handleToggleStatus = async () => {
    if (!selectedTeam) return;

    try {
      const updated = await api.put(`/teams/${selectedTeam.id}/status`, {
        is_active: !selectedTeam.is_active,
      });

      const updatedTeam = updated.data;

      setSelectedTeam((prev) => ({
        ...prev,
        ...updatedTeam,
        parent_team_name: prev?.parent_team_name || null,
        group_name: prev?.group_name || null,
      }));

      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === updatedTeam.id ? { ...team, ...updatedTeam } : team
        )
      );
    } catch (err) {
      console.error("Error updating team status:", err);
    }
  };

  // ===============================
  // Helper functions
  // ===============================
  const formatMemberName = (member) => {
    return `${member.first_name || ""} ${member.last_name || ""}`.trim() || "N/A";
  };

  const formatLocation = (member) => {
    const parts = [member.city, member.province, member.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  // Main teams first, then subteams
  const filteredTeams = [...teams]
    .sort((a, b) => {
      if (!a.parent_team_id && b.parent_team_id) return -1;
      if (a.parent_team_id && !b.parent_team_id) return 1;

      const aKey = `${a.parent_team_name || a.name}-${a.name}`.toLowerCase();
      const bKey = `${b.parent_team_name || b.name}-${b.name}`.toLowerCase();

      return aKey.localeCompare(bKey);
    })
    .filter((team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Only allow valid parent teams:
  // - same group
  // - not itself
  // - top-level teams only
  const availableParentTeams = teams.filter(
    (team) =>
      selectedTeam &&
      team.id !== selectedTeam.id &&
      team.group_id === selectedTeam.group_id &&
      !team.parent_team_id
  );

  return (
    <div className="teams-page">
      <div className="teams-shell">
        <div className="teams-header">
          <div>
            <h1>Teams</h1>
            <p className="teams-subtitle">
              Manage teams and subteams in the system
            </p>
          </div>

          <button className="create-team-btn" onClick={openCreateTeamModal}>
            + Create Team
          </button>
        </div>

        <div className="teams-container">
          <div className="teams-sidebar">
            <h3>Teams</h3>

            <input
              type="text"
              placeholder="Search teams..."
              className="team-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="team-list">
              {loading && <p>Loading teams...</p>}
              {error && <p className="error-text">{error}</p>}

              {!loading &&
                !error &&
                filteredTeams.map((team) => {
                  const isSubteam = !!team.parent_team_id;

                  return (
                    <div
                      key={team.id}
                      className={`team-item ${
                        selectedTeam?.id === team.id ? "active" : ""
                      } ${isSubteam ? "subteam-item" : "main-team-item"}`}
                      onClick={() => handleSelectTeam(team)}
                    >
                      <div className="team-item-content">
                        <div className="team-item-text">
                          <span
                            className={`team-name ${
                              isSubteam ? "subteam-name" : "main-team-name"
                            }`}
                          >
                            {isSubteam ? "↳ " : ""}
                            {team.name}
                          </span>

                          {isSubteam && team.parent_team_name && (
                            <span className="team-parent-label">
                              under {team.parent_team_name}
                            </span>
                          )}
                        </div>

                        <span
                          className={`team-type-badge ${
                            isSubteam ? "subteam-badge" : "main-badge"
                          }`}
                        >
                          {isSubteam ? "Subteam" : "Team"}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {!loading && !error && filteredTeams.length === 0 && (
                <p className="empty-sidebar-text">No teams found.</p>
              )}
            </div>
          </div>

          <div className="team-details">
            <h2>{selectedTeam ? selectedTeam.name : "Select a Team"}</h2>

            <p className="team-description">
              {selectedTeam
                ? selectedTeam.description || "No description available."
                : "Choose a team from the left panel to view details."}
            </p>

            <div className="team-info">
              <div className="info-card">
                <span>Group</span>
                <strong>{selectedTeam?.group_name || "N/A"}</strong>
              </div>

              <div className="info-card">
                <span>Parent Team</span>
                <strong>{selectedTeam?.parent_team_name || "None"}</strong>
              </div>

              <div className="info-card">
                <span>Timezone</span>
                <strong>{selectedTeam?.timezone || "N/A"}</strong>
              </div>

              <div className="info-card">
                <span>Status</span>
                <button
                  className={`status-toggle ${
                    selectedTeam?.is_active ? "active" : "inactive"
                  }`}
                  onClick={handleToggleStatus}
                >
                  {selectedTeam?.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            {selectedTeam && (
              <div className="team-actions">
                <button
                  className="create-team-btn"
                  onClick={openCreateSubteamModal}
                >
                  + Create Subteam
                </button>

                <button
                  className="create-team-btn"
                  onClick={openAddMemberModal}
                >
                  + Add Member
                </button>

                {selectedTeam?.parent_team_id && (
                  <button
                    className="create-team-btn"
                    onClick={openReassignModal}
                  >
                    Reassign Parent
                  </button>
                )}
              </div>
            )}

            <div className="members-section">
              <h3>Team Members</h3>

              {membersLoading && <p>Loading team members...</p>}
              {membersError && <p className="error-text">{membersError}</p>}

              {!membersLoading && !membersError && members.length > 0 && (
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Working Mode</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.team_member_id || member.user_id}>
                        <td>{formatMemberName(member)}</td>
                        <td>{member.email || "N/A"}</td>
                        <td>{member.role_name || "Member"}</td>
                        <td>{member.working_mode || "N/A"}</td>
                        <td>{formatLocation(member)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!membersLoading && !membersError && members.length === 0 && (
                <p>No members found for this team.</p>
              )}
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>
                {modalMode === "subteam" ? "Create Subteam" : "Create Team"}
              </h3>

              {modalMode === "subteam" && parentTeam && (
                <div className="subteam-parent-box">
                  <strong>Parent Team:</strong> {parentTeam.name}
                </div>
              )}

              {createError && <p className="error-text">{createError}</p>}

              <div className="modal-field">
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Team description"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>

              {modalMode === "team" ? (
                <div className="modal-field">
                  <label>Group</label>
                  <select
                    value={newTeamGroupId}
                    onChange={(e) => setNewTeamGroupId(e.target.value)}
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="modal-field">
                  <label>Group</label>
                  <input
                    type="text"
                    value={parentTeam?.group_name || "Same as parent team"}
                    disabled
                  />
                </div>
              )}

              <div className="modal-field">
                <label>Timezone</label>
                <select
                  value={newTeamTimezone}
                  onChange={(e) => setNewTeamTimezone(e.target.value)}
                >
                  <option value="">Select timezone</option>
                  <option value="America/Halifax">America/Halifax</option>
                  <option value="America/Toronto">America/Toronto</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Edmonton">America/Edmonton</option>
                  <option value="America/Vancouver">America/Vancouver</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={closeCreateModal}
                  disabled={createLoading}
                >
                  Cancel
                </button>

                <button
                  className="submit-btn"
                  onClick={handleCreateTeam}
                  disabled={createLoading}
                >
                  {createLoading
                    ? "Creating..."
                    : modalMode === "subteam"
                    ? "Create Subteam"
                    : "Create Team"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddMemberModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Add Member</h3>

              <div className="subteam-parent-box">
                <strong>Selected Team:</strong> {selectedTeam?.name}
              </div>

              {addMemberError && <p className="error-text">{addMemberError}</p>}

              <div className="modal-field">
                <label>Member</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select a member</option>
                  {allMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} - {member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Role</label>
                <select
                  value={selectedRoleTypeId}
                  onChange={(e) => setSelectedRoleTypeId(e.target.value)}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={closeAddMemberModal}
                  disabled={addMemberLoading}
                >
                  Cancel
                </button>

                <button
                  className="submit-btn"
                  onClick={handleAddMember}
                  disabled={addMemberLoading}
                >
                  {addMemberLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showReassignModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Reassign Parent Team</h3>

              <div className="subteam-parent-box">
                <strong>Subteam:</strong> {selectedTeam?.name}
              </div>

              {reassignError && <p className="error-text">{reassignError}</p>}

              <div className="modal-field">
                <label>New Parent Team</label>
                <select
                  value={newParentTeamId}
                  onChange={(e) => setNewParentTeamId(e.target.value)}
                >
                  <option value="">No Parent</option>
                  {availableParentTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={closeReassignModal}
                  disabled={reassignLoading}
                >
                  Cancel
                </button>

                <button
                  className="submit-btn"
                  onClick={handleReassignParent}
                  disabled={reassignLoading}
                >
                  {reassignLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teams;