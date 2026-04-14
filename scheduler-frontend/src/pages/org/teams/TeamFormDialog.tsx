import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

/* ================= TYPES ================= */

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Group {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  timezone?: string;
  groups?: { id: string };
  lead?: { id: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Team | null;
  groups: Group[];
  users: User[];
}

/* ================= TIMEZONES ================= */

const TIMEZONES = [
  "UTC",
  "America/Halifax",
  "America/Toronto",
  "America/Vancouver",
];

/* ================= COMPONENT ================= */

export default function TeamFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  groups,
  users,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "UTC",
    group_id: "",
    lead_user_id: "",
  });

  /* ================= INIT ================= */

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          description: initialData.description || "",
          timezone: initialData.timezone || "UTC",
          group_id: initialData.groups?.id || "",
          lead_user_id: initialData.lead?.id || "",
        });
      } else {
        setForm({
          name: "",
          description: "",
          timezone: "UTC",
          group_id: "",
          lead_user_id: "",
        });
      }
    }
  }, [open, initialData]);

  /* ================= ACTION ================= */

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    await onSubmit({
      ...form,
      lead_user_id: form.lead_user_id || undefined,
    });

    onClose();
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Edit Team" : "Create Team"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

          <TextField
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* GROUP */}
          <FormControl fullWidth>
            <InputLabel>Group</InputLabel>
            <Select
              value={form.group_id}
              label="Group"
              onChange={(e) =>
                setForm({ ...form, group_id: e.target.value })
              }
            >
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* TEAM LEAD */}
          <FormControl fullWidth>
            <InputLabel>Team Lead</InputLabel>
            <Select
              value={form.lead_user_id}
              label="Team Lead"
              onChange={(e) =>
                setForm({ ...form, lead_user_id: e.target.value })
              }
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.first_name} {u.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* TIMEZONE */}
          <FormControl fullWidth>
            <InputLabel>Timezone</InputLabel>
            <Select
              value={form.timezone}
              label="Timezone"
              onChange={(e) =>
                setForm({ ...form, timezone: e.target.value })
              }
            >
              {TIMEZONES.map((tz) => (
                <MenuItem key={tz} value={tz}>
                  {tz}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}