import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    UserScopeAPI,
    GroupsAPI,
    TeamsAPI,
    DomainAPI,
    RotationAPI,
} from "../../api";

import type { UserScope } from "../../types/user";
import type { Group, Team } from "../../types/org";
import type { Domain } from "../../types/domain";
import type { RotationDefinition as Rotation } from "../../types/rotation";

type ScopeKey =
    | "group"
    | "domain"
    | "team"
    | "subteam"
    | "rotation"
    | "leaveTeam"
    | "leaveGroup"
    | "holidayGroup";

interface SelectedState {
    group: string;
    domain: string;
    team: string;
    subteam: string;
    rotation: string;
    leaveTeam: string;
    leaveGroup: string;
    holidayGroup: string;
}

const scopeKeyToIdKey = {
    group: "group_ids",
    domain: "domain_ids",
    team: "team_ids",
    subteam: "subteam_ids",
    rotation: "rotation_ids",
    leaveTeam: "leave_approval_team_ids",
    leaveGroup: "leave_approval_group_ids",
    holidayGroup: "holiday_group_ids",
} as const;

export default function UserScopePage() {
    const { id: userId } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);

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
    const [rotations, setRotations] = useState<Rotation[]>([]);

    const [selected, setSelected] = useState<SelectedState>({
        group: "",
        domain: "",
        team: "",
        subteam: "",
        rotation: "",
        leaveTeam: "",
        leaveGroup: "",
        holidayGroup: "",
    });

    /** ---------------------------
     *  Strongly typed API mapping
     *  --------------------------- */
    const addScopeAPI: Record<ScopeKey, (userId: string, id: string) => Promise<any>> = {
        group: (u, id) => UserScopeAPI.addGroup(u, id),
        domain: (u, id) => UserScopeAPI.addDomain(u, id),
        team: (u, id) => UserScopeAPI.addTeam(u, id),
        subteam: (u, id) => UserScopeAPI.addSubteam(u, id),
        rotation: (u, id) => UserScopeAPI.addRotation(u, id),
        leaveTeam: (u, id) => UserScopeAPI.addLeaveTeam(u, id),
        leaveGroup: (u, id) => UserScopeAPI.addLeaveGroup(u, id),
        holidayGroup: (u, id) => UserScopeAPI.addHolidayGroup(u, id),
    };

    const removeScopeAPI: Record<ScopeKey, (userId: string, id: string) => Promise<any>> = {
        group: (u, id) => UserScopeAPI.removeGroup(u, id),
        domain: (u, id) => UserScopeAPI.removeDomain(u, id),
        team: (u, id) => UserScopeAPI.removeTeam(u, id),
        subteam: (u, id) => UserScopeAPI.removeSubteam(u, id),
        rotation: (u, id) => UserScopeAPI.removeRotation(u, id),
        leaveTeam: (u, id) => UserScopeAPI.removeLeaveTeam(u, id),
        leaveGroup: (u, id) => UserScopeAPI.removeLeaveGroup(u, id),
        holidayGroup: (u, id) => UserScopeAPI.removeHolidayGroup(u, id),
    };

    /** ---------------------------
     *  Load all data
     *  --------------------------- */
    useEffect(() => {
        if (!userId) return;

        (async () => {
            const [scopeData, groupsData, domainsData, teamsData, rotationsData] =
                await Promise.all([
                    UserScopeAPI.getScope(userId),
                    GroupsAPI.getAll(),
                    DomainAPI.getAll(),
                    TeamsAPI.getAll(),
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

            setGroups(groupsData);
            setDomains(domainsData);
            setTeams(teamsData);
            setRotations(rotationsData);

            setLoading(false);
        })();
    }, [userId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    /** ---------------------------
     *  Add / Remove Scope
     *  --------------------------- */
    const addScope = async (type: ScopeKey) => {
        if (!userId) return;

        const value = selected[type];
        if (!value) return;

        await addScopeAPI[type](userId, value);

        const idKey = scopeKeyToIdKey[type];

        setScope((prev) => ({
            ...prev,
            [idKey]: [...prev[idKey], value],
        }));

        setSelected((prev) => ({ ...prev, [type]: "" }));
    };

    const removeScope = async (type: ScopeKey, id: string) => {
        if (!userId) return;

        await removeScopeAPI[type](userId, id);

        const idKey = scopeKeyToIdKey[type];

        setScope((prev) => ({
            ...prev,
            [idKey]: prev[idKey].filter((x) => x !== id),
        }));
    };

    /** ---------------------------
     *  Reusable Section Renderer
     *  --------------------------- */
    const renderSection = (
        label: string,
        ids: string[],
        allItems: { id: string; name: string; description?: string | null }[],
        type: ScopeKey
    ) => (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6">{label}</Typography>

                <List>
                    {ids.map((id) => {
                        const item = allItems.find((i) => i.id === id);
                        return (
                            <ListItem
                                key={id}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => removeScope(type, id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={item?.name ?? id}
                                    secondary={item?.description ?? undefined}
                                />
                            </ListItem>
                        );
                    })}

                    {ids.length === 0 && (
                        <Typography color="text.secondary">
                            No {label} assigned.
                        </Typography>
                    )}
                </List>

                <Box display="flex" gap={2} mt={2}>
                    <Select
                        value={selected[type]}
                        onChange={(e) =>
                            setSelected((prev) => ({
                                ...prev,
                                [type]: String(e.target.value),
                            }))
                        }
                        displayEmpty
                        sx={{ minWidth: 240 }}
                    >
                        <MenuItem value="">
                            <em>Select one</em>
                        </MenuItem>

                        {allItems.map((i) => (
                            <MenuItem key={i.id} value={i.id}>
                                {i.name}
                            </MenuItem>
                        ))}
                    </Select>

                    <Button variant="contained" onClick={() => addScope(type)}>
                        Add
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );

    const renderGlobalHoliday = () => (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6">Global Holiday Permission</Typography>

                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {scope.holiday_global
                        ? "User CAN configure global holidays."
                        : "User CANNOT configure global holidays."}
                </Typography>

                {scope.holiday_global ? (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={async () => {
                            await UserScopeAPI.removeHolidayGlobal(userId!);
                            setScope((prev) => ({ ...prev, holiday_global: false }));
                        }}
                    >
                        Remove Global Holiday Permission
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={async () => {
                            await UserScopeAPI.addHolidayGlobal(userId!);
                            setScope((prev) => ({ ...prev, holiday_global: true }));
                        }}
                    >
                        Grant Global Holiday Permission
                    </Button>
                )}
            </CardContent>
        </Card>
    );
    /** ---------------------------
     *  Render Page
     *  --------------------------- */
    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                User Resource Scope (PBAC)
            </Typography>

            {renderSection("Group Scope", scope.group_ids, groups, "group")}
            {renderSection("Domain Scope", scope.domain_ids, domains, "domain")}
            {renderSection("Team Scope", scope.team_ids, teams, "team")}
            {renderSection("Subteam Scope", scope.subteam_ids, teams, "subteam")}
            {renderSection("Rotation Scope", scope.rotation_ids, rotations, "rotation")}

            {renderSection("Leave Approval (Team)", scope.leave_approval_team_ids, teams, "leaveTeam")}
            {renderSection("Leave Approval (Group)", scope.leave_approval_group_ids, groups, "leaveGroup")}

            {renderSection("Holiday (Group)", scope.holiday_group_ids, groups, "holidayGroup")}

            {/* Global Holiday Permission */}
            {renderGlobalHoliday()}
        </Box>
    );
}