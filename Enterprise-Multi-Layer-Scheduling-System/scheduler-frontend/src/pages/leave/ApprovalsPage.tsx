import { useEffect, useState } from "react";
import { LeaveAPI } from "../../api";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import type { LeaveRequest } from "../../types/leave";

export default function ApprovalsPage() {
  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    LeaveAPI.pendingForApproval().then(setPending);
  }, []);

  function openDialog(id: string, d: "APPROVED" | "REJECTED") {
    setSelectedId(id);
    setDecision(d);
    setNotes("");
    setOpen(true);
  }

  async function submitDecision() {
    if (!selectedId) return;

    await LeaveAPI.decide(selectedId, { decision, notes });

    setPending(prev => prev.filter(l => l.id !== selectedId));
    setOpen(false);
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Pending Leave Approvals
      </Typography>

      <Stack spacing={2}>
        {pending.map((leave) => (
          <Paper key={leave.id} sx={{ p: 2 }}>
            <Typography fontWeight={600}>
              {leave.users?.first_name} {leave.users?.last_name}
            </Typography>

            <Typography>
              {leave.type} — {leave.start_date} → {leave.end_date}
            </Typography>

            <Chip label={leave.status} color="warning" sx={{ mt: 1 }} />

            <Stack direction="row" spacing={1} mt={2}>
              <Button
                variant="contained"
                color="success"
                onClick={() => openDialog(leave.id, "APPROVED")}
              >
                Approve
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => openDialog(leave.id, "REJECTED")}
              >
                Reject
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Dialog for notes */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Decision</DialogTitle>

        <DialogContent>
          <Typography mb={1}>
            Decision: <strong>{decision}</strong>
          </Typography>

          <TextField
            label="Notes (optional)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitDecision}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}