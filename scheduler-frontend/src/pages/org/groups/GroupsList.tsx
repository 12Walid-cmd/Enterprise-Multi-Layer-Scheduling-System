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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { GroupsAPI } from "../../../api";
import { http } from "../../../api/http";

/* ================= TYPES ================= */
interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  timezone?: string;

  _count?: {
    teams: number;
  };

  owner?: User;
}

/* ================= TIMEZONE ================= */
const TIMEZONES = [
  "UTC",
  "America/Halifax",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Asia/Shanghai",
];

export default function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "UTC",
    owner_user_id: "",
  });

  /* ================= LOAD ================= */
  const load = async () => {
    setLoading(true);
    try {
      const data = await GroupsAPI.getAll(search);
      setGroups(data);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const res = await http.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  /* ================= SEARCH DEBOUNCE ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= CRUD ================= */
  const openCreate = () => {
    setEditGroup(null);
    setForm({
      name: "",
      description: "",
      timezone: "UTC",
      owner_user_id: "",
    });
    setOpenDialog(true);
  };

  const openEdit = (g: Group) => {
    setEditGroup(g);
    setForm({
      name: g.name,
      description: g.description || "",
      timezone: g.timezone || "UTC",
      owner_user_id: g.owner?.id || "",
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editGroup) {
      await GroupsAPI.update(editGroup.id, form);
    } else {
      await GroupsAPI.create(form);
    }

    setOpenDialog(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this group?")) return;
    await GroupsAPI.delete(id);
    load();
  };

  const truncate = (text?: string, max = 30) =>
    text && text.length > max ? text.slice(0, max) + "..." : text;

  /* ================= UI ================= */
  return (
    <Box p={3}>
      {/* ===== HEADER ===== */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          Groups
        </Typography>

        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search groups..."
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

      {/* ===== LOADING ===== */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      )}

      {/* ===== TABLE ===== */}
      {!loading && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Timezone</b></TableCell>
                <TableCell><b>Owner</b></TableCell>
                <TableCell><b>Teams</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No groups
                  </TableCell>
                </TableRow>
              )}

              {groups.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell>{g.name}</TableCell>

                  <TableCell>
                    <Tooltip title={g.description || ""}>
                      <span>{truncate(g.description || "-")}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell>{g.timezone || "UTC"}</TableCell>

                  <TableCell>
                    {g.owner
                      ? `${g.owner.first_name} ${g.owner.last_name}`
                      : "-"}
                  </TableCell>

                  <TableCell>{g._count?.teams ?? 0}</TableCell>

                  <TableCell align="right">
                    {/* <Tooltip title="Manage Members">
                      <IconButton color="primary" onClick={() => openMembers(d)}>
                        <GroupIcon />
                      </IconButton>
                    </Tooltip> */}
                    <Tooltip title="Edit">
                      <IconButton color="secondary" onClick={() => openEdit(g)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(g.id)}>
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

      {/* ===== DIALOG ===== */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editGroup ? "Edit Group" : "Create Group"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            {/* TIMEZONE */}
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={form.timezone}
                label="Timezone"
                onChange={(e) =>
                  setForm({ ...form, timezone: e.target.value })
                }
              >
                {TIMEZONES.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* OWNER */}
            <FormControl fullWidth>
              <InputLabel>Group Owner</InputLabel>
              <Select
                value={form.owner_user_id}
                label="Group Owner"
                onChange={(e) =>
                  setForm({ ...form, owner_user_id: e.target.value })
                }
              >

                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.first_name} {u.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSave}>
            {editGroup ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}