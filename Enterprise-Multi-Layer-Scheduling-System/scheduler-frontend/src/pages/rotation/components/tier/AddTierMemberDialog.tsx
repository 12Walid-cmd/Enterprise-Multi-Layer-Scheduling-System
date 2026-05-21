import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { UsersAPI, TierAPI } from "../../../../api";
import type { RotationMemberType } from "../../../../types/rotation";


const ROTATION_MEMBER_TYPES = [
  "USER",
  "TEAM",
  "SUBTEAM",
  "ROLE",
  "DOMAIN",
  "DOMAIN_TEAM",
  "GROUP",
] as const;

export default function AddTierMemberDialog({
  open,
  onClose,
  tierId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  tierId: string;
  onAdded: () => void;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [memberRefId, setMemberRefId] = useState("");
  const [memberType, setMemberType] = useState<RotationMemberType>("USER");
  const [weight, setWeight] = useState(1);

  useEffect(() => {
    UsersAPI.getAll().then(setUsers);
  }, []);

  const handleSubmit = async () => {
    await TierAPI.addTierMember(tierId, {
      member_type: memberType,
      member_ref_id: memberRefId,
      weight,
    });

    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Member to Tier</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* Member Type */}
          <TextField
            select
            label="Member Type"
            value={memberType}
            onChange={(e) => setMemberType(e.target.value as RotationMemberType)}
          >
            {ROTATION_MEMBER_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          {/* User Selector */}
          {memberType === "USER" && (
            <TextField
              select
              label="Select User"
              value={memberRefId}
              onChange={(e) => setMemberRefId(e.target.value)}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.first_name} {u.last_name} — {u.email}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Weight */}
          <TextField
            label="Weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}