import { useEffect, useState } from "react";
import { TeamsAPI } from "../../../api";
import { TeamMembersAPI } from "../../../api";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [newMember, setNewMember] = useState({
    user_id: "",
    role_type_id: "",
  });

  const loadTeam = () => {
    TeamsAPI.getOne(id!).then((data) => {
      setTeam(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  const handleDelete = async () => {
    await TeamsAPI.delete(id!);
    navigate("/teams");
  };

  const handleAddMember = async () => {
    await TeamMembersAPI.add(id!, newMember);
    loadTeam();
    setNewMember({ user_id: "", role_type_id: "" });
  };

  const handleRemoveMember = async (userId: string) => {
    await TeamMembersAPI.remove(id!, userId);
    loadTeam();
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (!team)
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Team not found.</Typography>
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {team.name}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography><strong>Description:</strong> {team.description}</Typography>
        <Typography><strong>Timezone:</strong> {team.timezone}</Typography>
        <Typography><strong>Members:</strong> {team.team_members?.length ?? 0}</Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" onClick={() => navigate(`/teams/${id}/edit`)}>
            Edit Team
          </Button>

          <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
            Delete Team
          </Button>
        </Box>
      </Paper>

      {/* Team Members List */}
      <Typography variant="h5" mt={4} mb={2}>
        Team Members
      </Typography>

      {team.team_members?.length === 0 && (
        <Typography>No members in this team.</Typography>
      )}

      {team.team_members?.map((m: any) => (
        <Paper key={m.id} sx={{ p: 2, mb: 1 }}>
          <Typography>
            <strong>User:</strong> {m.users?.first_name} {m.users?.last_name}
            </Typography>

            <Typography>
            <strong>Role:</strong> {m.role_types?.name}
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
      <Typography variant="h6" mt={4}>Add Member</Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>User</InputLabel>
        <Select
          value={newMember.user_id}
          label="User"
          onChange={(e) =>
            setNewMember({ ...newMember, user_id: e.target.value })
          }
        >
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.name || u.email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={newMember.role_type_id}
          label="Role"
          onChange={(e) =>
            setNewMember({ ...newMember, role_type_id: e.target.value })
          }
        >
          {roles.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddMember}>
        Add Member
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>Are you sure you want to delete this team?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}