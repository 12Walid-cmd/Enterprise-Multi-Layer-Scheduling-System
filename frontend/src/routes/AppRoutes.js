import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Groups from "../pages/Groups";
import Teams from "../pages/Teams";
import Rotations from "../pages/Rotations";
import Holidays from "../pages/Holidays";
import Schedule from "../pages/Schedule";
import Members from "../pages/Members";
import UserManagement from "../pages/UserManagement";
import Login from "../pages/Login";
import ChangePassword from "../pages/ChangePassword";

function hasAuthSession() {
  return Boolean(localStorage.getItem("accessToken"));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function ProtectedRoute({ children }) {
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ role, roles, children }) {
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />;
  }
  const user = getCurrentUser();
  const allowedRoles = Array.isArray(roles)
    ? roles
    : role
      ? [role]
      : [];

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  if (hasAuthSession()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route
        path="/members"
        element={
          <RoleRoute roles={["administrator", "rotation_owner", "team_lead"]}>
            <Members />
          </RoleRoute>
        }
      />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
      <Route path="/rotations" element={<ProtectedRoute><Rotations /></ProtectedRoute>} />
      <Route path="/holidays" element={<ProtectedRoute><Holidays /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      <Route path="/users" element={<RoleRoute role="administrator"><UserManagement /></RoleRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="*" element={<Navigate to={hasAuthSession() ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default AppRoutes;