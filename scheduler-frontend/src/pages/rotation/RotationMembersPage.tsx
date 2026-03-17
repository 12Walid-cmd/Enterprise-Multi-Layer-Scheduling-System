import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useParams } from "react-router-dom";

import type { RotationMember } from "../../types/rotation";
import { RotationAPI } from "../../api";

// dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableMemberRow from "./components/SortableMemberRow";
import AddMemberDialog from "./components/AddMemberDialog";

export default function RotationMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [members, setMembers] = useState<RotationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const fetchMembers = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const res = await RotationAPI.getMembers(id);
      setMembers(res);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [id]);

  const handleDelete = async (memberId: string) => {
    await RotationAPI.removeMember(memberId);
    fetchMembers();
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);

    const newOrder = arrayMove(members, oldIndex, newIndex);
    setMembers(newOrder);

    if (id) {
      await RotationAPI.reorderMembers(
        id,
        newOrder.map((m, index) => ({
          id: m.id,
          order_index: index,
        }))
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" mt={3}>
        {error}
      </Typography>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={600}>
          Rotation Members
        </Typography>

        <Box flexGrow={1} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Member
        </Button>
      </Stack>

      {/* Members List */}
      <Paper sx={{ p: 2 }}>
        {members.length === 0 ? (
          <Typography>No members in this rotation.</Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={members.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack spacing={1}>
                {members.map((m) => (
                  <SortableMemberRow key={m.id} id={m.id}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <Typography>
                        {m.member_type}: {m.member_ref_id}
                      </Typography>

                      <IconButton
                        color="error"
                        onClick={() => handleDelete(m.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </SortableMemberRow>
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Paper>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        rotationId={id!}
        onAdded={fetchMembers}
      />
    </Box>
  );
}