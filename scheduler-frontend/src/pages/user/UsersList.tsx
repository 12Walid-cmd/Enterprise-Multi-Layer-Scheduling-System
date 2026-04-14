import { useEffect, useState, useCallback } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";

import { UsersAPI } from "../../api";

import UserFormDialog from "./UserFormDialog";
import type { User } from "../../types/user";
import UserGlobalRolesDialog from "./UserGlobalRolesDialog";



/* ================= COMPONENT ================= */

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [openDialog, setOpenDialog] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);

    const [globalRoleOpen, setGlobalRoleOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    /* ================= LOAD ================= */

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await UsersAPI.getAll(search);
            setUsers(data);
        } catch (e: any) {
            setError(e.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        load();
    }, [load]);

    /* ================= SEARCH ================= */

    useEffect(() => {
        const timer = setTimeout(() => {
            load();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    /* ================= ACTIONS ================= */

    const openCreate = () => {
        setEditUser(null);
        setOpenDialog(true);
    };

    const openEdit = (user: User) => {
        setEditUser(user);
        setOpenDialog(true);
    };

    const openGlobalRoles = (user: User) => {
        setSelectedUser(user);
        setGlobalRoleOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            if (editUser) {
                await UsersAPI.update(editUser.id, data);
            } else {
                await UsersAPI.create(data);
            }

            setOpenDialog(false);
            await load();
        } catch (e) {
            console.error("Save failed", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user?")) return;

        try {
            await UsersAPI.delete(id);
            await load();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    /* ================= HELPER ================= */

    const truncate = (text?: string, max = 20) =>
        text && text.length > max ? text.slice(0, max) + "..." : text;

    /* ================= UI ================= */

    return (
        <Box p={3}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h4" fontWeight={700}>
                    Users
                </Typography>

                <Box display="flex" gap={1.5}>
                    <TextField
                        size="small"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ width: 260 }}
                    />

                    <Button variant="outlined" onClick={load}>
                        Search
                    </Button>

                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                        Create
                    </Button>
                </Box>
            </Box>

            {/* LOADING */}
            {loading && (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            )}

            {/* ERROR */}
            {error && (
                <Typography color="error" mb={2}>
                    {error}
                </Typography>
            )}

            {/* TABLE */}
            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Name</b></TableCell>
                                <TableCell><b>Email</b></TableCell>
                                <TableCell><b>Phone</b></TableCell>

                                <TableCell><b>Team</b></TableCell>
                                <TableCell><b>Team Role</b></TableCell>
                                <TableCell><b>Global Role</b></TableCell>
                                <TableCell><b>Permissions</b></TableCell>
                                <TableCell><b>Scope</b></TableCell>

                                <TableCell><b>Timezone</b></TableCell>
                                <TableCell><b>Active</b></TableCell>
                                <TableCell align="right"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}

                            {users.map((u) => (
                                <TableRow key={u.id} hover>
                                    <TableCell>{u.first_name} {u.last_name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{u.phone}</TableCell>

                                    {/* Team */}
                                    <TableCell>
                                        {u.team_members?.[0]?.teams?.name || "-"}
                                    </TableCell>

                                    {/* Team Role */}
                                    <TableCell>
                                        {u.team_members?.[0]?.team_roles?.name || "-"}
                                    </TableCell>

                                    {/* Global Role */}
                                    <TableCell>
                                        {u.user_roles?.[0]?.global_roles?.name || "-"}
                                    </TableCell>

                                    {/* Permissions */}
                                    <TableCell>
                                        <Tooltip title={(u.permissions || []).join(", ")}>
                                            <span>{truncate((u.permissions || []).join(", ")) || "-"}</span>
                                        </Tooltip>
                                    </TableCell>

                                    {/* Scope */}
                                    <TableCell>
                                        {(u.scope?.team_ids?.length || 0) +
                                            (u.scope?.group_ids?.length || 0) +
                                            (u.scope?.domain_ids?.length || 0) +
                                            (u.scope?.rotation_ids?.length || 0)}
                                    </TableCell>

                                    <TableCell>{u.timezone}</TableCell>
                                    <TableCell>{u.is_active ? "Yes" : "No"}</TableCell>

                                    {/* ACTIONS */}
                                    <TableCell align="right">
                                        <Tooltip title="Assign Global Role">
                                            <IconButton color="primary" onClick={() => openGlobalRoles(u)}>
                                                <GroupIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Edit">
                                            <IconButton color="secondary" onClick={() => openEdit(u)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Delete">
                                            <IconButton color="error" onClick={() => handleDelete(u.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ================= DIALOG ================= */}

            <UserFormDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSubmit={handleSave}
                initialData={editUser}
            />

            <UserGlobalRolesDialog
                open={globalRoleOpen}
                onClose={() => {setGlobalRoleOpen(false); load();}}
                userId={selectedUser?.id || null}
            />
        </Box>
    );
}