import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";

const createUser = async (data: any) => {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

export default function CreateUserPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    timezone: "",
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      await createUser(form);

      window.location.href = "/users";
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Create User
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="First Name"
            value={form.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Last Name"
            value={form.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            fullWidth
            required
          />

          <TextField
            select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => handleChange("timezone", e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="America/Halifax">America/Halifax</MenuItem>
            <MenuItem value="America/Toronto">America/Toronto</MenuItem>
            <MenuItem value="America/Vancouver">America/Vancouver</MenuItem>
            <MenuItem value="America/New_York">America/New_York</MenuItem>
            <MenuItem value="UTC">UTC</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
              />
            }
            label="Is Active"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : "Create User"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}