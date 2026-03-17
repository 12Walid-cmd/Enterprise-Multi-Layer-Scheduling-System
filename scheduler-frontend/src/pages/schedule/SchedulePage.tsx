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
} from '@mui/material';

import { getRotationSchedule } from '../../api/rotation/rotations.api';
import type { ScheduleResponse, ConflictCheckedDay, TimelineItem } from '../../types/schedule';



import CalendarView from './components/CalendarView';
import TimelineView from './components/TimelineView';
import DayDetailDrawer from './components/DayDetailDrawer';
import DashboardView from './components/DashboardView';

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ConflictCheckedDay | null>(null);

  // Tab state
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getRotationSchedule(id)
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
    return <Typography>加载失败</Typography>;
  }

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h4" fontWeight={600}>
        排班视图 – Rotation {data.rotationId}
      </Typography>

      <Divider />

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="日历视图" />
        <Tab label="时间轴视图" />
        <Tab label="统计视图" />
      </Tabs>

      {/* Tab Panels */}
      {tab === 0 && (
        <Paper
          elevation={2}
          sx={{ p: 2, height: '75vh', display: 'flex', flexDirection: 'column' }}
        >
          <Typography variant="h6" mb={1}>
            日历视图（Calendar）
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
            时间轴视图（Timeline）
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
            统计视图（Dashboard）
          </Typography>

          <DashboardView
            daily={data.daily}
            weekly={data.weekly}
            monthly={data.monthly}
          />
        </Paper>
      )}

      {/* Drawer */}
      <DayDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        day={selectedDay}
      />
    </Box>
  );
}