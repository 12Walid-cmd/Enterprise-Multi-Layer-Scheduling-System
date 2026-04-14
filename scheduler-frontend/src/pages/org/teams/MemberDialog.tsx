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

import { TeamMembersAPI, TeamRoleTypesAPI } from "../../../api";
import { http } from "../../../api/http";
import type { TeamMember, TeamRoleType } from "../../../types/org";

/* ================= TYPES ================= */

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
}

interface MemberDialogProps {
    open: boolean;
    onClose: () => void;
    teamId: string | null;
    teamName?: string;
}

/* ================= COMPONENT ================= */

export default function MemberDialog({
    open,
    onClose,
    teamId,
    teamName,
}: MemberDialogProps) {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<TeamRoleType[]>([]);

    const [userId, setUserId] = useState("");
    const [roleId, setRoleId] = useState<string>("");

    const [adding, setAdding] = useState(false); 

    /* ================= LOAD ================= */

    const loadMembers = async () => {
        if (!teamId) return;
        const data = await TeamMembersAPI.get(teamId);
        setMembers(data);
    };

    const loadUsers = async () => {
        const res = await http.get("/users");
        setUsers(res.data);
    };

    const loadRoles = async () => {
        const data = await TeamRoleTypesAPI.getAll();
        setRoles(data);
    };

    useEffect(() => {
        if (!open || !teamId) return;

        Promise.all([
            loadMembers(),
            loadUsers(),
            loadRoles(),
        ]);
    }, [open, teamId]);

    /* ================= FILTER  ================= */

    const availableUsers = useMemo(() => {
        const existingUserIds = new Set(members.map(m => m.user_id));
        return users.filter(u => !existingUserIds.has(u.id));
    }, [users, members]);

    /* ================= ACTIONS ================= */

    const handleAdd = async () => {
        if (!teamId || !userId || adding) return; 

        try {
            setAdding(true);

            await TeamMembersAPI.add(teamId, {
                userId,
                teamRoleId: roleId,
            });

            setUserId("");
            setRoleId("");

            await loadMembers();
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (uid: string) => {
        if (!teamId) return;

        await TeamMembersAPI.remove(teamId, uid);
        await loadMembers();
    };

    /* ================= UI ================= */

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                Team Members {teamName ? `- ${teamName}` : ""}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>

                    {/* ADD MEMBER */}
                    <Box display="flex" gap={2}>

                        {/* USER */}
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
                                    availableUsers.map((u) => (
                                        <MenuItem key={u.id} value={u.id}>
                                            {u.first_name} {u.last_name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        {/* ROLE */}
                        <FormControl fullWidth>
                            <InputLabel>Team Role</InputLabel>
                            <Select
                                value={roleId}
                                label="Team Role"
                                onChange={(e) => setRoleId(e.target.value)}
                            >
                                {roles.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>
                                        {r.name}
                                    </MenuItem>
                                ))}
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
                                    <TableCell>Team Role</TableCell>
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