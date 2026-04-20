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
import KeyIcon from "@mui/icons-material/Key";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useNavigate } from "react-router-dom";

import { UsersAPI } from "../../api";

import UserFormDialog from "./UserFormDialog";
import type { User } from "../../types/user";
import UserGlobalRolesDialog from "./UserGlobalRolesDialog";
import UserPermissionsDialog from "./UserPermissionsDialog";
import UserScopeDialog from "./UserScopeDialog";



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

    const [permissionOpen, setPermissionOpen] = useState(false);
    const [scopeOpen, setScopeOpen] = useState(false);


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

    const openPermissions = (user: User) => {
        setSelectedUser(user);
        setPermissionOpen(true);
    };

    const openScope = (user: User) => {
        setSelectedUser(user);
        setScopeOpen(true);
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

    const navigate = useNavigate();

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
                                <TableCell><b>Resource Scope</b></TableCell>

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
                                        <Tooltip
                                            title={
                                                <Box whiteSpace="pre-line">
                                                    {(u.permissionMeta || [])
                                                        .map(p => p.name)
                                                        .join("\n") || "No permissions"}
                                                </Box>
                                            }
                                            arrow
                                            placement="top"
                                        >
                                            <span>
                                                {truncate((u.permissionMeta || []).map(p => p.name).join(", ")) || "-"}
                                            </span>
                                        </Tooltip>
                                    </TableCell>



                                    {/* Scope */}
                                    <TableCell>
                                        {(() => {
                                            const scope = u.scope ?? {
                                                group_ids: [],
                                                team_ids: [],
                                                subteam_ids: [],
                                                domain_ids: [],
                                                rotation_ids: [],
                                                leave_approval_team_ids: [],
                                                leave_approval_group_ids: [],
                                                holiday_group_ids: [],
                                                holiday_global: false
                                            };

                                            //  Summary
                                            const summary = [
                                                scope.group_ids.length > 0 && `Group(${scope.group_ids.length})`,
                                                scope.team_ids.length > 0 && `Team(${scope.team_ids.length})`,
                                                scope.subteam_ids.length > 0 && `Subteam(${scope.subteam_ids.length})`,
                                                scope.domain_ids.length > 0 && `Domain(${scope.domain_ids.length})`,
                                                scope.rotation_ids.length > 0 && `Rotation(${scope.rotation_ids.length})`,
                                                scope.leave_approval_team_ids.length > 0 &&
                                                `LeaveTeam(${scope.leave_approval_team_ids.length})`,
                                                scope.leave_approval_group_ids.length > 0 &&
                                                `LeaveGroup(${scope.leave_approval_group_ids.length})`,
                                                scope.holiday_group_ids.length > 0 &&
                                                `HolidayGroup(${scope.holiday_group_ids.length})`,
                                                scope.holiday_global && `Holiday(Global)`
                                            ]
                                                .filter(Boolean)
                                                .join(", ") || "—";

                                            // Tooltip
                                            const details = [
                                                scope.group_ids.length > 0 && `Group: ${scope.group_ids.length}`,
                                                scope.team_ids.length > 0 && `Team: ${scope.team_ids.length}`,
                                                scope.subteam_ids.length > 0 && `Subteam: ${scope.subteam_ids.length}`,
                                                scope.domain_ids.length > 0 && `Domain: ${scope.domain_ids.length}`,
                                                scope.rotation_ids.length > 0 && `Rotation: ${scope.rotation_ids.length}`,
                                                scope.leave_approval_team_ids.length > 0 &&
                                                `Leave Approval (Team): ${scope.leave_approval_team_ids.length}`,
                                                scope.leave_approval_group_ids.length > 0 &&
                                                `Leave Approval (Group): ${scope.leave_approval_group_ids.length}`,
                                                scope.holiday_group_ids.length > 0 &&
                                                `Holiday (Group): ${scope.holiday_group_ids.length}`,
                                                scope.holiday_global && `Holiday (Global)`
                                            ]
                                                .filter(Boolean)
                                                .join("\n");

                                            return (
                                                <Tooltip
                                                    title={<Box whiteSpace="pre-line">{details || "No assigned scope"}</Box>}
                                                    arrow
                                                    placement="top"
                                                >
                                                    <span>
                                                        {summary}
                                                    </span>
                                                </Tooltip>
                                            );
                                        })()}
                                    </TableCell>

                                    <TableCell>{u.timezone}</TableCell>
                                    <TableCell>{u.is_active ? "Yes" : "No"}</TableCell>

                                    {/* ACTIONS */}
                                    <TableCell align="right">
                                        <Tooltip title="View Detail" arrow>
                                            <IconButton
                                                color="info"
                                                onClick={() => navigate(`/users/${u.id}`)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Assign Global Role" arrow>
                                            <IconButton color="primary" onClick={() => openGlobalRoles(u)}>
                                                <GroupIcon />
                                            </IconButton>
                                        </Tooltip>


                                        <Tooltip title="Assign Permissions" arrow>
                                            <IconButton color="primary" onClick={() => openPermissions(u)}>
                                                <KeyIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Assign Resource Scope" arrow>
                                            <IconButton color="primary" onClick={() => openScope(u)}>
                                                <AccountTreeIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Edit" arrow>
                                            <IconButton color="secondary" onClick={() => openEdit(u)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Delete" arrow>
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
                onClose={() => { setGlobalRoleOpen(false); load(); }}
                userId={selectedUser?.id || null}
                userName={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
            />

            <UserScopeDialog
                open={scopeOpen}
                onClose={() => { setScopeOpen(false); load(); }}
                userId={selectedUser?.id || null}
                userName={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
            />

            <UserPermissionsDialog
                open={permissionOpen}
                onClose={() => { setPermissionOpen(false); load(); }}
                userId={selectedUser?.id || null}
                userName={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
            />

        </Box>
    );
}