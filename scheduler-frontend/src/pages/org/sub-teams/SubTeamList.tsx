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

import { SubTeamsAPI, TeamsAPI } from "../../../api";
import { http } from "../../../api/http";
import type { SubTeam } from "../../../types/org";

import SubTeamFormDialog from "./SubTeamFormDialog";
import SubTeamMemberDialog from "./SubTeamMemberDialog";

/* ================= TYPES ================= */

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Team {
  id: string;
  name: string;
  timezone?: string;
}


/* ================= COMPONENT ================= */

export default function SubTeamsPage() {
  const [subTeams, setSubTeams] = useState<SubTeam[]>([]);
  const [parentTeams, setParentTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<SubTeam | null>(null);

  const [memberOpen, setMemberOpen] = useState(false);
  const [selectedSubTeam, setSelectedSubTeam] = useState<SubTeam | null>(null);


  /* ================= LOAD ================= */

  const load = async () => {
    setLoading(true);
    try {
      const data = await SubTeamsAPI.getAll(search);
      setSubTeams(data);
    } finally {
      setLoading(false);
    }
  };

  const loadParentTeams = async () => {
    const res = await TeamsAPI.getAll();
    setParentTeams(res.filter((t: any) => !t.parent_team_id));
  };

  const loadUsers = async () => {
    const res = await http.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    load();
    loadParentTeams();
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

  const openCreate = () => {
    setEdit(null);
    setOpen(true);
  };

  const openEdit = (t: SubTeam) => {
    setEdit(t);
    setOpen(true);
  };

  const handleSave = async (payload: any) => {
    if (edit) {
      await SubTeamsAPI.update(edit.id, payload);
    } else {
      await SubTeamsAPI.create(payload);
    }

    setOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sub-team?")) return;
    await SubTeamsAPI.delete(id);
    await load();
  };

  const openMembers = (t: SubTeam) => {
    setSelectedSubTeam(t);
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
          Sub Teams
        </Typography>

        <Box display="flex" gap={1.5}>
          <TextField
            size="small"
            placeholder="Search Sub-Teams..."
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
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Parent Team</b></TableCell>
                <TableCell><b>Subteam Lead</b></TableCell>
                <TableCell><b>Timezone</b></TableCell>
                <TableCell><b>Members</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {subTeams.map((t) => {
                const parent = parentTeams.find(p => p.id === t.parent_team_id);

                return (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.name}</TableCell>

                    <TableCell>
                      <Tooltip title={t.description || ""}
                        arrow
                        placement="top">
                        <span>{truncate(t.description) || "-"}</span>
                      </Tooltip>
                    </TableCell>

                    <TableCell>{parent?.name || "-"}</TableCell>

                    <TableCell>
                      {t.lead
                        ? `${t.lead.first_name} ${t.lead.last_name}`
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {t.timezone || parent?.timezone || "UTC"}
                    </TableCell>

                    <TableCell>{t._count?.sub_team_members ?? 0}</TableCell>

                    <TableCell align="right">
                      <Tooltip title="Manage Members" arrow>
                        <IconButton color="primary" onClick={() => openMembers(t)}>
                          <GroupIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit" arrow>
                        <IconButton color="secondary" onClick={() => openEdit(t)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton color="error" onClick={() => handleDelete(t.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* DIALOG  */}
      <SubTeamFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSave}
        initialData={edit}
        parentTeams={parentTeams}
        users={users}
      />
      <SubTeamMemberDialog
        open={memberOpen}
        onClose={() => { setMemberOpen(false); load(); }}
        subTeamId={selectedSubTeam?.id || null}
        parentTeamId={selectedSubTeam?.parent_team_id || null}
        subTeamName={selectedSubTeam?.name}
      />

    </Box>
  );
}