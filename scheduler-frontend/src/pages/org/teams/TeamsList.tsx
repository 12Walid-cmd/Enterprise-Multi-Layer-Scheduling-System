import { useEffect, useState } from "react";
import { TeamsAPI } from "../../../api";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TeamsList() {
  const [teams, setTeams] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    TeamsAPI.getAll().then((data) => {
      setTeams(
        data.filter((t: any) => t.is_active && t.parent_team_id === null)
      );
    });
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Teams</Typography>
        <Button variant="contained" onClick={() => navigate("/teams/create")}>
          Create Team
        </Button>
      </Box>

      {teams.map((team) => (
        <Paper
          key={team.id}
          sx={{ p: 2, mb: 2, cursor: "pointer" }}
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          <Typography variant="h6">{team.name}</Typography>
          <Typography variant="body2">{team.description}</Typography>
        </Paper>
      ))}
    </Box>
  );
}