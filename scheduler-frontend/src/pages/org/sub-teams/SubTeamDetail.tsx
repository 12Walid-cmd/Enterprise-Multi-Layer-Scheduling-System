import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { SubTeamsAPI, TeamMembersAPI, UsersAPI } from "../../../api";
import type { TeamMember } from '../../../types/org';

export const SubTeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subTeam, setSubTeam] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  
  const [users, setUsers] = useState<any[]>([]);
  const [newMemberUserId, setNewMemberUserId] = useState("");

  const load = async () => {
    if (!id) return;

    const st = await SubTeamsAPI.getOne(id);
    const members = await SubTeamsAPI.getMembers(id);
    const teamMembers = await TeamMembersAPI.get(st.parent_team_id);

    setSubTeam(st);
    setMembers(members);
    setTeamMembers(teamMembers);
  };

  const addMember = async () => {
    if (!newMemberUserId) return;

    await SubTeamsAPI.addMember(id!, {
      userId: newMemberUserId,
    });

    setNewMemberUserId("");
    load();
  };

  useEffect(() => {
    load();
    UsersAPI.getAll().then(setUsers);
  }, [id]);

  if (!subTeam) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">{subTeam.name}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/sub-teams/${id}/edit`)}
        >
          Edit
        </Button>
      </Stack>

      {/* Description */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1">Description</Typography>
        <Typography variant="body2" color="text.secondary">
          {subTeam.description || 'No description'}
        </Typography>
      </Paper>

      {/* Members */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" mb={1}>Members</Typography>

        {members.map((m: any) => (
          <Typography key={m.user_id}>
            {m.users?.first_name} {m.users?.last_name}
            {m.team_roles?.name ? ` — ${m.team_roles.name}` : " — No role"}
          </Typography>
        ))}

        {members.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No members in this sub-team.
          </Typography>
        )}
      </Paper>

      {/* Add Member */}
      <Typography variant="h6" mt={4}>Add Member</Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>User</InputLabel>
        <Select
          value={newMemberUserId}
          label="User"
          onChange={(e) => setNewMemberUserId(e.target.value)}
        >
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.first_name + " " + u.last_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" sx={{ mt: 2 }} onClick={addMember}>
        Add Member
      </Button>
    </Box>
  );
};