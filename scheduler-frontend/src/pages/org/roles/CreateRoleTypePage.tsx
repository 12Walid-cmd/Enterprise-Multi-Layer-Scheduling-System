import { useState } from "react";
import { RoleTypesAPI } from "../../../api";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateRoleTypePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
  });

  const handleSubmit = async () => {
    await RoleTypesAPI.create(form);
    navigate("/roles/types");
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>Create Role Type</Typography>

      <TextField
        fullWidth
        label="Code"
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
        sx={{ mb: 2 }}
      />

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

      <Button variant="contained" onClick={handleSubmit}>
        Create
      </Button>
    </Box>
  );
}