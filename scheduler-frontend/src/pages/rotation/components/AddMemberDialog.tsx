import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { RotationAPI } from "../../../api";
import MemberPicker from "./MemberPicker";

interface Props {
  open: boolean;
  onClose: () => void;
  rotationId: string;
  onAdded: () => void;
}

const MEMBER_TYPES = [
  "USER",
  "TEAM",
  "SUBTEAM",
  "ROLE",
  "DOMAIN",
] as const;

export default function AddMemberDialog({
  open,
  onClose,
  rotationId,
  onAdded,
}: Props) {
  const [memberType, setMemberType] = useState<string>("USER");
  const [selectedRefId, setSelectedRefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!selectedRefId) return;

    setLoading(true);
    await RotationAPI.addMember(rotationId, {
      member_type: memberType,
      member_ref_id: selectedRefId,
    });
    setLoading(false);

    onAdded();
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setSelectedRefId(null);
      setMemberType("USER");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Member</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Member Type Selector */}
          <Box>
            <Typography fontWeight={600} mb={1}>
              Member Type
            </Typography>
            <Select
              fullWidth
              value={memberType}
              onChange={(e) => setMemberType(e.target.value)}
            >
              {MEMBER_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Member Picker */}
          <Box>
            <Typography fontWeight={600} mb={1}>
              Select {memberType}
            </Typography>
            <MemberPicker
              type={memberType}
              value={selectedRefId}
              onChange={setSelectedRefId}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          disabled={!selectedRefId || loading}
          onClick={handleAdd}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}