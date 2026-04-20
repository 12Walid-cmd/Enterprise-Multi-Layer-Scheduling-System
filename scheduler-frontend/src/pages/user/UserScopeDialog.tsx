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
    TableBody,
    TableRow,
    TableCell,
    Paper,
    IconButton,
    Tabs,
    Tab,
    Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import {
    UserScopeAPI,
    GroupsAPI,
    TeamsAPI,
    DomainAPI,
    RotationAPI,
    SubTeamsAPI,
    PermissionsAPI,
} from "../../api";

import type { UserScope } from "../../types/user";
import type { Group, SubTeam, Team } from "../../types/org";
import type { Domain } from "../../types/domain";
import type { RotationDefinition as Rotation } from "../../types/rotation";

/* ================= PROPS ================= */

interface Props {
    open: boolean;
    onClose: () => void;
    userId: string | null;
    userName?: string;
}

/* ================= COMPONENT ================= */

export default function UserScopeDialog({
    open,
    onClose,
    userId,
    userName,
}: Props) {
    const [tab, setTab] = useState(0);

    const [scope, setScope] = useState<UserScope>({
        group_ids: [],
        domain_ids: [],
        team_ids: [],
        subteam_ids: [],
        rotation_ids: [],
        leave_approval_team_ids: [],
        leave_approval_group_ids: [],
        holiday_group_ids: [],
        holiday_global: false,
    });

    const [groups, setGroups] = useState<Group[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [subteams, setSubteams] = useState<SubTeam[]>([]);
    const [rotations, setRotations] = useState<Rotation[]>([]);

    const [value, setValue] = useState("");

    /* ================= LOAD ================= */

    const loadAll = async () => {
        if (!userId) return;

        const [scopeData, g, d, t, st, r] = await Promise.all([
            UserScopeAPI.getScope(userId),
            GroupsAPI.getAll(),
            DomainAPI.getAll(),
            TeamsAPI.getAll(),
            SubTeamsAPI.getAll(),
            RotationAPI.getAll(),
        ]);

        setScope({
            group_ids: scopeData.group_ids ?? [],
            domain_ids: scopeData.domain_ids ?? [],
            team_ids: scopeData.team_ids ?? [],
            subteam_ids: scopeData.subteam_ids ?? [],
            rotation_ids: scopeData.rotation_ids ?? [],
            leave_approval_team_ids: scopeData.leave_approval_team_ids ?? [],
            leave_approval_group_ids: scopeData.leave_approval_group_ids ?? [],
            holiday_group_ids: scopeData.holiday_group_ids ?? [],
            holiday_global: scopeData.holiday_global ?? false,
        });

        setGroups(g);
        setDomains(d);
        setTeams(t);
        setSubteams(st);
        setRotations(r);
    };

    useEffect(() => {
        if (!open || !userId) return;
        loadAll();
    }, [open, userId]);



    const [scopeRegistry, setScopeRegistry] = useState({});

    useEffect(() => {
        PermissionsAPI.getScopeRegistry().then(setScopeRegistry);
    }, []);

    /* ================= HELPERS ================= */

    function getResourceList(type: string) {
        switch (type) {
            case "group": return groups;
            case "domain": return domains;
            case "team": return teams;
            case "subteam": return subteams;
            case "rotation": return rotations;
            default: return [];
        }
    }

    function getAddFn(type: string) {
        switch (type) {
            case "group": return (id: string) => UserScopeAPI.addGroup(userId!, id);
            case "domain": return (id: string) => UserScopeAPI.addDomain(userId!, id);
            case "team": return (id: string) => UserScopeAPI.addTeam(userId!, id);
            case "subteam": return (id: string) => UserScopeAPI.addSubteam(userId!, id);
            case "rotation": return (id: string) => UserScopeAPI.addRotation(userId!, id);
            default: return () => { };
        }
    }

    function getRemoveFn(type: string) {
        switch (type) {
            case "group": return (id: string) => UserScopeAPI.removeGroup(userId!, id);
            case "domain": return (id: string) => UserScopeAPI.removeDomain(userId!, id);
            case "team": return (id: string) => UserScopeAPI.removeTeam(userId!, id);
            case "subteam": return (id: string) => UserScopeAPI.removeSubteam(userId!, id);
            case "rotation": return (id: string) => UserScopeAPI.removeRotation(userId!, id);
            default: return () => { };
        }
    }

    /* ================= CONFIGS (AUTO-GENERATED) ================= */

    const configs = useMemo(() => {
        return Object.keys(scopeRegistry).map(type => ({
            key: type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            ids: scope[`${type}_ids` as keyof UserScope] as string[],   //  string[]
            all: getResourceList(type),
            add: getAddFn(type),
            remove: getRemoveFn(type),
        }));
    }, [scopeRegistry, scope, userId]);


    const current = configs[tab];



    /* ================= FILTER ================= */

    const availableItems = useMemo(() => {
        if (!current) return [];
        const ids = current.ids as string[];
        const setIds = new Set(ids);
        return current.all.filter((i) => !setIds.has(i.id));
    }, [current]);

    /* ================= ACTIONS ================= */

    const handleAdd = async () => {
        if (!value) return;

        await current.add(value);

        setScope(prev => ({
            ...prev,
            [`${current.key}_ids` as keyof UserScope]: [...current.ids, value],
        }));


        setValue("");
        await loadAll();
    };

    const handleRemove = async (id: string) => {
        await current.remove(id);
        await loadAll();
    };

    const getExtraLabel = (i: any) => {
        if (!current) return "";

        switch (current.key) {
            case "team":
            case "leaveTeam":
                return i.groups?.name ? ` (Group: ${i.groups.name})` : "";
            case "subteam":
                return i.teams?.name
                    ? ` (Parent Team: ${i.teams.name})`
                    : "";

            default:
                return i.description ? ` (${i.description})` : "";
        }
    };

    /* ================= UI ================= */

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

            <DialogTitle>
                Assign Resource Scope {userName ? `- ${userName}` : ""}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>

                    {/* TABS */}
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
                        {configs.map((c) => (
                            <Tab key={c.key} label={c.label} />
                        ))}
                        <Tab label="Global Holiday" />
                    </Tabs>

                    {/* ADD AREA */}
                    {tab < configs.length && (
                        <Box display="flex" gap={2}>

                            <FormControl fullWidth>
                                <InputLabel>{current.label}</InputLabel>

                                <Select
                                    value={value}
                                    label={current.label}
                                    onChange={(e) => setValue(e.target.value)}
                                >
                                    {availableItems.length > 0 ? (
                                        availableItems.map((i) => (
                                            <MenuItem key={i.id} value={i.id}>
                                                {i.name}
                                                {getExtraLabel(i)}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No available {current.label}</MenuItem>
                                    )}
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                onClick={handleAdd}
                                disabled={!value || availableItems.length === 0}
                            >
                                Add
                            </Button>

                        </Box>
                    )}
                    {/* GLOBAL HOLIDAY */}
                    {tab === configs.length && (
                        <Box mt={1}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                                Global Holiday Permission
                            </Typography>

                            <Typography color="text.secondary" mb={2}>
                                {scope.holiday_global
                                    ? "User CAN configure global holidays"
                                    : "User CANNOT configure global holidays"}
                            </Typography>

                            {scope.holiday_global ? (
                                <Button
                                    color="error"
                                    variant="contained"
                                    onClick={async () => {
                                        await UserScopeAPI.removeHolidayGlobal(userId!);
                                        setScope((prev) => ({ ...prev, holiday_global: false }));
                                    }}
                                >
                                    Remove Permission
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={async () => {
                                        await UserScopeAPI.addHolidayGlobal(userId!);
                                        setScope((prev) => ({ ...prev, holiday_global: true }));
                                    }}
                                >
                                    Grant Permission
                                </Button>
                            )}

                        </Box>
                    )}

                    {/* TABLE */}
                    {tab < configs.length && (
                        <Paper variant="outlined" sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableBody>

                                    {current.ids.length > 0 ? (
                                        current.ids.map((id) => {
                                            const item = current.all.find((i) => i.id === id);

                                            return (
                                                <TableRow key={id}>
                                                    <TableCell>{item?.name ?? id}</TableCell>

                                                    <TableCell align="right">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleRemove(id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell align="center">
                                                <Typography color="text.secondary">
                                                    No {current.label} assigned
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                </TableBody>
                            </Table>
                        </Paper>
                    )}

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>

        </Dialog>
    );
}