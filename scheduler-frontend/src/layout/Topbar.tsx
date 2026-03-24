import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";
import cgiLogo from "../assets/cgi-logo.png";

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
        <Box
          component="img"
          src={cgiLogo}          
          alt="Logo"
          sx={{
            height: 36,          
            width: "auto",       
          }}
        />


        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography>Wei</Typography>
          <Avatar sx={{ bgcolor: "primary.main" }}>W</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}