import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { GroupsAPI } from "../../../api/org/groups.api";
import { useNavigate } from "react-router-dom";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    await GroupsAPI.create(form);
    navigate("/groups");
  };

  return (
    <Box p={4} display="flex" justifyContent="center">
      <Paper sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Create Group
        </Typography>

        <TextField
          fullWidth
          label="Group Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Timezone"
          value={form.timezone}
          onChange={(e) => handleChange("timezone", e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" fullWidth onClick={handleSubmit}>
          Create
        </Button>
      </Paper>
    </Box>
  );
}