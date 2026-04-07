import { useEffect, useState } from "react";
import { LeaveAPI } from "../../api";
import {
  Box,
  Button,
  Chip,
  Typography,
  Paper,
  Stack,
  MenuItem,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { LeaveRequest, LeaveStatus } from "../../types/leave";

export default function MyLeavesPage() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const [status, setStatus] = useState<LeaveStatus | "">("");

  useEffect(() => {
    LeaveAPI.myLeaves(status || undefined).then(setLeaves);
  }, [status]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          My Leave Requests
        </Typography>

        <Button variant="contained" onClick={() => navigate("/leave/create")}>
          Request Leave
        </Button>
      </Box>

      {/* Status Filter */}
      <TextField
        select
        label="Filter by Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as LeaveStatus | "")}
        sx={{ mb: 2, width: 250 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="PENDING">Pending</MenuItem>
        <MenuItem value="APPROVED">Approved</MenuItem>
        <MenuItem value="REJECTED">Rejected</MenuItem>
        <MenuItem value="CANCELLED">Cancelled</MenuItem>
      </TextField>

      {/* Leave List */}
      <Stack spacing={2}>
        {leaves.map((leave) => (
          <Paper key={leave.id} sx={{ p: 2 }}>
            <Typography fontWeight={600}>
              {leave.type} — {leave.start_date.split("T")[0]} → {leave.end_date.split("T")[0]}
            </Typography>

            {/* Status Chip */}
            <Chip
              color={
                leave.status === "APPROVED"
                  ? "success"
                  : leave.status === "REJECTED"
                  ? "error"
                  : leave.status === "CANCELLED"
                  ? "default"
                  : "warning"
              }
              sx={{ mt: 1 }}
            />

            {/* Cancel Button */}
            {leave.status === "PENDING" && (
              <Button
                sx={{ mt: 1 }}
                variant="outlined"
                onClick={() => {
                  LeaveAPI.cancelMyLeave(leave.id).then(() => {
                    LeaveAPI.myLeaves(status || undefined).then(setLeaves);
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}