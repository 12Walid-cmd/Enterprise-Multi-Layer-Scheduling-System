import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(u.role || null);
    } catch {
      setUserRole(null);
    }
  }, []);

  return (
    <div
      className="sidebar"
      style={{
        width: "240px",
        minHeight: "calc(100vh - 70px)"
      }}
    >

      <NavLink to="/" className="nav-link">
        🏠 Dashboard
      </NavLink>

      <NavLink to="/members" className="nav-link">
        👤 Members
      </NavLink>

      <NavLink to="/teams" className="nav-link">
        👥 Teams
      </NavLink>

      <NavLink to="/rotations" className="nav-link">
        🔄 Rotations
      </NavLink>

      <NavLink to="/schedule" className="nav-link">
        📅 Schedules
      </NavLink>

      <NavLink to="/holidays" className="nav-link">
        🎉 Holidays
      </NavLink>

      {userRole === 'administrator' && (
        <NavLink to="/users" className="nav-link">
          👨‍💼 User Management
        </NavLink>
      )}

      <NavLink to="/settings" className="nav-link">
        ⚙️ Settings
      </NavLink>
    </div>
  );
}

export default Sidebar;