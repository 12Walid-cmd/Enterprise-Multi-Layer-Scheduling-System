import React, { useEffect, useState } from "react";
import api from "../api/api";
import "../styles/teams.css";

function Teams() {
  // ===============================
  // Main page state
  // ===============================
  // Stores all teams loaded from the backend
  const [teams, setTeams] = useState([]);

  // Stores the currently selected team from the sidebar
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Stores members belonging to the selected team
  const [members, setMembers] = useState([]);

  // Loading/error state for team list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Loading/error state for team members
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  // Stores the current search input for filtering teams in the sidebar
  const [searchTerm, setSearchTerm] = useState("");

  // Controls whether the Create Team modal is visible
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ===============================
  // Create Team modal state
  // ===============================
  // Stores available groups for the group dropdown in the modal
  const [groups, setGroups] = useState([]);

  // Loading/error state for team creation
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Form values for creating a new team
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newTeamGroupId, setNewTeamGroupId] = useState("");
  const [newTeamTimezone, setNewTeamTimezone] = useState("");

 // ===============================
    // Initial page load
    // ===============================
    // On first render, load teams and groups from the backend
    useEffect(() => {
      fetchTeams();
      fetchGroups();
    }, []);

  // ===============================
  // API: Load all teams
  // ===============================
  // Fetches all teams for the sidebar.
  // If this is the first load and no team is selected yet,
  // automatically select the first team and load its members.
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
  // API: Load members for one team
  // ===============================
  // Fetches all members assigned to a selected team.
  // Called whenever a user clicks a team in the sidebar.
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
  // Fetches available groups for the Create Team modal dropdown.
  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // ===============================
  // Event handlers
  // ===============================
  // Updates the selected team and loads its members
  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    fetchTeamMembers(team.id);
  };

  // Creates a new team from modal form data,
  // refreshes the team list, selects the new team,
  // and closes the modal on success.
  const handleCreateTeam = async () => {
    try {
      setCreateLoading(true);
      setCreateError("");

      if (!newTeamName.trim() || !newTeamGroupId) {
        setCreateError("Team name and group are required.");
        return;
      }

      const payload = {
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || null,
        group_id: newTeamGroupId,
        timezone: newTeamTimezone || null,
        parent_team_id: null,
        is_active: true,
      };

      const response = await api.post("/teams", payload);
      const createdTeam = response.data;

      await fetchTeams();
      setSelectedTeam(createdTeam);
      fetchTeamMembers(createdTeam.id);

      // Reset modal form after successful creation
      setNewTeamName("");
      setNewTeamDescription("");
      setNewTeamGroupId("");
      setNewTeamTimezone("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating team:", err);
      setCreateError(err.response?.data?.error || "Failed to create team.");
    } finally {
      setCreateLoading(false);
    }
  };

    

    // ===============================
    // Helper functions
    // ===============================
    // Builds a readable full name for a member
  const formatMemberName = (member) => {
    return `${member.first_name || ""} ${member.last_name || ""}`.trim() || "N/A";
  };

  // Builds a readable location string from available location fields
  const formatLocation = (member) => {
    const parts = [member.city, member.province, member.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  // Filters teams in the sidebar based on the search input
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="teams-page">
      {/* ===============================
          Page header
          Displays page title and opens the Create Team modal
         =============================== */}
      <div className="teams-header">
        <h1>Teams</h1>
        <button
          className="create-team-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Team
        </button>
      </div>

      {/* ===============================
          Main layout
          Left side = team list
          Right side = selected team details
         =============================== */}
      <div className="teams-container">
        {/* ===============================
            Sidebar
            Contains search and filtered list of teams
           =============================== */}
        <div className="teams-sidebar">
          <h3>Teams</h3>

          {/* Search input used to filter teams by name */}
          <input
            type="text"
            placeholder="Search teams..."
            className="team-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Team list with loading/error/empty states */}
          <div className="team-list">
            {loading && <p>Loading teams...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading &&
              !error &&
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className={`team-item ${
                    selectedTeam?.id === team.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectTeam(team)}
                >
                  {team.name}
                </div>
              ))}

            {!loading && !error && filteredTeams.length === 0 && (
              <p className="empty-sidebar-text">No teams found.</p>
            )}
          </div>
        </div>

        {/* ===============================
            Team details panel
            Shows currently selected team's info and members
           =============================== */}
        <div className="team-details">
          <h2>{selectedTeam ? selectedTeam.name : "Select a Team"}</h2>

          <p className="team-description">
            {selectedTeam
              ? selectedTeam.description || "No description available."
              : "Choose a team from the left panel to view details."}
          </p>

          {/* Summary cards for selected team */}
          <div className="team-info">
            <div className="info-card">
              <span>Group</span>
              <strong>{selectedTeam?.group_name || "N/A"}</strong>
            </div>

            <div className="info-card">
              <span>Timezone</span>
              <strong>{selectedTeam?.timezone || "N/A"}</strong>
            </div>

            <div className="info-card">
              <span>Status</span>
              <strong>{selectedTeam?.is_active ? "Active" : "Inactive"}</strong>
            </div>
          </div>

          {/* Members table for the selected team */}
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

      {/* ===============================
          Create Team modal
          Rendered only when showCreateModal is true
         =============================== */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Create Team</h3>

            {createError && <p className="error-text">{createError}</p>}

            {/* Team name input */}
            <div className="modal-field">
              <label>Team Name</label>
              <input
                type="text"
                placeholder="Team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>

            {/* Team description input */}
            <div className="modal-field">
              <label>Description</label>
              <input
                type="text"
                placeholder="Team description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
              />
            </div>

            {/* Group selection loaded from backend */}
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

            {/* Optional timezone selection */}
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

            {/* Modal action buttons */}
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Cancel
              </button>

              <button
                className="submit-btn"
                onClick={handleCreateTeam}
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Create Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;