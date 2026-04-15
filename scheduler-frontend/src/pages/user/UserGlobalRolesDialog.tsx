import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { UserGlobalRolesAPI, GlobalRoleTypesAPI } from "../../api";
import type { GlobalRoleType } from "../../types/org";

/* ================= PROPS ================= */

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  userName?: string;
}

/* ================= COMPONENT ================= */

export default function UserGlobalRoleDialog({
  open,
  onClose,
  userId,
  userName
}: Props) {
  const [roleTypes, setRoleTypes] = useState<GlobalRoleType[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!open || !userId) return;

    GlobalRoleTypesAPI.getAll().then(setRoleTypes);
  }, [open, userId]);

  /* ================= ACTION ================= */

  const assignRole = async () => {
    if (!userId || !selectedRoleId) return;

    await UserGlobalRolesAPI.assign({
      userId,
      globalRoleId: selectedRoleId,
    });

    setSelectedRoleId("");
    onClose();
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Global Role {userName ? `- ${userName}` : ""}</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* SINGLE SELECT */}
          <FormControl fullWidth>
            <InputLabel>Global Role</InputLabel>

            <Select
              value={selectedRoleId}
              label="Global Role"
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              {roleTypes.map((rt) => (
                <MenuItem key={rt.id} value={rt.id}>
                  {rt.name}
                  {rt.description ? ` (${rt.description})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={assignRole}
          disabled={!selectedRoleId}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}