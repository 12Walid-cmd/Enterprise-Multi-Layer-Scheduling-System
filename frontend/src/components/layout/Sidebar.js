import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div
      className="sidebar"
      style={{
        width: "240px",
        minHeight: "calc(100vh - 70px)"
      }}
    >

      <NavLink to="/" className="nav-link">
        Dashboard
      </NavLink>

      <NavLink to="/members" className="nav-link">
        Members
      </NavLink>

      <NavLink to="/teams" className="nav-link">
        Teams
      </NavLink>

      <NavLink to="/rotations" className="nav-link">
        Rotations
      </NavLink>

      <NavLink to="/schedule" className="nav-link">
        Schedules
      </NavLink>

      <NavLink to="/holidays" className="nav-link">
        Holidays
      </NavLink>

      <NavLink to="/settings" className="nav-link">
        Settings
      </NavLink>
    </div>
  );
}

export default Sidebar;