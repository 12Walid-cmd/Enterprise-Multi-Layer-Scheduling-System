import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { TierAPI } from "../../../../api";
import type { AddTier } from "../../../../types/rotation";

export default function AddTierDialog({
  open,
  onClose,
  rotationId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  rotationId: string;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [tierLevel, setTierLevel] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Tier name is required");
      return;
    }

    if (tierLevel < 1) {
      setError("Tier level must be at least 1");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: AddTier = {
        name,
        tier_level: tierLevel,
      };

      await TierAPI.addTier(rotationId, payload);

      onCreated();
      onClose();

      // Reset form
      setName("");
      setTierLevel(1);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create tier");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Tier</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <TextField
            label="Tier Name"
            placeholder="e.g., Primary, Secondary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Tier Level"
            type="number"
            value={tierLevel}
            onChange={(e) => setTierLevel(Number(e.target.value))}
            fullWidth
          />

          <Typography variant="body2" color="text.secondary">
            Tier Level determines priority. Lower numbers mean higher priority.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}