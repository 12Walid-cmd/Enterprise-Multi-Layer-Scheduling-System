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

import { DomainTeamsAPI } from "../../../api";
import { UsersAPI } from "../../../api"; 
import type { User } from "../../../types/user";

export default function AddUserToDomainTeamPage() {
    const { id: domainTeamId } = useParams();
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        UsersAPI.getAll().then((res) => {
            const normalized = res.map((u: any) => ({
            ...u,
            firstName: u.first_name,
            lastName: u.last_name,
        }));
        setUsers(normalized);
        setLoading(false);
        });
    }, []);

    const handleSubmit = async () => {
        if (!selectedUser) return;

        await DomainTeamsAPI.addUser(domainTeamId!, { user_id: selectedUser });
        navigate(`/domain-teams/${domainTeamId}`);
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
                Add Member to Domain-Team
            </Typography>

            <Card>
                <CardContent>
                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Select User"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            fullWidth
                        >
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.firstName} {u.lastName} ({u.email})
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="contained"
                            disabled={!selectedUser}
                            onClick={handleSubmit}
                        >
                            Add Member
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate(`/domains/${domainTeamId}`)}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}