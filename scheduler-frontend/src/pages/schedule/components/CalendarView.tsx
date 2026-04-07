import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { CalendarEvent } from '../../../types/schedule';

interface Props {
  events: CalendarEvent[];
  holidays?: { name: string; date: string }[];
  onDayClick?: (date: string) => void;
}

const tierColors: Record<number, string> = {
  1: '#4FC3F7', // Light Blue
  2: '#7C4DFF', // Purple
  3: '#FFB300', // Amber
  4: '#E57373', // Soft Red
  5: '#81C784', // Green
  6: '#BA68C8', // Lavender
  7: '#FFD54F', // Soft Yellow
  8: '#4DB6AC', // Teal
  9: '#9575CD', // Deep Purple
  10: '#F06292', // Pink
};

const EventCard = styled('div')(({ theme }) => ({
  padding: '4px 6px',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
}));

export default function CalendarView({ events, holidays = [], onDayClick }: Props) {
  const mappedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    extendedProps: {
      tier: e.tier,
      tierName: e.tierName,
      conflicts: e.conflictFlags,
      overrides: e.overrideFlags,
      assignees: e.assignees,
    },
  }));



  const holidayEvents = (holidays ?? []).map(h => ({
    id: `holiday-${h.date}`,
    title: h.name,
    start: h.date,
    allDay: true,
    display: "background",
    backgroundColor: "#ffcccc",
    extendedProps: { isHoliday: true },
  }));

  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        '.fc': {
          color: theme.palette.text.primary,
        },
        '.fc-daygrid-day': {
          background:
            theme.palette.mode === 'dark'
              ? '#0D0F12'
              : theme.palette.background.default,
          borderColor:
            theme.palette.mode === 'dark' ? '#222' : theme.palette.divider,
        },

        '.fc-bg-event': {
          backgroundColor: '#ffcccc !important',
          opacity: 0.6,
        },

        '.fc-toolbar-title': {
          fontSize: '1.4rem',
          fontWeight: 600,
        },
      })}
    >
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        events={[...mappedEvents, ...holidayEvents]}
        dateClick={(info) => onDayClick?.(info.dateStr)}
        eventContent={(arg) => {
          if (arg.event.extendedProps.isHoliday) {
            return (
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "#b71c1c" }}
              >
                {arg.event.title}
              </Typography>
            );
          }
          const raw = arg.event.extendedProps.assignees;
          const assignees = Array.isArray(raw) ? raw : [];

          const tier = arg.event.extendedProps.tier;
          const tierName = arg.event.extendedProps.tierName;
          const conflicts = arg.event.extendedProps.conflicts ?? [];
          const overrides = arg.event.extendedProps.overrides ?? [];

          return (
            <Tooltip
              title={
                <Box p={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {arg.event.title}-{tierName}
                  </Typography>

                  <Typography variant="body2">
                    Tier Level: {tier}
                  </Typography>

                  <Typography variant="body2">
                    Assignees: {assignees.join(', ')}
                  </Typography>

                  {conflicts.length > 0 && (
                    <Typography variant="body2" color="error">
                      Conflicts: {conflicts.join(', ')}
                    </Typography>
                  )}

                  {overrides.length > 0 && (
                    <Typography variant="body2" color="warning.main">
                      Overrides: {overrides.join(', ')}
                    </Typography>
                  )}
                </Box>
              }
              arrow
              placement="top"
            >
              <EventCard>
                <Chip
                  size="small"
                  label={`Tier ${tier}-${tierName}`}
                  sx={{
                    bgcolor: tierColors[tier] ?? '#555',
                    color: '#000',
                    fontWeight: 600,
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{ color: 'text.primary', fontWeight: 500 }}
                >
                  {assignees.join(', ')}
                </Typography>

                {conflicts.length > 0 && (
                  <Chip
                    size="small"
                    label="Conflict"
                    color="error"
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                )}

                {overrides.length > 0 && (
                  <Chip
                    size="small"
                    label="Override"
                    color="warning"
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                )}
              </EventCard>
            </Tooltip>
          );
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth',
        }}
      />
    </Box>
  );
}