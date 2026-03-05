import { useEffect, useState } from "react";
import { RoleTypesAPI } from "../../../api";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function EditRoleTypePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    RoleTypesAPI.getAll().then((list) => {
      const found = list.find((r) => r.id === id);
      setForm(found);
    });
  }, [id]);

  const handleSubmit = async () => {
    await RoleTypesAPI.update(id!, {
      name: form.name,
      description: form.description,
    });
    navigate(`/roles/types/${id}`);
  };

  if (!form) return null;

  return (
    <Box>
      <Typography variant="h4" mb={3}>Edit Role Type</Typography>

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
        Save Changes
      </Button>
    </Box>
  );
}