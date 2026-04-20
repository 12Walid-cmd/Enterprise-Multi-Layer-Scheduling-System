import { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Stack } from "@mui/material";
import { AuthAPI } from "../../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    timezone: "",
  });

  function update(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function handleRegister() {
    try {
      await AuthAPI.register(form);
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8fa",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 420 }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Create Account
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="First Name"
            fullWidth
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
          />

          <TextField
            label="Last Name"
            fullWidth
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
          />

          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />

          <TextField
            label="Timezone"
            fullWidth
            value={form.timezone}
            onChange={(e) => update("timezone", e.target.value)}
          />

          <Button variant="contained" fullWidth onClick={handleRegister}>
            Register
          </Button>

          <Button variant="text" onClick={() => navigate("/login")}>
            Already have an account?
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}