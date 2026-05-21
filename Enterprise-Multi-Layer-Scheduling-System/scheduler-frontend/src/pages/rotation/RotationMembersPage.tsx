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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useNavigate, useParams } from "react-router-dom";

import { RotationAPI, UsersAPI } from "../../api";
import type { RotationDefinition, RotationMember } from "../../types/rotation";
type RotationMemberWithUser = RotationMember & {
  user_name?: string;
  user_email?: string;
};
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
import AddMemberDialog from "./components/member/AddMemberDialog";
import EditMemberDialog from "./components/member/EditMemberDialog";

export default function RotationMembersPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [rotation, setRotation] = useState<RotationDefinition | null>(null);
const [members, setMembers] = useState<RotationMemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editMember, setEditMember] = useState<RotationMemberWithUser | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const loadData = async () => {
    try {
      if (!id) return;
      setLoading(true);
      setError(null);

      const [rotationData, memberData, allUsers] = await Promise.all([
        RotationAPI.getOne(id),
        RotationAPI.getMembers(id),
        UsersAPI.getAll(),   
      ]);
      
      const membersWithUserInfo = memberData.map((m) => {
        let user = null;
        if (m.member_type === "USER") {
          user = allUsers.find((u) => u.id === m.member_ref_id);
        }
        return {
          ...m,
          user_name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
          user_email: user?.email ?? "",
        };
      });

      setRotation(rotationData);
      setMembers(membersWithUserInfo);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load rotation members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async (memberId: string) => {
    await RotationAPI.removeMember(memberId);
    loadData();
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

  if (error || !rotation) {
    return (
      <Box p={3}>
        <Typography color="error" textAlign="center" mt={3}>
          {error ?? "Rotation not found"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/rotations/${rotation.id}`)}
        >
          Back
        </Button>

        <Typography variant="h5" fontWeight={600}>
          Rotation Members — {rotation.name}
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
                      <Box>
                        <Typography fontWeight={500}>
                          {m.display_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {m.member_type} — {m.user_name} ({m.user_email})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Weight: {m.weight} — {m.is_active ? "Active" : "Inactive"}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => setEditMember(m)}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDelete(m.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
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
        rotation={rotation}
        onAdded={loadData}
      />

      {/* Edit Member Dialog */}
      {editMember && (
        <EditMemberDialog
          member={editMember}
          onClose={() => setEditMember(null)}
          onSaved={loadData}
        />
      )}
    </Box>
  );
}