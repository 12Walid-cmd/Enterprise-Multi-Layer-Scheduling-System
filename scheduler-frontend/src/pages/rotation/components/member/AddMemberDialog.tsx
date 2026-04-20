import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  CircularProgress,
  Stack,
} from "@mui/material";

import { RotationAPI, UsersAPI, TeamsAPI, DomainAPI, SubTeamMembersAPI, DomainTeamsAPI, TeamMembersAPI } from "../../../../api";
import type { RotationDefinition } from "../../../../types/rotation";

interface Props {
  open: boolean;
  onClose: () => void;
  rotation: RotationDefinition;
  onAdded: () => void;
}

interface Candidate {
  id: string;
  display: string;
}


export default function AddMemberDialog({ open, onClose, rotation, onAdded }: Props) {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [weight, setWeight] = useState<number>(1);
  const [active, setActive] = useState<boolean>(true);

  const loadCandidates = async () => {
    setLoading(true);

    let list: any[] = [];
    if (!rotation.scope_ref_id) {
      console.error("Rotation scope is not configured correctly. rotation.scope_ref_id is null");
      setCandidates([]);
      setLoading(false);
      return;
    }

    switch (rotation.scope_type) {

      case "GROUP": {
        const allTeams = await TeamsAPI.getAll();

        const teams = allTeams.filter(t =>
          t.group_id === rotation.scope_ref_id &&
          t.parent_team_id === null
        );

        list = teams.map(t => ({
          id: t.id,
          display: t.name,
        }));
        break;
      }


      case "TEAM": {
        const members = await TeamMembersAPI.get(rotation.scope_ref_id!);

        list = members.map(m => ({
          id: m.user_id,
          display: `${m.users?.first_name} ${m.users?.last_name}`,
        }));
        break;
      }

      case "SUBTEAM": {
        const members = await SubTeamMembersAPI.get(rotation.scope_ref_id!);

        list = members.map(m => ({
          id: m.user_id,
          display: `${m.users?.first_name} ${m.users?.last_name}`,
        }));
        break;
      }

      case "DOMAIN": {
        const domainTeams = await DomainTeamsAPI.getTeamsByDomain(rotation.scope_ref_id!);
        const domainUsers = await DomainAPI.getDomainUsers(rotation.scope_ref_id!);

        list = [
          ...domainTeams.map(dt => ({
            id: dt.id,
            display: `[Team] ${dt.teams?.name ?? "Unknown"}`,
            type: "DOMAIN_TEAM",
          })),
          ...domainUsers.map(u => ({
            id: u.id,
            display: `[User] ${u.user.first_name} ${u.user.last_name}`,
            type: "USER",
          })),
        ];
        break;
      }

      case "DOMAIN_TEAM": {
        const members = await DomainTeamsAPI.getTeamMembers(rotation.scope_ref_id!);

        list = members.map(m => ({
          id: m.user_id,
          display: `${m.user.firstName} ${m.user.lastName}`,
        }));
        break;
      }

      case "NONE":
      default: {
        const users = await UsersAPI.getAll();
        list = users.map(u => ({
          id: u.id,
          display: `${u.first_name} ${u.last_name}`,
        }));
        break;
      }
    }

    const existingMemberIds = rotation.rotation_members.map(m => m.member_ref_id);
    list = list.filter(c => !existingMemberIds.includes(c.id));

    setCandidates(list);
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadCandidates();
  }, [open]);

  const handleSubmit = async () => {
    if (!selected) return;

    await RotationAPI.addMember(rotation.id, {
      member_type: "USER",
      member_ref_id: selected,
      weight,
      is_active: active,
    });

    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Member</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <TextField
              select
              label="Select Member"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              fullWidth
            >
              {candidates.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.display}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              fullWidth
            />

            <TextField
              select
              label="Active"
              value={active ? "true" : "false"}
              onChange={(e) => setActive(e.target.value === "true")}
              fullWidth
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!selected} onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}