import { useState } from "react";
import { DomainAPI } from "../../../api";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateDomainPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exclusive, setExclusive] = useState(false);

  const handleSubmit = async () => {
    await DomainAPI.create({ name, description, exclusive });
    navigate("/domains");
  };

  return (
    <Box p={3} maxWidth={600}>
      <Typography variant="h4" mb={3}>
        Create Business Domain
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Domain Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={exclusive}
              onChange={(e) => setExclusive(e.target.checked)}
            />
          }
          label="Exclusive Domain (users cannot join multiple domain rotations)"
        />

        <Button variant="contained" onClick={handleSubmit}>
          Create
        </Button>
      </Stack>
    </Box>
  );
}