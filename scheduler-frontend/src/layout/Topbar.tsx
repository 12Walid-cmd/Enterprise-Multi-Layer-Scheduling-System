import { AppBar, Toolbar, Typography, Box, Avatar, Button } from "@mui/material";
import cgiLogo from "../assets/cgi-logo.png";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  const fullName = user ? `${user.first_name} ${user.last_name}` : "Guest";
  const role = user?.roles?.[0] ?? "User";
  const avatarLetter = user?.first_name?.[0]?.toUpperCase() ?? "U";

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

        {/* Logo */}
        <Box
          component="img"
          src={cgiLogo}
          alt="Logo"
          sx={{ height: 36, width: "auto" }}
        />

        {/* Right side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Role + Name */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",   
              alignItems: "center",   
              gap: 2                 
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "1.2rem" }}
            >
              {role}
            </Typography>

            <Typography
              fontWeight={700}
              sx={{ fontSize: "1.45rem", lineHeight: 1 }}
            >
              {fullName}
            </Typography>
          </Box>




          <Avatar sx={{ bgcolor: "primary.main" }}>{avatarLetter}</Avatar>

          <Button
            variant="outlined"
            size="small"
            onClick={logout}
            sx={{ textTransform: "none" }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}