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
import { SubTeamsAPI, TeamMembersAPI, UsersAPI, TeamRoleTypesAPI } from "../../../api";
import type { TeamMember } from '../../../types/org';

export const SubTeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subTeam, setSubTeam] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // 新增：用于添加成员的用户与角色
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({
    userId: "",
    teamRoleId: "",
  });

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
    if (!newMember.userId || !newMember.teamRoleId) return;

    await SubTeamsAPI.addMember(id!, {
      userId: newMember.userId,
      teamRoleId: newMember.teamRoleId,
    });

    setNewMember({ userId: "", teamRoleId: "" });
    load();
  };

  useEffect(() => {
    load();

    // 加载用户与角色
    UsersAPI.getAll().then(setUsers);
    TeamRoleTypesAPI.getAll().then(setRoles);
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
          onClick={() => navigate(`/sub-teams/${id}/edit`)}
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

      {/* 页面内添加成员 */}
      <Typography variant="h6" mt={4}>Add Member</Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>User</InputLabel>
        <Select
          value={newMember.userId}
          label="User"
          onChange={(e) =>
            setNewMember({ ...newMember, userId: e.target.value })
          }
        >
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.first_name + " " + u.last_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={newMember.teamRoleId}
          label="Role"
          onChange={(e) =>
            setNewMember({ ...newMember, teamRoleId: e.target.value })
          }
        >
          {roles.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
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