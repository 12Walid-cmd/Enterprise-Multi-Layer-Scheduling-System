import { useState } from "react";
import {
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import GroupIcon from "@mui/icons-material/Group";
import PeopleIcon from "@mui/icons-material/People";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonIcon from "@mui/icons-material/Person";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { NavLink } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar() {
  const [openOrg, setOpenOrg] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          background: "#1f1f2e",
          color: "white",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6">Scheduler</Typography>
      </Toolbar>

      <List>

        {/* ============================
            Organization Management
        ============================ */}
        <ListItemButton onClick={() => setOpenOrg(!openOrg)}>
          <ListItemIcon sx={{ color: "white" }}>
            <GroupsIcon />
          </ListItemIcon>
          <ListItemText primary="Organization Management" />
          {openOrg ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openOrg} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton component={NavLink} to="/groups" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Groups" />
            </ListItemButton>

            <ListItemButton component={NavLink} to="/teams" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Teams" />
            </ListItemButton>

            {/* Sub-teams  */}
            <ListItemButton component={NavLink} to="/teams" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Sub-teams" />
            </ListItemButton>


            <ListItemButton component={NavLink} to="/roles/team-types" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <ShieldIcon />
              </ListItemIcon>
              <ListItemText primary="Team Role Types" />
            </ListItemButton>

            <ListItemButton component={NavLink} to="/roles/global-types" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <ShieldIcon />
              </ListItemIcon>
              <ListItemText primary="Global Role Types" />
            </ListItemButton>

          </List>
        </Collapse>

        {/* ============================
            User Management
        ============================ */}
        <ListItemButton onClick={() => setOpenUser(!openUser)}>
          <ListItemIcon sx={{ color: "white" }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="User Management" />
          {openUser ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openUser} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            {/* Users List */}
            <ListItemButton component={NavLink} to="/users" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>

            {/* Create User */}
            <ListItemButton component={NavLink} to="/users/create" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Create User" />
            </ListItemButton>

          </List>
        </Collapse>

      </List>
    </Drawer>
  );
}