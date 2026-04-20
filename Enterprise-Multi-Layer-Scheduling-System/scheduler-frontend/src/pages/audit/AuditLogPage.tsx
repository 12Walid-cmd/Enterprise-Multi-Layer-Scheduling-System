// src/pages/AuditLogPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
} from "@mui/material";
import { AuditLogAPI } from "../../api";
import type { AuditLog } from "../../types/auditlog";

const ENTITY_TYPES = [
  "group",
  "team",
  "domain",
  "domainTeam",
  "leave",
  "rotation",
  "holiday",
  "tier",
  "rule",
];

const ACTION_TYPES = [
  "approved",
  "cancelled",
  "created",
  "deleted",
  "member_added",
  "member_removed",
  "members_reordered",
  "rejected",
  "requested",
  "updated",
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [actionType, setActionType] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const data = await AuditLogAPI.getAll();
    setLogs(data);
    setLoading(false);
  };

  const applyFilter = async () => {
    setLoading(true);

    const data = await AuditLogAPI.filter({
      entity_type: entityType || undefined,
      entity_id: entityId || undefined,
      action: actionType || undefined,
    });

    setLogs(data);
    setLoading(false);
  };

  const reset = () => {
    setEntityType("");
    setEntityId("");
    setActionType("");
    loadAll();
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Audit Logs
        </Typography>
      </Stack>

      {/* Filter Section */}
      <Stack direction="row" spacing={2} mb={2}>
        {/* Entity Type */}
        <TextField
          select
          label="Entity Type"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {ENTITY_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        {/* Entity ID */}
        <TextField
          label="Entity ID"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        />

        {/* Action Type */}
        <TextField
          select
          label="Action"
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {ACTION_TYPES.map((action) => (
            <MenuItem key={action} value={action}>
              {action}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={applyFilter}>
          FILTER
        </Button>

        <Button variant="outlined" onClick={reset}>
          Reset
        </Button>
      </Stack>

      {/* Logs */}
      <Stack spacing={1}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography fontWeight={600}>{log.action}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.entity_type} · {log.entity_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  </Box>

                  {log.details && (
                    <Typography
                      variant="body2"
                      sx={{ maxWidth: 320, whiteSpace: "pre-wrap" }}
                    >
                      {JSON.stringify(log.details, null, 2)}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}