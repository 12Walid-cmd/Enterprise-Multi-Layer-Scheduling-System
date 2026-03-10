import { useEffect, useState } from "react";
import { TeamRoleTypesAPI } from "../../../../api";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { TeamRoleType } from "../../../../types/org";

export default function TeamRoleTypesList() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [items, setItems] = useState<TeamRoleType[]>([]);

  const load = () => {
    TeamRoleTypesAPI.getAll().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Team Role Types
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/roles/team-types/create")}
        sx={{ mb: 3 }}
      >
        Create Team Role Type
      </Button>

      {items.length === 0 && <Typography>No team roles found.</Typography>}

      {items.map((r: any) => (
        <Paper
          key={r.id}
          sx={{ p: 2, mb: 2, cursor: "pointer" }}
          onClick={() => navigate(`/roles/team-types/${r.id}`)}
        >
          <Typography><strong>{r.name}</strong></Typography>
          <Typography variant="body2">{r.description}</Typography>
        </Paper>
      ))}
    </Box>
  );
}