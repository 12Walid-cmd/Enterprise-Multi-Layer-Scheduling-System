import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useState } from "react";

import { HolidayAPI } from "../../api";
import type { CreateHolidayInput } from "../../types/holiday";

export default function HolidayCreateDialog({
  open,
  onClose,
  onCreated,
  groupId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  groupId: string;
}) {
  const [form, setForm] = useState<CreateHolidayInput>({
    name: "",
    date: "",
  });

  const update = (k: keyof CreateHolidayInput, v: any) =>
    setForm({ ...form, [k]: v });

  const submit = async () => {
    await HolidayAPI.create(groupId, form); 
    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add Holiday</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Holiday Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <TextField
            type="date"
            label="Date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
