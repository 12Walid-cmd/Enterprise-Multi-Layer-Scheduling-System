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
    Switch,
    FormControlLabel,
} from "@mui/material";

/* ================= TYPES ================= */

import type { User } from "../../types/user";


interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: User | null;

}

/* ================= TIMEZONES ================= */

const TIMEZONES = [
    "UTC",
    "America/Halifax",
    "America/Toronto",
    "America/Vancouver",
];

/* ================= COMPONENT ================= */

export default function UserFormDialog({
    open,
    onClose,
    onSubmit,
    initialData,
}: Props) {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        timezone: "UTC",
        is_active: true,

    });

    /* ================= INIT ================= */

    useEffect(() => {
        if (open) {
            if (initialData) {
                setForm({
                    first_name: initialData.first_name,
                    last_name: initialData.last_name,
                    email: initialData.email,
                    phone: initialData.phone,
                    timezone: initialData.timezone || "UTC",
                    is_active: initialData.is_active,

                });
            } else {
                setForm({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    timezone: "UTC",
                    is_active: true,

                });
            }
        }
    }, [open, initialData]);

    /* ================= ACTION ================= */

    const handleSubmit = async () => {
        if (!form.first_name.trim() || !form.email.trim()) return;

        await onSubmit({
            ...form,
        });

        onClose();
    };

    /* ================= UI ================= */

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {initialData ? "Edit User" : "Create User"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {/* NAME */}
                    <TextField
                        label="First Name"
                        fullWidth
                        value={form.first_name}
                        onChange={(e) =>
                            setForm({ ...form, first_name: e.target.value })
                        }
                    />

                    <TextField
                        label="Last Name"
                        fullWidth
                        value={form.last_name}
                        onChange={(e) =>
                            setForm({ ...form, last_name: e.target.value })
                        }
                    />

                    {/* EMAIL */}
                    <TextField
                        label="Email"
                        fullWidth
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                    

                    {/* PHONE */}
                    <TextField
                        label="Phone"
                        fullWidth
                        value={form.phone}
                        onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                        }
                    />

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
                            {TIMEZONES.map((tz) => (
                                <MenuItem key={tz} value={tz}>
                                    {tz}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* ACTIVE */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm({ ...form, is_active: e.target.checked })
                                }
                            />
                        }
                        label="Is Active"
                    />
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