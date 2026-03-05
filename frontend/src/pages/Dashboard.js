import React, { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeRotations: 0,
    pendingApprovals: 0,
    activeConflicts: 0
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

  const conflicts = [
    {
      id: 1,
      title: "Overlapping Rotation Assignment",
      description: "John Doe assigned to two rotations at the same time.",
      severity: "High",
      severityClass: "danger"
    },
    {
      id: 2,
      title: "Minimum Staffing Not Met",
      description: '"Platform Engineering" has only 1 assigned member.',
      severity: "Medium",
      severityClass: "warning"
    }
  ];

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
          <span className="badge bg-danger">{conflicts.length} Active</span>
        </div>

        <div className="list-group list-group-flush">
          {conflicts.map((conflict) => (
            <div 
              key={conflict.id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div>
                <strong className={`text-${conflict.severityClass}`}>
                  {conflict.title}
                </strong>
                <div className="small text-muted">
                  {conflict.description}
                </div>
              </div>
              <span className={`badge bg-${conflict.severityClass} ${conflict.severityClass === 'warning' ? 'text-dark' : ''}`}>
                {conflict.severity}
              </span>
            </div>
          ))}
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