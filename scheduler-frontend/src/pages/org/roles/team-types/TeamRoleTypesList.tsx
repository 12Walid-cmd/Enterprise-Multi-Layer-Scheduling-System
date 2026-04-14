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
  Alert,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { TeamRoleTypesAPI } from "../../../../api";
import type { TeamRoleType } from "../../../../types/org";

export default function TeamRoleTypesList() {
  const [items, setItems] = useState<TeamRoleType[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<TeamRoleType | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [codeExists, setCodeExists] = useState(false);
  const [checking, setChecking] = useState(false);

  /* ================= LOAD ================= */

  const load = async () => {
    setLoading(true);
    try {
      const data = await TeamRoleTypesAPI.getAll(search);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= SEARCH DEBOUNCE ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= NAME → CODE ================= */

  useEffect(() => {
    if (edit) return;

    const timer = setTimeout(() => {
      const code = form.name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");

      setForm((prev) => ({ ...prev, code }));
    }, 300);

    return () => clearTimeout(timer);
  }, [form.name]);

  /* ================= CODE CHECK ================= */

  useEffect(() => {
    if (!form.code) {
      setCodeExists(false);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      try {
        setChecking(true);

        const res = await TeamRoleTypesAPI.checkCode(
          form.code,
          edit?.id
        );

        if (active) setCodeExists(res.exists);
      } finally {
        if (active) setChecking(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [form.code, edit]);

  /* ================= ACTION ================= */

  const openCreate = () => {
    setEdit(null);
    setForm({ code: "", name: "", description: "" });
    setCodeExists(false);
    setOpen(true);
  };

  const openEdit = (item: TeamRoleType) => {
    setEdit(item);
    setForm({
      code: item.code,
      name: item.name,
      description: item.description ?? "",
    });
    setCodeExists(false);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code || codeExists) return;

    if (edit) {
      await TeamRoleTypesAPI.update(edit.id, form);
    } else {
      await TeamRoleTypesAPI.create(form);
    }

    setOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    await TeamRoleTypesAPI.delete(id);
    await load();
  };

  const truncate = (text?: string, max = 30) =>
    text && text.length > max ? text.slice(0, max) + "..." : text;

  /* ================= UI ================= */

  return (
    <Box p={3}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Team Role
        </Typography>

        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search team roles..."
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
        <Box textAlign="center" mt={5}>
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
                <TableCell><b>Code</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No data
                  </TableCell>
                </TableRow>
              )}

              {items.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.code}</TableCell>

                  <TableCell>
                    <Tooltip title={r.description || ""}>
                      <span>{truncate(r.description || "-")}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="right">
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

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {edit ? "Edit Team Role" : "Create Team Role"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Code"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value })
              }
              fullWidth
              error={codeExists}
              helperText={
                checking
                  ? "Checking..."
                  : codeExists
                    ? "Code already exists"
                    : ""
              }
            />

            {codeExists && (
              <Alert severity="error">
                Code already exists
              </Alert>
            )}

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.name || !form.code || codeExists}
          >
            {edit ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}