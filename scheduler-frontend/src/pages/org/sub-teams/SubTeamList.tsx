import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SubTeamsAPI } from "../../../api";
import { useNavigate } from 'react-router-dom';
import type { SubTeam } from "../../../types/org"; 

export default function SubTeamList({ teamId }: { teamId: string }) {
  const [subTeams, setSubTeams] = useState<SubTeam[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    SubTeamsAPI.getAll(teamId).then(setSubTeams);
  }, [teamId]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Sub-teams</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/teams/${teamId}/sub-teams/create`)}
        >
          New Sub-team
        </Button>
      </Stack>

      <Stack spacing={2}>
        {subTeams.map(st => (
          <Card
            key={st.id}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/teams/sub-teams/${st.id}`)}
          >
            <CardHeader title={st.name} />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {st.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}