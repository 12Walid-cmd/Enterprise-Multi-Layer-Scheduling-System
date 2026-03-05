import { useEffect, useState } from "react";
import { RoleTypesAPI } from "../../../api";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function RoleTypeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    RoleTypesAPI.getAll().then((list) => {
      const found = list.find((r) => r.id === id);
      setRole(found);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    await RoleTypesAPI.delete(id!);
    navigate("/roles/types");
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  if (!role)
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Role Type not found.</Typography>
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {role.name}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography><strong>Code:</strong> {role.code}</Typography>
        <Typography><strong>Description:</strong> {role.description}</Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" onClick={() => navigate(`/roles/types/${id}/edit`)}>
            Edit Role Type
          </Button>

          <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
            Delete Role Type
          </Button>
        </Box>
      </Paper>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Role Type</DialogTitle>
        <DialogContent>Are you sure you want to delete this role type?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}