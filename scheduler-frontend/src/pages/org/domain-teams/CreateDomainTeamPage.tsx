import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import { DomainAPI } from "../../../api";
import { TeamsAPI } from "../../../api";
import { DomainTeamsAPI } from "../../../api";

import type { Domain } from "../../../types/domain";
import type { Team } from "../../../types/org";

export default function CreateDomainTeamPage() {
    const navigate = useNavigate();

    const [domains, setDomains] = useState<Domain[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    const [selectedDomain, setSelectedDomain] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([DomainAPI.getAll(), TeamsAPI.getAll()]).then(([d, t]) => {
            setDomains(d);
            setTeams(t);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async () => {
        if (!selectedDomain || !selectedTeam) return;

        await DomainTeamsAPI.create({
            domain_id: selectedDomain,
            team_id: selectedTeam,
        });

        navigate("/domain-teams");
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3} maxWidth={600}>
            <Typography variant="h4" mb={3}>
                Create Domain-Team Mapping
            </Typography>

            <Card>
                <CardContent>
                    <Stack spacing={3}>
                        {/* Select Domain */}
                        <TextField
                            select
                            label="Select Domain"
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            fullWidth
                        >
                            {domains.map((d) => (
                                <MenuItem key={d.id} value={d.id}>
                                    {d.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Select Team */}
                        <TextField
                            select
                            label="Select Team"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            fullWidth
                        >
                            {teams.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Submit */}
                        <Button
                            variant="contained"
                            disabled={!selectedDomain || !selectedTeam}
                            onClick={handleSubmit}
                        >
                            Create Mapping
                        </Button>

                        {/* Cancel */}
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate("/domain-teams")}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}