import { useEffect, useState } from "react";
import { DomainTeamsAPI } from "../../../api";
import type { DomainTeam } from "../../../types/domain";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function DomainTeamsListPage() {
    const [items, setItems] = useState<DomainTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        DomainTeamsAPI.getAll().then((res) => {
            setItems(res);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h4">Domain-Team Mappings</Typography>

                <Button
                    variant="contained"
                    onClick={() => navigate("/domain-teams/create")}
                >
                    Add Mapping
                </Button>
            </Stack>

            <Stack spacing={2}>
                {items.map((dt) => (
                    <Card
                        key={dt.id}
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/domain-teams/${dt.id}`)}
                    >
                        <CardContent>
                            <Typography variant="h6">
                                {dt.domains?.name} → {dt.teams?.name}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Members: {dt.domainTeamMembers?.length ?? 0}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}