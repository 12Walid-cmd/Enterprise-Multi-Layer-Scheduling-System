import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Paper,
    TextField,
    Typography,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { useParams } from "react-router-dom";

// ===== API functions =====
const fetchUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error("Failed to load user");
    return res.json();
};

const updateUser = async (id: string, data: any) => {
    const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
};

// ===== Component =====
export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        timezone: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Load user
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const user = await fetchUser(id!);

                setForm({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    timezone: user.timezone,
                    is_active: user.is_active,
                });
            } catch (err: any) {
                setError(err.message || "Error loading user");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError("");

            await updateUser(id!, form);

            window.location.href = "/users";
        } catch (err: any) {
            setError(err.message || "Failed to update user");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Edit User
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
                        <MenuItem value="America/Halifax">America/Halifax (AST)</MenuItem>
                        <MenuItem value="America/Toronto">America/Toronto (EST)</MenuItem>
                        <MenuItem value="America/Winnipeg">America/Winnipeg (CST)</MenuItem>
                        <MenuItem value="America/Edmonton">America/Edmonton (MST)</MenuItem>
                        <MenuItem value="America/Vancouver">America/Vancouver (PST)</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                        <MenuItem value="Europe/London">Europe/London</MenuItem>
                        <MenuItem value="Asia/Shanghai">Asia/Shanghai</MenuItem>
                        <MenuItem value="Asia/Tokyo">Asia/Tokyo</MenuItem>
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
                        {submitting ? <CircularProgress size={24} /> : "Save Changes"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}