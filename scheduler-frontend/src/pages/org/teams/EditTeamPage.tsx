import { useEffect, useState } from "react";
import { TeamsAPI } from "../../../api";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function EditTeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    TeamsAPI.getOne(id!).then((data) => setForm(data));

      // load user
    UsersAPI.getAll().then((data) => setUsers(data));

    // load role
    RoleTypesAPI.getAll().then((data) => setRoles(data));

  }, [id]);

  const handleSubmit = async () => {
    // await TeamsAPI.update(id!, form);
    // navigate(`/teams/${id}`);
    const cleanData = Object.fromEntries(
  Object.entries(form)
    .filter(([k]) => k !== "team_members")   // delet relate filed
    .map(([k, v]) => [k, v ?? null])         // undefined → null
    );

    await TeamsAPI.update(id!, cleanData);
    navigate(`/teams/${id}`);
  };

  if (!form) return null;

  return (
    <Box>
      <Typography variant="h4" mb={3}>Edit Team</Typography>

      <TextField
        fullWidth
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Timezone"
        value={form.timezone}
        onChange={(e) => setForm({ ...form, timezone: e.target.value })}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={handleSubmit}>
        Save Changes
      </Button>
    </Box>
  );
}