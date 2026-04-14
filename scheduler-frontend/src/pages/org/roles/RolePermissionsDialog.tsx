import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Select,
    MenuItem,
    Typography,
    IconButton,
    Stack,
    Paper,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
    FormControl,
    InputLabel,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

import { RolesAPI, PermissionsAPI } from "../../../api";
import type { Role } from "../../../types/org";
import type { PermissionType } from "../../../types/permission";

export default function RolePermissionsDialog({
    open,
    onClose,
    role,
}: {
    open: boolean;
    onClose: () => void;
    role: Role | null;
}) {
    const [permissions, setPermissions] = useState<PermissionType[]>([]);
    const [selected, setSelected] = useState("");

    const [current, setCurrent] = useState<string[]>([]);

    useEffect(() => {
        if (!role) return;

        const load = async () => {
            const fullRole = await RolesAPI.getOne(role.id);

            setCurrent(fullRole.permissions || []);
            setPermissions(await PermissionsAPI.getAll());
        };

        load();
    }, [role]);

    const addPermission = async () => {
        if (!role || !selected) return;

        if (current.includes(selected)) return; 
        await RolesAPI.assignPermission(role.id, selected);

        setCurrent((prev) =>
            prev.includes(selected) ? prev : [...prev, selected]
        );
        setSelected("");
    };

    const removePermission = async (p: string) => {
        if (!role) return;

        await RolesAPI.removePermission(role.id, p);

        setCurrent((prev) => prev.filter(x => x !== p));
    };
    const availablePermissions = permissions.filter(
        p => !current.includes(p.code)
    );

    if (!role) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                Manage Permissions {role ? `— ${role.name}` : ""}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>

                    {/* ADD PERMISSION */}
                    <Box display="flex" gap={2}>

                        {/* PERMISSION SELECT */}
                        <FormControl fullWidth>
                            <InputLabel>Permission</InputLabel>
                            <Select
                                value={selected}
                                label="Permission"
                                onChange={(e) => setSelected(e.target.value)}
                            >
                                {availablePermissions.length === 0 ? (
                                    <MenuItem disabled>No permissions available</MenuItem>
                                ) : (
                                    availablePermissions.map((p) => (
                                        <MenuItem key={p.code} value={p.code}>
                                            {p.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            onClick={addPermission}
                            disabled={!selected}
                        >
                            Add
                        </Button>
                    </Box>

                    {/* PERMISSION LIST */}
                    <Paper variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {current.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            <Typography color="text.secondary">
                                                No permissions assigned
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    current.map((p) => {
                                        const perm = permissions.find((x) => x.code === p);

                                        return (
                                            <TableRow key={p}>
                                                {/* NAME */}
                                                <TableCell>
                                                    {perm?.name || "-"}
                                                </TableCell>

                                                {/* DESCRIPTION */}
                                                <TableCell>
                                                    {perm?.description || "-"}
                                                </TableCell>

                                                {/* ACTION */}
                                                <TableCell align="right">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => removePermission(p)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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