import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const fetchUsers = async (search: string) => {
    const res = await fetch(`/api/users?search=${search}`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
};

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await fetchUsers(search);
            setUsers(data);
        } catch (err: any) {
            setError(err.message || "Error loading users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSearch = () => {
        loadUsers();
    };

    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Users
            </Typography>

            {/* Search + Create */}
            <Box display="flex" gap={2} mb={3}>
                <TextField
                    label="Search by name or email"
                    variant="outlined"
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="contained" onClick={handleSearch}>
                    Search
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => (window.location.href = "/users/create")}
                >
                    Create User
                </Button>
            </Box>

            {loading && (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Typography color="error" mb={2}>
                    {error}
                </Typography>
            )}

            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Phone</strong></TableCell>
                                <TableCell><strong>Timezone</strong></TableCell>
                                <TableCell><strong>Active</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}

                            {users.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        {user.first_name} {user.last_name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{user.timezone}</TableCell>
                                    <TableCell>{user.is_active ? "Yes" : "No"}</TableCell>

                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => (window.location.href = `/users/${user.id}`)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>

                                        <IconButton
                                            color="secondary"
                                            onClick={() => (window.location.href = `/users/${user.id}/edit`)}
                                        >
                                            <EditIcon />
                                        </IconButton>

                                        <IconButton
                                            color="error"
                                            onClick={() => alert("TODO: delete user")}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}