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
import { TierAPI } from "../../../../api";
import type { Tier } from "../../../../types/rotation";

export default function EditTierDialog({
  open,
  onClose,
  tier,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  tier: Tier;
  onSaved: () => void;
}) {
  const [name, setName] = useState(tier.name);
  const [tierLevel, setTierLevel] = useState(tier.tier_level);

  const handleSave = async () => {
    await TierAPI.updateTier(tier.id, {
      name,
      tier_level: tierLevel,
    });

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Tier</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Tier Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Tier Level"
            type="number"
            value={tierLevel}
            onChange={(e) => setTierLevel(Number(e.target.value))}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}