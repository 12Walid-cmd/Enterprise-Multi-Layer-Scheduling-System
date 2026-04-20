import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Typography,
    Divider,
    Avatar,
    Tooltip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useNavigate, useParams } from "react-router-dom";

import { RotationAPI, TierAPI, UsersAPI } from "../../api";
import type { RotationDefinition } from "../../types/rotation";
import type { Tier, TierMember } from "../../types/rotation";

import AddTierDialog from "./components/tier/AddTierDialog";
import AddTierMemberDialog from "./components/tier/AddTierMemberDialog";
import EditTierDialog from "./components/tier/EditTierDialog";
import EditTierMemberDialog from "./components/tier/EditTierMemberDialog";

export default function RotationTiersPage() {
    const navigate = useNavigate();
    const { id: rotationId } = useParams();

    const [rotation, setRotation] = useState<RotationDefinition | null>(null);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [membersMap, setMembersMap] = useState<Record<string, TierMember[]>>({});
    const [users, setUsers] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const [openAddTier, setOpenAddTier] = useState(false);
    const [editTier, setEditTier] = useState<Tier | null>(null);

    const [openAddMemberTierId, setOpenAddMemberTierId] = useState<string | null>(null);
    const [editMember, setEditMember] = useState<TierMember | null>(null);

    const loadData = async () => {
        if (!rotationId) return;

        setLoading(true);

        const [rotationData, tierData, userData] = await Promise.all([
            RotationAPI.getOne(rotationId),
            TierAPI.getTiers(rotationId),
            UsersAPI.getAll(),
        ]);

        setRotation(rotationData);
        setTiers(tierData);
        setUsers(userData);

        const map: Record<string, TierMember[]> = {};
        for (const tier of tierData) {
            const members = await TierAPI.getTierMembers(tier.id);
            map[tier.id] = members;
        }
        setMembersMap(map);

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [rotationId]);

    const handleDeleteTier = async (tierId: string) => {
        await TierAPI.removeTier(tierId);
        loadData();
    };

    const handleDeleteMember = async (tierId: string, memberId: string) => {
        await TierAPI.removeTierMember(tierId, memberId);
        loadData();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    if (!rotation) {
        return (
            <Box p={3}>
                <Typography color="error" textAlign="center" mt={3}>
                    Rotation not found
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/rotations/${rotation.id}`)}
                >
                    Back
                </Button>

                <Typography variant="h5" fontWeight={600}>
                    Rotation Tiers — {rotation.name}
                </Typography>

                <Box flexGrow={1} />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddTier(true)}
                >
                    Add Tier
                </Button>
            </Stack>

            {/* Tier List */}
            <Stack spacing={3}>
                {tiers.map((tier) => (
                    <Paper
                        key={tier.id}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                    >
                        {/* Tier Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={600}>
                                Tier {tier.tier_level} — {tier.name}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Edit Tier">
                                    <IconButton onClick={() => setEditTier(tier)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete Tier">
                                    <IconButton color="error" onClick={() => handleDeleteTier(tier.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* Members Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>
                                Members
                            </Typography>

                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenAddMemberTierId(tier.id)}
                            >
                                Add Member
                            </Button>
                        </Stack>

                        {/* Members List */}
                        <Stack spacing={1} mt={2}>
                            {membersMap[tier.id]?.length === 0 ? (
                                <Typography>No members in this tier.</Typography>
                            ) : (
                                membersMap[tier.id].map((m) => {
                                    const user = users.find((u) => u.id === m.member_ref_id);

                                    return (
                                        <Paper
                                            key={m.id}
                                            sx={{
                                                p: 1.5,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                borderRadius: 1,
                                                border: "1px solid #eee",
                                                transition: "0.2s",
                                                "&:hover": {
                                                    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                                                },
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar>
                                                    {user
                                                        ? user.first_name[0] + user.last_name[0]
                                                        : "?"}
                                                </Avatar>

                                                <Box>
                                                    <Typography fontWeight={500}>
                                                        {user
                                                            ? `${user.first_name} ${user.last_name}`
                                                            : "Unknown User"}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary">
                                                        {m.member_type} — {user?.email}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary">
                                                        Weight: {m.weight} — {m.is_active ? "Active" : "Inactive"}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Edit Member">
                                                    <IconButton onClick={() => setEditMember(m)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete Member">
                                                    <IconButton color="error" onClick={() => handleDeleteMember(tier.id, m.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Paper>
                                    );
                                })
                            )}
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            {/* Dialogs */}
            <AddTierDialog
                open={openAddTier}
                onClose={() => setOpenAddTier(false)}
                rotationId={rotation.id}
                onCreated={loadData}
            />

            {editTier && (
                <EditTierDialog
                    open={true}
                    onClose={() => setEditTier(null)}
                    tier={editTier}
                    onSaved={loadData}
                />
            )}

            {openAddMemberTierId && (
                <AddTierMemberDialog
                    open={true}
                    onClose={() => setOpenAddMemberTierId(null)}
                    tierId={openAddMemberTierId}
                    onAdded={loadData}
                />
            )}

            {editMember && (
                <EditTierMemberDialog
                    open={true}
                    onClose={() => setEditMember(null)}
                    member={editMember}
                    onSaved={loadData}
                />
            )}
        </Box>
    );
}