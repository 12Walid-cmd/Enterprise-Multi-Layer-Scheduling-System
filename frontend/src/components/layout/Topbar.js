import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/api";
import cgiLogo from "../../images/cgiLogo.png";

function Topbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      setNotificationsLoading(true);
      setNotificationsError("");

      const { data } = await api.get("/notifications", {
        params: { limit: 15, offset: 0 },
      });

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      setNotificationsError("Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    let parsedUser = null;

    try {
      parsedUser = rawUser ? JSON.parse(rawUser) : null;
    } catch {
      parsedUser = null;
    }

    setCurrentUser(parsedUser);

    const needsProfile = !parsedUser || !parsedUser.firstName || !parsedUser.lastName;
    const token = localStorage.getItem("accessToken");

    if (!needsProfile || !token) {
      return;
    }

    axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.data && response.data.user) {
          setCurrentUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      })
      .catch(() => {
        // keep existing local user fallback
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const displayName = useMemo(() => {
    if (!currentUser) return "User";

    const first = String(currentUser.firstName || "").trim();
    const last = String(currentUser.lastName || "").trim();
    if (first || last) {
      return [first, last].filter(Boolean).join(" ");
    }
    return currentUser.username || "User";
  }, [currentUser]);

  const initials = useMemo(() => {
    const first = String((currentUser && currentUser.firstName) || "").trim();
    const last = String((currentUser && currentUser.lastName) || "").trim();

    if (first || last) {
      const fi = first ? first.charAt(0).toUpperCase() : "";
      const li = last ? last.charAt(0).toUpperCase() : "";
      return `${fi}${li}` || "U";
    }

    return String((currentUser && currentUser.username) || "U").slice(0, 2).toUpperCase();
  }, [currentUser]);

  async function handleLogout() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (accessToken) {
        await axios.post(
          "http://localhost:5000/api/auth/logout",
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch {
      // ignore errors — still clear client-side state
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setMenuOpen(false);
      setNotificationsOpen(false);
      navigate("/login");
    }
  }

  async function handleMarkAsRead(notificationId) {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      setNotificationsError("Failed to update notification");
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      setNotificationsError("Failed to update notifications");
    }
  }

  const notificationItems = notifications.slice(0, 8);

  return (
    <div className="topbar" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 30px",
    }}>

      {/* Left side: Logo and title */}
      <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src={cgiLogo}
          alt="CGI Logo"
          style={{ width: "75px", height: "75px", objectFit: "contain" }}
        />
        <span className="topbar-title" style={{ fontWeight: "600", fontSize: "18px" }}>
          Enterprise Scheduling System
        </span>
      </div>

      {/* Right side: User info dropdown */}
      <div
        className="topbar-right"
        style={{ display: "flex", alignItems: "center", gap: "15px", position: "relative" }}
      >
        <div ref={notificationsRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              const willOpen = !notificationsOpen;
              setNotificationsOpen(willOpen);
              setMenuOpen(false);
              if (willOpen) {
                fetchNotifications();
              }
            }}
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={notificationsOpen}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: "18px",
              position: "relative",
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-2px",
                  backgroundColor: "#e31837",
                  color: "white",
                  borderRadius: "999px",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 5px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                width: "360px",
                maxHeight: "420px",
                overflowY: "auto",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.1)",
                zIndex: 1100,
              }}
            >
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "14px", color: "#1f2937" }}>Notifications</strong>
                <button
                  onClick={handleMarkAllAsRead}
                  style={{ border: "none", background: "transparent", color: "#2563eb", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                >
                  Mark all read
                </button>
              </div>

              {notificationsLoading && <div style={{ padding: "14px", color: "#6b7280", fontSize: "13px" }}>Loading...</div>}
              {notificationsError && <div style={{ padding: "14px", color: "#b91c1c", fontSize: "13px" }}>{notificationsError}</div>}

              {!notificationsLoading && !notificationsError && notificationItems.length === 0 && (
                <div style={{ padding: "14px", color: "#6b7280", fontSize: "13px" }}>
                  No notifications yet.
                </div>
              )}

              {!notificationsLoading && !notificationsError && notificationItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #f3f4f6",
                    backgroundColor: item.is_read ? "#ffffff" : "#f8fbff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: "13px" }}>{item.title}</div>
                    {!item.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        style={{ border: "none", background: "transparent", color: "#2563eb", fontSize: "12px", cursor: "pointer" }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: "4px", color: "#4b5563", fontSize: "12px", lineHeight: 1.4 }}>{item.message}</div>
                  <div style={{ marginTop: "6px", color: "#9ca3af", fontSize: "11px" }}>
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          ref={menuRef}
          style={{ position: "relative" }}
        >
        <button
          onClick={() => {
            setMenuOpen((prev) => !prev);
            setNotificationsOpen(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 10px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "999px",
            cursor: "pointer"
          }}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="topbar-user" style={{ fontWeight: 600 }}>{displayName}</span>
          <div className="topbar-avatar" style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "white",
            color: "#e31837",
            border: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700"
          }}>
            {initials}
          </div>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>▼</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "52px",
              right: 0,
              minWidth: "200px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.1)",
              padding: "6px",
              zIndex: 1000
            }}
            role="menu"
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/change-password");
              }}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#1f2937",
                fontWeight: 500
              }}
              role="menuitem"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#b91c1c",
                fontWeight: 600
              }}
              role="menuitem"
            >
              Logout
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;