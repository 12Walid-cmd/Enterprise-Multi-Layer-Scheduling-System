import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
    Divider,
} from "@mui/material";

import { UsersAPI } from "../../api";
import ChangePasswordDialog from "./ChangePasswordDialog";

/* ================= TYPES ================= */
import type { User } from "../../types/user";
import { useAuth } from "../../context/AuthContext";


/* ================= COMPONENT ================= */
export default function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD ================= */
    const load = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await UsersAPI.getOne(id);
            setUser(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    /* ================= UI STATES ================= */
    if (loading || !user) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    const permissions = user.permissionMeta || [];


    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                User Details
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 700 }}>

                {/* ===== BASIC ===== */}
                <Typography variant="h6" fontWeight="bold">
                    Basic Information
                </Typography>

                <DetailRow label="First Name" value={user.first_name} />
                <DetailRow label="Last Name" value={user.last_name} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Phone" value={user.phone} />
                <DetailRow label="Timezone" value={user.timezone} />
                <DetailRow label="Working Mode" value={(user as any).working_mode} />
                <DetailRow label="City" value={(user as any).city ?? "-"} />
                <DetailRow label="Province" value={(user as any).province ?? "-"} />
                <DetailRow label="Country" value={(user as any).country ?? "-"} />

                <DetailRow label="Created At" value={formatDate((user as any).created_at)} />
                <DetailRow label="Updated At" value={formatDate((user as any).updated_at)} />

                <DetailRow
                    label="Active"
                    value={user.is_active ? "Yes" : "No"}
                />

                <Divider sx={{ my: 3 }} />

                {/* ===== TEAM ===== */}
                <Typography variant="h6" fontWeight="bold">Team</Typography>
                <DetailRow
                    label="Team"
                    value={user.team_members?.[0]?.teams?.name ?? "-"}
                />

                <Divider sx={{ my: 3 }} />

                {/* ===== TEAM ROLE ===== */}
                <Typography variant="h6" fontWeight="bold">Team Role</Typography>
                <DetailRow
                    label="Team Role"
                    value={user.team_members?.[0]?.team_roles?.name ?? "-"}
                />

                <Divider sx={{ my: 3 }} />

                {/* ===== GLOBAL ROLE ===== */}
                <Typography variant="h6" fontWeight="bold">Global Role</Typography>
                <DetailRow
                    label="Global Role"
                    value={user.user_roles?.[0]?.global_roles?.name ?? "-"}
                />

                <Divider sx={{ my: 3 }} />

                {/* ===== PERMISSIONS ===== */}
                <Typography variant="h6" fontWeight="bold">Permissions</Typography>
                <DetailRow
                    label="Permissions"
                    value={
                        permissions.length ? (
                            <Box textAlign="right">
                                {permissions.map((p: any, idx: number) => (
                                    <Typography key={idx}>
                                        {p.name || p.permission}
                                    </Typography>
                                ))}
                            </Box>
                        ) : "-"
                    }
                />

                <Divider sx={{ my: 3 }} />

                {/* ===== SCOPE ===== */}
                <Typography variant="h6" fontWeight="bold">Resource Scope</Typography>
                <DetailRow
                    label="Resource Scope"
                    value={getScopeSummary(user)}
                />

                {/* ===== CHANGE PASSWORD BUTTON ===== */}
                {currentUser?.id === user.id && (
                    <Box mt={3}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setOpenPasswordDialog(true)}
                        >
                            Change Password
                        </Button>
                    </Box>
                )}



                {/* ===== BACK BUTTON ONLY ===== */}
                <Box mt={4}>
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/users`)}
                    >
                        Back to Users List
                    </Button>
                </Box>
            </Paper>


            {/* ================= CHANGE PASSWORD DIALOG ================= */}
            <ChangePasswordDialog
                open={openPasswordDialog}
                onClose={() => setOpenPasswordDialog(false)}
            />
        </Box>

    );
}

/* ================= HELPERS ================= */

function DetailRow({ label, value }: { label: string; value: any }) {
    return (
        <Box display="flex" justifyContent="space-between" py={1}>
            <Typography fontWeight="bold">{label}</Typography>
            <Typography whiteSpace="pre-line">{value || "-"}</Typography>
        </Box>
    );
}

function formatDate(dateString?: string) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
}

function getScopeSummary(user: any) {
    const s = user.scopeEntities;
    const lines: string[] = [];

    if (s.groups?.length) {
        lines.push("Groups:");
        s.groups.forEach((g: any) => lines.push(`  - ${g.name}`));
        lines.push("");
    }

    if (s.teams?.length) {
        lines.push("Teams:");
        s.teams.forEach((t: any) => lines.push(`  - ${t.name}`));
        lines.push("");
    }

    if (s.subTeams?.length) {
        lines.push("Subteams:");
        s.subTeams.forEach((st: any) => lines.push(`  - ${st.name}`));
        lines.push("");
    }

    if (s.domains?.length) {
        lines.push("Domains:");
        s.domains.forEach((d: any) => lines.push(`  - ${d.name}`));
        lines.push("");
    }

    if (s.rotations?.length) {
        lines.push("Rotations:");
        s.rotations.forEach((r: any) => lines.push(`  - ${r.name}`));
        lines.push("");
    }

    if (user.scope?.holiday_global) {
        lines.push("Holiday:");
        lines.push("  - Global");
    }

    return lines.join("\n");
}
