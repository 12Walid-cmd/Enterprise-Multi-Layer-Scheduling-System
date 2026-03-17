import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box } from '@mui/material';
import type { CalendarEvent } from '../../../types/schedule';

interface Props {
  events: CalendarEvent[];
  onDayClick?: (date: string) => void;
}

export default function CalendarView({ events, onDayClick }: Props) {
  const mappedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    backgroundColor: e.conflictFlags.length > 0 ? '#ff5252' : '#1976d2',
    borderColor: e.conflictFlags.length > 0 ? '#ff1744' : '#1565c0',
    textColor: '#fff',
  }));

  return (
    <Box sx={{ flex: 1, '.fc': { color: '#fff' } }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        events={mappedEvents}
        dateClick={(info) => onDayClick?.(info.dateStr)}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
    </Box>
  );
}