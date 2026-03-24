import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Divider,
  Tabs,
  Tab,
  Button,
} from '@mui/material';

import { getSchedule, RotationAPI } from '../../api';
import type { ScheduleResponse, ConflictCheckedDay, TimelineItem } from '../../types/schedule';

import CalendarView from './components/CalendarView';
import TimelineView from './components/TimelineView';
import DayDetailDrawer from './components/DayDetailDrawer';
import DashboardView from './components/DashboardView';

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ConflictCheckedDay | null>(null);

  const [tab, setTab] = useState(0);
  const loadSchedule = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getSchedule(id);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadSchedule();
    setLoading(true);
    getSchedule(id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDayClick = (dateStr: string) => {
    if (!data) return;

    const found = data.days.find(
      (d) => d.date.toString().slice(0, 10) === dateStr
    );

    setSelectedDay(found ?? null);
    setDrawerOpen(true);
  };

  const handleTimelineClick = (item: TimelineItem) => {
    if (!data) return;

    const found = data.days.find(
      (d) =>
        d.date.toString().slice(0, 10) === item.start.slice(0, 10)
    );

    setSelectedDay(found ?? null);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography>Failed to load schedule.</Typography>;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Rotation Schedule – {data.name}
        </Typography>

        <Button
          variant="contained"
          onClick={async () => {
            if (!id) return;
            await RotationAPI.generateSchedule(id);
            await loadSchedule();
          }}
        >
          Regenerate Schedule
        </Button>
      </Box>

      <Divider />


      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Calendar View" />
        <Tab label="Timeline View" />
        <Tab label="Dashboard" />
      </Tabs>

      {tab === 0 && (
        <Paper
          elevation={2}
          sx={{ p: 2, height: '75vh', display: 'flex', flexDirection: 'column' }}
        >
          <Typography variant="h6" mb={1}>
            Calendar View
          </Typography>

          <CalendarView
            events={data.calendar}
            onDayClick={handleDayClick}
          />
        </Paper>
      )}

      {tab === 1 && (
        <Paper
          elevation={2}
          sx={{ p: 2, height: '75vh', display: 'flex', flexDirection: 'column' }}
        >
          <Typography variant="h6" mb={1}>
            Timeline View
          </Typography>

          <TimelineView
            items={data.timeline}
            onItemClick={handleTimelineClick}
          />
        </Paper>
      )}

      {tab === 2 && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Dashboard
          </Typography>

          <DashboardView
            daily={data.daily}
            weekly={data.weekly}
            monthly={data.monthly}
          />
        </Paper>
      )}

      <DayDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        day={selectedDay}
      />
    </Box>
  );
}