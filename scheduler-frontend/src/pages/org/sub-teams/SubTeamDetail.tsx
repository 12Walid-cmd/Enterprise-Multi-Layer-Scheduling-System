import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { SubTeamsAPI, SubTeamMembersAPI, TeamMembersAPI } from "../../../api";
import type { SubTeamMember, TeamMember } from "../../../types/org";

export default function SubTeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subTeam, setSubTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<SubTeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [newMemberUserId, setNewMemberUserId] = useState("");

  const load = async () => {
    if (!id) return;

    const st = await SubTeamsAPI.getOne(id);
    const members = await SubTeamMembersAPI.get(id);
    const teamMembers = await TeamMembersAPI.get(st.parent_team_id);

    setSubTeam(st);
    setMembers(members);
    setTeamMembers(teamMembers);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAddMember = async () => {
    if (!newMemberUserId) return;

    await SubTeamMembersAPI.add(id!, { userId: newMemberUserId });
    setNewMemberUserId("");
    load();
  };

  const handleRemoveMember = async (userId: string) => {
    await SubTeamMembersAPI.remove(id!, userId);
    load();
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (!subTeam)
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Sub-team not found.</Typography>
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {subTeam.name}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography>
          <strong>Description:</strong> {subTeam.description || "No description"}
        </Typography>

        <Typography>
          <strong>Members:</strong> {members.length}
        </Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/teams/sub-teams/${id}/edit`)}
          >
            Edit Sub-team
          </Button>
        </Box>
      </Paper>

      {/* Members List */}
      <Typography variant="h5" mt={4} mb={2}>
        Sub-team Members
      </Typography>

      {members.length === 0 && <Typography>No members in this sub-team.</Typography>}

      {members.map((m) => (
        <Paper key={m.user_id} sx={{ p: 2, mb: 1 }}>
          <Typography>
            <strong>User:</strong> {m.users?.first_name} {m.users?.last_name}
          </Typography>

          <Button
            color="error"
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => handleRemoveMember(m.user_id)}
          >
            Remove
          </Button>
        </Paper>
      ))}

      {/* Add Member */}
      <Typography variant="h6" mt={4}>
        Add Member
      </Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>User</InputLabel>
        <Select
          value={newMemberUserId}
          label="User"
          onChange={(e) => setNewMemberUserId(e.target.value)}
        >
          {teamMembers.map((tm) => (
            <MenuItem key={tm.user_id} value={tm.user_id}>
              {tm.users?.first_name} {tm.users?.last_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddMember}>
        Add Member
      </Button>

    </Box>
  );
}