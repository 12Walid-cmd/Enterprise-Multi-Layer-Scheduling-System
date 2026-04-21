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

interface Team {
  id: string;
  name: string;
  timezone?: string;
}

interface SubTeam {
  id: string;
  name: string;
  description?: string;
  timezone?: string;
  parent_team_id: string;
  lead?: {
    id: string;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: SubTeam | null;
  parentTeams: Team[];
  users: User[];
}

/* ================= COMPONENT ================= */

export default function SubTeamFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  parentTeams,
  users,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "",
    parent_team_id: "",
    lead_user_id: "",
  });

  /* ================= INIT ================= */

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name,
          description: initialData.description || "",
          timezone: initialData.timezone || "",
          parent_team_id: initialData.parent_team_id,
          lead_user_id: initialData.lead?.id || "",
        });
      } else {
        setForm({
          name: "",
          description: "",
          timezone: "",
          parent_team_id: "",
          lead_user_id: "",
        });
      }
    }
  }, [open, initialData]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.name || !form.parent_team_id) return;

    await onSubmit({
      name: form.name,
      description: form.description,
      timezone: form.timezone || undefined,
      parent_team_id: form.parent_team_id,
      lead_user_id: form.lead_user_id || undefined,
    });

    onClose();
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      <DialogTitle>
        {initialData ? "Edit SubTeam" : "Create SubTeam"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

          {/* NAME */}
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            multiline
            minRows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          {/* PARENT TEAM */}
          <FormControl fullWidth>
            <InputLabel>Parent Team</InputLabel>
            <Select
              value={form.parent_team_id}
              label="Parent Team"
              onChange={(e) =>
                setForm({ ...form, parent_team_id: e.target.value })
              }
            >
              {parentTeams.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* LEAD */}
          <FormControl fullWidth>
            <InputLabel>Lead</InputLabel>
            <Select
              value={form.lead_user_id}
              label="Lead"
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
              <MenuItem value="">Inherit</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="America/Toronto">America/Toronto</MenuItem>
              <MenuItem value="America/Halifax">America/Halifax</MenuItem>
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