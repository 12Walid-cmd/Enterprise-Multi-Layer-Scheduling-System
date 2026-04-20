import { useState, useMemo } from "react";
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
  Divider,
} from "@mui/material";

import {
  Groups,
  Group,
  People,
  Shield,
  Person,
  Autorenew,
  CalendarMonth,
  Business,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

import { NavLink, useLocation } from "react-router-dom";
import cgiLogo from "../assets/cgi-logo.png";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 260;

type MenuItem = {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};


const menu: MenuItem[] = [
  {
    label: "Organization",
    icon: <Groups />,
    children: [
      { label: "Groups", path: "/groups", icon: <Group /> },
      { label: "Teams", path: "/teams", icon: <People /> },
      { label: "Sub Teams", path: "/sub-teams", icon: <People /> },
      { label: "Domains", path: "/domains", icon: <Business /> },
    ],
  },
  {
    label: "Users",
    icon: <Person />,
    children: [{ label: "User Management", path: "/users", icon: <People /> }],
  },
  {
    label: "Roles",
    icon: <Shield />,
    children: [
      { label: "Team Roles", path: "/roles/team-types", icon: <Shield /> },
      { label: "Global Roles", path: "/roles/global-types", icon: <Shield /> },
      { label: "Permissions", path: "/permissions", icon: <Shield /> },
    ],
  },
  {
    label: "Rotations",
    icon: <Autorenew />,
    children: [
      { label: "Rotation Definitions", path: "/rotations", icon: <Autorenew /> },
    ],
  },
  {
    label: "Schedule",
    icon: <CalendarMonth />,
    children: [
      { label: "Calendar View", path: "/schedule", icon: <CalendarMonth /> },
      { label: "Holidays", path: "/groups/:groupId/holidays", icon: <CalendarMonth /> },
    ],
  },
  {
    label: "Leave",
    icon: <CalendarMonth />,
    children: [
      { label: "My Leaves", path: "/leave", icon: <CalendarMonth /> },
      { label: "Approvals", path: "/leave/approvals", icon: <Shield /> },
    ],
  },
  {
    label: "Audit",
    children: [{ label: "Audit Logs", path: "/audit-logs", icon: <Shield /> }],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();


  if (!user) return null;
  const groupId = user.scope?.group_ids?.[0];
  const initialOpen = useMemo(() => {
    const state: Record<string, boolean> = {};

    menu.forEach((section) => {
      if (
        section.children?.some((item) =>
          location.pathname.startsWith(item.path || "")
        )
      ) {
        state[section.label] = true;
      }
    });

    return state;
  }, [location.pathname]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  const toggle = (label: string) => {
    setOpen((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#020617",
          color: "#ffffff",
          borderRight: "1px solid #111827",
        },
      }}
    >
      <Toolbar sx={{ px: 2 }}>
        <Box component="img" src={cgiLogo} sx={{ height: 28, mr: 1 }} />
        <Typography fontWeight={700} fontSize={25}>
          Scheduler
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: "#111827" }} />

      <List sx={{ px: 1, mt: 1 }}>
        {menu.map((section) => (
          <Box key={section.label}>
            <ListItemButton
              onClick={() => toggle(section.label)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&:hover": { bgcolor: "#111827" },
              }}
            >
              {section.icon && (
                <ListItemIcon sx={{ color: "#cbd5e1", minWidth: 36 }}>
                  {section.icon}
                </ListItemIcon>
              )}

              <ListItemText
                primary={section.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: 1,
                      color: "#94a3b8",
                    },
                  },
                }}
              />

              {open[section.label] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={open[section.label]} timeout="auto" unmountOnExit>
              {section.children?.filter((item) => {
                if (item.path?.includes(":groupId") && !groupId) {
                  return false;
                }
                return true;
              })
                .map((item) => {
                  const realPath = item.path
                    ? item.path.replace(":groupId", groupId ?? "")
                    : item.path;


                  return (
                    <ListItemButton
                      key={realPath}
                      component={NavLink}
                      to={realPath!}
                      end
                      sx={{
                        position: "relative",
                        pl: 4,
                        borderRadius: 2,
                        mx: 1,
                        mb: 0.5,
                        "&:hover": { bgcolor: "#111827" },
                        "&.active": {
                          bgcolor: "#2563eb",
                          color: "#ffffff",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 6,
                            bottom: 6,
                            width: 3,
                            borderRadius: 2,
                            bgcolor: "#3b82f6",
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: 16,
                              fontWeight: 500,
                              color: "#e5e7eb",
                            },
                          },
                        }}
                      />
                    </ListItemButton>
                  );
                })}
            </Collapse>
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
