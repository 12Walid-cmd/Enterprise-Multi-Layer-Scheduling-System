import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupIcon from "@mui/icons-material/Group";
import PeopleIcon from "@mui/icons-material/People";
import ShieldIcon from "@mui/icons-material/Shield";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { NavLink } from "react-router-dom";
import { useState } from "react";

const drawerWidth = 240;

export default function Sidebar() {
  const [openOrg, setOpenOrg] = useState(false);

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

        {/* Organization Management (Parent) */}
        <ListItemButton onClick={() => setOpenOrg(!openOrg)}>
          <ListItemIcon sx={{ color: "white" }}>
            <GroupsIcon />
          </ListItemIcon>
          <ListItemText primary="Organization Management" />
          {openOrg ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        {/* Submenu */}
        <Collapse in={openOrg} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton
              component={NavLink}
              to="/groups"
              sx={{ pl: 4 }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Groups" />
            </ListItemButton>

            <ListItemButton
              component={NavLink}
              to="/teams"
              sx={{ pl: 4 }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Teams" />
            </ListItemButton>

            <ListItemButton
              component={NavLink}
              to="/roles/types"
              sx={{ pl: 4 }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <ShieldIcon />
              </ListItemIcon>
              <ListItemText primary="Roles" />
            </ListItemButton>

          </List>
        </Collapse>

      </List>
    </Drawer>
  );
}