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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import { UserPermissionsAPI, PermissionsAPI } from "../../api";
import type { PermissionType } from "../../types/permission";

/* ================= PROPS ================= */

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  userName?: string;
}

/* ================= COMPONENT ================= */

export default function UserPermissionsDialog({
  open,
  onClose,
  userId,
  userName
}: Props) {
  const [userPermissions, setUserPermissions] = useState<{ user_id: string; permission: string }[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionType[]>([]);
  const [selectedPermission, setSelectedPermission] = useState("");
  const [adding, setAdding] = useState(false);

  /* ================= LOAD ================= */

  const loadAll = async () => {
    if (!userId) return;

    const [userRes, allRes] = await Promise.all([
      UserPermissionsAPI.getByUser(userId),
      PermissionsAPI.getAll(),
    ]);

    setUserPermissions(userRes);
    setAllPermissions(allRes);
  };

  useEffect(() => {
    if (!open || !userId) return;
    loadAll();
  }, [open, userId]);

  /* ================= FILTER ================= */

  const availablePermissions = useMemo(() => {
    const assigned = new Set(userPermissions.map(up => up.permission));
    return allPermissions.filter(p => !assigned.has(p.code));
  }, [allPermissions, userPermissions]);

  /* ================= ACTIONS ================= */

  const handleAdd = async () => {
    if (!userId || !selectedPermission || adding) return;

    try {
      setAdding(true);
      await UserPermissionsAPI.assign(userId, selectedPermission);
      setSelectedPermission("");
      await loadAll();
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (permission: string) => {
    if (!userId) return;

    await UserPermissionsAPI.remove(userId, permission);
    await loadAll();
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Permissions {userName ? `- ${userName}` : ""}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

          {/* ===== ADD ===== */}
          <Box display="flex" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Permission</InputLabel>

              <Select
                value={selectedPermission}
                label="Permission"
                onChange={(e) => setSelectedPermission(e.target.value)}
              >
                {availablePermissions.length === 0 ? (
                  <MenuItem disabled>No available permissions</MenuItem>
                ) : (
                  availablePermissions.map((p) => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.name}
                      {p.description ? ` (${p.description})` : ""}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={
                !selectedPermission ||
                adding ||
                availablePermissions.length === 0
              }
            >
              {adding ? "Adding..." : "Add"}
            </Button>
          </Box>

          {/* ===== SIMPLE LIST ===== */}
          <List>
            {userPermissions.length === 0 ? (
              <Typography color="text.secondary">
                No permissions assigned
              </Typography>
            ) : (
              userPermissions.map((up) => {
                const meta = allPermissions.find(p => p.code === up.permission);

                return (
                  <ListItem
                    key={up.permission}
                    secondaryAction={
                      <IconButton
                        color="error"
                        onClick={() => handleRemove(up.permission)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        meta
                          ? `${meta.name}${meta.description ? ` (${meta.description})` : ""}`
                          : up.permission
                      }
                    />
                  </ListItem>
                );
              })
            )}
          </List>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}