import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import { useState } from "react";
import { AuthAPI } from "../../api/auth";

export default function ChangePasswordDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError("");
        setSuccess("");

        if (newPassword !== confirm) {
            setError("New passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await AuthAPI.changePassword({
                old_password: oldPassword,
                new_password: newPassword,
            });
            setSuccess(res.data.message);
            setOldPassword("");
            setNewPassword("");
            setConfirm("");
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Change Password</DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <TextField
                    label="Old Password"
                    type="text"                     
                    fullWidth
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Old Password"
                    autoComplete="off"              
                    slotProps={{
                        inputLabel: { shrink: true }, 
                    }}
                />


                <TextField
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                />

                <TextField
                    label="Confirm New Password"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm New Password"
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
