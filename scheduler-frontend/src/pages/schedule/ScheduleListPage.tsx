import { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemText } from '@mui/material';
import { RotationAPI } from '../../api';
import type { RotationDefinition } from '../../types/rotation';
import { Link } from 'react-router-dom';

export default function ScheduleListPage() {
  const [rotations, setRotations] = useState<RotationDefinition[]>([]);

  useEffect(() => {
    RotationAPI.getAll().then(setRotations);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Schedule Overview
      </Typography>

      <Paper sx={{ p: 2 }}>
        <List>
          {rotations.map((r) => (
            <ListItemButton
              key={r.id}
              component={Link}
              to={`/schedule/${r.id}`}
            >
              <ListItemText primary={r.name} secondary={`Rotation ID: ${r.id}`} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
}