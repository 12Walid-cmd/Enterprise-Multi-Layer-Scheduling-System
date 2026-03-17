import { Box, Typography, Paper, Stack, Tooltip } from '@mui/material';
import type { TimelineItem } from '../../../types/schedule';

interface Props {
  items: TimelineItem[];
  onItemClick?: (item: TimelineItem) => void;
}

export default function TimelineView({ items, onItemClick }: Props) {
  const grouped = groupByUser(items);

  const allDates = items.flatMap((i) => [new Date(i.start), new Date(i.end)]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalDays = diffDays(minDate, maxDate);

  return (
    <Box sx={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      <Stack spacing={2}>
        {Object.entries(grouped).map(([userId, userItems]) => (
          <Paper
            key={userId}
            sx={{
              p: 1.5,
              bgcolor: '#111',
              border: '1px solid #333',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" mb={1}>
              {userId}
            </Typography>

            <Box sx={{ position: 'relative', height: 32, bgcolor: '#222', borderRadius: 1 }}>
              {userItems.map((item, idx) => {
                const start = new Date(item.start);
                const end = new Date(item.end);

                const startOffset = diffDays(minDate, start);
                const duration = diffDays(start, end) + 1;

                const leftPercent = (startOffset / totalDays) * 100;
                const widthPercent = (duration / totalDays) * 100;

                const hasConflict = item.conflictFlags.length > 0;
                const hasViolation = item.ruleViolations.length > 0;

                return (
                  <Tooltip
                    key={idx}
                    title={
                      <Box>
                        <Typography variant="body2">
                          {start.toISOString().slice(0, 10)} → {end.toISOString().slice(0, 10)}
                        </Typography>
                        {hasConflict && (
                          <Typography color="error">冲突: {item.conflictFlags.join(', ')}</Typography>
                        )}
                        {hasViolation && (
                          <Typography color="warning.main">
                            违规: {item.ruleViolations.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  >
                    <Box
                      onClick={() => onItemClick?.(item)}
                      sx={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        height: '100%',
                        bgcolor: hasConflict ? '#ff5252' : '#1976d2',
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: hasViolation ? '2px dashed yellow' : 'none',
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

function groupByUser(items: TimelineItem[]) {
  const map: Record<string, TimelineItem[]> = {};
  for (const item of items) {
    if (!map[item.userId]) map[item.userId] = [];
    map[item.userId].push(item);
  }
  return map;
}

function diffDays(a: Date, b: Date) {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}