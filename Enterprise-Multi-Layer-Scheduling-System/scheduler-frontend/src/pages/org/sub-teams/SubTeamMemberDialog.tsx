import { useEffect, useState, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    IconButton,
    Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import { SubTeamMembersAPI, TeamMembersAPI } from "../../../api";
import type { SubTeamMember, TeamMember } from "../../../types/org";

/* ================= TYPES ================= */

interface MemberDialogProps {
    open: boolean;
    onClose: () => void;
    subTeamId: string | null;
    parentTeamId: string | null;
    subTeamName?: string;
}

/* ================= COMPONENT ================= */

export default function SubTeamMemberDialog({
    open,
    onClose,
    subTeamId,
    parentTeamId,
    subTeamName,
}: MemberDialogProps) {
    const [members, setMembers] = useState<SubTeamMember[]>([]);
    const [parentMembers, setParentMembers] = useState<TeamMember[]>([]);
    const [userId, setUserId] = useState("");

    const [adding, setAdding] = useState(false); 

    /* ================= LOAD ================= */

    const loadMembers = async () => {
        if (!subTeamId) return;
        const data = await SubTeamMembersAPI.get(subTeamId);
        setMembers(data);
    };

    const loadParentMembers = async () => {
        if (!parentTeamId) return;
        const res = await TeamMembersAPI.get(parentTeamId);
        setParentMembers(res);
    };

    const loadAll = async () => {
        await Promise.all([
            loadMembers(),
            loadParentMembers(),
        ]);
    };

    useEffect(() => {
        if (!open || !subTeamId || !parentTeamId) return;
        loadAll();
    }, [open, subTeamId, parentTeamId]);

    /* ================= FILTER ================= */

    const availableUsers = useMemo(() => {
        const subUserIds = new Set(members.map(m => m.user_id));
        return parentMembers.filter(m => !subUserIds.has(m.user_id));
    }, [parentMembers, members]);

    /* ================= ACTIONS ================= */

    const handleAdd = async () => {
        if (!subTeamId || !userId || adding) return;

        try {
            setAdding(true);

            await SubTeamMembersAPI.add(subTeamId, {
                userId,
            });

            setUserId("");
            await loadMembers();
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (uid: string) => {
        if (!subTeamId) return;

        await SubTeamMembersAPI.remove(subTeamId, uid);
        await loadMembers();
    };

    /* ================= UI ================= */

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

            <DialogTitle>
                SubTeam Members {subTeamName ? `- ${subTeamName}` : ""}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>

                    {/* ADD MEMBER */}
                    <Box display="flex" gap={2}>

                        <FormControl fullWidth>
                            <InputLabel>User</InputLabel>
                            <Select
                                value={userId}
                                label="User"
                                onChange={(e) => setUserId(e.target.value)}
                            >
                                
                                {availableUsers.length === 0 ? (
                                    <MenuItem disabled>
                                        No available users
                                    </MenuItem>
                                ) : (
                                    availableUsers.map((m) => (
                                        <MenuItem key={m.user_id} value={m.user_id}>
                                            {m.users?.first_name} {m.users?.last_name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            onClick={handleAdd}
                            disabled={
                                !userId ||
                                adding ||
                                availableUsers.length === 0
                            }
                        >
                            {adding ? "Adding..." : "Add"}
                        </Button>

                    </Box>

                    {/* MEMBER LIST */}
                    <Paper variant="outlined">
                        <Table size="small">

                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                
                                {members.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography color="text.secondary">
                                                No members in this team
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.map((m) => (
                                        <TableRow key={m.id}>

                                            <TableCell>
                                                {m.users?.first_name} {m.users?.last_name}
                                            </TableCell>

                                            <TableCell>
                                                {m.users?.email}
                                            </TableCell>

                                            <TableCell>
                                                {m.team_roles?.name || "-"}
                                            </TableCell>

                                            <TableCell align="right">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemove(m.user_id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>

                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                        </Table>
                    </Paper>

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>

        </Dialog>
    );
}