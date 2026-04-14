import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { RolesAPI } from "../../../api";
import type { Role } from "../../../types/org";

export default function RoleDialog({
  open,
  onClose,
  role,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (role) {
      setForm({
        name: role.name,
        description: role.description || "",
      });
    } else {
      setForm({ name: "", description: "" });
    }
  }, [role]);

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (role) {
      await RolesAPI.update(role.id, form);
    } else {
      await RolesAPI.create(form);
    }

    onClose();
    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {role ? "Edit Role" : "Create Role"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          {role ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}