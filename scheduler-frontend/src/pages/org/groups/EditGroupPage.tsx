import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GroupsAPI } from "../../../api/org/groups.api";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

export default function EditGroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "",
  });

  useEffect(() => {
    GroupsAPI.getOne(id!).then((data) => {
      setForm({
        name: data.name,
        description: data.description,
        timezone: data.timezone,
      });
    });
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    await GroupsAPI.update(id!, form);
    navigate(`/groups/${id}`);
  };

  return (
    <Box p={4} display="flex" justifyContent="center">
      <Paper sx={{ p: 4, width: 500 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Edit Group
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
          Save Changes
        </Button>
      </Paper>
    </Box>
  );
}