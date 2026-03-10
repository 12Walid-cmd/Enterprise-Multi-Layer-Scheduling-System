import { useEffect, useState } from "react";
import { GlobalRoleTypesAPI } from "../../../../api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function EditGlobalRoleTypePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GlobalRoleTypesAPI.getOne(id!).then((data) => {
      setForm({
        code: data.code,
        name: data.name,
        description: data.description ?? "",
      });
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    await GlobalRoleTypesAPI.update(id!, form);
    navigate("/roles/global-types");
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Edit Global Role Type
      </Typography>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Code"
          sx={{ mb: 2 }}
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />

        <TextField
          fullWidth
          label="Name"
          sx={{ mb: 2 }}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          sx={{ mb: 2 }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </Paper>
    </Box>
  );
}