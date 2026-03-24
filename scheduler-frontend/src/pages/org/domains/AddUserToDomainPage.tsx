import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { UsersAPI, DomainAPI } from "../../../api";

import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    CircularProgress,
    TextField,
    MenuItem,
} from "@mui/material";

export default function AddUserToDomainPage() {
    const { domainId } = useParams();
    const navigate = useNavigate();

    const [users, setUsers] = useState<any[]>([]);
    const [existingDomainUsers, setExistingDomainUsers] = useState<any[]>([]); // ⭐ 默认空数组
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!domainId) return;
        Promise.all([
            UsersAPI.getAll(),
            DomainAPI.getOne(domainId),
        ]).then(([allUsers, domain]) => {
            const normalizedUsers = allUsers.map((u: any) => ({
                ...u,
                firstName: u.first_name,
                lastName: u.last_name,
            }));

            setUsers(normalizedUsers);
            setExistingDomainUsers(domain.domain_users ?? []);
            setLoading(false);
        });
    }, [domainId]);

    const handleSubmit = async () => {
        if (!selectedUser) return;

        await DomainAPI.addUser(domainId!, { user_id: selectedUser });
        navigate(`/domains/${domainId}`);
    };

    if (loading) return <CircularProgress />;


    const existingUserIds = new Set(
        existingDomainUsers?.map((du: any) => du.user_id) ?? []
    );

    const availableUsers = users.filter((u) => !existingUserIds.has(u.id));

    return (
        <Box p={3} maxWidth={600}>
            <Typography variant="h4" mb={3}>Add User to Domain</Typography>

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
                            {availableUsers.length > 0 ? (
                                availableUsers.map((u) => (
                                    <MenuItem key={u.id} value={u.id}>
                                        {u.firstName} {u.lastName} ({u.email})
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No available users</MenuItem>
                            )}
                        </TextField>

                        <Button variant="contained" disabled={!selectedUser} onClick={handleSubmit}>
                            Add User
                        </Button>

                        <Button variant="outlined" onClick={() => navigate(`/domains/${domainId}`)}>
                            Cancel
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}