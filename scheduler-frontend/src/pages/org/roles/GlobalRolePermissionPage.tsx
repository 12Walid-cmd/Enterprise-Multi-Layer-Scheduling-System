import { useEffect, useState } from "react";
import {
    Box, Card, CardContent, Typography, List, ListItem,
    ListItemText, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { GlobalRolePermissionsAPI } from "../../../api";
import type { GlobalRolePermission } from "../../../types/globalRolePermission";
import { useParams } from "react-router-dom";


export default function GlobalRolePermissionPage() {
    const [permissions, setPermissions] = useState<GlobalRolePermission[]>([]);
    const [open, setOpen] = useState(false);
    const [newPermission, setNewPermission] = useState("");
    const { roleId } = useParams<{ roleId: string }>();

    if (!roleId) {
        return <div>No role selected</div>;
    }

    const load = () => {
        GlobalRolePermissionsAPI.get(roleId).then(setPermissions);
    };

    useEffect(() => {
        load();
    }, [roleId]);

    const add = async () => {
        await GlobalRolePermissionsAPI.add(roleId, newPermission);
        setNewPermission("");
        setOpen(false);
        load();
    };

    const remove = async (permission: string) => {
        await GlobalRolePermissionsAPI.remove(roleId, permission);
        load();
    };



    return (
        <Box p={3}>
            <Typography variant="h5">Global Role Permissions</Typography>

            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <List>
                        {permissions.map(p => (
                            <ListItem
                                key={p.permission}
                                secondaryAction={
                                    <IconButton onClick={() => remove(p.permission)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText primary={p.permission} />
                            </ListItem>
                        ))}
                    </List>

                    <Button variant="contained" onClick={() => setOpen(true)}>
                        Add Permission
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Permission</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Permission Code"
                        value={newPermission}
                        onChange={e => setNewPermission(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={add}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}