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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { UserPermissionsAPI } from "../../api";
import { PermissionsAPI } from "../../api";
import type { PermissionType } from "../../types/permission";

export default function UserPermissionsPage() {
  const { id: userId } = useParams();

  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionType[]>([]);
  const [selectedPermission, setSelectedPermission] = useState("");

  useEffect(() => {
    if (!userId) return;

    // Load user's assigned permissions
    UserPermissionsAPI.getByUser(userId).then(setUserPermissions);

    // Load all available permissions
    PermissionsAPI.getAll().then(setAllPermissions);
  }, [userId]);

  const handleAssign = async () => {
    if (!selectedPermission) return;

    await UserPermissionsAPI.assign(userId!, selectedPermission);

    setUserPermissions((prev) => [...prev, selectedPermission]);
    setSelectedPermission("");
  };

  const handleRemove = async (permission: string) => {
    await UserPermissionsAPI.remove(userId!, permission);

    setUserPermissions((prev) => prev.filter((p) => p !== permission));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        User Permission Management
      </Typography>

      {/* Assigned Permissions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Assigned Permissions</Typography>

          <List>
            {userPermissions.map((permission) => (
              <ListItem
                key={permission}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemove(permission)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={permission} />
              </ListItem>
            ))}

            {userPermissions.length === 0 && (
              <Typography color="text.secondary">
                This user has no assigned permissions.
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Assign New Permission */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Assign New Permission
          </Typography>

          <Box display="flex" gap={2}>
            <Select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              displayEmpty
              sx={{ minWidth: 260 }}
            >
              <MenuItem value="">
                <em>Select a permission</em>
              </MenuItem>

              {allPermissions.map((permission) => (
                <MenuItem key={permission.code} value={permission.code}>
                  {permission.name}
                </MenuItem>
              ))}
            </Select>

            <Button variant="contained" onClick={handleAssign}>
              Assign Permission
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}