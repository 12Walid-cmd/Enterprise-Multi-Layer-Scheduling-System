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
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 360,
          p: 3,
          bgcolor: '#111',
          height: '100%',
          color: '#fff',
        }}
      >
        {!day ? (
          <Typography>无数据</Typography>
        ) : (
          <>
            <Typography variant="h5" fontWeight={600}>
              {day.date.toString().slice(0, 10)}
            </Typography>

            <Divider sx={{ my: 2, borderColor: '#444' }} />

            {/* Assignees */}
            <Typography variant="subtitle1" gutterBottom>
              当日值班人员
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
              {day.assignees.length > 0 ? (
                day.assignees.map((u) => (
                  <Chip key={u} label={u} color="primary" />
                ))
              ) : (
                <Typography color="gray">无人员</Typography>
              )}
            </Stack>

            {/* Unavailable */}
            <Typography variant="subtitle1" gutterBottom>
              请假 / 不可用
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
              {day.unavailable.length > 0 ? (
                day.unavailable.map((u) => (
                  <Chip key={u} label={u} color="warning" />
                ))
              ) : (
                <Typography color="gray">无</Typography>
              )}
            </Stack>

            {/* Conflicts */}
            <Typography variant="subtitle1" gutterBottom>
              冲突（conflicts）
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
              {day.conflicts.length > 0 ? (
                day.conflicts.map((c, i) => (
                  <Chip key={i} label={c} color="error" />
                ))
              ) : (
                <Typography color="gray">无</Typography>
              )}
            </Stack>

            {/* Rule Violations */}
            <Typography variant="subtitle1" gutterBottom>
              规则违规（ruleViolations）
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {day.ruleViolations.length > 0 ? (
                day.ruleViolations.map((v, i) => (
                  <Chip key={i} label={v} color="error" variant="outlined" />
                ))
              ) : (
                <Typography color="gray">无</Typography>
              )}
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
}