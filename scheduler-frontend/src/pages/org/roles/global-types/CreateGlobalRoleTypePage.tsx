import { useState } from "react";
import { GlobalRoleTypesAPI } from "../../../../api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateGlobalRoleTypePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
  });

  const handleSubmit = async () => {
    await GlobalRoleTypesAPI.create(form);
    navigate("/roles/global-types");
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Create Global Role Type
      </Typography>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Code"
          sx={{ mb: 2 }}
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />

        <TextField
          fullWidth
          label="Name"
          sx={{ mb: 2 }}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          sx={{ mb: 2 }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Button variant="contained" onClick={handleSubmit}>
          Create
        </Button>
      </Paper>
    </Box>
  );
}