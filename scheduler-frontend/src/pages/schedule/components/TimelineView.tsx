import {
  Box,
  Paper,
  Typography,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { TimelineItem } from '../../../types/schedule';

interface Props {
  items: TimelineItem[];
  onItemClick?: (item: TimelineItem) => void;
}

const tierColors: Record<number, string> = {
  1: '#4FC3F7',
  2: '#7C4DFF',
  3: '#FFB300',
};

const Bar = styled('div')({
  position: 'absolute',
  height: '100%',
  borderRadius: 6,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    filter: 'brightness(1.15)',
    transform: 'scale(1.02)',
  },
});

export default function TimelineView({ items, onItemClick }: Props) {
  const theme = useTheme();

  const grouped = groupByUser(items);

  const allDates = items.flatMap((i) => [
    new Date(i.start),
    new Date(i.end),
  ]);

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalDays = diffDays(minDate, maxDate);

  const today = stripTime(new Date());
  const todayOffset = diffDays(minDate, today);

  return (
    <Box sx={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="subtitle1" color="text.secondary">
            Date Range: {formatDate(minDate)} – {formatDate(maxDate)}
          </Typography>
        </Box>

        {Object.entries(grouped).map(([userId, userItems]) => (
          <Paper
            key={userId}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="subtitle1" mb={1} fontWeight={600}>
              {userItems[0].userName}
            </Typography>

            <Box
              sx={{
                position: 'relative',
                height: 36,
                bgcolor: theme.palette.action.hover,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Today marker */}
              {todayOffset >= 0 && todayOffset <= totalDays && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${(todayOffset / totalDays) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    bgcolor: theme.palette.error.main,
                    opacity: 0.8,
                  }}
                />
              )}

              {/* Bars */}
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
                    arrow
                    placement="top"
                    title={
                      <Box p={1}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {formatDate(start)} – {formatDate(end)}
                        </Typography>

                        <Typography variant="body2">
                          Tier Level: {item.tier}
                        </Typography>

                        {hasConflict && (
                          <Typography variant="body2" color="error">
                            Conflicts: {item.conflictFlags.join(', ')}
                          </Typography>
                        )}

                        {hasViolation && (
                          <Typography variant="body2" color="warning.main">
                            Rule Violations: {item.ruleViolations.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  >
                    <Bar
                      onClick={() => onItemClick?.(item)}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: tierColors[item.tier] ?? '#555',
                        border: hasViolation
                          ? `2px dashed ${theme.palette.warning.main}`
                          : 'none',
                        boxShadow: hasConflict
                          ? `0 0 8px ${theme.palette.error.main}`
                          : `0 0 4px ${theme.palette.action.disabled}`,
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

/* ----------------- utils ----------------- */

function groupByUser(items: TimelineItem[]) {
  const map: Record<string, TimelineItem[]> = {};
  for (const item of items) {
    if (!map[item.userId]) map[item.userId] = [];
    map[item.userId].push(item);
  }
  return map;
}

function diffDays(a: Date, b: Date) {
  const ms = Math.abs(stripTime(a).getTime() - stripTime(b).getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}