import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createSubTeam } from "../../../api";

export const CreateSubTeamPage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        timezone: "",
    });

    const [errors, setErrors] = useState({
        name: "",
    });

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        let ok = true;
        const newErrors: any = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
            ok = false;
        }

        setErrors(newErrors);
        return ok;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        await createSubTeam(teamId!, form);
        navigate(`/teams/${teamId}/sub-teams`);
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={3}>
                Create Sub-team
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={3}>

                    {/* Name */}
                    <TextField
                        label="Sub-team Name"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                    />

                    {/* Description */}
                    <TextField
                        label="Description"
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />

                    {/* Timezone */}
                    <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                            label="Timezone"
                            value={form.timezone}
                            onChange={(e) => handleChange("timezone", e.target.value)}
                        >
                            <MenuItem value="America/Toronto">America/Toronto</MenuItem>
                            <MenuItem value="America/New_York">America/New_York</MenuItem>
                            <MenuItem value="America/Vancouver">America/Vancouver</MenuItem>
                            <MenuItem value="UTC">UTC</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Buttons */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                        >
                            Create
                        </Button>
                    </Stack>

                </Stack>
            </Paper>
        </Box>
    );
};