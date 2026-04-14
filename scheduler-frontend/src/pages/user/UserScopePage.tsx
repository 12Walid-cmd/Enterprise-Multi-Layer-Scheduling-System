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

type ScopeKey = "group" | "domain" | "team" | "rotation";

interface SelectedState {
    group: string;
    domain: string;
    team: string;
    rotation: string;
}

const scopeKeyToIdKey = {
    group: "group_ids",
    domain: "domain_ids",
    team: "team_ids",
    rotation: "rotation_ids",
} as const;

export default function UserScopePage() {
    const { id: userId } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);

    const [scope, setScope] = useState<UserScope>({
        group_ids: [],
        domain_ids: [],
        team_ids: [],
        rotation_ids: [],
    });

    const [groups, setGroups] = useState<Group[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [rotations, setRotations] = useState<Rotation[]>([]);

    const [selected, setSelected] = useState<SelectedState>({
        group: "",
        domain: "",
        team: "",
        rotation: "",
    });

    /** ---------------------------
     *  Strongly typed API mapping
     *  --------------------------- */
    const addScopeAPI: Record<ScopeKey, (userId: string, id: string) => Promise<any>> = {
        group: (userId, id) => UserScopeAPI.addGroup(userId, id),
        domain: (userId, id) => UserScopeAPI.addDomain(userId, id),
        team: (userId, id) => UserScopeAPI.addTeam(userId, id),
        rotation: (userId, id) => UserScopeAPI.addRotation(userId, id),
    };

    const removeScopeAPI: Record<ScopeKey, (userId: string, id: string) => Promise<any>> = {
        group: (userId, id) => UserScopeAPI.removeGroup(userId, id),
        domain: (userId, id) => UserScopeAPI.removeDomain(userId, id),
        team: (userId, id) => UserScopeAPI.removeTeam(userId, id),
        rotation: (userId, id) => UserScopeAPI.removeRotation(userId, id),
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
                rotation_ids: scopeData.rotation_ids ?? [],
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
            {renderSection("Rotation Scope", scope.rotation_ids, rotations, "rotation")}
        </Box>
    );
}