import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { HolidayAPI } from "../../api";
import type { Holiday } from "../../types/holiday";

import HolidayCreateDialog from "./HolidayCreateDialog";
import HolidayEditDialog from "./HolidayEditDialog";

export default function HolidayPage() {
  const { user } = useAuth();
  const { groupId: urlGroupId } = useParams();


  const groupId = urlGroupId ?? user?.scope?.group_ids?.[0];

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);

  /* ================== PROTECTION ================== */
  if (!groupId) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ fontSize: 16 }}>
          This user is not assigned to any team.  
          Please assign the user to a team before viewing holidays.
        </Alert>
      </Box>
    );
  }

  /* ================== LOAD HOLIDAYS ================== */

  const load = async () => {
    setLoading(true);
    const data = await HolidayAPI.getByGroup(groupId); 
    setHolidays(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [groupId]);


  const formatDate = (iso: string) => iso.split("T")[0];

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Holidays
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Add Holiday
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {holidays.map((h) => (
            <Card key={h.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography fontWeight={700}>{h.name}</Typography>
                    <Typography color="text.secondary">
                      {formatDate(h.date)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => setEditHoliday(h)}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={async () => {
                        await HolidayAPI.remove(h.id, groupId!); 
                        load();
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create Dialog */}
      <HolidayCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
        groupId={groupId!} 
      />

      {/* Edit Dialog */}
      {editHoliday && (
        <HolidayEditDialog
          holiday={editHoliday}
          onClose={() => setEditHoliday(null)}
          onUpdated={load}
          groupId={groupId!} 
        />
      )}
    </Box>
  );
}
