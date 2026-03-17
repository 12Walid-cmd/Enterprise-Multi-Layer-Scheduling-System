import {
  Box,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

import type {
  DailyProjection,
  WeeklyProjection,
  MonthlyProjection,
} from '../../../types/schedule';

interface Props {
  daily: DailyProjection[];
  weekly: WeeklyProjection[];
  monthly: MonthlyProjection[];
}

export default function DashboardView({ daily, weekly, monthly }: Props) {
  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* Daily */}
      <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #333' }}>
        <Typography variant="h6" mb={2}>
          每日覆盖率趋势（Daily）
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={daily}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{ background: '#222', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="totalAssignees"
                stroke="#4fc3f7"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Weekly */}
      <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #333' }}>
        <Typography variant="h6" mb={2}>
          每周冲突数量（Weekly）
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={weekly}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="weekStart" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{ background: '#222', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="conflicts" fill="#ff5252" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Monthly */}
      <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #333' }}>
        <Typography variant="h6" mb={2}>
          每月违规趋势（Monthly）
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="violationsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffeb3b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ffeb3b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{ background: '#222', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="violations"
                stroke="#ffeb3b"
                fillOpacity={1}
                fill="url(#violationsColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Stack>
  );
}