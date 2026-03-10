import { useEffect, useState } from "react";
import { GlobalRoleTypesAPI } from "../../../../api";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { GlobalRoleType } from "../../../../types/org";

export default function GlobalRoleTypesList() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GlobalRoleType[]>([]);
  const navigate = useNavigate();

  const load = () => {
    GlobalRoleTypesAPI.getAll().then((data) => {
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
        Global Role Types
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/roles/global-types/create")}
        sx={{ mb: 3 }}
      >
        Create Global Role Type
      </Button>

      {items.length === 0 && <Typography>No global roles found.</Typography>}

      {items.map((r: any) => (
        <Paper
          key={r.id}
          sx={{ p: 2, mb: 2, cursor: "pointer" }}
          onClick={() => navigate(`/roles/global-types/${r.id}`)}
        >
          <Typography><strong>{r.name}</strong></Typography>
          <Typography variant="body2">{r.description}</Typography>
        </Paper>
      ))}
    </Box>
  );
}