import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

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

function computeKpis(
  daily: DailyProjection[],
  weekly: WeeklyProjection[],
  monthly: MonthlyProjection[]
) {
  const today = daily[daily.length - 1];

  const totalConflictsThisWeek =
    weekly.length > 0 ? weekly[weekly.length - 1].conflicts : 0;

  const totalViolationsThisMonth =
    monthly.length > 0 ? monthly[monthly.length - 1].violations : 0;

  const coverageRate =
    today && today.capacity > 0
      ? Math.round((today.totalAssignees / today.capacity) * 100)
      : null;

  return {
    todayAssignees: today?.totalAssignees ?? 0,
    conflictsThisWeek: totalConflictsThisWeek,
    violationsThisMonth: totalViolationsThisMonth,
    coverageRate,
  };
}

export default function DashboardView({ daily, weekly, monthly }: Props) {
  const theme = useTheme();
  const kpis = computeKpis(daily, weekly, monthly);

  const cardStyle = {
    p: 2,
    bgcolor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
  };

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* KPI Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={cardStyle}>
            <Typography variant="subtitle2" color="text.secondary">
              On‑call Today
            </Typography>
            <Typography variant="h4" fontWeight={700} mt={1}>
              {kpis.todayAssignees}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Total assignees across all tiers
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={cardStyle}>
            <Typography variant="subtitle2" color="text.secondary">
              Conflicts This Week
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              mt={1}
              color={theme.palette.error.main}
            >
              {kpis.conflictsThisWeek}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Overlaps, rule conflicts, and violations
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={cardStyle}>
            <Typography variant="subtitle2" color="text.secondary">
              Violations This Month
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              mt={1}
              color={theme.palette.warning.main}
            >
              {kpis.violationsThisMonth}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Overtime, insufficient rest, and other violations
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={cardStyle}>
            <Typography variant="subtitle2" color="text.secondary">
              Coverage Rate Today
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              mt={1}
              color={theme.palette.primary.main}
            >
              {kpis.coverageRate != null ? `${kpis.coverageRate}%` : '--'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Actual assignees / target capacity
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Daily Trend */}
      <Paper sx={{ ...cardStyle, bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" mb={2}>
          Daily Coverage Trend
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={daily}>
              <CartesianGrid stroke={theme.palette.divider} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
              />
              <Line
                type="monotone"
                dataKey="totalAssignees"
                name="Assignees"
                stroke={theme.palette.primary.light}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="capacity"
                name="Capacity"
                stroke={theme.palette.secondary.main}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Weekly Conflicts */}
      <Paper sx={{ ...cardStyle, bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" mb={2}>
          Weekly Conflict Count
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={weekly}>
              <CartesianGrid stroke={theme.palette.divider} />
              <XAxis dataKey="weekStart" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
              />
              <Bar
                dataKey="conflicts"
                name="Conflicts"
                fill={theme.palette.error.main}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Monthly Violations */}
      <Paper sx={{ ...cardStyle, bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" mb={2}>
          Monthly Violation Trend
        </Typography>
        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="violationsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.warning.light}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.warning.light}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid stroke={theme.palette.divider} />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                labelStyle={{ color: theme.palette.text.primary }}
              />

              <Area
                type="monotone"
                dataKey="violations"
                name="Violations"
                stroke={theme.palette.warning.main}
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