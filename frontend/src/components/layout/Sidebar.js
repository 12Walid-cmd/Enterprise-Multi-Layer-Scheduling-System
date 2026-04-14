import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

/* ── Inline styles (no extra CSS file needed) ─────────────────────────── */
const S = {
  sidebar: (open) => ({
    width: open ? 240 : 64,
    minHeight: "calc(100vh - 70px)",
    background: "#ffffff",
    borderRight: "1px solid #ede9fe",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.28s cubic-bezier(.4,0,.2,1)",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
    boxShadow: open ? "4px 0 24px rgba(82,54,171,0.07)" : "none",
    zIndex: 100,
  }),
  toggleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1.5px solid #ede9fe",
    background: "#f5f3ff",
    cursor: "pointer",
    color: "#5236ab",
    flexShrink: 0,
    transition: "background 0.18s, border-color 0.18s",
    outline: "none",
  },
  topRow: (open) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: open ? "space-between" : "center",
    padding: open ? "18px 16px 10px 16px" : "18px 0 10px 0",
    minHeight: 56,
  }),
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 7,
    background: "linear-gradient(135deg, #5236ab 0%, #e41937 100%)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    fontFamily: "'DM Sans', sans-serif",
  },
  brandText: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    background: "linear-gradient(90deg, #5236ab, #e41937)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, #ede9fe, #fce7eb, #ede9fe)",
    margin: "6px 12px 10px",
    flexShrink: 0,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "0 8px",
    flex: 1,
  },
  footer: (open) => ({
    padding: open ? "12px 16px 20px" : "12px 8px 20px",
    borderTop: "1px solid #ede9fe",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  }),
  footerLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: "#a78bfa",
    padding: "2px 8px 6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
};

/* ── Nav items config ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
    {
      to: "/admin-roles",
      label: "Admin Roles",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#a21caf" opacity="0.13"/>
          <path d="M8 12h8M12 8v8" stroke="#a21caf" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: "#a21caf",
    },
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="#5236ab" opacity="0.85"/>
        <rect x="13" y="3" width="8" height="8" rx="2" fill="#e41937" opacity="0.7"/>
        <rect x="3" y="13" width="8" height="8" rx="2" fill="#e41937" opacity="0.7"/>
        <rect x="13" y="13" width="8" height="8" rx="2" fill="#5236ab" opacity="0.5"/>
      </svg>
    ),
    color: "#5236ab",
  },
  {
    to: "/schedule",
    label: "Schedules",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="#10b981" strokeWidth="2" fill="#d1fae5" fillOpacity="0.4"/>
        <path d="M16 2v4M8 2v4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 9h18" stroke="#10b981" strokeWidth="2"/>
        <rect x="7" y="13" width="3" height="3" rx="0.7" fill="#10b981"/>
        <rect x="11" y="13" width="3" height="3" rx="0.7" fill="#34d399" opacity="0.7"/>
      </svg>
    ),
    color: "#10b981",
  },
  {
    to: "/rotations",
    label: "Rotations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 2v6h-6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 22v-6h6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: "#f59e0b",
  },
  {
    to: "/members",
    label: "Members",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3.5" fill="#7c3aed"/>
        <circle cx="16" cy="9" r="2.5" fill="#a78bfa" opacity="0.8"/>
        <path d="M2 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
        <path d="M17 14c2.21 0 4 1.567 4 3.5" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      </svg>
    ),
    color: "#7c3aed",
  },
  {
    to: "/teams",
    label: "Teams",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="#0ea5e9" strokeWidth="2" fill="#bae6fd" fillOpacity="0.4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: "#0ea5e9",
  },
  {
    to: "/holidays",
    label: "Holidays",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="5" fill="#f97316" opacity="0.85"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: "#f97316",
  },
];

const FOOTER_ITEMS = [
  {
    to: "/settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#6b7280" strokeWidth="2"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#6b7280" strokeWidth="2"/>
      </svg>
    ),
    color: "#6b7280",
  },
];

/* ── NavItem component ─────────────────────────────────────────────────── */
function NavItem({ item, open, end = false }) {
  return (
    <NavLink
      to={item.to}
      end={end}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: open ? "9px 10px" : "9px 0",
        justifyContent: open ? "flex-start" : "center",
        borderRadius: 9,
        textDecoration: "none",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? item.color : "#374151",
        background: isActive ? `${item.color}14` : "transparent",
        border: isActive ? `1.5px solid ${item.color}30` : "1.5px solid transparent",
        transition: "all 0.17s",
        whiteSpace: "nowrap",
        overflow: "hidden",
        position: "relative",
      })}
      title={!open ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          {/* Active left bar */}
          {isActive && (
            <span style={{
              position: "absolute",
              left: 0,
              top: "20%",
              height: "60%",
              width: 3,
              borderRadius: "0 3px 3px 0",
              background: item.color,
            }} />
          )}
          <span style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 7,
            background: isActive ? `${item.color}18` : "transparent",
            transition: "background 0.17s",
            marginLeft: open ? 2 : 0,
          }}>
            {item.icon}
          </span>
          {open && (
            <span style={{
              opacity: open ? 1 : 0,
              transition: "opacity 0.18s",
              overflow: "hidden",
            }}>
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ── Main Sidebar ──────────────────────────────────────────────────────── */
function Sidebar() {
  const [open, setOpen] = useState(true);
  const [role, setRole] = useState(getRole());

  useEffect(() => {
    const syncRole = () => setRole(getRole());
    window.addEventListener("storage", syncRole);
    window.addEventListener("rolechange", syncRole);
    return () => {
      window.removeEventListener("storage", syncRole);
      window.removeEventListener("rolechange", syncRole);
    };
  }, []);

  const navItems = FILTERED_NAV(role);

  return (
    <aside style={S.sidebar(open)}>
      {/* Top row: brand + toggle */}
      <div style={S.topRow(open)}>
        {open && (
          <div style={S.brand}>
            <div style={S.brandDot}>C</div>
            <span style={S.brandText}>CGI Portal</span>
          </div>
        )}
        <button
          style={S.toggleBtn}
          onClick={() => setOpen(o => !o)}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#ede9fe";
            e.currentTarget.style.borderColor = "#a78bfa";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#f5f3ff";
            e.currentTarget.style.borderColor = "#ede9fe";
          }}
        >
          {/* Animated arrow icon */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.28s cubic-bezier(.4,0,.2,1)" }}
          >
            <path d="M15 18l-6-6 6-6" stroke="#5236ab" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={S.divider} />

      {/* Main nav */}
      <nav style={S.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
            style={{ color: item.color, display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: "none", marginBottom: 2 }}
          >
            {item.icon}
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer nav (Settings) */}
      <div style={S.footer(open)}>
        {open && <div style={S.footerLabel}>System</div>}
        {FOOTER_ITEMS.map(item => (
          <NavItem key={item.to} item={item} open={open} />
        ))}
      </div>

    </aside>
  );
}

export default Sidebar;

function getRole() {
  return localStorage.getItem("role") || "Individual";
}

const FILTERED_NAV = (role) => {
  // Admin can see everything
  if (role === "Administrator") return NAV_ITEMS;
  // Rotation Owner
  if (role === "Rotation Owner") return NAV_ITEMS.filter(item => ["Rotations", "Schedules", "Teams", "Holidays"].includes(item.label));
  // Team Leader
  if (role === "Team Leader") return NAV_ITEMS.filter(item => ["Teams", "Schedules", "Holidays", "Rotations"].includes(item.label));
  // Individual
  return NAV_ITEMS.filter(item => ["Schedules", "Holidays"].includes(item.label));
};