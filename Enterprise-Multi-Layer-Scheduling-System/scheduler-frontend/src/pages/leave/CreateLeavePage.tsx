import { useState } from "react";
import { LeaveAPI } from "../../api";
import {
    Button,
    MenuItem,
    TextField,
    Typography,
    Paper,
    Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { LeaveType } from "../../types/leave";


export default function CreateLeavePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        type: "VACATION" as LeaveType,
        start_date: "",
        end_date: "",
        is_full_day: true,
        reason: "",
    });

    type LeaveForm = typeof form;

    function update<K extends keyof LeaveForm>(key: K, value: LeaveForm[K]) {
        setForm(prev => ({ ...prev, [key]: value }));
    }


    async function submit() {
        await LeaveAPI.create(form);
        navigate("/leave");
    }

    return (
        <Paper sx={{ p: 3, maxWidth: 500 }}>
            <Typography variant="h5" fontWeight={600} mb={2}>
                Request Leave
            </Typography>

            <Stack spacing={2}>
                <TextField
                    select
                    label="Leave Type"
                    value={form.type}
                    onChange={(e) => update("type", e.target.value as LeaveType)}
                >
                    <MenuItem value="VACATION">Vacation</MenuItem>
                    <MenuItem value="SICK">Sick</MenuItem>
                    <MenuItem value="PERSONAL">Personal</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                </TextField>

                <TextField
                    type="date"
                    label="Start Date"
                    slotProps={{
                        inputLabel: { shrink: true },
                    }}
                    value={form.start_date}
                    onChange={(e) => update("start_date", e.target.value)}
                />

                <TextField
                    type="date"
                    label="End Date"
                    slotProps={{
                        inputLabel: { shrink: true },
                    }}
                    value={form.end_date}
                    onChange={(e) => update("end_date", e.target.value)}
                />

                <TextField
                    label="Reason"
                    multiline
                    rows={3}
                    value={form.reason}
                    onChange={(e) => update("reason", e.target.value)}
                />

                <Button variant="contained" onClick={submit}>
                    Submit
                </Button>
            </Stack>
        </Paper>
    );
}