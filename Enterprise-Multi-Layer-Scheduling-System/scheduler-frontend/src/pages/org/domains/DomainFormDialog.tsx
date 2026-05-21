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

interface User {
    id: string;
    first_name: string;
    last_name: string;
}

interface Domain {
    id: string;
    name: string;
    description?: string;
    exclusive: boolean;
    type: string;
    owner?: {
        id: string;
    };
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: Domain | null;
    users: User[];
}

/* ================= CONSTANT ================= */

const DOMAIN_TYPES = [
    { value: "CAPABILITY", label: "Capability Domain" },
    { value: "POOL", label: "Rotation Pool" },
];

/* ================= COMPONENT ================= */

export default function DomainFormDialog({
    open,
    onClose,
    onSubmit,
    initialData,
    users,
}: Props) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        exclusive: false,
        owner_user_id: "",
        type: "CAPABILITY",
    });

    const [saving, setSaving] = useState(false);

    /* ================= INIT ================= */

    useEffect(() => {
        if (!open) return;

        if (initialData) {
            setForm({
                name: initialData.name,
                description: initialData.description || "",
                exclusive: initialData.exclusive,
                owner_user_id: initialData.owner?.id || "",
                type: initialData.type ?? "CAPABILITY",

            });
        } else {
            setForm({
                name: "",
                description: "",
                exclusive: false,
                owner_user_id: "",
                type: "CAPABILITY",
            });
        }
    }, [open, initialData]);

    /* ================= ACTION ================= */

    const handleSubmit = async () => {
        if (!form.name.trim()) return;

        setSaving(true);

        await onSubmit({
            ...form,
            owner_user_id: form.owner_user_id || undefined,
        });

        setSaving(false);
        onClose();
    };

    /* ================= UI ================= */

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {initialData ? "Edit Domain" : "Create Domain"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>

                    {/* NAME */}
                    <TextField
                        label="Name"
                        fullWidth
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    {/* TYPE */}
                    <FormControl fullWidth>
                        <InputLabel>Domain Type</InputLabel>
                        <Select
                            value={form.type}
                            label="Domain Type"
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            {DOMAIN_TYPES.map((t) => (
                                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* DESCRIPTION */}
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        minRows={3}
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />

                    {/* OWNER */}
                    <FormControl fullWidth>
                        <InputLabel>Owner</InputLabel>
                        <Select
                            value={form.owner_user_id}
                            label="Owner"
                            onChange={(e) =>
                                setForm({ ...form, owner_user_id: e.target.value })
                            }
                        >
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* EXCLUSIVE */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.exclusive}
                                onChange={(e) =>
                                    setForm({ ...form, exclusive: e.target.checked })
                                }
                            />
                        }
                        label="Exclusive Domain (Users cannot belong to multiple domains)"
                    />

                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : initialData
                            ? "Save"
                            : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}