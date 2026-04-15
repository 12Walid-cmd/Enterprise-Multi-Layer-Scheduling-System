import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeRotations: 0,
    pendingApprovals: 0,
    activeConflicts: 0,
    conflicts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
      // Set default values on error
      setStats({
        totalTeams: 12,
        activeRotations: 8,
        pendingApprovals: 3,
        activeConflicts: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: "➕", label: "Create Team", action: () => console.log("Create Team") },
    { icon: "🔄", label: "Create Rotation", action: () => console.log("Create Rotation") },
    { icon: "👤", label: "Add User", action: () => console.log("Add User") },
    { icon: "🎉", label: "Add Holiday", action: () => console.log("Add Holiday") },
    { icon: "📊", label: "Generate Schedule", action: () => console.log("Generate Schedule") },
    { icon: "⚙️", label: "Generate Reports", action: () => console.log("Generate Reports") }
  ];

  const severityClass = (s) => {
    if ((s || "").toUpperCase() === "HIGH")   return "danger";
    if ((s || "").toUpperCase() === "MEDIUM") return "warning";
    return "info";
  };

  const conflictTitle = (type) => {
    const map = {
      OVERLAPPING_ROTATION: "Overlapping Rotation Assignment",
      UNDERSTAFFED:         "Minimum Staffing Not Met",
    };
    return map[type] || type;
  };

  const recentActivities = [
    { icon: "👥", text: 'New team created: "Platform Engineering"', time: "2 hours ago" },
    { icon: "🔄", text: 'Rotation updated: "CDO On-Call Rotation"', time: "5 hours ago" },
    { icon: "📅", text: 'Schedule generated: "Q2 2026 Mountain Rotation"', time: "Yesterday" },
    { icon: "🏖️", text: "Leave request pending approval", time: "2 days ago" },
    { icon: "🎉", text: 'Holiday added: "Canada Day"', time: "3 days ago" }
  ];

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <p className="text-muted">
          Welcome back! Here's an overview of your scheduling system.
        </p>
      </div>

      {/* Stats Section */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="dashboard-card stat-card-wrapper">
            <div className="stat-title">Total Teams</div>
            <div className="stat-number">
              {loading ? "..." : stats.totalTeams}
            </div>
            <small className="text-success">↑ 2 new this month</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card stat-card-wrapper">
            <div className="stat-title">Active Rotations</div>
            <div className="stat-number">
              {loading ? "..." : stats.activeRotations}
            </div>
            <small className="text-success">All running smoothly</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card stat-card-wrapper">
            <div className="stat-title">Conflicts</div>
            <div className="stat-number">
              {loading ? "..." : stats.activeConflicts}
            </div>
            <small className="text-success">↓ 1 resolved today</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card stat-card-wrapper">
            <div className="stat-title">Pending Approvals</div>
            <div className="stat-number">
              {loading ? "..." : stats.pendingApprovals}
            </div>
            <small className="text-warning">Requires attention</small>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card mb-4">
        <h5 className="mb-4">Quick Actions</h5>

        <div className="row g-3">
          {quickActions.map((action, index) => (
            <div className="col-md-2" key={index}>
              <div 
                className="quick-action-box"
                onClick={action.action}
                role="button"
                tabIndex={0}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                  {action.icon}
                </div>
                <div style={{ fontSize: "14px" }}>
                  {action.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conflict Alerts Section */}
      <div className="dashboard-card mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">⚠️ Conflict Alerts</h5>
          <span className="badge bg-danger">{stats.activeConflicts} Active</span>
        </div>

        <div className="list-group list-group-flush">
          {loading ? (
            <div className="small text-muted">Loading...</div>
          ) : stats.conflicts.length === 0 ? (
            <div className="small text-muted">No open conflicts</div>
          ) : (
            stats.conflicts.map((c) => {
              const cls = severityClass(c.severity);
              return (
                <div
                  key={c.id}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div>
                    <strong className={`text-${cls}`}>
                      {conflictTitle(c.conflict_type)}
                    </strong>
                    <div className="small text-muted">
                      {c.details?.description || `${c.first_name} ${c.last_name} — ${c.rotation_name}`}
                    </div>
                  </div>
                  <span className={`badge bg-${cls}${cls === "warning" ? " text-dark" : ""}`}>
                    {c.severity}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-4">
        <h5 className="mb-3">Recent Activity</h5>

        <ul className="list-group list-group-flush">
          {recentActivities.map((activity, index) => (
            <li key={index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <span style={{ marginRight: "8px" }}>{activity.icon}</span>
                  {activity.text}
                </span>
                <small className="text-muted">{activity.time}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;