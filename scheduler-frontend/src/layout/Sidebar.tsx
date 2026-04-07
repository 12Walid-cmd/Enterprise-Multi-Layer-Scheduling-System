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
  Box,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import GroupIcon from "@mui/icons-material/Group";
import PeopleIcon from "@mui/icons-material/People";
import ShieldIcon from "@mui/icons-material/Shield";
import PersonIcon from "@mui/icons-material/Person";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import BusinessIcon from "@mui/icons-material/Business";

import cgiLogo from "../assets/cgi-logo.png";

import { NavLink } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar() {
  const [openOrg, setOpenOrg] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openRotation, setOpenRotation] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);
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
        <Box
          component="img"
          src={cgiLogo}
          alt="Logo"
          sx={{ height: 32, width: 'auto', mr: 1, }}
        />
        <Typography variant="h6">Scheduler</Typography>
      </Toolbar>

      <List>

        {/* ============================
            ORGANIZATION
        ============================ */}
        <ListItemButton onClick={() => setOpenOrg(!openOrg)}>
          <ListItemIcon sx={{ color: "white" }}>
            <GroupsIcon />
          </ListItemIcon>
          <ListItemText primary="ORGANIZATION" />
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

            <ListItemButton component={NavLink} to="/domains" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="Domains" />
            </ListItemButton>


            <ListItemButton component={NavLink} to="/roles/team-types" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <ShieldIcon />
              </ListItemIcon>
              <ListItemText primary="Team Role" />
            </ListItemButton>

            <ListItemButton component={NavLink} to="/roles/global-types" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <ShieldIcon />
              </ListItemIcon>
              <ListItemText primary="Global Role" />
            </ListItemButton>

          </List>
        </Collapse>

        {/* ============================
            USER
        ============================ */}
        <ListItemButton onClick={() => setOpenUser(!openUser)}>
          <ListItemIcon sx={{ color: "white" }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="USER" />
          {openUser ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openUser} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton component={NavLink} to="/users" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>

          </List>
        </Collapse>

        {/* ============================
            ROTATION
        ============================ */}
        <ListItemButton onClick={() => setOpenRotation(!openRotation)}>
          <ListItemIcon sx={{ color: "white" }}>
            <AutorenewIcon />
          </ListItemIcon>
          <ListItemText primary="ROTATION" />
          {openRotation ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openRotation} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton component={NavLink} to="/rotations" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <AutorenewIcon />
              </ListItemIcon>
              <ListItemText primary="Definitions" />
            </ListItemButton>

          </List>
        </Collapse>


        {/* ============================
            SCHEDULE  
        ============================ */}
        <ListItemButton onClick={() => setOpenSchedule(!openSchedule)}>
          <ListItemIcon sx={{ color: "white" }}>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText primary="SCHEDULE" />
          {openSchedule ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openSchedule} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton component={NavLink} to="/schedule" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="View" />
            </ListItemButton>

            <ListItemButton component={NavLink} to="/holidays" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Holidays" />
            </ListItemButton>

          </List>
        </Collapse>

        {/* ============================
          LEAVE
          ============================ */}
        <ListItemButton onClick={() => setOpenLeave(!openLeave)}>
          <ListItemIcon sx={{ color: "white" }}>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText primary="LEAVE" />
          {openLeave ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openLeave} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItemButton component={NavLink} to="/leave" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="My Leaves" />
            </ListItemButton>

            <ListItemButton component={NavLink} to="/leave/approvals" sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: "white" }}>
                <ShieldIcon />
              </ListItemIcon>
              <ListItemText primary="Approvals" />
            </ListItemButton>

          </List>
        </Collapse>
        {/* ============================
          Audit Logs
          ============================ */}
        <ListItemButton component={NavLink} to="/audit-logs" sx={{ pl: 4 }}>
          <ListItemIcon sx={{ color: "white" }}>
            <ShieldIcon />
          </ListItemIcon>
          <ListItemText primary="Audit Logs" />
        </ListItemButton>

      </List>
    </Drawer>
  );
}