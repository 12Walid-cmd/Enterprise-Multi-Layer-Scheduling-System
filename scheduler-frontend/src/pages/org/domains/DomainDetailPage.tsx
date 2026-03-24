import { useEffect, useState } from "react";
import { DomainAPI } from "../../../api";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function DomainDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [domain, setDomain] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const load = () => {
        DomainAPI.getOne(id!).then((res) => {
            setDomain(res);
            setLoading(false);
        });
    };

    useEffect(() => {
        load();
    }, [id]);

    if (loading) {
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
                <Typography variant="h4">{domain.name}</Typography>
                <Button variant="contained" onClick={() => navigate(`/domains/${id}/edit`)}>
                    Edit
                </Button>
            </Stack>

            {/* Teams Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
                <Typography variant="h6">Teams in this Domain</Typography>

                <Button variant="outlined" onClick={() => navigate(`/domains/${id}/add-team`)}>
                    Add Team
                </Button>
            </Stack>

            <Typography variant="body1" mb={3}>
                {domain.description || "No description"}
            </Typography>

            {/* Domain Teams */}
            <Stack spacing={2}>
                {domain.domain_teams.map((dt: any) => (
                    <Card key={dt.id}>
                        <CardContent>
                            <Typography variant="h6">{dt.teams.name}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            {/*  Users in this Domain */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
                <Typography variant="h6" mt={4}>Users in this Domain</Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/domains/${id}/add-user`)}
                >
                    Add User
                </Button>
            </Stack>
            

            <Stack spacing={2}>
                {domain.domainUsers?.map((du: any) => (
                    <Card key={du.id}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography>
                                    {du.user.first_name} {du.user.last_name} ({du.user.email})
                                </Typography>

                                <Button
                                    color="error"
                                    onClick={() => DomainAPI.removeUser(domain.id, du.user.id).then(load)}
                                >
                                    Remove
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            {/* Members Section */}


            <Stack spacing={2}>
                {domain.domain_teams.flatMap((dt: any) =>
                    dt.domainTeamMembers.map((m: any) => (
                        <Card key={m.id}>
                            <CardContent>
                                <Typography>{m.user.name}</Typography>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Stack>
        </Box>
    );
}