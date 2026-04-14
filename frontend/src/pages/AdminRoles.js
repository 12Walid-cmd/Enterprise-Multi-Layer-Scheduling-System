import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import "../styles/members.css";

function AdminRoles() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRoleFilters, setSelectedRoleFilters] = useState([]);
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [showTempPwdModal, setShowTempPwdModal] = useState(false);
  const [tempPwd, setTempPwd] = useState("");
  const [tempPwdUser, setTempPwdUser] = useState("");
  const [resetPwdLoadingUserId, setResetPwdLoadingUserId] = useState(null);
  const limit = 10;

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return members.filter((member) => {
      const searchMatch = !normalizedSearch || [
        member.first_name,
        member.last_name,
        member.email,
        member.username,
        ...(member.app_roles || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const roleMatch =
        selectedRoleFilters.length === 0 ||
        selectedRoleFilters.some((roleId) => (member.app_role_ids || []).some((id) => String(id) === String(roleId)));

      return searchMatch && roleMatch;
    });
  }, [members, search, selectedRoleFilters]);

  const total = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagedMembers = filteredMembers.slice((page - 1) * limit, page * limit);
  const emptyRowsCount = Math.max(0, limit - pagedMembers.length);

  const bodyCellBaseStyle = {
    padding: "14px 18px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "middle",
  };

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    const pages = [1];
    if (page > 3) pages.push("...");

    [page - 1, page, page + 1]
      .filter((p) => p > 1 && p < totalPages)
      .forEach((p) => pages.push(p));

    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchRoles();
      await fetchMembers();
      await fetchRoleAuditLogs();
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedRoleFilters]);

  useEffect(() => {
    const close = () => setRoleDropOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);


  // Fetch all members and their application roles
  const fetchMembers = async () => {
    const res = await api.get("/members", { params: { page: 1, limit: 2000 } });
    const members = res.data.data;
    // For each member, fetch their app roles
    await Promise.all(
      members.map(async (member) => {
        try {
          const rolesRes = await api.get(`/users/${member.id}/app-roles`);
          let appRoles = Array.isArray(rolesRes.data.roles)
            ? rolesRes.data.roles.map((r) => r.name || r.role_name || r.code)
            : [];
          let appRoleIds = Array.isArray(rolesRes.data.roles)
            ? rolesRes.data.roles.map((r) => r.id)
            : [];
          // If no roles, assign Individual as default
          if ((!appRoles || appRoles.length === 0) && roles.length > 0) {
            const individualRole = roles.find(r => (r.name || r.role_name || r.code).toLowerCase() === 'individual');
            if (individualRole) {
              appRoles = [individualRole.name || individualRole.role_name || individualRole.code];
              appRoleIds = [individualRole.id];
            }
          }
          member.app_roles = appRoles;
          member.app_role_ids = appRoleIds;
        } catch {
          // fallback: assign Individual if available
          const individualRole = roles.find(r => (r.name || r.role_name || r.code).toLowerCase() === 'individual');
          member.app_roles = individualRole ? [individualRole.name || individualRole.role_name || individualRole.code] : [];
          member.app_role_ids = individualRole ? [individualRole.id] : [];
        }
      })
    );
    setMembers(members);
  };

  // Fetch application roles from /account-roles
  const fetchRoles = async () => {
    const res = await api.get("/account-roles");
    setRoles(res.data);
  };

  const fetchRoleAuditLogs = async () => {
    try {
      const res = await api.get("/users/role-audit", { params: { limit: 25 } });
      setAuditLogs(Array.isArray(res.data?.logs) ? res.data.logs : []);
      setAuditError("");
    } catch {
      setAuditError("Unable to load role audit history.");
      setAuditLogs([]);
    }
  };

  const handleEditRoles = (member) => {
    setSelectedMember(member);
    // If user has no roles, auto-select 'Individual' role if present
    let rolesToSet = member.app_role_ids || [];
    if ((!rolesToSet || rolesToSet.length === 0) && roles.length > 0) {
      const individualRole = roles.find(r => (r.name || r.role_name || r.code).toLowerCase() === 'individual');
      if (individualRole) rolesToSet = [individualRole.id];
    }
    setSelectedRoles(rolesToSet);
    setShowModal(true);
  };

  const handleResetPassword = async (member) => {
    const identifier = member.username || member.email;
    if (!identifier) return;

    try {
      setResetPwdLoadingUserId(member.id);
      const res = await api.post("/login/reset", { identifier });
      setTempPwd(res.data.tempPassword || "");
      setTempPwdUser(`${member.first_name || ""} ${member.last_name || ""}`.trim() || identifier);
      setShowTempPwdModal(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setResetPwdLoadingUserId(null);
    }
  };

  // Save application roles for the user
  const handleSaveRoles = async () => {
    const changedByUserId = localStorage.getItem("userId") || null;
    const changedByIdentifier = localStorage.getItem("identifier") || null;

    // Save to /users/:userId/app-roles (PUT or POST)
    await api.put(`/users/${selectedMember.id}/app-roles`, {
      role_ids: selectedRoles,
      changed_by_user_id: changedByUserId,
      changed_by_identifier: changedByIdentifier,
    });
    // After saving roles, update localStorage and dispatch event if this is the current user
    const userId = localStorage.getItem("userId");
    if (userId && userId === String(selectedMember.id)) {
      // Find the new role name
      const newRole = roles.find(r => String(r.id) === String(selectedRoles[0]));
      if (newRole) {
        localStorage.setItem("role", newRole.name || newRole.role_name || newRole.code);
        window.dispatchEvent(new Event("rolechange"));
      }
    }
    setShowModal(false);
    await Promise.all([fetchMembers(), fetchRoleAuditLogs()]);
  };

  const formatAuditName = (firstName, lastName, email, fallback) => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (fullName) return email ? `${fullName} (${email})` : fullName;
    return email || fallback;
  };

  const formatAuditDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  return (
    <div className="members-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">Assign roles and manage access for all users</p>
        </div>
      </div>
      <div className="filters-bar" style={{ marginBottom: 16 }}>
        <div className="fb-top-row">
          <div className="fb-search-wrap">
            <input
              type="text"
              className="fb-search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="fb-clear-x" onClick={() => setSearch("")}>×</button>}
          </div>

          <div className="fb-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
            <div className="fb-drop-label">Role</div>
            <button
              className={`fb-drop-btn${selectedRoleFilters.length ? " active" : ""}`}
              onClick={() => setRoleDropOpen((prev) => !prev)}
            >
              {selectedRoleFilters.length ? `Role (${selectedRoleFilters.length})` : "All Roles"}
              <span className="fb-chevron">{roleDropOpen ? "▴" : "▾"}</span>
            </button>
            {roleDropOpen && (
              <div className="fb-drop-panel">
                <label className="fb-option fb-option-all">
                  <input
                    type="checkbox"
                    checked={selectedRoleFilters.length === roles.length && roles.length > 0}
                    onChange={() =>
                      setSelectedRoleFilters(
                        selectedRoleFilters.length === roles.length ? [] : roles.map((role) => role.id)
                      )
                    }
                  />
                  <span>Select All</span>
                </label>
                <div className="fb-divider" />
                {roles.map((role) => (
                  <label key={role.id} className="fb-option">
                    <input
                      type="checkbox"
                      checked={selectedRoleFilters.some((id) => String(id) === String(role.id))}
                      onChange={() =>
                        setSelectedRoleFilters((prev) =>
                          prev.some((id) => String(id) === String(role.id))
                            ? prev.filter((id) => String(id) !== String(role.id))
                            : [...prev, role.id]
                        )
                      }
                    />
                    <span>{role.name || role.role_name || role.code}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(82,54,171,0.07)', overflow: 'hidden' }}>
        <table className="employee-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '28%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '23%' }} />
            <col style={{ width: '24%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '16px 18px', fontWeight: 700, color: '#23223a', textAlign: 'left', letterSpacing: 0.2 }}>Employee</th>
              <th style={{ padding: '16px 18px', fontWeight: 700, color: '#23223a', textAlign: 'left', letterSpacing: 0.2 }}>Username</th>
              <th style={{ padding: '16px 18px', fontWeight: 700, color: '#23223a', textAlign: 'left', letterSpacing: 0.2 }}>Roles</th>
              <th style={{ padding: '16px 18px', fontWeight: 700, color: '#23223a', textAlign: 'left', letterSpacing: 0.2 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedMembers.map((member, idx) => (
              <tr key={member.id} style={{ background: idx % 2 === 0 ? '#fafaff' : '#f3f4f6' }}>
                <td style={{ ...bodyCellBaseStyle, color: '#23223a', fontWeight: 500 }}>{member.first_name} {member.last_name}</td>
                <td style={{ ...bodyCellBaseStyle, color: '#6366f1', fontWeight: 400 }}>{member.username}</td>
                <td style={{ ...bodyCellBaseStyle, color: '#a21caf', fontWeight: 600 }}>
                  {member.app_roles && member.app_roles.length > 0 ? member.app_roles.join(", ") : <span style={{ color: '#bbb' }}>Individual</span>}
                </td>
                <td style={{ ...bodyCellBaseStyle }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                    <button
                      onClick={() => handleEditRoles(member)}
                      style={{
                        background: 'linear-gradient(90deg, #a78bfa 0%, #e41937 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px 14px',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(82,54,171,0.08)',
                        transition: 'background 0.18s',
                        whiteSpace: 'nowrap',
                      }}
                    >Edit Roles</button>

                    <button
                      onClick={() => handleResetPassword(member)}
                      disabled={resetPwdLoadingUserId === member.id}
                      style={{
                        background: '#fff',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        padding: '7px 12px',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: resetPwdLoadingUserId === member.id ? 'not-allowed' : 'pointer',
                        opacity: resetPwdLoadingUserId === member.id ? 0.6 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {resetPwdLoadingUserId === member.id ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-row-${idx}`} style={{ background: (pagedMembers.length + idx) % 2 === 0 ? '#fafaff' : '#f3f4f6' }}>
                <td style={{ ...bodyCellBaseStyle, color: 'transparent' }}>&nbsp;</td>
                <td style={{ ...bodyCellBaseStyle, color: 'transparent' }}>&nbsp;</td>
                <td style={{ ...bodyCellBaseStyle, color: 'transparent' }}>&nbsp;</td>
                <td style={{ ...bodyCellBaseStyle, color: 'transparent' }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className="pagination-container"
          style={{
            marginTop: 0,
            padding: "12px 16px",
            borderTop: "1px solid #ececf4",
          }}
        >
          <div className="pagination-info">
            {total === 0
              ? "Showing 0 - 0 of 0 employees"
              : `Showing ${(page - 1) * limit + 1} - ${Math.min(page * limit, total)} of ${total} employees`}
          </div>

          <div className="pagination-controls" style={{ gap: 8 }}>
            <button
              className="page-button"
              disabled={page === 1 || total === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            {getVisiblePages().map((item, index) =>
              item === "..." ? (
                <span
                  key={`dots-${index}`}
                  style={{
                    minWidth: 24,
                    textAlign: "center",
                    color: "#6b7280",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`page-button ${page === item ? "active" : ""}`}
                >
                  {item}
                </button>
              )
            )}

            <button
              className="page-button"
              disabled={page === totalPages || total === 0}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header" style={{ position: 'relative', paddingBottom: 8, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ color: '#fff', fontWeight: 700, letterSpacing: 0.2, margin: 0, fontSize: 22, lineHeight: 1.3 }}>
                  Edit Roles for {selectedMember.first_name} {selectedMember.last_name}
                </h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{ color: '#fff', background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', fontWeight: 700, lineHeight: 1, marginLeft: 4, marginTop: -2 }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '32px 24px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <label htmlFor="role-select" style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, color: '#3b3769', letterSpacing: 0.2 }}>Application Role</label>
              <select
                id="role-select"
                value={selectedRoles[0] || ""}
                onChange={e => setSelectedRoles([e.target.value])}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 16,
                  borderRadius: 10,
                  border: '1.5px solid #d1d5db',
                  background: '#fafaff',
                  color: '#23223a',
                  marginBottom: 18,
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(82,54,171,0.04)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#a78bfa'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="" disabled>Select a role...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name || role.role_name || role.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveRoles}>Save Roles</button>
            </div>
          </div>
        </div>
      )}

      {showTempPwdModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: 'min(460px, 92vw)', boxShadow: '0 18px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, color: '#111827' }}>Temporary Password</h3>
            <p style={{ margin: '8px 0 16px', color: '#6b7280', fontSize: 14 }}>
              {tempPwdUser ? `Current temporary password for ${tempPwdUser}:` : 'Current temporary password:'}
            </p>
            <div style={{
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: '#f9fafb',
              fontFamily: 'monospace',
              fontSize: 16,
              fontWeight: 700,
              wordBreak: 'break-all',
              color: '#111827',
            }}>
              {tempPwd || '-'}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => navigator.clipboard.writeText(tempPwd || '')}
                style={{
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
              <button
                onClick={() => setShowTempPwdModal(false)}
                style={{
                  border: 'none',
                  background: 'linear-gradient(90deg, #a78bfa 0%, #e41937 100%)',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 28, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(82,54,171,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #ececf4' }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#23223a' }}>Audit Log</h2>
          <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: 14 }}>Tracks role changes by user and time.</p>
        </div>

        {auditError && <div style={{ color: '#b91c1c', padding: '14px 20px' }}>{auditError}</div>}

        {!auditError && (
          <table className="employee-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#23223a' }}>Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#23223a' }}>Changed By</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#23223a' }}>User Updated</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#23223a' }}>Old Role(s)</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#23223a' }}>New Role(s)</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '14px 16px', color: '#6b7280' }}>No role changes logged yet.</td>
                </tr>
              )}
              {auditLogs.map((log, idx) => (
                <tr key={log.id} style={{ background: idx % 2 === 0 ? '#fafaff' : '#f3f4f6' }}>
                  <td style={{ padding: '12px 14px', color: '#23223a' }}>{formatAuditDate(log.changed_at)}</td>
                  <td style={{ padding: '12px 14px', color: '#23223a' }}>
                    {formatAuditName(log.actor_first_name, log.actor_last_name, log.actor_email, log.changed_by_identifier || 'Unknown')}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#23223a' }}>
                    {formatAuditName(log.target_first_name, log.target_last_name, log.target_email, 'Unknown')}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#23223a' }}>
                    {Array.isArray(log.old_roles) && log.old_roles.length > 0 ? log.old_roles.join(', ') : '-'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#23223a' }}>
                    {Array.isArray(log.new_roles) && log.new_roles.length > 0 ? log.new_roles.join(', ') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminRoles;