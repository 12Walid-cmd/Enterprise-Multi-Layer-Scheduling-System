import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { SubTeamsAPI } from "../../../api";

export const EditSubTeamPage = () => {
    const { subTeamId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        timezone: "",
        parent_team_id: "",
    });


    const load = async () => {
        if (!subTeamId) return;
        const st = await SubTeamsAPI.getOne(subTeamId);

        console.log("Loaded SubTeam:", st);
        setForm({
            name: st.name,
            description: st.description ?? "",
            timezone: st.timezone ?? "",
            parent_team_id: st.parent_team_id,
        });
    };

    useEffect(() => {
        load();
    }, [subTeamId]);

    const handleChange =
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm(prev => ({ ...prev, [field]: e.target.value }));
        };

    const handleSubmit = async () => {
        if (!subTeamId) return;

        await SubTeamsAPI.update(subTeamId, {
            name: form.name,
            description: form.description,
            timezone: form.timezone,
            parent_team_id: form.parent_team_id,
        });

        navigate(`/sub-teams/${subTeamId}`);
    };
    return (
        <Box p={3}>
            <Typography variant="h5" mb={3}>
                Edit Sub-team
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <TextField
                        label="Name"
                        value={form.name}
                        onChange={handleChange('name')}
                        fullWidth
                    />
                    <TextField
                        label="Description"
                        value={form.description}
                        onChange={handleChange('description')}
                        fullWidth
                        multiline
                        minRows={2}
                    />
                    <TextField
                        label="Timezone"
                        value={form.timezone}
                        onChange={handleChange('timezone')}
                        fullWidth
                    />

                    <Stack direction="row" spacing={2} mt={2}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSubmit}>
                            Save
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};