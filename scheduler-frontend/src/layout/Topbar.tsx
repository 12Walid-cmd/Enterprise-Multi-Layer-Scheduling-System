import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";

export default function Topbar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "white",
        color: "black",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Enterprise Scheduler</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography>Wei</Typography>
          <Avatar sx={{ bgcolor: "primary.main" }}>W</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}