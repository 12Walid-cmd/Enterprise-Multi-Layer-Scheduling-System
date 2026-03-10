import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, Button} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubTeam, getSubTeamMembers, type Member } from "../../../api";


export const SubTeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subTeam, setSubTeam] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const load = async () => {
    if (!id) return;
    const st = await getSubTeam(id);
    const m = await getSubTeamMembers(id);
    setSubTeam(st);
    setMembers(m);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!subTeam) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">{subTeam.name}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/teams/sub-teams/${id}/edit`)}
        >
          Edit
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1">Description</Typography>
        <Typography variant="body2" color="text.secondary">
          {subTeam.description || 'No description'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" mb={1}>
          Members
        </Typography>

        {members.map((m: any) => (
          <Typography key={m.user_id}>
            {m.users?.name ?? m.user_id}
          </Typography>
        ))}

        {members.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No members in this sub-team.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};