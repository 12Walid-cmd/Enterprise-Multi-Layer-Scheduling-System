import { useEffect, useState } from "react";
import { TeamRoleTypesAPI } from "../../../../api";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function TeamRoleTypeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    TeamRoleTypesAPI.getOne(id!).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (!item)
    return (
      <Typography color="error" mt={10} textAlign="center">
        Not found.
      </Typography>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        {item.name}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography><strong>Code:</strong> {item.code}</Typography>
        <Typography><strong>Description:</strong> {item.description}</Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={() => navigate(`/roles/team-types/${id}/edit`)}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              await TeamRoleTypesAPI.delete(id!);
              navigate("/roles/team-types");
            }}
          >
            Delete
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}