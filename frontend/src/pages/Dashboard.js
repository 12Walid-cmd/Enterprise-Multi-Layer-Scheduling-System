import React, { useState, useEffect } from "react";
import api from "../api/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeRotations: 0,
    pendingApprovals: 0,
    activeConflicts: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };
  
  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <p className="text-muted">
          Welcome back! Here's an overview of your scheduling system.
        </p>
      </div>

      {/* Stats Section */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="dashboard-card">
            <div className="stat-title">Total Teams</div>
            <div className="stat-number">{stats.totalTeams}</div>
            <small className="text-success">↑ 2 new this month</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card">
            <div className="stat-title">Active Rotations</div>
            <div className="stat-number">{stats.activeRotations}</div>
            <small className="text-success">All running smoothly</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card">
            <div className="stat-title">Conflicts</div>
            <div className="stat-number">{stats.activeConflicts}</div>
            <small className="text-success">↑ 1 new this week</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card">
            <div className="stat-title">Pending Approvals</div>
            <div className="stat-number">{stats.pendingApprovals}</div>
            <small className="text-warning">Requires attention</small>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card mb-4">
        <h5 className="mb-4">Quick Actions</h5>

        <div className="row g-3">
          <div className="col-md-2">
            <div className="quick-action-box">➕<br/>Create Team</div>
          </div>

          <div className="col-md-2">
            <div className="quick-action-box">🔄<br/>Create Rotation</div>
          </div>

          <div className="col-md-2">
            <div className="quick-action-box">👤<br/>Add User</div>
          </div>

          <div className="col-md-2">
            <div className="quick-action-box">🎉<br/>Add Holiday</div>
          </div>

          <div className="col-md-2">
            <div className="quick-action-box">📊<br/>Generate Schedule</div>
          </div>

          <div className="col-md-2">
            <div className="quick-action-box">⚙️<br/>Generate Reports</div>
          </div>
        </div>
      </div>

      {/* Conflict Alerts Section */}
      <div className="dashboard-card mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">⚠️ Conflict Alerts</h5>
          <span className="badge bg-danger">2 Active</span>
        </div>

        <div className="list-group list-group-flush">

          {/* High Severity */}
          <div className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <strong className="text-danger">
                Overlapping Rotation Assignment
              </strong>
              <div className="small text-muted">
                John Doe assigned to two rotations at the same time.
              </div>
            </div>
            <span className="badge bg-danger">High</span>
          </div>

          {/* Medium Severity */}
          <div className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <strong className="text-warning">
                Minimum Staffing Not Met
              </strong>
              <div className="small text-muted">
                "Platform Engineering" has only 1 assigned member.
              </div>
            </div>
            <span className="badge bg-warning text-dark">Medium</span>
          </div>

        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-4 shadow-sm">
        <h5 className="mb-3">Recent Activity</h5>

        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            👥 New team created: "Platform Engineering"
          </li>
          <li className="list-group-item">
            🔄 Rotation updated: "CDO On-Call Rotation"
          </li>
          <li className="list-group-item">
            📅 Schedule generated: "Q2 2026 Mountain Rotation"
          </li>
          <li className="list-group-item">
            🏖️ Leave request pending approval
          </li>
          <li className="list-group-item">
            🎉 Holiday added: "Canada Day"
          </li>
        </ul>
      </div>
    </>
  );
}

export default Dashboard;