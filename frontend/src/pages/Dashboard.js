import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/dashboard.css";

function getDateParts() {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  end.setDate(end.getDate() + 13);
  return {
    today: now.toISOString().split("T")[0],
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function isDateInRange(day, start, end) {
  if (!day || !start || !end) return false;
  const normalizedDay = String(day).split("T")[0];
  const normalizedStart = String(start).split("T")[0];
  const normalizedEnd = String(end).split("T")[0];
  return normalizedDay >= normalizedStart && normalizedDay <= normalizedEnd;
}

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Individual";
  const isIndividual = role === "Individual";
  const isTeamLeader = role === "Team Leader";
  const isRotationOwner = role === "Rotation Owner";
  const userId = localStorage.getItem("userId");

  const [stats, setStats] = useState({
    totalTeams: 0,
    activeRotations: 0,
    pendingApprovals: 0,
    activeConflicts: 0
  });
  const [adminConflicts, setAdminConflicts] = useState([]);
  const [adminActivity, setAdminActivity] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const activityLimit = 5;
  const [individualData, setIndividualData] = useState({
    assignments: [],
    leaveRequests: [],
  });
  const [teamLeaderData, setTeamLeaderData] = useState({
    teams: [],
    members: [],
    assignments: [],
    leaveRequests: [],
    conflicts: [],
  });
  const [rotationOwnerData, setRotationOwnerData] = useState({
    rotations: [],
    members: [],
    assignments: [],
    coverageGaps: [],
    conflicts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isIndividual) {
      fetchIndividualDashboard();
      return;
    }
    if (isRotationOwner) {
      fetchRotationOwnerDashboard();
      return;
    }
    if (isTeamLeader) {
      fetchTeamLeaderDashboard();
      return;
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIndividual, isRotationOwner, isTeamLeader, userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, conflictsRes, activityRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/conflicts"),
        api.get("/dashboard/activity"),
      ]);
      setStats(statsRes.data);
      setAdminConflicts(Array.isArray(conflictsRes.data) ? conflictsRes.data : []);
      const actData = activityRes.data || {};
      setAdminActivity(Array.isArray(actData.rows) ? actData.rows : Array.isArray(actData) ? actData : []);
      setActivityTotalPages(actData.totalPages || 1);
      setActivityTotal(actData.total || 0);
      setActivityPage(1);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setStats({ totalTeams: 0, activeRotations: 0, pendingApprovals: 0, activeConflicts: 0 });
      setAdminConflicts([]);
      setAdminActivity([]);
      setActivityTotalPages(1);
      setActivityTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndividualDashboard = async () => {
    try {
      setLoading(true);
      if (!userId) {
        setIndividualData({ assignments: [], leaveRequests: [] });
        return;
      }

      const dateParts = getDateParts();
      const response = await api.get("/schedules", {
        params: {
          startDate: dateParts.start,
          endDate: dateParts.end,
        },
      });

      const assignments = (response.data?.assignments || []).filter(
        (assignment) => String(assignment.user_id) === String(userId)
      );
      const leaveRequests = (response.data?.leaveRequests || []).filter(
        (leaveRequest) => String(leaveRequest.user_id) === String(userId)
      );

      setIndividualData({ assignments, leaveRequests });
    } catch (error) {
      console.error("Failed to load individual dashboard data", error);
      setIndividualData({ assignments: [], leaveRequests: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamLeaderDashboard = async () => {
    try {
      setLoading(true);
      if (!userId) {
        setTeamLeaderData({ teams: [], members: [], assignments: [], leaveRequests: [], conflicts: [] });
        return;
      }

      const dateParts = getDateParts();
      const teamsResponse = await api.get("/teams");
      const allTeams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];

      const teamMemberResults = await Promise.all(
        allTeams.map(async (team) => {
          try {
            const membersResponse = await api.get(`/teams/${team.id}/members`);
            return {
              team,
              members: Array.isArray(membersResponse.data) ? membersResponse.data : [],
            };
          } catch (error) {
            console.error("Failed to load team members", error);
            return { team, members: [] };
          }
        })
      );

      const managedTeamEntries = teamMemberResults.filter(({ members }) =>
        members.some((member) => String(member.user_id) === String(userId))
      );

      const managedTeams = managedTeamEntries.map(({ team }) => team);
      const managedMembers = managedTeamEntries.flatMap(({ team, members }) =>
        members.map((member) => ({ ...member, teamId: team.id, teamName: team.name }))
      );

      const uniqueManagedMembers = Array.from(
        new Map(managedMembers.map((member) => [String(member.user_id), member])).values()
      );

      const teamIds = new Set(managedTeams.map((team) => String(team.id)));
      const memberIds = new Set(uniqueManagedMembers.map((member) => String(member.user_id)));

      const schedulesResponse = await api.get("/schedules", {
        params: {
          startDate: dateParts.start,
          endDate: dateParts.end,
        },
      });

      const assignments = (schedulesResponse.data?.assignments || []).filter((assignment) =>
        teamIds.has(String(assignment.team_id))
      );
      const leaveRequests = (schedulesResponse.data?.leaveRequests || []).filter((leaveRequest) =>
        memberIds.has(String(leaveRequest.user_id))
      );
      const managedTeamNames = new Set(managedTeams.map((team) => team.name));
      const conflicts = (schedulesResponse.data?.conflicts || []).filter((conflict) =>
        managedTeamNames.has(conflict.team_name)
      );

      setTeamLeaderData({
        teams: managedTeams,
        members: uniqueManagedMembers,
        assignments,
        leaveRequests,
        conflicts,
      });
    } catch (error) {
      console.error("Failed to load team leader dashboard data", error);
      setTeamLeaderData({ teams: [], members: [], assignments: [], leaveRequests: [], conflicts: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchRotationOwnerDashboard = async () => {
    try {
      setLoading(true);
      if (!userId) {
        setRotationOwnerData({ rotations: [], members: [], assignments: [], coverageGaps: [], conflicts: [] });
        return;
      }

      const dateParts = getDateParts();
      const [schedulesResponse, rotationsResponse] = await Promise.all([
        api.get("/schedules", {
          params: {
            startDate: dateParts.start,
            endDate: dateParts.end,
          },
        }),
        api.get("/rotations"),
      ]);

      const scheduleData = schedulesResponse.data || {};
      const allRotationMembers = Array.isArray(scheduleData.rotationMembers) ? scheduleData.rotationMembers : [];
      const allRotations = Array.isArray(rotationsResponse.data) ? rotationsResponse.data : [];

      const managedRotationIds = new Set(
        allRotationMembers
          .filter((member) => String(member.user_id) === String(userId))
          .map((member) => String(member.rotation_id))
      );

      const managedRotations = allRotations.filter((rotation) => managedRotationIds.has(String(rotation.id)));
      const managedRotationNames = new Set(managedRotations.map((rotation) => rotation.name));

      const rotationMembers = allRotationMembers.filter((member) =>
        managedRotationIds.has(String(member.rotation_id))
      );
      const assignments = (scheduleData.assignments || []).filter((assignment) =>
        managedRotationIds.has(String(assignment.rotation_id))
      );
      const coverageGaps = (scheduleData.coverageGaps || []).filter((gap) =>
        managedRotationIds.has(String(gap.rotation_id))
      );
      const conflicts = (scheduleData.conflicts || []).filter((conflict) =>
        managedRotationNames.has(conflict.rotation_name)
      );

      setRotationOwnerData({
        rotations: managedRotations,
        members: rotationMembers,
        assignments,
        coverageGaps,
        conflicts,
      });
    } catch (error) {
      console.error("Failed to load rotation owner dashboard data", error);
      setRotationOwnerData({ rotations: [], members: [], assignments: [], coverageGaps: [], conflicts: [] });
    } finally {
      setLoading(false);
    }
  };

  const individualSummary = useMemo(() => {
    const dateParts = getDateParts();
    const myAssignments = individualData.assignments || [];
    const myLeaveRequests = individualData.leaveRequests || [];

    const onCallToday = myAssignments.filter((assignment) =>
      isDateInRange(dateParts.today, assignment.assigned_start, assignment.assigned_end)
    ).length;

    const upcomingAssignments = [...myAssignments]
      .filter((assignment) => String(assignment.assigned_end).split("T")[0] >= dateParts.today)
      .sort(
        (left, right) =>
          new Date(left.assigned_start).getTime() - new Date(right.assigned_start).getTime()
      )
      .slice(0, 5);

    const pendingLeaveCount = myLeaveRequests.filter((leaveRequest) => leaveRequest.status === "PENDING").length;
    const approvedLeaveCount = myLeaveRequests.filter((leaveRequest) => leaveRequest.status === "APPROVED").length;

    return {
      assignmentCount: myAssignments.length,
      onCallToday,
      pendingLeaveCount,
      approvedLeaveCount,
      upcomingAssignments,
      myLeaveRequests: myLeaveRequests.slice(0, 5),
    };
  }, [individualData]);

  const teamLeaderSummary = useMemo(() => {
    const dateParts = getDateParts();
    const managedAssignments = teamLeaderData.assignments || [];
    const managedLeaveRequests = teamLeaderData.leaveRequests || [];
    const managedMembers = teamLeaderData.members || [];
    const managedTeams = teamLeaderData.teams || [];

    const onCallToday = managedAssignments.filter((assignment) =>
      isDateInRange(dateParts.today, assignment.assigned_start, assignment.assigned_end)
    ).length;

    const pendingApprovals = managedLeaveRequests.filter((leaveRequest) => leaveRequest.status === "PENDING");
    const approvedLeave = managedLeaveRequests.filter((leaveRequest) => leaveRequest.status === "APPROVED");

    const upcomingCoverage = [...managedAssignments]
      .filter((assignment) => String(assignment.assigned_end).split("T")[0] >= dateParts.today)
      .sort(
        (left, right) => new Date(left.assigned_start).getTime() - new Date(right.assigned_start).getTime()
      )
      .slice(0, 6);

    return {
      managedTeamCount: managedTeams.length,
      memberCount: managedMembers.length,
      pendingApprovalCount: pendingApprovals.length,
      approvedLeaveCount: approvedLeave.length,
      onCallToday,
      conflictCount: (teamLeaderData.conflicts || []).length,
      upcomingCoverage,
      pendingApprovals: pendingApprovals.slice(0, 5),
      managedTeams,
    };
  }, [teamLeaderData]);

  const rotationOwnerSummary = useMemo(() => {
    const dateParts = getDateParts();
    const managedAssignments = rotationOwnerData.assignments || [];
    const managedRotations = rotationOwnerData.rotations || [];
    const managedMembers = rotationOwnerData.members || [];
    const coverageGaps = rotationOwnerData.coverageGaps || [];
    const conflicts = rotationOwnerData.conflicts || [];

    const uniqueMembers = Array.from(
      new Map(managedMembers.map((member) => [String(member.user_id), member])).values()
    );

    const onCallToday = managedAssignments.filter((assignment) =>
      isDateInRange(dateParts.today, assignment.assigned_start, assignment.assigned_end)
    ).length;

    const upcomingAssignments = [...managedAssignments]
      .filter((assignment) => String(assignment.assigned_end).split("T")[0] >= dateParts.today)
      .sort(
        (left, right) => new Date(left.assigned_start).getTime() - new Date(right.assigned_start).getTime()
      )
      .slice(0, 6);

    return {
      managedRotationCount: managedRotations.length,
      memberCount: uniqueMembers.length,
      coverageGapCount: coverageGaps.length,
      conflictCount: conflicts.length,
      onCallToday,
      upcomingAssignments,
      coverageGaps: coverageGaps.slice(0, 5),
      managedRotations,
    };
  }, [rotationOwnerData]);

  const formatWindow = (startValue, endValue) => {
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const activityIcon = (type) => {
    const icons = { member: "👤", rotation: "🔄", leave: "🏖️", team: "👥", holiday: "🎉", schedule: "📊" };
    return icons[type] || "📋";
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const formatConflictType = (type) => {
    if (!type) return "Conflict";
    return type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  const conflictSeverityClass = (severity) => {
    if (severity === "HIGH") return "danger";
    if (severity === "MEDIUM") return "warning";
    return "info";
  };

  const quickActions = [
    { icon: "➕", label: "Create Team", action: () => navigate("/teams") },
    { icon: "🔄", label: "Create Rotation", action: () => navigate("/rotations") },
    { icon: "👤", label: "Add User", action: () => navigate("/members") },
    { icon: "🎉", label: "View Holidays", action: () => navigate("/holidays") },
    { icon: "📊", label: "Generate Schedule", action: () => navigate("/schedule") },
  ];

  const individualSignals = [
    {
      id: "on-call",
      title: "On-call status",
      description:
        individualSummary.onCallToday > 0
          ? "You are currently assigned on-call coverage today."
          : "You are not assigned for on-call coverage today.",
      severity: individualSummary.onCallToday > 0 ? "Active" : "Clear",
      severityClass: individualSummary.onCallToday > 0 ? "warning" : "success",
    },
    {
      id: "leave-pending",
      title: "Leave approvals",
      description:
        individualSummary.pendingLeaveCount > 0
          ? `${individualSummary.pendingLeaveCount} leave request(s) waiting for approval.`
          : "No pending leave approvals in the current window.",
      severity: individualSummary.pendingLeaveCount > 0 ? "Pending" : "Clear",
      severityClass: individualSummary.pendingLeaveCount > 0 ? "warning" : "success",
    },
  ];

  if (isIndividual) {
    return (
      <div className="dashboard-container">
        <div className="mb-4">
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Welcome back! Here is your personal scheduling overview for the next 14 days.</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">My Assignments</div>
              <div className="stat-number">{loading ? "..." : individualSummary.assignmentCount}</div>
              <small className="text-success">Next 14 days</small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">On Call Today</div>
              <div className="stat-number">{loading ? "..." : individualSummary.onCallToday}</div>
              <small className={individualSummary.onCallToday > 0 ? "text-warning" : "text-success"}>
                {individualSummary.onCallToday > 0 ? "Active today" : "No on-call shift today"}
              </small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Pending Leave</div>
              <div className="stat-number">{loading ? "..." : individualSummary.pendingLeaveCount}</div>
              <small className="text-warning">Awaiting approval</small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Approved Leave</div>
              <div className="stat-number">{loading ? "..." : individualSummary.approvedLeaveCount}</div>
              <small className="text-success">In current window</small>
            </div>
          </div>
        </div>

        <div className="dashboard-card mb-4">
          <h5 className="mb-4">Quick Actions</h5>
          <div className="row g-3">
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/schedule")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📅</div>
                <div style={{ fontSize: "14px" }}>View My Schedule</div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/holidays")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎉</div>
                <div style={{ fontSize: "14px" }}>View Holidays</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="dashboard-card mb-4">
              <h5 className="mb-3">Upcoming Assignments</h5>
              {loading ? (
                <p className="text-muted">Loading your assignments...</p>
              ) : individualSummary.upcomingAssignments.length === 0 ? (
                <p className="text-muted">No upcoming assignments in the selected window.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {individualSummary.upcomingAssignments.map((assignment) => (
                    <li key={assignment.assignment_id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <strong>{assignment.rotation_name || "Rotation"}</strong>
                          <span className="text-muted"> · {assignment.assignment_status || "ON_CALL"}</span>
                        </span>
                        <small className="text-muted">
                          {formatWindow(assignment.assigned_start, assignment.assigned_end)}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="dashboard-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">My Alerts</h5>
                <span className="badge bg-warning text-dark">{individualSignals.filter((item) => item.severity !== "Clear").length} Active</span>
              </div>

              <div className="list-group list-group-flush">
                {individualSignals.map((signal) => (
                  <div key={signal.id} className="list-group-item d-flex justify-content-between align-items-start">
                    <div>
                      <strong className={`text-${signal.severityClass}`}>{signal.title}</strong>
                      <div className="small text-muted">{signal.description}</div>
                    </div>
                    <span className={`badge bg-${signal.severityClass} ${signal.severityClass === "warning" ? "text-dark" : ""}`}>
                      {signal.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card mb-4">
              <h5 className="mb-3">My Leave Requests</h5>
              {loading ? (
                <p className="text-muted">Loading leave requests...</p>
              ) : individualSummary.myLeaveRequests.length === 0 ? (
                <p className="text-muted">No leave requests in this period.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {individualSummary.myLeaveRequests.map((leaveRequest) => (
                    <li key={leaveRequest.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{formatWindow(leaveRequest.start_date, leaveRequest.end_date)}</span>
                        <span className={`badge ${leaveRequest.status === "APPROVED" ? "bg-success" : "bg-warning text-dark"}`}>
                          {leaveRequest.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRotationOwner) {
    return (
      <div className="dashboard-container">
        <div className="mb-4">
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Welcome back! Here is your rotation operations overview for the next 14 days.</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Managed Rotations</div>
              <div className="stat-number">{loading ? "..." : rotationOwnerSummary.managedRotationCount}</div>
              <small className="text-success">Rotations under your view</small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Assigned Members</div>
              <div className="stat-number">{loading ? "..." : rotationOwnerSummary.memberCount}</div>
              <small className="text-success">Member coverage in scope</small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Coverage Gaps</div>
              <div className="stat-number">{loading ? "..." : rotationOwnerSummary.coverageGapCount}</div>
              <small className={rotationOwnerSummary.coverageGapCount > 0 ? "text-warning" : "text-success"}>
                {rotationOwnerSummary.coverageGapCount > 0 ? "Needs attention" : "All covered"}
              </small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">On Call Today</div>
              <div className="stat-number">{loading ? "..." : rotationOwnerSummary.onCallToday}</div>
              <small className={rotationOwnerSummary.onCallToday > 0 ? "text-warning" : "text-success"}>
                {rotationOwnerSummary.onCallToday > 0 ? "Active coverage today" : "No active on-call today"}
              </small>
            </div>
          </div>
        </div>

        <div className="dashboard-card mb-4">
          <h5 className="mb-4">Quick Actions</h5>
          <div className="row g-3">
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/rotations")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔄</div>
                <div style={{ fontSize: "14px" }}>View Rotations</div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/schedule")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📅</div>
                <div style={{ fontSize: "14px" }}>View Schedules</div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/holidays")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏖️</div>
                <div style={{ fontSize: "14px" }}>View Holidays</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="dashboard-card mb-4">
              <h5 className="mb-3">Upcoming Rotation Coverage</h5>
              {loading ? (
                <p className="text-muted">Loading coverage data...</p>
              ) : rotationOwnerSummary.upcomingAssignments.length === 0 ? (
                <p className="text-muted">No assignments found for your managed rotations in this window.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {rotationOwnerSummary.upcomingAssignments.map((assignment) => (
                    <li key={assignment.assignment_id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <strong>{assignment.rotation_name}</strong>
                          <span className="text-muted"> · {assignment.first_name} {assignment.last_name}</span>
                        </span>
                        <small className="text-muted">{formatWindow(assignment.assigned_start, assignment.assigned_end)}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dashboard-card mb-4">
              <h5 className="mb-3">Managed Rotations</h5>
              {loading ? (
                <p className="text-muted">Loading rotations...</p>
              ) : rotationOwnerSummary.managedRotations.length === 0 ? (
                <p className="text-muted">No managed rotations found for your account.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {rotationOwnerSummary.managedRotations.map((rotation) => (
                    <li key={rotation.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <strong>{rotation.name}</strong>
                        <span className="text-muted"> · {rotation.rotation_type}</span>
                      </span>
                      <small className="text-muted">{rotation.team_name || rotation.group_name || "No team"}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="dashboard-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Rotation Alerts</h5>
                <span className="badge bg-warning text-dark">{rotationOwnerSummary.coverageGapCount + rotationOwnerSummary.conflictCount} Active</span>
              </div>

              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <strong className={rotationOwnerSummary.coverageGapCount > 0 ? "text-warning" : "text-success"}>Coverage gaps</strong>
                    <div className="small text-muted">
                      {rotationOwnerSummary.coverageGapCount > 0
                        ? `${rotationOwnerSummary.coverageGapCount} gap(s) need filling in your rotations.`
                        : "No open coverage gaps in your managed rotations."}
                    </div>
                  </div>
                  <span className={`badge ${rotationOwnerSummary.coverageGapCount > 0 ? "bg-warning text-dark" : "bg-success"}`}>
                    {rotationOwnerSummary.coverageGapCount > 0 ? "Open" : "Clear"}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <strong className={rotationOwnerSummary.conflictCount > 0 ? "text-danger" : "text-success"}>Open conflicts</strong>
                    <div className="small text-muted">
                      {rotationOwnerSummary.conflictCount > 0
                        ? `${rotationOwnerSummary.conflictCount} conflict(s) are affecting your rotations.`
                        : "No open conflicts in your managed rotations."}
                    </div>
                  </div>
                  <span className={`badge ${rotationOwnerSummary.conflictCount > 0 ? "bg-danger" : "bg-success"}`}>
                    {rotationOwnerSummary.conflictCount > 0 ? "Attention" : "Clear"}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-card mb-4">
              <h5 className="mb-3">Open Coverage Gaps</h5>
              {loading ? (
                <p className="text-muted">Loading coverage gaps...</p>
              ) : rotationOwnerSummary.coverageGaps.length === 0 ? (
                <p className="text-muted">No coverage gaps in this period.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {rotationOwnerSummary.coverageGaps.map((gap) => (
                    <li key={gap.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <strong>{gap.rotation_name}</strong>
                          <span className="text-muted"> · {gap.team_name || "No team"}</span>
                        </span>
                        <span className="badge bg-warning text-dark">{formatWindow(gap.gap_start, gap.gap_end)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTeamLeader) {
    return (
      <div className="dashboard-container">
        <div className="mb-4">
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Welcome back! Here is your team leadership overview for the next 14 days.</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Managed Teams</div>
              <div className="stat-number">{loading ? "..." : teamLeaderSummary.managedTeamCount}</div>
              <small className="text-success">Teams under your view</small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Team Members</div>
              <div className="stat-number">{loading ? "..." : teamLeaderSummary.memberCount}</div>
              <small className="text-success">Active roster in scope</small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">Pending Approvals</div>
              <div className="stat-number">{loading ? "..." : teamLeaderSummary.pendingApprovalCount}</div>
              <small className="text-warning">Needs your review</small>
            </div>
          </div>

          <div className="col-md-3">
            <div className="dashboard-card stat-card-wrapper">
              <div className="stat-title">On Call Today</div>
              <div className="stat-number">{loading ? "..." : teamLeaderSummary.onCallToday}</div>
              <small className={teamLeaderSummary.onCallToday > 0 ? "text-warning" : "text-success"}>
                {teamLeaderSummary.onCallToday > 0 ? "Team coverage is active" : "No active on-call today"}
              </small>
            </div>
          </div>
        </div>

        <div className="dashboard-card mb-4">
          <h5 className="mb-4">Quick Actions</h5>
          <div className="row g-3">
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/teams")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
                <div style={{ fontSize: "14px" }}>View Teams</div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/schedule")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📅</div>
                <div style={{ fontSize: "14px" }}>View Schedules</div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/rotations")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔄</div>
                <div style={{ fontSize: "14px" }}>View Rotations</div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="quick-action-box" onClick={() => navigate("/holidays")} role="button" tabIndex={0}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎉</div>
                <div style={{ fontSize: "14px" }}>View Holidays</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="dashboard-card mb-4">
              <h5 className="mb-3">Upcoming Team Coverage</h5>
              {loading ? (
                <p className="text-muted">Loading coverage data...</p>
              ) : teamLeaderSummary.upcomingCoverage.length === 0 ? (
                <p className="text-muted">No team assignments found in the selected window.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {teamLeaderSummary.upcomingCoverage.map((assignment) => (
                    <li key={assignment.assignment_id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <strong>{assignment.first_name} {assignment.last_name}</strong>
                          <span className="text-muted"> · {assignment.team_name || assignment.rotation_name}</span>
                        </span>
                        <small className="text-muted">{formatWindow(assignment.assigned_start, assignment.assigned_end)}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dashboard-card mb-4">
              <h5 className="mb-3">Managed Teams</h5>
              {loading ? (
                <p className="text-muted">Loading teams...</p>
              ) : teamLeaderSummary.managedTeams.length === 0 ? (
                <p className="text-muted">No managed teams found for your account.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {teamLeaderSummary.managedTeams.map((team) => (
                    <li key={team.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span><strong>{team.name}</strong>{team.group_name ? ` · ${team.group_name}` : ""}</span>
                      <small className="text-muted">{team.is_active ? "Active" : "Inactive"}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="dashboard-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Leadership Alerts</h5>
                <span className="badge bg-warning text-dark">{teamLeaderSummary.pendingApprovalCount + teamLeaderSummary.conflictCount} Active</span>
              </div>

              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <strong className={teamLeaderSummary.pendingApprovalCount > 0 ? "text-warning" : "text-success"}>Pending leave requests</strong>
                    <div className="small text-muted">
                      {teamLeaderSummary.pendingApprovalCount > 0
                        ? `${teamLeaderSummary.pendingApprovalCount} request(s) are awaiting review.`
                        : "No leave requests are waiting for action."}
                    </div>
                  </div>
                  <span className={`badge ${teamLeaderSummary.pendingApprovalCount > 0 ? "bg-warning text-dark" : "bg-success"}`}>
                    {teamLeaderSummary.pendingApprovalCount > 0 ? "Pending" : "Clear"}
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <strong className={teamLeaderSummary.conflictCount > 0 ? "text-danger" : "text-success"}>Open team conflicts</strong>
                    <div className="small text-muted">
                      {teamLeaderSummary.conflictCount > 0
                        ? `${teamLeaderSummary.conflictCount} open conflict(s) are affecting your teams.`
                        : "No open conflicts in your managed teams."}
                    </div>
                  </div>
                  <span className={`badge ${teamLeaderSummary.conflictCount > 0 ? "bg-danger" : "bg-success"}`}>
                    {teamLeaderSummary.conflictCount > 0 ? "Attention" : "Clear"}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-card mb-4">
              <h5 className="mb-3">Pending Leave Requests</h5>
              {loading ? (
                <p className="text-muted">Loading approvals...</p>
              ) : teamLeaderSummary.pendingApprovals.length === 0 ? (
                <p className="text-muted">No pending leave requests in this period.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {teamLeaderSummary.pendingApprovals.map((leaveRequest) => (
                    <li key={leaveRequest.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>
                          <strong>{leaveRequest.first_name} {leaveRequest.last_name}</strong>
                          <span className="text-muted"> · {formatWindow(leaveRequest.start_date, leaveRequest.end_date)}</span>
                        </span>
                        <span className="badge bg-warning text-dark">Pending</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <small className="text-success">Active teams in the system</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card stat-card-wrapper">
            <div className="stat-title">Active Rotations</div>
            <div className="stat-number">
              {loading ? "..." : stats.activeRotations}
            </div>
            <small className={stats.activeRotations > 0 ? "text-success" : "text-muted"}>
              {stats.activeRotations > 0 ? "All running smoothly" : "No active rotations"}
            </small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card stat-card-wrapper">
            <div className="stat-title">Conflicts</div>
            <div className="stat-number">
              {loading ? "..." : stats.activeConflicts}
            </div>
            <small className={stats.activeConflicts > 0 ? "text-danger" : "text-success"}>
              {stats.activeConflicts > 0 ? "Requires attention" : "No open conflicts"}
            </small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card stat-card-wrapper">
            <div className="stat-title">Pending Approvals</div>
            <div className="stat-number">
              {loading ? "..." : stats.pendingApprovals}
            </div>
            <small className={stats.pendingApprovals > 0 ? "text-warning" : "text-success"}>
              {stats.pendingApprovals > 0 ? "Awaiting your review" : "All clear"}
            </small>
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
          <span className={`badge ${adminConflicts.length > 0 ? "bg-danger" : "bg-success"}`}>
            {adminConflicts.length} Active
          </span>
        </div>

        {loading ? (
          <p className="text-muted">Loading conflicts...</p>
        ) : adminConflicts.length === 0 ? (
          <p className="text-muted">No open conflicts. Everything looks good!</p>
        ) : (
          <div className="list-group list-group-flush">
            {adminConflicts.map((conflict) => {
              const badgeClass = conflictSeverityClass(conflict.severity);
              return (
                <div
                  key={conflict.id}
                  className="list-group-item d-flex justify-content-between align-items-start"
                >
                  <div>
                    <strong className={`text-${badgeClass}`}>
                      {formatConflictType(conflict.conflict_type)}
                    </strong>
                    <div className="small text-muted">
                      {typeof conflict.details === "string"
                        ? conflict.details
                        : conflict.details?.description || `${conflict.first_name} ${conflict.last_name} · ${conflict.rotation_name}`}
                    </div>
                  </div>
                  <span className={`badge bg-${badgeClass} ${badgeClass === "warning" ? "text-dark" : ""}`}>
                    {conflict.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card p-4">
        <h5 className="mb-3">Recent Activity</h5>

        {loading ? (
          <p className="text-muted">Loading activity...</p>
        ) : adminActivity.length === 0 ? (
          <p className="text-muted">No recent activity to display.</p>
        ) : (
          <>
            <ul className="list-group list-group-flush">
              {adminActivity.map((activity, index) => (
                <li key={index} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <span style={{ marginRight: "8px" }}>{activityIcon(activity.type)}</span>
                      {activity.description}
                    </span>
                    <small className="text-muted">{formatRelativeTime(activity.created_at)}</small>
                  </div>
                </li>
              ))}
            </ul>
            {activityTotalPages > 1 && (
              <div className="dashboard-pagination-container">
                <div className="dashboard-pagination-info">
                  Showing {(activityPage - 1) * activityLimit + 1} -{" "}
                  {Math.min(activityPage * activityLimit, activityTotal)} of {activityTotal} activities
                </div>
                <div className="dashboard-pagination-controls">
                  <button
                    className="dashboard-page-button"
                    disabled={activityPage === 1}
                    onClick={() => {
                      const p = activityPage - 1;
                      setActivityPage(p);
                      api.get(`/dashboard/activity?page=${p}&limit=${activityLimit}`).then((res) => {
                        const d = res.data || {};
                        setAdminActivity(Array.isArray(d.rows) ? d.rows : []);
                        setActivityTotalPages(d.totalPages || 1);
                        setActivityTotal(d.total || 0);
                      });
                    }}
                  >Previous</button>

                  {activityTotalPages <= 7 ? (
                    [...Array(activityTotalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const p = i + 1;
                          setActivityPage(p);
                          api.get(`/dashboard/activity?page=${p}&limit=${activityLimit}`).then((res) => {
                            const d = res.data || {};
                            setAdminActivity(Array.isArray(d.rows) ? d.rows : []);
                            setActivityTotalPages(d.totalPages || 1);
                            setActivityTotal(d.total || 0);
                          });
                        }}
                        className={`dashboard-page-button ${activityPage === i + 1 ? "active" : ""}`}
                      >{i + 1}</button>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setActivityPage(1);
                          api.get(`/dashboard/activity?page=1&limit=${activityLimit}`).then((res) => {
                            const d = res.data || {};
                            setAdminActivity(Array.isArray(d.rows) ? d.rows : []);
                            setActivityTotalPages(d.totalPages || 1);
                            setActivityTotal(d.total || 0);
                          });
                        }}
                        className={`dashboard-page-button ${activityPage === 1 ? "active" : ""}`}
                      >1</button>

                      {activityPage > 3 && <span className="dashboard-page-button">...</span>}

                      {[activityPage - 1, activityPage, activityPage + 1]
                        .filter(p => p > 1 && p < activityTotalPages)
                        .map(p => (
                          <button
                            key={p}
                            onClick={() => {
                              setActivityPage(p);
                              api.get(`/dashboard/activity?page=${p}&limit=${activityLimit}`).then((res) => {
                                const d = res.data || {};
                                setAdminActivity(Array.isArray(d.rows) ? d.rows : []);
                                setActivityTotalPages(d.totalPages || 1);
                                setActivityTotal(d.total || 0);
                              });
                            }}
                            className={`dashboard-page-button ${activityPage === p ? "active" : ""}`}
                          >{p}</button>
                        ))}

                      {activityPage < activityTotalPages - 2 && (
                        <span className="dashboard-page-button">...</span>
                      )}

                      <button
                        onClick={() => {
                          setActivityPage(activityTotalPages);
                          api.get(`/dashboard/activity?page=${activityTotalPages}&limit=${activityLimit}`).then((res) => {
                            const d = res.data || {};
                            setAdminActivity(Array.isArray(d.rows) ? d.rows : []);
                            setActivityTotalPages(d.totalPages || 1);
                            setActivityTotal(d.total || 0);
                          });
                        }}
                        className={`dashboard-page-button ${activityPage === activityTotalPages ? "active" : ""}`}
                      >{activityTotalPages}</button>
                    </>
                  )}

                  <button
                    className="dashboard-page-button"
                    disabled={activityPage === activityTotalPages}
                    onClick={() => {
                      const p = activityPage + 1;
                      setActivityPage(p);
                      api.get(`/dashboard/activity?page=${p}&limit=${activityLimit}`).then((res) => {
                        const d = res.data || {};
                        setAdminActivity(Array.isArray(d.rows) ? d.rows : []);
                        setActivityTotalPages(d.totalPages || 1);
                        setActivityTotal(d.total || 0);
                      });
                    }}
                  >Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;