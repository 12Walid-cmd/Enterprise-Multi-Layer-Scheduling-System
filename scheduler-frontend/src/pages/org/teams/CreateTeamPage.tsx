import { useEffect, useState } from "react";
import { TeamsAPI } from "../../../api";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "",
    group_id: "",
    parent_team_id: null,
  });

  const handleSubmit = async () => {
    await TeamsAPI.create(form);
    navigate("/teams");
  };
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);


  useEffect(() => {
    fetch("/api/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data));
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={3}>Create Team</Typography>

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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="group-select-label">Group</InputLabel>
        <Select
          labelId="group-select-label"
          value={form.group_id || ""}
          label="Group"
          onChange={(e) =>
            setForm({ ...form, group_id: e.target.value })
          }
        >
          {groups.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              {g.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>


      <Button variant="contained" onClick={handleSubmit}>
        Create
      </Button>
    </Box>
  );
}