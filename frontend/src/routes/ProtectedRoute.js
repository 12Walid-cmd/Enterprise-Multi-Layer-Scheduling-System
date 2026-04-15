import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, blockedRoles = [] }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "Individual";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (blockedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
