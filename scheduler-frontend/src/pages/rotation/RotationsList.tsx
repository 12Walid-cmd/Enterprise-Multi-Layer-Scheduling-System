import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import type { RotationDefinition } from "../../types/rotation";
import {
  RotationAPI,
  TeamsAPI,
  DomainAPI,
  DomainTeamsAPI,
  SubTeamsAPI,
} from "../../api";

export default function RotationsList() {
  const navigate = useNavigate();

  const [data, setData] = useState<(RotationDefinition & { scope_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 
  const resolveScopeName = async (r: RotationDefinition): Promise<string> => {
    if (!r.scope_ref_id) return "None";

    switch (r.scope_type) {
      case "TEAM": {
        const team = await TeamsAPI.getOne(r.scope_ref_id);
        return team.name;
      }

      case "SUBTEAM": {
        const subteam = await SubTeamsAPI.getOne(r.scope_ref_id);
        return subteam.name;
      }

      case "GROUP": {
        const allTeams = await TeamsAPI.getAll();
        const groupTeam = allTeams.find(t => t.group_id === r.scope_ref_id);
        return groupTeam?.name ?? "Unknown Group";
      }

      case "DOMAIN": {
        const domain = await DomainAPI.getOne(r.scope_ref_id);
        return domain.name;
      }

      case "DOMAIN_TEAM": {
        const dt = await DomainTeamsAPI.getOne(r.scope_ref_id);
        return dt.teams?.name ?? "Unknown Domain Team";
      }

      case "NONE":
      default:
        return "None";
    }
  };

  const fetchRotations = async () => {
    try {
      setLoading(true);
      const res = await RotationAPI.getAll();

      
      const withNames = await Promise.all(
        res.map(async (r) => ({
          ...r,
          scope_name: await resolveScopeName(r),
        }))
      );

      setData(withNames);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load rotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRotations();
  }, []);

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Rotation Definitions
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/rotations/create")}
        >
          Create Rotation
        </Button>
      </Box>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Typography color="error" textAlign="center" mt={3}>
          {error}
        </Typography>
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <Typography textAlign="center" mt={3}>
          No rotations found.
        </Typography>
      )}

      {/* Table */}
      {!loading && !error && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Cadence</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/rotations/${r.id}`)}
                >
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.code}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>
                    {r.cadence}
                    {r.cadence === "CUSTOM" ? ` (${r.cadence_interval} days)` : ""}
                  </TableCell>

                  
                  <TableCell>
                    {r.scope_type}
                    {r.scope_name ? ` (${r.scope_name})` : ""}
                  </TableCell>

                  <TableCell>{r.is_active ? "Active" : "Inactive"}</TableCell>

                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/rotations/${r.id}`);
                      }}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      )}
    </Box>
  );
}