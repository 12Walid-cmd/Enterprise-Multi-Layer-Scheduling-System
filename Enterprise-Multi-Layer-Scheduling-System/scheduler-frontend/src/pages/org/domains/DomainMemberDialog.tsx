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
    TableRow,
    TableCell,
    TableBody,
    Paper,
    IconButton,
    Tabs,
    Tab,
    Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import {
    DomainTeamsAPI,
    TeamsAPI,
    UsersAPI,
} from "../../../api";

import { DomainUsersAPI } from "../../../api";

import type { Team } from "../../../types/org";

/* ================= TYPES ================= */

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
}

interface DomainMemberDialogProps {
    open: boolean;
    onClose: () => void;
    domainId: string | null;
    domainName?: string;
}

/* ================= COMPONENT ================= */

export default function DomainMemberDialog({
    open,
    onClose,
    domainId,
    domainName,
}: DomainMemberDialogProps) {

    const [tab, setTab] = useState(0);

    const [teams, setTeams] = useState<Team[]>([]);
    const [domainTeams, setDomainTeams] = useState<any[]>([]);

    const [users, setUsers] = useState<User[]>([]);
    const [domainUsers, setDomainUsers] = useState<any[]>([]);

    const [teamId, setTeamId] = useState("");
    const [userId, setUserId] = useState("");

    const [addingTeam, setAddingTeam] = useState(false);
    const [addingUser, setAddingUser] = useState(false);

    /* ================= LOAD ================= */

    const loadAll = async () => {
        if (!domainId) return;

        const [allTeams, dt, allUsers, du] = await Promise.all([
            TeamsAPI.getAll(),
            DomainTeamsAPI.getTeamsByDomain(domainId),
            UsersAPI.getAll(),
            DomainUsersAPI.getUsers(domainId),
        ]);

        setTeams(allTeams);
        setDomainTeams(dt);
        setUsers(allUsers);
        setDomainUsers(du);

    };

    useEffect(() => {
        if (!open || !domainId) return;
        loadAll();
    }, [open, domainId]);

    /* ================= FILTER ================= */

    const availableTeams = useMemo(() => {
        const ids = new Set(domainTeams.map((t: any) => t.team_id));
        return teams.filter((t) => !ids.has(t.id));
    }, [teams, domainTeams]);

    const availableUsers = useMemo(() => {
        const ids = new Set(domainUsers.map((u: any) => u.user_id));
        return users.filter((u) => !ids.has(u.id));
    }, [users, domainUsers]);

    /* ================= ACTION ================= */

    const handleAddTeam = async () => {
        if (!domainId || !teamId) return;

        setAddingTeam(true);

        await DomainTeamsAPI.create({
            domain_id: domainId,
            team_id: teamId,
        });

        setTeamId("");
        await loadAll();

        setAddingTeam(false);
    };

    const handleAddUser = async () => {
        if (!domainId || !userId) return;

        setAddingUser(true);

        await DomainUsersAPI.addUser(domainId, {
            user_id: userId,
        });

        setUserId("");
        await loadAll();

        setAddingUser(false);
    };

    const handleRemoveTeam = async (id: string) => {
        await DomainTeamsAPI.delete(id);
        await loadAll();
    };

    const handleRemoveUser = async (userId: string) => {
        if (!domainId) return;

        await DomainUsersAPI.removeUser(domainId, userId);
        await loadAll();
    };

    /* ================= UI ================= */

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

            <DialogTitle>
                Domain Members {domainName ? `- ${domainName}` : ""}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>

                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label="Teams" />
                        <Tab label="Users" />
                    </Tabs>

                    {/* ================= TEAM TAB ================= */}
                    {tab === 0 && (
                        <>
                            <Box display="flex" gap={2}>

                                <FormControl fullWidth>
                                    <InputLabel>Team</InputLabel>
                                    <Select
                                        value={teamId}
                                        label="Team"
                                        onChange={(e) => setTeamId(e.target.value)}
                                    >
                                        {availableTeams.length > 0 ? (
                                            availableTeams.map((t) => (
                                                <MenuItem key={t.id} value={t.id}>
                                                    {t.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No available teams</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="contained"
                                    disabled={!teamId || addingTeam}
                                    onClick={handleAddTeam}
                                >
                                    {addingTeam ? "Adding..." : "Add"}
                                </Button>

                            </Box>

                            <Paper variant="outlined">
                                <Table size="small">
                                    <TableBody>
                                        {domainTeams.length > 0 ? (
                                            domainTeams.map((t: any) => (
                                                <TableRow key={t.id}>
                                                    <TableCell>{t.teams?.name}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleRemoveTeam(t.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell align="center">
                                                    <Typography color="text.secondary">
                                                        No teams in this domain
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </>
                    )}

                    {/* ================= USER TAB ================= */}
                    {tab === 1 && (
                        <>
                            <Box display="flex" gap={2}>

                                <FormControl fullWidth>
                                    <InputLabel>User</InputLabel>
                                    <Select
                                        value={userId}
                                        label="User"
                                        onChange={(e) => setUserId(e.target.value)}
                                    >
                                        {availableUsers.length > 0 ? (
                                            availableUsers.map((u) => (
                                                <MenuItem key={u.id} value={u.id}>
                                                    {u.first_name} {u.last_name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No available users</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="contained"
                                    disabled={!userId || addingUser}
                                    onClick={handleAddUser}
                                >
                                    {addingUser ? "Adding..." : "Add"}
                                </Button>

                            </Box>

                            <Paper variant="outlined">
                                <Table size="small">
                                    <TableBody>
                                        {domainUsers.length > 0 ? (
                                            domainUsers.map((u: any) => (
                                                <TableRow key={u.user_id}>
                                                    <TableCell>
                                                        {u.user?.first_name} {u.user?.last_name}
                                                    </TableCell>
                                                    <TableCell>{u.user?.email}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleRemoveUser(u.user_id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell align="center">
                                                    <Typography color="text.secondary">
                                                        No users in this domain
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </>
                    )}

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>

        </Dialog>
    );
}