import { useEffect, useState } from "react";
import { DomainAPI } from "../../../api";
import type { Domain } from "../../../types/domain";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function DomainsListPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    DomainAPI.getAll().then((res) => {
      setDomains(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Business Domains</Typography>
        <Button variant="contained" onClick={() => navigate("/domains/create")}>
          Create Domain
        </Button>
      </Stack>

      <Stack spacing={2}>
        {domains.map((d) => (
          <Card
            key={d.id}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/domains/${d.id}`)}
          >
            <CardContent>
              <Typography variant="h6">{d.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {d.description || "No description"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}