import { useEffect, useState } from "react";
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
import SecurityIcon from "@mui/icons-material/Security";

import { RolesAPI } from "../../../api";
import type { Role } from "../../../types/org";

import RoleDialog from "./RoleDialog";
import RolePermissionsDialog from "./RolePermissionsDialog";

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);

  const [openPermDialog, setOpenPermDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  /* ================= LOAD ================= */
  const load = async () => {
    setLoading(true);
    try {
      const data = await RolesAPI.getAll();

      // 前端过滤（因为你后端暂时没 search）
      const filtered = data.filter(r =>
        [r.name, r.description]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      setRoles(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= ACTIONS ================= */
  const openCreate = () => {
    setEditRole(null);
    setOpenDialog(true);
  };

  const openEdit = (role: Role) => {
    setEditRole(role);
    setOpenDialog(true);
  };

  const openPermissions = (role: Role) => {
    setSelectedRole(role);
    setOpenPermDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    await RolesAPI.delete(id);
    load();
  };

  /* ================= UI ================= */
  return (
    <Box p={3}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Roles
        </Typography>

        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            sx={{ width: 260 }}
          />

          <Button variant="outlined" onClick={load}>
            Search
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
          >
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

      {/* TABLE */}
      {!loading && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Permissions</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No roles
                  </TableCell>
                </TableRow>
              )}

              {roles.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.name}</TableCell>

                  <TableCell>
                    <Tooltip title={r.description || ""}>
                      <span>{r.description || "-"}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    {r.permissions?.length || 0}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Manage Permissions">
                      <IconButton
                        color="primary"
                        onClick={() => openPermissions(r)}
                      >
                        <SecurityIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        color="secondary"
                        onClick={() => openEdit(r)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(r.id)}
                      >
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

      {/* DIALOGS */}
      <RoleDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        role={editRole}
        onSaved={load}
      />

      <RolePermissionsDialog
        open={openPermDialog}
        onClose={() => {setOpenPermDialog(false); load(); }}
        role={selectedRole}
      />
    </Box>
  );
}