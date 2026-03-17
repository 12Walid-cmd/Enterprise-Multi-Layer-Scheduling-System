import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
    Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";

// ===== API =====
const fetchUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error("Failed to load user");
    return res.json();
};

// ===== Component =====
export default function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await fetchUser(id!);
                setUser(data);
            } catch (err: any) {
                setError(err.message || "Error loading user");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!user) {
        return (
            <Box p={3}>
                <Typography>No user found.</Typography>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                User Details
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 700 }}>
                {/* Basic Info */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Basic Information
                </Typography>

                <DetailRow label="First Name" value={user.first_name} />
                <DetailRow label="Last Name" value={user.last_name} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Phone" value={user.phone} />
                <DetailRow label="Timezone" value={user.timezone} />
                <DetailRow label="Working Mode" value={user.working_mode} />
                <DetailRow label="City" value={user.city ?? "-"} />
                <DetailRow label="Province" value={user.province ?? "-"} />
                <DetailRow label="Country" value={user.country ?? "-"} />

                <DetailRow label="Created At" value={formatDate(user.created_at)} />
                <DetailRow label="Updated At" value={formatDate(user.updated_at)} />
                <Divider sx={{ my: 3 }} />

                {/* Team Info */}
                <Typography variant="h6" fontWeight="bold" gutterBottom> Team </Typography>
                <DetailRow label="Team" value={user.team_members?.[0]?.teams?.name ?? "-"} />
                <Divider sx={{ my: 3 }} />
                {/* Team Role */}
                <Typography variant="h6" fontWeight="bold" gutterBottom> Team Role </Typography>
                <DetailRow label="Team Role" value={user.team_members?.[0]?.team_roles?.name ?? "-"} />
                {/* Global Role */}
                <Typography variant="h6" fontWeight="bold" gutterBottom> Global Role </Typography>
                <DetailRow label="Global Role" value={user.user_roles?.[0]?.global_roles?.name ?? "-"} />

                <Box mt={4} display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate(`/users/${id}/global-roles`)}
                    >
                        Manage Global Roles
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/users/${id}/edit`)}
                    >
                        Edit User
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

// ===== Helper Components =====
function DetailRow({ label, value }: { label: string; value: any }) {
    return (
        <Box display="flex" justifyContent="space-between" py={1}>
            <Typography fontWeight="bold">{label}</Typography>
            <Typography>{value}</Typography>
        </Box>
    );
}

function formatDate(dateString: string) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString();
}