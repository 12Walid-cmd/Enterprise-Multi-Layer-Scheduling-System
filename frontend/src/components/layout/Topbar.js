import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import cgiLogo from "../../images/cgiLogo.png";

/* ─── tiny hook: detect click outside ─────────────────────────────── */
function useClickOutside(ref, cb) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

/* ─── Icons ────────────────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Topbar ───────────────────────────────────────────────────────── */

export default function Topbar() {
  const [dropOpen, setDropOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    token: localStorage.getItem("token"),
    firstName: localStorage.getItem("firstName"),
    lastName: localStorage.getItem("lastName")
  });
  const dropRef = useRef(null);
  const navigate = useNavigate();
  useClickOutside(dropRef, () => setDropOpen(false));

  // Listen for storage changes (e.g., login/logout in other tabs)
  useEffect(() => {
    const syncUserInfo = () => {
      setUserInfo({
        token: localStorage.getItem("token"),
        firstName: localStorage.getItem("firstName"),
        lastName: localStorage.getItem("lastName")
      });
    };
    window.addEventListener("storage", syncUserInfo);
    return () => window.removeEventListener("storage", syncUserInfo);
  }, []);

  // Also update on navigation (login/logout in same tab)
  useEffect(() => {
    setUserInfo({
      token: localStorage.getItem("token"),
      firstName: localStorage.getItem("firstName"),
      lastName: localStorage.getItem("lastName")
    });
  }, [window.location.pathname]);

  const notifCount = 3;

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    setDropOpen(false);
    setUserInfo({ token: null, firstName: null, lastName: null });
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .tb-root {
          font-family: 'DM Sans', sans-serif;
          height: 68px;
          background: #ffffff;
          border-bottom: 1px solid #ede9fe;
          box-shadow: 0 2px 16px rgba(82,54,171,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px 0 20px;
          position: sticky;
          top: 0;
          z-index: 500;
        }

        /* ── left: now a Link so it's clickable ── */
        .tb-left {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          border-radius: 10px;
          padding: 4px 10px 4px 4px;
          transition: background 0.18s;
        }
        .tb-left:hover { background: #f5f3ff; }

        .tb-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
          filter: drop-shadow(0 2px 6px rgba(228,25,55,0.18));
        }

        .tb-divider-v {
          width: 1.5px;
          height: 28px;
          background: linear-gradient(180deg, #5236ab44, #e4193744);
          border-radius: 2px;
        }

        .tb-title-wrap { display: flex; flex-direction: column; gap: 1px; }

        .tb-title {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.3px;
          background: linear-gradient(90deg, #5236ab 0%, #e41937 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        /* ── right ── */
        .tb-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tb-icon-btn {
          position: relative;
          width: 38px; height: 38px;
          border-radius: 10px;
          border: 1.5px solid #ede9fe;
          background: #fafafa;
          color: #6b7280;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.18s;
          outline: none;
        }
        .tb-icon-btn:hover {
          background: #f5f3ff;
          border-color: #c4b5fd;
          color: #5236ab;
        }

        .tb-badge {
          position: absolute;
          top: 5px; right: 5px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e41937, #5236ab);
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
          line-height: 1;
          animation: tb-pulse 2s infinite;
        }

        @keyframes tb-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(228,25,55,0.4); }
          50%       { box-shadow: 0 0 0 5px rgba(228,25,55,0); }
        }

        .tb-sep {
          width: 1px; height: 28px;
          background: linear-gradient(180deg, transparent, #e5e7eb, transparent);
          margin: 0 4px;
        }

        .tb-user-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 5px 12px 5px 5px;
          border-radius: 12px;
          border: 1.5px solid #ede9fe;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.18s;
          outline: none;
          min-width: 0;
        }
        .tb-user-btn:hover {
          background: #f5f3ff;
          border-color: #c4b5fd;
        }

        .tb-avatar {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #5236ab 0%, #e41937 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(82,54,171,0.35);
        }

        .tb-user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          text-align: left;
          min-width: 0;
        }

        .tb-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
          white-space: nowrap;
          line-height: 1.2;
        }

        .tb-user-role {
          font-size: 11px;
          font-weight: 500;
          color: #9ca3af;
          white-space: nowrap;
        }

        .tb-chevron {
          color: #9ca3af;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .tb-chevron.open { transform: rotate(180deg); }

        .tb-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: #fff;
          border: 1px solid #ede9fe;
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(82,54,171,0.14);
          padding: 6px;
          z-index: 600;
          animation: tb-drop-in 0.16s ease;
        }

        @keyframes tb-drop-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .tb-drop-header {
          padding: 10px 12px 8px;
          border-bottom: 1px solid #f3f4f6;
          margin-bottom: 4px;
        }

        .tb-drop-name  { font-size: 13px; font-weight: 700; color: #111827; }
        .tb-drop-email { font-size: 11px; color: #9ca3af; margin-top: 2px; }

        .tb-drop-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border: none;
          border-radius: 8px;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          text-align: left;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .tb-drop-item:hover { background: #f5f3ff; color: #5236ab; }
        .tb-drop-item.danger:hover { background: #fff1f2; color: #e41937; }

        .tb-drop-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 4px 6px;
        }
      `}</style>

      <header className="tb-root">

        {/* ── LEFT: Link wraps logo + title → redirects to "/" on click ── */}
        <Link to="/" className="tb-left">
          <img src={cgiLogo} alt="CGI" className="tb-logo" />
          <div className="tb-divider-v" />
          <div className="tb-title-wrap">
            <span className="tb-title">Enterprise Scheduling</span>
          </div>
        </Link>

        {/* ── RIGHT ── */}
        <div className="tb-right">
          <button className="tb-icon-btn" title="Notifications">
            <BellIcon />
            {notifCount > 0 && <span className="tb-badge">{notifCount}</span>}
          </button>
          <div className="tb-sep" />
          {userInfo.token ? (
            <div style={{ position: "relative" }} ref={dropRef}>
              <button className="tb-user-btn" onClick={() => setDropOpen(p => !p)}>
                <div className="tb-avatar">{userInfo.firstName ? userInfo.firstName[0].toUpperCase() : "U"}</div>
                <div className="tb-user-info">
                  <span className="tb-user-name">{userInfo.firstName || "User"} {userInfo.lastName || ""}</span>
                  <span className="tb-user-role">User</span>
                </div>
                <span className={`tb-chevron${dropOpen ? " open" : ""}`}>
                  <ChevronDown />
                </span>
              </button>
              {dropOpen && (
                <div className="tb-dropdown">
                  <div className="tb-drop-header">
                    <div className="tb-drop-name">{userInfo.firstName || "User"} {userInfo.lastName || ""}</div>
                  </div>
                  <div className="tb-drop-divider" />
                  <button
                    className="tb-drop-item danger"
                    onClick={handleSignOut}
                  >
                    <LogoutIcon /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}