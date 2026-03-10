import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GroupsAPI } from "../../../api";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    GroupsAPI.getOne(id!)
      .then((data) => {
        setGroup(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    await GroupsAPI.delete(id!);
    navigate("/groups");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Group not found.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        {group.name}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" mb={1}>
          <strong>Description:</strong> {group.description}
        </Typography>

        <Typography variant="body1" mb={1}>
          <strong>Timezone:</strong> {group.timezone}
        </Typography>

        <Typography variant="body1" mb={1}>
          <strong>Teams:</strong> {group.teams?.length ?? 0}
        </Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={() => navigate(`/groups/${id}/edit`)}
          >
            Edit Group
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteOpen(true)}
          >
            Delete Group
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this group?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}