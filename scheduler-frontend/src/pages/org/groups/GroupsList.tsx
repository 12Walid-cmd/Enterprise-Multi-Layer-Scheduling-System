import { useEffect, useState } from "react";
import type { Group } from "../../../types/org";
import { GroupsAPI } from "../../../api";
import { useNavigate } from "react-router-dom";



import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";

export default function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    GroupsAPI.getAll()
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load groups.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Groups
        </Typography>

        <Button variant="contained" size="large"
        onClick={() => navigate("/groups/create")}>
          Create Group
        </Button>
      </Box>

      {/* Groups Grid */}
      <Grid
        container
        columns={12}
        spacing={3}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        {groups.map((group) => (
          <Grid key={group.id}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {group.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={1}>
                  {group.description}
                </Typography>

                <Typography variant="body2" mt={2}>
                  Timezone: {group.timezone}
                </Typography>

                <Typography variant="body2">
                  Teams: {group.teams?.length ?? 0}
                </Typography>

                <Button variant="outlined" size="small" sx={{ mt: 2 }}
                onClick={() => navigate(`/groups/${group.id}`)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}