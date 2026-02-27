import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Groups from "../pages/Groups";
import Teams from "../pages/Teams";
import Rotations from "../pages/Rotations";
import Holidays from "../pages/Holidays";
import Schedule from "../pages/Schedule";
import Members from "../pages/Members";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/members" element={<Members />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/rotations" element={<Rotations />} />
      <Route path="/holidays" element={<Holidays />} />
      <Route path="/schedule" element={<Schedule />} />
    </Routes>
  );
}

export default AppRoutes;