import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserGlobalRolesAPI, GlobalRoleTypesAPI } from "../../../api";
import type { UserGlobalRole, GlobalRoleType } from "../../../types/org";

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
    ListItemText
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UserGlobalRolesPage() {
    const { id: userId } = useParams(); // /users/:id/global-roles
    const [roles, setRoles] = useState<UserGlobalRole[]>([]);
    const [roleTypes, setRoleTypes] = useState<GlobalRoleType[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");

    useEffect(() => {
        if (!userId) return;

        UserGlobalRolesAPI.getByUser(userId).then(setRoles);
        GlobalRoleTypesAPI.getAll().then(setRoleTypes);
    }, [userId]);

    const assignRole = () => {
        if (!selectedRoleId) return;

        UserGlobalRolesAPI.assign({
            userId: userId!,
            globalRoleId: selectedRoleId
        }).then(newRole => {
            setRoles(prev => [...prev, newRole]);
            setSelectedRoleId("");
        });
    };

    const removeRole = (globalRoleId: string) => {
        UserGlobalRolesAPI.remove(userId!, globalRoleId).then(() => {
            setRoles(prev => prev.filter(r => r.global_role_id !== globalRoleId));
        });
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                User Global Role Management
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6">Assigned Global Roles</Typography>

                    <List>
                        {roles.map(role => (
                            <ListItem
                                key={role.global_role_id}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        onClick={() => removeRole(role.global_role_id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={role.global_roles?.name ?? role.global_role_id}
                                />
                            </ListItem>
                        ))}

                        {roles.length === 0 && (
                            <Typography color="text.secondary">
                                This user has no assigned global roles.
                            </Typography>
                        )}
                    </List>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Assign New Global Role
                    </Typography>

                    <Box display="flex" gap={2}>
                        <Select
                            value={selectedRoleId}
                            onChange={e => setSelectedRoleId(e.target.value)}
                            displayEmpty
                            sx={{ minWidth: 240 }}
                        >
                            <MenuItem value="">
                                <em>Select a global role</em>
                            </MenuItem>

                            {roleTypes.map(rt => (
                                <MenuItem key={rt.id} value={rt.id}>
                                    {rt.name}
                                </MenuItem>
                            ))}
                        </Select>

                        <Button variant="contained" onClick={assignRole}>
                            Assign Role
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}