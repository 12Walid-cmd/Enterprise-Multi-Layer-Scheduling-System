import {
  Box,
  Drawer,
  Typography,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import type { ConflictCheckedDay } from '../../../types/schedule';

interface Props {
  open: boolean;
  onClose: () => void;
  day: ConflictCheckedDay | null;
}

export default function DayDetailDrawer({ open, onClose, day }: Props) {
  const dateLabel = day ? day.date.toString().slice(0, 10) : '';

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 380,
          p: 3,
          bgcolor: '#0D0F12',
          height: '100%',
          color: '#E3E6EB',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {!day ? (
          <Typography>无数据</Typography>
        ) : (
          <>
            {/* Header */}
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {dateLabel}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                当日排班详情
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#333' }} />

            {/* Assignees */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                当日值班人员
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} mb={1}>
                {day.assignees.length > 0 ? (
                  day.assignees.map((u) => (
                    <Chip
                      key={u}
                      label={u}
                      color="primary"
                      variant="filled"
                      sx={{ borderRadius: 999 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">无值班人员</Typography>
                )}
              </Stack>
            </Box>

            {/* Unavailable */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                请假 / 不可用
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} mb={1}>
                {day.unavailable.length > 0 ? (
                  day.unavailable.map((u) => (
                    <Chip
                      key={u}
                      label={u}
                      color="warning"
                      variant="outlined"
                      sx={{ borderRadius: 999 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">无不可用人员</Typography>
                )}
              </Stack>
            </Box>

            {/* Conflicts */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                冲突（Conflicts）
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} mb={1}>
                {day.conflicts.length > 0 ? (
                  day.conflicts.map((c, i) => (
                    <Chip
                      key={i}
                      label={c}
                      color="error"
                      variant="filled"
                      sx={{ borderRadius: 999 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">无冲突</Typography>
                )}
              </Stack>
            </Box>

            {/* Rule Violations */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                规则违规（Rule Violations）
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {day.ruleViolations.length > 0 ? (
                  day.ruleViolations.map((v, i) => (
                    <Chip
                      key={i}
                      label={v}
                      color="error"
                      variant="outlined"
                      sx={{ borderRadius: 999 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">无规则违规</Typography>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}