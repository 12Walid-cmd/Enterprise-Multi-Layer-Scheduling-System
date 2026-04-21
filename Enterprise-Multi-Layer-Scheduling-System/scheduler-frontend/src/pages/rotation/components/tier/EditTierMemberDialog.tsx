import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import { TierAPI } from "../../../../api";
import type { TierMember } from "../../../../types/rotation";

export default function EditTierMemberDialog({
  open,
  onClose,
  member,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  member: TierMember;
  onSaved: () => void;
}) {
  const [weight, setWeight] = useState(member.weight);
  const [isActive, setIsActive] = useState(member.is_active);

  const handleSave = async () => {
    await TierAPI.updateTierMember(member.id, {
      weight,
      is_active: isActive,
    });

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Member</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            }
            label="Active"
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
