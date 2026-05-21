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
import type { Holiday, UpdateHolidayInput } from "../../types/holiday";

export default function HolidayEditDialog({
  holiday,
  onClose,
  onUpdated,
  groupId,
}: {
  holiday: Holiday;
  onClose: () => void;
  onUpdated: () => void;
  groupId: string;
}) {
  const [form, setForm] = useState<UpdateHolidayInput>({
    name: holiday.name,
    date: holiday.date.split("T")[0],
  });

  const update = (k: keyof UpdateHolidayInput, v: any) =>
    setForm({ ...form, [k]: v });

  const submit = async () => {
    await HolidayAPI.update(holiday.id, groupId, form); 
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={!!holiday} onClose={onClose} fullWidth>
      <DialogTitle>Edit Holiday</DialogTitle>

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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
