import { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemText } from '@mui/material';
import { getRotations } from '../../api/rotation/rotations.api';
import type { Rotation } from '../../types/rotation';
import { Link } from 'react-router-dom';

export default function ScheduleListPage() {
  const [rotations, setRotations] = useState<Rotation[]>([]);

  useEffect(() => {
    getRotations().then(setRotations);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        排班视图
      </Typography>

      <Paper sx={{ p: 2 }}>
        <List>
          {rotations.map((r) => (
            <ListItemButton
              key={r.id}
              component={Link}
              to={`/schedule/${r.id}`}
            >
              <ListItemText primary={r.name} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
}