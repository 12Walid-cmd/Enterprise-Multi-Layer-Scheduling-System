import { useEffect, useState, useCallback } from "react";
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
import GroupIcon from "@mui/icons-material/Group";

import { TeamsAPI } from "../../../api";
import { http } from "../../../api/http";

import MemberDialog from "./MemberDialog";
import TeamFormDialog from "./TeamFormDialog";

/* ================= TYPES ================= */

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Group {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  timezone?: string;

  groups?: {
    id: string;
    name: string;
  };

  lead?: {
    id: string;
    first_name: string;
    last_name: string;
  };

  _count?: {
    team_members: number;
    other_teams?: number;
  };

  parent_team_id?: string | null;
}

/* ================= COMPONENT ================= */

export default function TeamsList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);

  const [memberOpen, setMemberOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  /* ================= LOAD ================= */

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await TeamsAPI.getAll(search);
      setTeams(data.filter((t) => t.parent_team_id === null));
    } catch (e: any) {
      setError(e.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadMeta = useCallback(async () => {
    try {
      const [groupsRes, usersRes] = await Promise.all([
        http.get("/groups"),
        http.get("/users"),
      ]);
      setGroups(groupsRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      console.error("Failed to load meta", e);
    }
  }, []);

  useEffect(() => {
    load();
    loadMeta();
  }, [load, loadMeta]);

  /* ================= SEARCH DEBOUNCE ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= ACTIONS ================= */

  const openCreate = () => {
    setEditTeam(null);
    setOpenDialog(true);
  };

  const openEdit = (team: Team) => {
    setEditTeam(team);
    setOpenDialog(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editTeam) {
        await TeamsAPI.update(editTeam.id, data);
      } else {
        await TeamsAPI.create(data);
      }
      setOpenDialog(false);
      await load();
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return;

    try {
      await TeamsAPI.delete(id);
      await load();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const openMembers = (team: Team) => {
    setSelectedTeam(team);
    setMemberOpen(true);
  };

  const truncate = (text?: string, max = 30) =>
    text && text.length > max ? text.slice(0, max) + "..." : text;

  /* ================= UI ================= */

  return (
    <Box p={3}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Teams
        </Typography>

        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            sx={{ width: 260 }}
          />

          <Button variant="outlined" onClick={load}>
            Search
          </Button>

          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
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

      {/* ERROR */}
      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Group</b></TableCell>
                <TableCell><b>Team Lead</b></TableCell>
                <TableCell><b>Timezone</b></TableCell>
                <TableCell><b>Sub Teams</b></TableCell>
                <TableCell><b>Members</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {teams.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.name}</TableCell>

                  <TableCell>
                    <Tooltip title={t.description || ""}>
                      <span>{truncate(t.description || "-")}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell>{t.groups?.name || "-"}</TableCell>

                  <TableCell>
                    {t.lead
                      ? `${t.lead.first_name} ${t.lead.last_name}`
                      : "-"}
                  </TableCell>

                  <TableCell>{t.timezone || "UTC"}</TableCell>

                  <TableCell>{t._count?.other_teams ?? 0}</TableCell>

                  <TableCell>{t._count?.team_members ?? 0}</TableCell>

                  <TableCell align="right">
                    <Tooltip title="Manage Members">
                      <IconButton color="primary" onClick={() => openMembers(t)}>
                        <GroupIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton color="secondary" onClick={() => openEdit(t)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(t.id)}>
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
      <TeamFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSave}
        initialData={editTeam}
        groups={groups}
        users={users}
      />

      <MemberDialog
        open={memberOpen}
        onClose={() => { setMemberOpen(false); load(); }}
        teamId={selectedTeam?.id || null}
        teamName={selectedTeam?.name}
      />
    </Box>
  );
}