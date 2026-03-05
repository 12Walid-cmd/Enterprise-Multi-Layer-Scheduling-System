import { useEffect, useState } from "react";
import { RoleTypesAPI } from "../../../api";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function RoleTypesList() {
  const [roles, setRoles] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    RoleTypesAPI.getAll().then(setRoles);
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Role Types</Typography>
        <Button variant="contained" onClick={() => navigate("/roles/types/create")}>
          Create Role Type
        </Button>
      </Box>

      {roles.map((role) => (
        <Paper
          key={role.id}
          sx={{ p: 2, mb: 2, cursor: "pointer" }}
          onClick={() => navigate(`/roles/types/${role.id}`)}
        >
          <Typography variant="h6">{role.name}</Typography>
          <Typography variant="body2">{role.description}</Typography>
        </Paper>
      ))}
    </Box>
  );
}