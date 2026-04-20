import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function RootLayout() {
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />

      {/* Left Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // prevents flex overflow
        }}
      >
        {/* Top Navigation */}
        <Topbar />

        {/* Scrollable Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}