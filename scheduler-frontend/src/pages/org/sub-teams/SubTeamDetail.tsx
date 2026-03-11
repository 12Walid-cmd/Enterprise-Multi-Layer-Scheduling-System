import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { SubTeamsAPI, TeamMembersAPI } from "../../../api";
import type { TeamMember } from '../../../types/org';

export const SubTeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subTeam, setSubTeam] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

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
    if (!selectedUserId) return;

    await SubTeamsAPI.addMember(id!, { userId: selectedUserId });

    setOpenAdd(false);
    setSelectedUserId("");
    load(); 
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!subTeam) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">{subTeam.name}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/teams/sub-teams/${id}/edit`)}
        >
          Edit
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1">Description</Typography>
        <Typography variant="body2" color="text.secondary">
          {subTeam.description || 'No description'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1">Members</Typography>
          <Button variant="contained" onClick={() => setOpenAdd(true)}>
            Add Member
          </Button>
        </Stack>

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

      {/* Add Member Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add Member to Subteam</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Team Member</InputLabel>
            <Select
              value={selectedUserId}
              label="Team Member"
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {teamMembers.map((tm: any) => (
                <MenuItem key={tm.user_id} value={tm.user_id}>
                  {tm.users?.first_name} {tm.users?.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={addMember}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};