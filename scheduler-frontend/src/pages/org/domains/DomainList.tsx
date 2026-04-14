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
  Typography,
  TextField,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";

import { DomainAPI } from "../../../api";
import { http } from "../../../api/http";

import type { Domain } from "../../../types/domain";
import DomainFormDialog from "./DomainFormDialog";
import DomainMemberDialog from "./DomainMemberDialog";


/* ================= TYPES ================= */

interface User {
  id: string;
  first_name: string;
  last_name: string;
}



/* ================= COMPONENT ================= */

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Domain | null>(null);

  const [memberOpen, setMemberOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  /* ================= LOAD ================= */

  const load = async () => {
    setLoading(true);
    try {
      const data = await DomainAPI.getAll(search);
      setDomains(data);
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

  /* ================= ACTIONS ================= */
  const openMembers = (d: Domain) => {
    setSelectedDomain(d);
    setMemberOpen(true);
  };

  const openCreate = () => {
    setEdit(null);
    setOpen(true);
  };

  const openEdit = (d: Domain) => {
    setEdit(d);
    setOpen(true);
  };

  const handleSubmit = async (payload: any) => {
    if (edit) {
      await DomainAPI.update(edit.id, payload);
    } else {
      await DomainAPI.create(payload);
    }

    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this domain?")) return;
    await DomainAPI.delete(id);
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
          Domains
        </Typography>

        <Box display="flex" alignItems="center" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search Domains..."
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
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Owner</b></TableCell>
                <TableCell><b>Exclusive</b></TableCell>
                <TableCell><b>Teams</b></TableCell>
                <TableCell><b>Users</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {domains.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>
                    {d.type === "CAPABILITY" ? (
                      <span style={{ color: "#1976d2", fontWeight: 600 }}>Capability Domain</span>
                    ) : (
                      <span style={{ color: "#9c27b0", fontWeight: 600 }}>Rotation Pool</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Tooltip title={d.description || ""}>
                      <span>{truncate(d.description) || "-"}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    {d.owner
                      ? `${d.owner.first_name} ${d.owner.last_name}`
                      : "-"}
                  </TableCell>

                  <TableCell>
                    {d.exclusive ? "Yes" : "No"}
                  </TableCell>

                  <TableCell>{d._count?.domain_teams ?? 0}</TableCell>

                  <TableCell>{d._count?.domainUsers ?? 0}</TableCell>

                  <TableCell align="right">
                    <Tooltip title="Manage Members">
                      <IconButton color="primary" onClick={() => openMembers(d)}>
                        <GroupIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton color="secondary" onClick={() => openEdit(d)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(d.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
      }

      {/* DIALOG */}
      <DomainFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialData={edit}
        users={users}
      />

      <DomainMemberDialog
        open={memberOpen}
        onClose={() => { setMemberOpen(false); load(); }}
        domainId={selectedDomain?.id || null}
        domainName={selectedDomain?.name}
      />
    </Box >
  );
}