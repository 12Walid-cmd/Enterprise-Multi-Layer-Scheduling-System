import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";
import LayersIcon from "@mui/icons-material/Layers";
import RuleIcon from "@mui/icons-material/Rule";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { useNavigate, useParams } from "react-router-dom";
import {
    RotationAPI,
    UsersAPI,
    TeamsAPI,
    DomainAPI,
    DomainTeamsAPI,
    SubTeamsAPI,
} from "../../api";
import type { RotationDefinition } from "../../types/rotation";

export default function RotationDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [users, setUsers] = useState<any[]>([]);
    const [rotation, setRotation] = useState<RotationDefinition | null>(null);
    const [loading, setLoading] = useState(true);

    const [scopeName, setScopeName] = useState<string>("Loading...");

    const loadRotation = async () => {
        if (!id) return;
        setLoading(true);
        const data = await RotationAPI.getOne(id);
        setRotation(data);
        setLoading(false);
    };

    // Load users + rotation
    useEffect(() => {
        const load = async () => {
            const usersList = await UsersAPI.getAll();
            setUsers(usersList);
        };
        load();
        loadRotation();
    }, [id]);

    // Load scope name
    useEffect(() => {
        async function loadScopeName() {
            if (!rotation?.scope_ref_id) {
                setScopeName("None");
                return;
            }

            switch (rotation.scope_type) {
                case "TEAM": {
                    const team = await TeamsAPI.getOne(rotation.scope_ref_id);
                    setScopeName(team.name);
                    break;
                }

                case "SUBTEAM": {
                    const subteam = await SubTeamsAPI.getOne(rotation.scope_ref_id);
                    setScopeName(subteam.name);
                    break;
                }

                case "GROUP": {
                    const allTeams = await TeamsAPI.getAll();
                    const groupTeam = allTeams.find(
                        (t) => t.group_id === rotation.scope_ref_id
                    );
                    setScopeName(groupTeam?.name ?? "Unknown Group");
                    break;
                }

                case "DOMAIN": {
                    const domain = await DomainAPI.getOne(rotation.scope_ref_id);
                    setScopeName(domain.name);
                    break;
                }

                case "DOMAIN_TEAM": {
                    const dt = await DomainTeamsAPI.getOne(rotation.scope_ref_id);
                    setScopeName(dt.teams?.name ?? "Unknown Domain Team");
                    break;
                }

                case "NONE":
                default:
                    setScopeName("None");
                    break;
            }
        }

        if (rotation) loadScopeName();
    }, [rotation]);

    if (loading || !rotation) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    const formatDate = (value: string | null) =>
        value ? new Date(value).toLocaleDateString() : "—";

    const owner = users.find((u) => u.id === rotation.owner_id);

    return (
        <Box p={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/rotations")}>
                    Back
                </Button>

                <Typography variant="h5" fontWeight={600}>
                    {rotation.name}
                </Typography>

                <Chip
                    label={rotation.is_active ? "Active" : "Inactive"}
                    color={rotation.is_active ? "success" : "default"}
                    size="small"
                />

                <Box flexGrow={1} />

                <Typography variant="body2" color="text.secondary">
                    Code: {rotation.code}
                </Typography>
            </Stack>

            {/* Main content */}
            <Stack spacing={3}>
                {/* Basic info */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                        Basic Information
                    </Typography>
                    <Stack spacing={1}>
                        <Typography>
                            <strong>Type:</strong> {rotation.type}
                        </Typography>
                        <Typography>
                            <strong>Cadence:</strong> {rotation.cadence}{" "}
                            {rotation.cadence === "CUSTOM"
                                ? `(${rotation.cadence_interval})`
                                : ""}
                        </Typography>
                        <Typography>
                            <strong>Priority:</strong> {rotation.priority}
                        </Typography>
                        <Typography>
                            <strong>Overlap:</strong>{" "}
                            {rotation.allow_overlap ? "Allowed" : "Not allowed"}
                        </Typography>
                        <Typography>
                            <strong>Assignees per slot:</strong>{" "}
                            {rotation.min_assignees} – {rotation.max_assignees}
                        </Typography>
                    </Stack>
                </Paper>

                {/* Scope & dates */}
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Paper sx={{ p: 2, flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            Scope
                        </Typography>
                        <Stack spacing={1}>
                            <Typography>
                                <strong>Scope Type:</strong> {rotation.scope_type}
                            </Typography>
                            <Typography>
                                <strong>Scope:</strong> {scopeName}
                            </Typography>
                            <Typography>
                                <strong>Owner:</strong>{" "}
                                {owner
                                    ? `${owner.first_name} ${owner.last_name} (${owner.email})`
                                    : "None"}
                            </Typography>
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 2, flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            Dates
                        </Typography>
                        <Stack spacing={1}>
                            <Typography>
                                <strong>Start:</strong> {formatDate(rotation.start_date)}
                            </Typography>
                            <Typography>
                                <strong>End:</strong> {formatDate(rotation.end_date)}
                            </Typography>
                            <Typography>
                                <strong>Effective:</strong>{" "}
                                {formatDate(rotation.effective_date)}
                            </Typography>
                            <Typography>
                                <strong>Freeze:</strong> {formatDate(rotation.freeze_date)}
                            </Typography>
                        </Stack>
                    </Paper>
                </Stack>

                {/* Description */}
                {rotation.description && (
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>
                            Description
                        </Typography>
                        <Typography>{rotation.description}</Typography>
                    </Paper>
                )}

                {/* Actions */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Manage Rotation
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/rotations/${rotation.id}/edit`)}
                        >
                            Edit Rotation
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<GroupIcon />}
                            onClick={() => navigate(`/rotations/${rotation.id}/members`)}
                        >
                            Members
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<LayersIcon />}
                            onClick={() => navigate(`/rotations/${rotation.id}/tiers`)}
                        >
                            Tiers
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<RuleIcon />}
                            onClick={() => navigate(`/rotations/${rotation.id}/rules`)}
                        >
                            Rules
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<WarningIcon />}
                            onClick={() => navigate(`/rotations/${rotation.id}/exceptions`)}
                        >
                            Exceptions
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<CalendarMonthIcon />}
                            onClick={() => navigate(`/schedule/${id}`)}
                        >
                            View Schedule
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}