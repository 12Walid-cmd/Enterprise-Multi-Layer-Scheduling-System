import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { TeamsAPI } from "../../../api";
import { DomainTeamsAPI } from "../../../api";

import type { Team } from "../../../types/org";
import type { DomainTeam } from "../../../types/domain";

export default function AddTeamToDomainPage() {
    const { id: domainId } = useParams(); // /domains/:id/add-team
    const navigate = useNavigate();

    const [teams, setTeams] = useState<Team[]>([]);
    const [existingDomainTeams, setExistingDomainTeams] = useState<DomainTeam[]>([]);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!domainId) return;

        Promise.all([
            TeamsAPI.getAll(),
            DomainTeamsAPI.getTeamsByDomain(domainId),
        ]).then(([allTeams, domainTeams]) => {
            setTeams(allTeams);
            setExistingDomainTeams(domainTeams);
            setLoading(false);
        });
    }, [domainId]);

    const handleSubmit = async () => {
        if (!selectedTeam) return;

        await DomainTeamsAPI.create({
            domain_id: domainId!,
            team_id: selectedTeam,
        });

        navigate(`/domains/${domainId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    const existingTeamIds = new Set(existingDomainTeams.map((dt) => dt.team_id));
    const availableTeams = teams.filter((t) => !existingTeamIds.has(t.id));

    return (
        <Box p={3} maxWidth={600}>
            <Typography variant="h4" mb={3}>
                Add Team to Domain
            </Typography>

            <Card>
                <CardContent>
                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Select Team"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            fullWidth
                        >
                            {availableTeams.length > 0 ? (
                                availableTeams.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No available teams</MenuItem>
                            )}
                        </TextField>

                        <Button
                            variant="contained"
                            disabled={!selectedTeam}
                            onClick={handleSubmit}
                        >
                            Add
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate(`/domains/${domainId}`)}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}