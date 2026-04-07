import { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Stack } from "@mui/material";
import { AuthAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import cgiLogo from "../../assets/cgi-logo.png";

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        try {
            const tokens = await AuthAPI.login(email, password);
            localStorage.setItem("access_token", tokens.access_token);

            const me = await AuthAPI.me();
            setUser(me);

            navigate("/");
        } catch (err) {
            alert("Invalid email or password");
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
            <Paper elevation={3} sx={{ p: 4, width: 380 }}>
                <Box sx={{ mb: 3 }}>
                    {/* Logo + Title */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Box
                            component="img"
                            src={cgiLogo}
                            alt="Logo"
                            sx={{ height: 36, width: "auto", mr: 1.5 }}
                        />

                        <Typography variant="h4" fontWeight={700} letterSpacing={0.3}>
                            Scheduler
                        </Typography>
                    </Box>

                    {/* Subtle Divider */}
                    <Box
                        sx={{
                            height: 1,
                            width: "100%",
                            bgcolor: "divider",
                            opacity: 0.6,
                            borderRadius: 1,
                        }}
                    />
                </Box>



                <Stack spacing={2}>
                    <TextField
                        label="Email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button variant="contained" fullWidth onClick={handleLogin}>
                        Sign In
                    </Button>

                    <Button variant="text" onClick={() => navigate("/register")}>
                        Create an account
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}