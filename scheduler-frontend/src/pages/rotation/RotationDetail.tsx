import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate, useParams } from "react-router-dom";

import type { RotationDefinition, RotationMember } from "../../types/rotation";
import { RotationAPI, UsersAPI } from "../../api";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function RotationDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [rotation, setRotation] = useState<RotationDefinition | null>(null);
    const [members, setMembers] = useState<RotationMember[]>([]);
    const [ownerName, setOwnerName] = useState<string>("—");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchData = async () => {
        try {
            setLoading(true);
            if (!id) return;

            const [rot, mem] = await Promise.all([
                RotationAPI.getOne(id),
                RotationAPI.getMembers(id),
            ]);

            setRotation(rot);
            setMembers(mem);

            // Load owner name
            if (rot.owner_id) {
                const user = await UsersAPI.getOne(rot.owner_id);
                setOwnerName(`${user.first_name} ${user.last_name} (${user.email})`);
            }

        } catch (err: any) {
            setError(err?.message ?? "Failed to load rotation");
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !rotation) {
        return (
            <Typography color="error" textAlign="center" mt={3}>
                {error ?? "Rotation not found"}
            </Typography>
        );
    }

    return (
        <Box p={3}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={600}>
                    {rotation.name}
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<GroupIcon />}
                        onClick={() => navigate(`/rotations/${rotation.id}/members`)}
                    >
                        Manage Members
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/rotations/${rotation.id}/edit`)}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<CalendarMonthIcon />}
                        onClick={() => navigate(`/schedule/${rotation.id}`)}
                    >
                        View Schedule
                    </Button>
                </Stack>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Basic Information
                </Typography>

                <Stack spacing={1}>
                    <InfoRow label="Name" value={rotation.name} />
                    <InfoRow label="Code" value={rotation.code} />
                    <InfoRow label="Type" value={rotation.type} />

                    <InfoRow
                        label="Cadence"
                        value={
                            rotation.cadence === "CUSTOM"
                                ? `${rotation.cadence} (${rotation.cadence_interval} days)`
                                : rotation.cadence
                        }
                    />

                    <InfoRow label="Minimum Assignees" value={String(rotation.min_assignees)} />

                    <InfoRow
                        label="Allow Overlap"
                        value={rotation.allow_overlap ? "Yes" : "No"}
                    />

                    <InfoRow label="Scope Type" value={rotation.scope_type} />
                    <InfoRow label="Scope Reference" value={rotation.scope_ref_id ?? "None"} />

                    <InfoRow label="Owner" value={ownerName} />

                    <InfoRow
                        label="Status"
                        value={rotation.is_active ? "Active" : "Inactive"}
                    />

                    <InfoRow
                        label="Description"
                        value={rotation.description ?? "—"}
                    />
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Members ({members.length})
                </Typography>

                {members.length === 0 ? (
                    <Typography>No members in this rotation.</Typography>
                ) : (
                    <Stack spacing={1}>
                        {members.map((m) => (
                            <Paper key={m.id} sx={{ p: 1.5 }}>
                                <Typography>
                                    {m.member_type}: {m.member_ref_id} (order {m.order_index})
                                </Typography>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <Box display="flex" justifyContent="space-between">
            <Typography fontWeight={500}>{label}</Typography>
            <Typography>{value}</Typography>
        </Box>
    );
}