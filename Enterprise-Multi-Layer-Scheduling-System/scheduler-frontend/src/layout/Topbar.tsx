import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  Typography,
  IconButton,
  InputBase,
  Paper,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";


import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : "Guest";

  const role = user?.roles?.[0]?.name ?? "User";

  const avatarLetter =
    user?.first_name?.[0]?.toUpperCase() ?? "U";

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
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* 🔍 Search */}
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 0.5,
            width: 320,
            borderRadius: 2,
            bgcolor: "#f3f4f6",
          }}
        >
          <SearchIcon fontSize="small" />
          <InputBase
            placeholder="Search users, teams, rotations..."
            sx={{ ml: 1, flex: 1, fontSize: 14 }}
          />
        </Paper>

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* 🔔 Notifications */}
          <IconButton>
            <NotificationsNoneIcon />
          </IconButton>

          {/* 👤 User */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              px: 1,
              py: 0.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#f3f4f6",
              },
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {avatarLetter}
            </Avatar>

            <Box>
              <Typography fontSize={13} fontWeight={600}>
                {fullName}
              </Typography>
              <Typography
                fontSize={11}
                color="text.secondary"
              >
                {role}
              </Typography>
            </Box>

            <KeyboardArrowDownIcon fontSize="small" />
          </Box>

          {/* Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem disabled>{fullName}</MenuItem>
            <Divider />

        
            <MenuItem
              onClick={() => {
                handleClose();
                navigate(`/users/${user.id}`);
              }}
            >
              Profile
            </MenuItem>


            <MenuItem onClick={handleClose}>
              Settings
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={() => {
                handleClose();
                logout();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}