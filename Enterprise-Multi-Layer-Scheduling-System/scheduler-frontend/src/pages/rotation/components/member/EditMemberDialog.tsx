import { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
} from "@mui/material";

import type { RotationMember } from "../../../../types/rotation";
import { RotationAPI } from "../../../../api";

interface Props {
    member: RotationMember;
    onClose: () => void;
    onSaved: () => void;
}

export default function EditMemberDialog({ member, onClose, onSaved }: Props) {
    const [weight, setWeight] = useState<number>(member.weight);
    const [active, setActive] = useState<boolean>(member.is_active);

    const handleSave = async () => {
        await RotationAPI.updateMember(
            member.id,   
            {
                weight,
                is_active: active,
            }
        );

        onSaved();
        onClose();
    };

    return (
        <Dialog open={!!member} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Edit Member</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
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