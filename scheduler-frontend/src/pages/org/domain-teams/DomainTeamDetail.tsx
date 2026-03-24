import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { DomainTeamsAPI } from "../../../api";
import type { DomainTeam } from "../../../types/domain";

export default function DomainTeamDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState<DomainTeam | null>(null);
    const [loading, setLoading] = useState(true);

    const load = () => {
        DomainTeamsAPI.getOne(id!).then((res) => {
            setItem(res);
            setLoading(false);
        });
    };

    useEffect(() => {
        load();
    }, [id]);

    const handleDeleteMapping = async () => {
        await DomainTeamsAPI.delete(id!);
        navigate("/domain-teams");
    };

    const handleRemoveMember = async (memberId: string) => {
        await DomainTeamsAPI.removeUser(memberId);
        load();
    };

    if (loading || !item) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h4">
                    {item.domains?.name} → {item.teams?.name}
                </Typography>

                <Button variant="contained" color="error" onClick={handleDeleteMapping}>
                    Delete Mapping
                </Button>
            </Stack>

            {/* Members Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
                <Typography variant="h6">Members</Typography>

                <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate(`/domain-teams/${id}/add-member`)}
                >
                    Add Member
                </Button>
            </Stack>

            <Stack spacing={2}>
                {item.domainTeamMembers && item.domainTeamMembers.length > 0 ? (
                    item.domainTeamMembers.map((m) => (
                        <Card key={m.id}>
                            <CardContent
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography>{m.user?.name}</Typography>

                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveMember(m.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography color="text.secondary">No members in this domain-team.</Typography>
                )}
            </Stack>
        </Box>
    );
}