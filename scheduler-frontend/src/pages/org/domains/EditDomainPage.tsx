import { useEffect, useState } from "react";
import { DomainAPI } from "../../../api";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

export default function EditDomainPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState<any>(null);

  useEffect(() => {
    DomainAPI.getOne(id!).then((res) => {
      setDomain(res);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    await DomainAPI.update(id!, {
      name: domain.name,
      description: domain.description,
      exclusive: domain.exclusive,
    });
    navigate(`/domains/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth={600}>
      <Typography variant="h4" mb={3}>
        Edit Domain
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Domain Name"
          value={domain.name}
          onChange={(e) => setDomain({ ...domain, name: e.target.value })}
          fullWidth
        />

        <TextField
          label="Description"
          value={domain.description}
          onChange={(e) => setDomain({ ...domain, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={domain.exclusive}
              onChange={(e) =>
                setDomain({ ...domain, exclusive: e.target.checked })
              }
            />
          }
          label="Exclusive Domain"
        />

        <Button variant="contained" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
}